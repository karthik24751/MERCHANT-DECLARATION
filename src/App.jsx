import React, { useRef, useState } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { Download, RefreshCw, Upload, Image as ImageIcon } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import { DeclarationTemplate } from './DeclarationTemplate';
import { ImageEditorModal } from './components/ImageEditorModal';
import './index.css';

const initialFormState = {
  // Letterpad Header
  businessName: '',
  regAddress: '',
  mobile: '',
  email: '',

  // Section 1: Merchant Details
  name: '',
  designation: '',
  addressLogic: 'same',
  opAddress: '',

  // Section 2: Details
  disabilityType: '',
  disabilityPercentage: '',
  fatherName: '',

  // Section 3: KYC
  kycPan: false,
  kycDoc: '',

  // Section 4: Declaration Sign 1
  signature1: null,
  seal1: null,

  // Section 5: Entity Type
  entityType: '',

  // Section 6: TAN
  tanOption: '',
  tanNumber: '',

  // Section 7: GST
  gstOption: '',
  gstNumber: '',

  // Section 8: Nature of Entity
  natureOfEntity: '',

  // Section 9: PEP
  pep: '',

  // Section 10: PAN
  panNumber: '',

  // Section 11: Final
  signatureFinal: null,
  sealFinal: null,
  picture: null,
  date: '',
  place: '',
};

