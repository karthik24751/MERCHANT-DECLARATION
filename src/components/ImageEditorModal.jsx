import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { X, Check, RefreshCw, Sliders, Image as ImageIcon, Crop, RotateCcw, ArrowLeftRight } from 'lucide-react';
import '../declaration.css';

export const ImageEditorModal = ({ file, onSave, onClose }) => {
  const [activeTab, setActiveTab] = useState('adjust'); // 'adjust', 'crop'
  const [originalUrl, setOriginalUrl] = useState('');
  const [processedUrl, setProcessedUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  // Settings
  const [settings, setSettings] = useState({
    bg_sensitivity: 50,
    brightness: 50,
    contrast: 50,
    sharpness: 50,
    noise_reduction: 50,
    use_rembg: false,
  });

  // Crop State
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState(null);
  const imgRef = useRef(null);

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setOriginalUrl(url);
      setProcessedUrl(url); // Initial processed url is original
      
      // Auto-process on load with default settings
      processImage(file, settings);
      
      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

  const processImage = async (currentFile, currentSettings, cropData = null) => {
    setIsProcessing(true);
    setError(null);
    try {
      let fileToProcess = currentFile;
      
      // If there is a crop, we should crop the image on canvas first and send the cropped blob
      if (cropData && imgRef.current && cropData.width && cropData.height) {
        fileToProcess = await getCroppedImg(imgRef.current, cropData);
      }

      const formData = new FormData();
      formData.append('file', fileToProcess, currentFile.name || 'image.png');
      formData.append('bg_sensitivity', currentSettings.bg_sensitivity);
      formData.append('brightness', currentSettings.brightness);
      formData.append('contrast', currentSettings.contrast);
      formData.append('sharpness', currentSettings.sharpness);
      formData.append('noise_reduction', currentSettings.noise_reduction);
      formData.append('use_rembg', currentSettings.use_rembg);

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await fetch(`${API_URL}/process-signature`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to process image on server');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setProcessedUrl(url);
    } catch (err) {
      console.error(err);
      setError('Processing failed. Is the backend running?');
    } finally {
      setIsProcessing(false);
    }
  };

  // Debounce settings change
  useEffect(() => {
    const handler = setTimeout(() => {
      if (file) {
        processImage(file, settings, completedCrop);
      }
    }, 500);
    return () => clearTimeout(handler);
  }, [settings, completedCrop]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : parseInt(value)
    }));
  };

  const handleReset = () => {
    setSettings({
      bg_sensitivity: 50,
      brightness: 50,
      contrast: 50,
      sharpness: 50,
      noise_reduction: 50,
      use_rembg: false,
    });
    setCrop(undefined);
    setCompletedCrop(null);
  };

  const handleSave = () => {
    // Convert blob url to data url so it can be saved in local storage easily
    fetch(processedUrl)
      .then(r => r.blob())
      .then(blob => {
        const reader = new FileReader();
        reader.onloadend = () => {
          onSave(reader.result);
        };
        reader.readAsDataURL(blob);
      });
  };

  // Canvas utility for cropping
  const getCroppedImg = (image, crop) => {
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext('2d');

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/png');
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content image-editor">
        <div className="modal-header">
          <h3>Advanced Signature Extraction</h3>
          <button className="icon-btn" onClick={onClose}><X size={20} /></button>
        </div>
        
        <div className="editor-layout">
          {/* LEFT: Preview Area */}
          <div className="editor-preview">
            <div className="preview-container transparent-bg">
              {isProcessing && (
                <div className="processing-overlay">
                  <RefreshCw className="spin" size={32} />
                  <span>Processing AI...</span>
                </div>
              )}
              {activeTab === 'crop' ? (
                <ReactCrop 
                   crop={crop} 
                   onChange={c => setCrop(c)} 
                   onComplete={c => setCompletedCrop(c)}
                >
                  <img ref={imgRef} src={originalUrl} alt="Original to crop" className="preview-main" />
                </ReactCrop>
              ) : (
                <img src={processedUrl} alt="Processed Signature" className="preview-main" />
              )}
            </div>
            
            {error && <div className="error-msg">{error}</div>}
            
            <div className="tabs mt-4">
              <button className={`tab-btn ${activeTab === 'adjust' ? 'active' : ''}`} onClick={() => setActiveTab('adjust')}>
                <Sliders size={16} /> Adjustments
              </button>
              <button className={`tab-btn ${activeTab === 'crop' ? 'active' : ''}`} onClick={() => setActiveTab('crop')}>
                <Crop size={16} /> Crop Original
              </button>
            </div>
          </div>

          {/* RIGHT: Controls */}
          <div className="editor-controls">
            {activeTab === 'adjust' && (
              <>
                <div className="control-group">
                  <label>Background Sensitivity: {settings.bg_sensitivity}</label>
                  <input type="range" name="bg_sensitivity" min="0" max="100" value={settings.bg_sensitivity} onChange={handleChange} />
                </div>
                <div className="control-group">
                  <label>Brightness: {settings.brightness}</label>
                  <input type="range" name="brightness" min="0" max="100" value={settings.brightness} onChange={handleChange} />
                </div>
                <div className="control-group">
                  <label>Contrast: {settings.contrast}</label>
                  <input type="range" name="contrast" min="0" max="100" value={settings.contrast} onChange={handleChange} />
                </div>
                <div className="control-group">
                  <label>Sharpness: {settings.sharpness}</label>
                  <input type="range" name="sharpness" min="0" max="100" value={settings.sharpness} onChange={handleChange} />
                </div>
                <div className="control-group">
                  <label>Noise Reduction: {settings.noise_reduction}</label>
                  <input type="range" name="noise_reduction" min="0" max="100" value={settings.noise_reduction} onChange={handleChange} />
                </div>
                
                <div className="checkbox-group mt-4 mb-4">
                  <label className="checkbox-label" title="Use U2-Net for complex backgrounds (like desks)">
                    <input type="checkbox" name="use_rembg" checked={settings.use_rembg} onChange={handleChange} />
                    Enable Deep AI Background Removal
                  </label>
                </div>
              </>
            )}

            {activeTab === 'crop' && (
              <div className="crop-instructions">
                <p>Drag on the image to select the area containing the signature.</p>
                <p>This will help the AI focus only on the ink and ignore other document artifacts.</p>
              </div>
            )}

            <div className="editor-actions">
              <button className="btn btn-secondary" onClick={handleReset}>
                <RotateCcw size={16} /> Reset
              </button>
              <button className="btn btn-primary" onClick={handleSave} disabled={isProcessing}>
                <Check size={16} /> Apply Signature
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
