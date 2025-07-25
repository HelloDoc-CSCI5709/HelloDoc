import React, { useState } from 'react';

const PatientDocumentUpload: React.FC = () => {
  const [files, setFiles] = useState({
    insuranceCard: null as File | null,
    healthFront: null as File | null,
    healthBack: null as File | null,
    medicalHistory: null as File | null,
    allergyDoc: null as File | null,
  });

  const [showUploads, setShowUploads] = useState({
    health: false,
    insurance: false,
    medical: false,
    allergy: false,
  });

  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, key: keyof typeof files) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (!allowedTypes.includes(file.type)) {
        alert('Only PDF, JPG, JPEG, and PNG files are allowed.');
        e.target.value = '';
        return;
      }
      setFiles(prev => ({ ...prev, [key]: file }));
    }
  };

  const renderPreview = (file: File | null, onRemove?: () => void) => {
    if (!file) return null;
    const url = URL.createObjectURL(file);
    const isPDF = file.type === 'application/pdf';

    return (
      <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200 relative">
        {onRemove && (
          <button
            onClick={onRemove}
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors z-10"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
        {isPDF ? (
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 font-medium underline">{file.name}</a>
              <p className="text-sm text-gray-500">PDF Document</p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <img src={url} alt="Preview" className="max-h-32 rounded-lg border shadow-sm mx-auto" />
            <p className="text-sm text-gray-600 text-center">{file.name}</p>
          </div>
        )}
      </div>
    );
  };

  const handleSingleFileUpload = (file: File | null, label: string, fileKey: keyof typeof files, showKey: keyof typeof showUploads) => {
    if (!file) {
      alert(`Please upload your ${label}.`);
      return;
    }
    alert(`${label} uploaded successfully (simulation).`);
    setFiles(prev => ({ ...prev, [fileKey]: null }));
    setShowUploads(prev => ({ ...prev, [showKey]: false }));
  };

  const handleCancelUpload = (type: string) => {
    const configs: Record<string, { files: (keyof typeof files)[], show: keyof typeof showUploads }> = {
      insurance: { files: ['insuranceCard'], show: 'insurance' },
      health: { files: ['healthFront', 'healthBack'], show: 'health' },
      medical: { files: ['medicalHistory'], show: 'medical' },
      allergy: { files: ['allergyDoc'], show: 'allergy' }
    };
    
    const config = configs[type];
    setFiles(prev => ({ ...prev, ...Object.fromEntries(config.files.map(f => [f, null])) }));
    setShowUploads(prev => ({ ...prev, [config.show]: false }));
  };

  const handleHealthUpload = () => {
    if (!files.healthFront || !files.healthBack) {
      alert('Please upload both front and back side of the health card.');
      return;
    }
    alert('Health card uploaded successfully (simulation).');
    setFiles(prev => ({ ...prev, healthFront: null, healthBack: null }));
    setShowUploads(prev => ({ ...prev, health: false }));
  };

  const uploadConfigs = [
    { key: 'insurance', title: 'Insurance Card', description: 'Upload your insurance card document', fileKey: 'insuranceCard' as keyof typeof files },
    { key: 'medical', title: 'Medical History Document', description: 'Upload your complete medical history', fileKey: 'medicalHistory' as keyof typeof files },
    { key: 'allergy', title: 'Allergy Document', description: 'Upload your allergy information and test results', fileKey: 'allergyDoc' as keyof typeof files }
  ];

  return (
    <div className="bg-gradient-to-br from-white to-blue-50 rounded-3xl shadow-lg border border-blue-100 p-8 backdrop-blur-sm">
      <div className="flex items-center space-x-3 mb-6 mt-1">
        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-gray-800">Upload Documents</h3>
      </div>
      
      <p className="text-gray-600 mb-8 text-sm">Accepted formats: PDF, JPG, JPEG, PNG</p>

      <div className="grid gap-8">
        {uploadConfigs.map(config => (
          <UploadSection
            key={config.key}
            title={config.title}
            description={config.description}
            file={files[config.fileKey]}
            setFile={(file) => setFiles(prev => ({ ...prev, [config.fileKey]: file }))}
            show={showUploads[config.key as keyof typeof showUploads]}
            setShow={(show) => setShowUploads(prev => ({ ...prev, [config.key]: show }))}
            onUpload={() => handleSingleFileUpload(files[config.fileKey], config.title, config.fileKey, config.key as keyof typeof showUploads)}
            onCancel={() => handleCancelUpload(config.key)}
          />
        ))}

        {/* Health Card */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition-all duration-300">
          <div className="mb-4">
            <label className="block text-gray-800 font-semibold text-lg">Health Card</label>
            <p className="text-gray-500 text-sm">Upload both front and back sides</p>
          </div>
          
          {!showUploads.health ? (
            <button onClick={() => setShowUploads(prev => ({ ...prev, health: true }))} className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm disabled:opacity-50">
              Upload Health Card
            </button>
          ) : (
            <div className="space-y-6 animate-in slide-in-from-top-2 duration-300">
              <div className="grid md:grid-cols-2 gap-6">
                {[{ key: 'healthFront', label: 'Front Side' }, { key: 'healthBack', label: 'Back Side' }].map(side => (
                  <div key={side.key} className="space-y-3">
                    <label className="block text-gray-700 font-medium">{side.label}</label>
                    <input type="file" accept=".pdf, .jpg, .jpeg, .png" onChange={(e) => handleFileChange(e, side.key as keyof typeof files)} className="w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 file:transition-colors file:cursor-pointer cursor-pointer" />
                    {renderPreview(files[side.key as keyof typeof files], () => setFiles(prev => ({ ...prev, [side.key]: null })))}
                  </div>
                ))}
              </div>
              <div className="flex gap-4 pt-4">
                <button onClick={handleHealthUpload} className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm disabled:opacity-50">Upload Health Card</button>
                <button onClick={() => handleCancelUpload('health')} className="px-6 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm disabled:opacity-50 border border-gray-300">Cancel</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface UploadSectionProps {
  title: string;
  description: string;
  file: File | null;
  setFile: (file: File | null) => void;
  show: boolean;
  setShow: (show: boolean) => void;
  onUpload: () => void;
  onCancel: () => void;
}

const UploadSection: React.FC<UploadSectionProps> = ({ title, description, file, setFile, show, setShow, onUpload, onCancel }) => {
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (!allowedTypes.includes(selectedFile.type)) {
        alert('Only PDF, JPG, JPEG, and PNG files are allowed.');
        e.target.value = '';
        return;
      }
      setFile(selectedFile);
    }
  };

  const renderPreview = () => {
    if (!file) return null;
    const url = URL.createObjectURL(file);
    
    return (
      <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200 relative">
        <button
          onClick={() => setFile(null)}
          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors z-10"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        {file.type === 'application/pdf' ? (
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 font-medium underline">{file.name}</a>
              <p className="text-sm text-gray-500">PDF Document</p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <img src={url} alt="Preview" className="max-h-32 rounded-lg border shadow-sm mx-auto" />
            <p className="text-sm text-gray-600 text-center">{file.name}</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition-all duration-300">
      <div className="mb-4">
        <label className="block text-gray-800 font-semibold text-lg">{title}</label>
        <p className="text-gray-500 text-sm">{description}</p>
      </div>
      
      {!show ? (
        <button onClick={() => setShow(true)} className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm disabled:opacity-50">Upload {title}</button>
      ) : (
        <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
          <input type="file" accept=".pdf, .jpg, .jpeg, .png" onChange={handleFileChange} className="w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 file:transition-colors file:cursor-pointer cursor-pointer" />
          {renderPreview()}
          <div className="flex gap-4 pt-2">
            <button onClick={onUpload} className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm disabled:opacity-50">Upload {title}</button>
            <button onClick={onCancel} className="px-6 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm disabled:opacity-50 border border-gray-300">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientDocumentUpload;