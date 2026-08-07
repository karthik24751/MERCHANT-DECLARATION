import cv2
import numpy as np
from PIL import Image, ImageEnhance
import io

def extract_signature(
    image_bytes: bytes,
    bg_sensitivity: int = 50,  # 0 to 100
    brightness: int = 50,      # 0 to 100, 50 is normal
    contrast: int = 50,        # 0 to 100, 50 is normal
    sharpness: int = 50,       # 0 to 100, 50 is normal
    noise_reduction: int = 50, # 0 to 100, 50 is normal
    use_rembg: bool = False
) -> bytes:
    # 1. Load image
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    if img is None:
        raise ValueError("Invalid image")

    # 2. Optional: use rembg to remove complex background (like a desk behind the paper)
    if use_rembg:
        try:
            import rembg
            img_pil = Image.fromarray(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))
            img_pil = rembg.remove(img_pil)
            img = cv2.cvtColor(np.array(img_pil), cv2.COLOR_RGBA2BGRA)
        except ImportError:
            # rembg not installed, skip it
            print("Warning: rembg is not installed. Skipping deep AI background removal.")
            pass
        
        # Convert back to BGR for OpenCV processing, keeping a white background where transparent
        if img.shape[2] == 4:
            alpha = img[:, :, 3] / 255.0
            for c in range(3):
                img[:, :, c] = (alpha * img[:, :, c] + (1 - alpha) * 255).astype(np.uint8)
            img = img[:, :, :3]

    # 3. Apply Brightness, Contrast, Sharpness adjustments
    pil_img = Image.fromarray(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))
    
    if brightness != 50:
        enhancer = ImageEnhance.Brightness(pil_img)
        pil_img = enhancer.enhance(brightness / 50.0)
    
    if contrast != 50:
        enhancer = ImageEnhance.Contrast(pil_img)
        pil_img = enhancer.enhance(contrast / 50.0)
        
    if sharpness != 50:
        enhancer = ImageEnhance.Sharpness(pil_img)
        pil_img = enhancer.enhance(sharpness / 50.0)

    img = cv2.cvtColor(np.array(pil_img), cv2.COLOR_RGB2BGR)

    # 4. Convert to grayscale for thresholding
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # 5. Apply noise reduction
    if noise_reduction > 0:
        ksize = int(noise_reduction / 20) * 2 + 1 # 1, 3, 5, 7, 9, 11
        if ksize > 1:
            gray = cv2.GaussianBlur(gray, (ksize, ksize), 0)

    # 6. Adaptive Thresholding to extract ink
    # bg_sensitivity controls the threshold block size and constant
    block_size = int(bg_sensitivity / 10) * 2 + 11 # 11 to 31
    C = int((bg_sensitivity - 50) / 2) + 10 # Constant subtracted from mean

    # Create mask of the signature (white ink on black background)
    mask = cv2.adaptiveThreshold(
        gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY_INV, block_size, C
    )

    # Morphological operations to clean up mask and fill gaps
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2, 2))
    mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel, iterations=1)
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel, iterations=1)

    # 7. Create output image with alpha channel
    # We want to keep the original ink color where mask is white, and transparent where mask is black
    b, g, r = cv2.split(img)
    
    # Optional: Enhance ink color by darkening it slightly based on mask
    # To make ink pop, we can use the original color but make it fully opaque where mask > 0
    # Actually, using the mask directly as alpha channel gives smooth anti-aliased edges!
    
    # Smooth the mask for anti-aliasing
    mask_blurred = cv2.GaussianBlur(mask, (3, 3), 0)
    
    out_img = cv2.merge((b, g, r, mask_blurred))

    # 8. Crop to bounding box
    coords = cv2.findNonZero(mask)
    if coords is not None:
        x, y, w, h = cv2.boundingRect(coords)
        # Add some padding
        padding = 10
        y1 = max(0, y - padding)
        y2 = min(out_img.shape[0], y + h + padding)
        x1 = max(0, x - padding)
        x2 = min(out_img.shape[1], x + w + padding)
        
        out_img = out_img[y1:y2, x1:x2]

    # 9. Encode as PNG
    is_success, buffer = cv2.imencode(".png", out_img)
    if not is_success:
        raise RuntimeError("Failed to encode image to PNG")
        
    return buffer.tobytes()