function App() {
  const [formData, setFormData] = useLocalStorage('merchant-declaration-form', initialFormState);
  const pdfRef = useRef(null);
  
  // Image Editor State
  const [editingImageFile, setEditingImageFile] = useState(null);
  const [editingImageField, setEditingImageField] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const processBasicImage = (file, fieldName) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const max_size = 800;

        if (width > height) {
          if (width > max_size) {
            height *= max_size / width;
            width = max_size;
          }
        } else {
          if (height > max_size) {
            width *= max_size / height;
            height = max_size;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setFormData(prev => ({
          ...prev,
          [fieldName]: dataUrl
        }));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  const handleImageUpload = (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      if (['signature1', 'seal1', 'signatureFinal', 'sealFinal'].includes(fieldName)) {
        // Open Advanced Image Editor for Signatures and Seals
        setEditingImageFile(file);
        setEditingImageField(fieldName);
      } else {
        // Basic processing for normal pictures (like Authorized Signatory Picture)
        processBasicImage(file, fieldName);
      }
    }
  };

  const handleEditorSave = (dataUrl) => {
    setFormData(prev => ({
      ...prev,
      [editingImageField]: dataUrl
    }));
    setEditingImageFile(null);
    setEditingImageField(null);
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      setFormData(initialFormState);
      window.scrollTo(0, 0);
    }
  };

  const handleGeneratePDF = async () => {
    try {
      if (!pdfRef.current) return;
      const element = pdfRef.current;
      const opt = {
        margin: 0,
        filename: `Merchant_Declaration_${formData.businessName || 'Form'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };
      html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Check console for details.');
    }
  };

  return (
    <div className="container">
      {editingImageFile && (
        <ImageEditorModal 
          file={editingImageFile} 
          onSave={handleEditorSave} 
          onClose={() => {
            setEditingImageFile(null);
            setEditingImageField(null);
          }} 
        />
      )}

      <h1>PhonePe Merchant Declaration</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
        Fill out the details below. The system automatically saves your progress.
      </p>

      {/* SECTION 1 */}
      <div className="card">
        <h2>Section 1: Merchant Details & Letterhead</h2>
        <div className="grid-2 mt-4">
          <div className="form-group">
            <label>Business Name (Used for Letterhead & Form)</label>
            <input type="text" className="form-control" name="businessName" value={formData.businessName} onChange={handleChange} placeholder="e.g. SHREE RAGHAVENDRA FUELS" />
          </div>
          <div className="form-group">
            <label>Registered Office Address (Used for Letterhead & Form)</label>
            <input type="text" className="form-control" name="regAddress" value={formData.regAddress} onChange={handleChange} placeholder="Full Address" />
          </div>
          <div className="form-group">
            <label>Name of Authorized Signatory</label>
            <input type="text" className="form-control" name="name" value={formData.name} onChange={handleChange} placeholder="Full Name" />
          </div>
          <div className="form-group">
            <label>Authorized Designation</label>
            <input type="text" className="form-control" name="designation" value={formData.designation} onChange={handleChange} placeholder="e.g. Partner, Director" />
          </div>
        </div>

        <div className="form-group mt-4">
          <label>Principal Place of Operation</label>
          <div className="radio-group horizontal">
            <label className="radio-label">
              <input type="radio" name="addressLogic" value="same" checked={formData.addressLogic === 'same'} onChange={handleChange} />
              Same as Registered Office
            </label>
            <label className="radio-label">
              <input type="radio" name="addressLogic" value="different" checked={formData.addressLogic === 'different'} onChange={handleChange} />
              Different Address
            </label>
          </div>
        </div>

        {formData.addressLogic === 'different' && (
          <div className="form-group">
            <label>Operating Address</label>
            <input type="text" className="form-control" name="opAddress" value={formData.opAddress} onChange={handleChange} placeholder="Enter operating address" />
          </div>
        )}
      </div>

      {/* SECTION 2 */}
      <div className="card">
        <h2>Section 2: Details Provided</h2>
        <div className="grid-2 mt-4">
          <div className="form-group">
            <label>Mobile Number (For Letterhead & Form)</label>
            <input type="text" className="form-control" name="mobile" value={formData.mobile} onChange={handleChange} placeholder="10-digit number" />
          </div>
          <div className="form-group">
            <label>Email ID (For Letterhead & Form)</label>
            <input type="email" className="form-control" name="email" value={formData.email} onChange={handleChange} placeholder="email@example.com" />
          </div>
          <div className="form-group">
            <label>Father's Name (Authorized Signatory)</label>
            <input type="text" className="form-control" name="fatherName" value={formData.fatherName} onChange={handleChange} />
          </div>
        </div>
        
        <p className="mt-4" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Person with Disability (Optional)</p>
        <div className="grid-2">
          <div className="form-group">
            <label>Type of Disability</label>
            <input type="text" className="form-control" name="disabilityType" value={formData.disabilityType} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Percentage of Disability</label>
            <input type="text" className="form-control" name="disabilityPercentage" value={formData.disabilityPercentage} onChange={handleChange} />
          </div>
        </div>
      </div>

      {/* SECTION 3 */}
      <div className="card">
        <h2>Section 3: KYC Documents</h2>
        <div className="checkbox-group mt-4">
          <label className="checkbox-label">
            <input type="checkbox" name="kycPan" checked={formData.kycPan} onChange={handleChange} />
            PAN Card (Mandatory)
          </label>
        </div>
        
        <p className="mt-4 mb-4" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Any one of the following:</p>
        <div className="radio-group">
          <label className="radio-label">
            <input type="radio" name="kycDoc" value="aadhaar" checked={formData.kycDoc === 'aadhaar'} onChange={handleChange} />
            Aadhaar (Masked except last 4 digits)
          </label>
          <label className="radio-label">
            <input type="radio" name="kycDoc" value="dl" checked={formData.kycDoc === 'dl'} onChange={handleChange} />
            Driving License
          </label>
          <label className="radio-label">
            <input type="radio" name="kycDoc" value="voterid" checked={formData.kycDoc === 'voterid'} onChange={handleChange} />
            Voter ID
          </label>
        </div>
      </div>

      {/* SECTION 4 */}
      <div className="card">
        <h2>Section 4: Declaration Signatures</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
          Our AI will automatically extract the signature/seal, remove the background, and make it transparent.
        </p>
        <div className="grid-2 mt-4">
          <div className="form-group">
            <label>Upload Signature</label>
            <div className="file-upload-wrapper">
              <Upload size={24} color="var(--primary-color)" />
              <p style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>Click to upload signature</p>
              <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'signature1')} />
              {formData.signature1 && <img src={formData.signature1} alt="Signature 1" className="preview-image" style={{ background: '#f8fafc' }} />}
            </div>
          </div>
          <div className="form-group">
            <label>Upload Company Seal (Optional)</label>
            <div className="file-upload-wrapper">
              <Upload size={24} color="var(--primary-color)" />
              <p style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>Click to upload seal</p>
              <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'seal1')} />
              {formData.seal1 && <img src={formData.seal1} alt="Seal 1" className="preview-image" style={{ background: '#f8fafc' }} />}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 5 */}
      <div className="card">
        <h2>Section 5: Merchant Entity Type</h2>
        <div className="grid-2 mt-4">
          <div className="radio-group">
            <label className="radio-label"><input type="radio" name="entityType" value="individual" checked={formData.entityType === 'individual'} onChange={handleChange}/> Individual/Sole proprietorship</label>
            <label className="radio-label"><input type="radio" name="entityType" value="company" checked={formData.entityType === 'company'} onChange={handleChange}/> Company</label>
            <label className="radio-label"><input type="radio" name="entityType" value="registered_partnership" checked={formData.entityType === 'registered_partnership'} onChange={handleChange}/> Registered Partnership Firm</label>
            <label className="radio-label"><input type="radio" name="entityType" value="unregistered_partnership" checked={formData.entityType === 'unregistered_partnership'} onChange={handleChange}/> Un-Registered Partnership Firm</label>
            <label className="radio-label"><input type="radio" name="entityType" value="body_of_individual" checked={formData.entityType === 'body_of_individual'} onChange={handleChange}/> Body of individual</label>
            <label className="radio-label"><input type="radio" name="entityType" value="govt" checked={formData.entityType === 'govt'} onChange={handleChange}/> Government Departments / PSU</label>
          </div>
          <div className="radio-group">
            <label className="radio-label"><input type="radio" name="entityType" value="huf" checked={formData.entityType === 'huf'} onChange={handleChange}/> HUF</label>
            <label className="radio-label"><input type="radio" name="entityType" value="trust" checked={formData.entityType === 'trust'} onChange={handleChange}/> Trust</label>
            <label className="radio-label"><input type="radio" name="entityType" value="society" checked={formData.entityType === 'society'} onChange={handleChange}/> Society</label>
            <label className="radio-label"><input type="radio" name="entityType" value="others" checked={formData.entityType === 'others'} onChange={handleChange}/> Others (Club, University, etc.)</label>
            <label className="radio-label"><input type="radio" name="entityType" value="association_of_person" checked={formData.entityType === 'association_of_person'} onChange={handleChange}/> Association of Person</label>
          </div>
        </div>
      </div>

      {/* SECTION 6 & 7 */}
      <div className="card">
        <h2>Section 6 & 7: Tax Details</h2>
        <div className="form-group mt-4">
          <label>TAN Details</label>
          <div className="radio-group horizontal">
            <label className="radio-label"><input type="radio" name="tanOption" value="has_tan" checked={formData.tanOption === 'has_tan'} onChange={handleChange}/> Merchant has TAN</label>
            <label className="radio-label"><input type="radio" name="tanOption" value="no_tan" checked={formData.tanOption === 'no_tan'} onChange={handleChange}/> Merchant does not have TAN</label>
          </div>
          {formData.tanOption === 'has_tan' && (
             <input type="text" className="form-control mt-4" name="tanNumber" value={formData.tanNumber} onChange={handleChange} placeholder="Enter TAN Number" />
          )}
        </div>

        <div className="form-group mt-8">
          <label>GST Details</label>
          <div className="radio-group horizontal">
            <label className="radio-label"><input type="radio" name="gstOption" value="has_gst" checked={formData.gstOption === 'has_gst'} onChange={handleChange}/> Merchant has GST</label>
            <label className="radio-label"><input type="radio" name="gstOption" value="no_gst" checked={formData.gstOption === 'no_gst'} onChange={handleChange}/> No GST Registration</label>
          </div>
          {formData.gstOption === 'has_gst' && (
             <input type="text" className="form-control mt-4" name="gstNumber" value={formData.gstNumber} onChange={handleChange} placeholder="Enter GSTIN Number" />
          )}
        </div>
      </div>

      {/* SECTION 8, 9, 10 */}
      <div className="card">
        <h2>Section 8, 9 & 10: Additional Details</h2>
        
        <div className="form-group mt-4">
          <label>Nature of Entity</label>
          <div className="radio-group horizontal">
            <label className="radio-label"><input type="radio" name="natureOfEntity" value="govt_org" checked={formData.natureOfEntity === 'govt_org'} onChange={handleChange}/> Govt Org</label>
            <label className="radio-label"><input type="radio" name="natureOfEntity" value="ngo" checked={formData.natureOfEntity === 'ngo'} onChange={handleChange}/> NGO / Charitable</label>
            <label className="radio-label"><input type="radio" name="natureOfEntity" value="na" checked={formData.natureOfEntity === 'na'} onChange={handleChange}/> NA</label>
          </div>
        </div>

        <div className="form-group mt-4">
          <label>Politically Exposed Person (PEP) / Associate?</label>
          <div className="radio-group horizontal">
            <label className="radio-label"><input type="radio" name="pep" value="yes" checked={formData.pep === 'yes'} onChange={handleChange}/> Yes</label>
            <label className="radio-label"><input type="radio" name="pep" value="no" checked={formData.pep === 'no'} onChange={handleChange}/> No (Applies declaration)</label>
          </div>
        </div>

        <div className="form-group mt-4">
          <label>PAN Number (Declaration)</label>
          <input type="text" className="form-control" name="panNumber" value={formData.panNumber} onChange={handleChange} placeholder="Enter PAN" />
        </div>
      </div>

      {/* SECTION 11 */}
      <div className="card">
        <h2>Section 11: Final Signature & Countersign</h2>
        <div className="grid-2 mt-4">
          <div className="form-group">
            <label>Final Signature</label>
            <div className="file-upload-wrapper">
              <Upload size={24} color="var(--primary-color)" />
              <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'signatureFinal')} />
              {formData.signatureFinal && <img src={formData.signatureFinal} alt="Final Sign" className="preview-image" style={{ background: '#f8fafc' }} />}
            </div>
          </div>
          <div className="form-group">
            <label>Final Seal (Optional)</label>
            <div className="file-upload-wrapper">
              <Upload size={24} color="var(--primary-color)" />
              <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'sealFinal')} />
              {formData.sealFinal && <img src={formData.sealFinal} alt="Final Seal" className="preview-image" style={{ background: '#f8fafc' }} />}
            </div>
          </div>
          <div className="form-group">
            <label>Picture of Authorized Signatory (Countersign)</label>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Final signature will automatically be placed over this picture.
            </p>
            <div className="file-upload-wrapper">
              <ImageIcon size={24} color="var(--primary-color)" />
              <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'picture')} />
              {formData.picture && <img src={formData.picture} alt="Picture" className="preview-image" />}
            </div>
          </div>
        </div>

        <div className="grid-2 mt-4">
          <div className="form-group">
            <label>Date</label>
            <input type="date" className="form-control" name="date" value={formData.date} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Place</label>
            <input type="text" className="form-control" name="place" value={formData.place} onChange={handleChange} />
          </div>
        </div>
      </div>

      {/* ACTIONS */}
      <div className="actions-bar">
        <button className="btn btn-danger" onClick={handleReset}>
          <RefreshCw size={18} /> Reset Form
        </button>
        <button className="btn btn-primary" onClick={handleGeneratePDF}>
          <Download size={18} /> Generate PDF
        </button>
      </div>
      {/* Hidden printable template */}
      <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
        <DeclarationTemplate ref={pdfRef} data={formData} />
      </div>
    </div>
  );
}

export default App;
