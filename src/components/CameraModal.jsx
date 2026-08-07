import React, { useRef, useCallback, useState } from 'react';
import Webcam from 'react-webcam';
import { X, Camera, RefreshCw, Check } from 'lucide-react';

export const CameraModal = ({ onCapture, onClose }) => {
  const webcamRef = useRef(null);
  const [imgSrc, setImgSrc] = useState(null);

  const capture = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setImgSrc(imageSrc);
    }
  }, [webcamRef]);

  const handleRetake = () => {
    setImgSrc(null);
  };

  const handleConfirm = () => {
    if (!imgSrc) return;
    
    // Convert base64 data url to File object
    fetch(imgSrc)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], "camera-capture.jpg", { type: "image/jpeg" });
        onCapture(file);
      });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '600px', height: 'auto', maxHeight: '90vh' }}>
        <div className="modal-header">
          <h3>Take a Photo</h3>
          <button className="icon-btn" onClick={onClose}><X size={20} /></button>
        </div>
        
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', overflowY: 'auto' }}>
          {!imgSrc ? (
            <>
              <div style={{ borderRadius: '12px', overflow: 'hidden', background: '#000', width: '100%', border: '1px solid var(--border-color)' }}>
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  videoConstraints={{ facingMode: "environment" }}
                  style={{ width: '100%', height: 'auto', display: 'block', maxHeight: '60vh', objectFit: 'contain' }}
                />
              </div>
              <button className="btn btn-primary" onClick={capture} style={{ width: '100%', maxWidth: '250px' }}>
                <Camera size={20} /> Capture Photo
              </button>
            </>
          ) : (
            <>
              <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-color)', width: '100%', background: '#000' }}>
                <img src={imgSrc} alt="Captured" style={{ width: '100%', height: 'auto', display: 'block', maxHeight: '60vh', objectFit: 'contain' }} />
              </div>
              <div style={{ display: 'flex', gap: '1rem', width: '100%', justifyContent: 'center' }}>
                <button className="btn btn-secondary" onClick={handleRetake}>
                  <RefreshCw size={20} /> Retake
                </button>
                <button className="btn btn-primary" onClick={handleConfirm}>
                  <Check size={20} /> Use Photo
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
