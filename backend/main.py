from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
import uvicorn
from image_processor import extract_signature
import logging

app = FastAPI(title="Signature Extraction API")

# Setup CORS to allow requests from the Vite frontend (usually runs on port 5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to the frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.post("/process-signature")
async def process_signature(
    file: UploadFile = File(...),
    bg_sensitivity: int = Form(50),
    brightness: int = Form(50),
    contrast: int = Form(50),
    sharpness: int = Form(50),
    noise_reduction: int = Form(50),
    use_rembg: bool = Form(False)
):
    try:
        image_bytes = await file.read()
        logger.info(f"Processing image: {file.filename}, size: {len(image_bytes)} bytes")
        
        processed_bytes = extract_signature(
            image_bytes,
            bg_sensitivity=bg_sensitivity,
            brightness=brightness,
            contrast=contrast,
            sharpness=sharpness,
            noise_reduction=noise_reduction,
            use_rembg=use_rembg
        )
        
        return Response(content=processed_bytes, media_type="image/png")
    except Exception as e:
        logger.error(f"Error processing image: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
