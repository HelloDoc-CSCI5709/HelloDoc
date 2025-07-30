import React, { useState, type JSX } from 'react';
import { BASE_URL } from '../../constant_url';
interface Patient {
  fullName: string;
  gender: string;
  dob: string;
  mobile: string;
  emergencyContact: string;
  email: string;
  image: string;
}

interface PatientDocumentUploadProps {
  patient: Patient | null;
  documents: { [key: string]: string }; 
}

const PatientDocumentUpload: React.FC<PatientDocumentUploadProps> = ({  documents }) => {
  const [files, setFiles] = useState({
    insuranceCard: null as File | null,
    healthFront: null as File | null,
    healthBack: null as File | null,
    medicalHistory: null as File | null,
    allergyDoc: null as File | null,
  });

  const [uploading, setUploading] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<{ [key: string]: 'success' | 'error' | null }>({});

  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];

  const apiMap: Record<keyof typeof files, string> = {
    insuranceCard: '/api/patient/upload/insurance',
    healthFront: '/api/patient/upload/healthcard/front',
    healthBack: '/api/patient/upload/healthcard/back',
    medicalHistory: '/api/patient/upload/medical-history',
    allergyDoc: '/api/patient/upload/allergy',
  };

  const documentLabels: Record<keyof typeof files, string> = {
    insuranceCard: 'Insurance Card',
    healthFront: 'Health Card (Front)',
    healthBack: 'Health Card (Back)',
    medicalHistory: 'Medical History',
    allergyDoc: 'Allergy Document',
  };

  const documentIcons: Record<keyof typeof files, JSX.Element> = {
    insuranceCard: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>,
    healthFront: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
    healthBack: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
    medicalHistory: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>,
    allergyDoc: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
  };

  const docKeyMap: { [key: string]: string } = {
    insuranceCard: "insurance",
    healthFront: "healthcard-front",
    healthBack: "healthcard-back",
    medicalHistory: "history",
    allergyDoc: "allergy",
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, key: keyof typeof files) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (!allowedTypes.includes(file.type)) {
        setUploadStatus(prev => ({ ...prev, [key]: 'error' }));
        e.target.value = '';
        return;
      }
      setFiles(prev => ({ ...prev, [key]: file }));
      setUploadStatus(prev => ({ ...prev, [key]: null }));
    }
  };

  const handleUpload = async (key: keyof typeof files) => {
    const file = files[key];
    if (!file) return;

    const token = localStorage.getItem('accessToken');
    if (!token) {
      setUploadStatus(prev => ({ ...prev, [key]: 'error' }));
      return;
    }

    setUploading(key);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`${BASE_URL}${apiMap[key]}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData,
      });

      if (res.ok) {
        setUploadStatus(prev => ({ ...prev, [key]: 'success' }));
        setFiles(prev => ({ ...prev, [key]: null }));
        setTimeout(() => {
          setUploadStatus(prev => ({ ...prev, [key]: null }));
        }, 3000);
      } else {
        setUploadStatus(prev => ({ ...prev, [key]: 'error' }));
      }
    } catch (err) {
      console.error(err);
      setUploadStatus(prev => ({ ...prev, [key]: 'error' }));
    } finally {
      setUploading(null);
    }
  };

  const removeFile = (key: keyof typeof files) => {
    setFiles(prev => ({ ...prev, [key]: null }));
    setUploadStatus(prev => ({ ...prev, [key]: null }));
  };

  const renderPreview = (file: File | null, key: keyof typeof files) => {
    if (!file) return null;
    const url = URL.createObjectURL(file);
    const isPDF = file.type === 'application/pdf';

    return (
      <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md relative">
        <button
          onClick={() => removeFile(key)}
          className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs hover:bg-red-600 flex items-center justify-center"
        >
          ×
        </button>
        {isPDF ? (
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <span className="text-xs text-gray-700 truncate">{file.name}</span>
          </div>
        ) : (
          <img src={url} alt="preview" className="w-full h-16 object-cover rounded" />
        )}
      </div>
    );
  };

  return (
    <div className="h-full bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 rounded-t-lg">
        <div className="flex items-center space-x-2">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <div>
            <h2 className="text-lg font-semibold text-white">Health Documents</h2>
            <p className="text-green-100 text-xs mt-1">Upload your medical documents</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6 max-h-[460px] overflow-y-auto">
        {Object.entries(apiMap).map(([key]) => {
          const typedKey = key as keyof typeof files;
          const file = files[typedKey];
          const status = uploadStatus[key];
          const isUploading = uploading === key;

          const alreadyUploadedURL = documents?.[docKeyMap[key]] || null;

          return (
            <div key={key} className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center space-x-2 mb-2">
                <div className="text-gray-600">{documentIcons[typedKey]}</div>
                <label className="text-xs font-medium text-gray-700 flex-1">{documentLabels[typedKey]}</label>
                {alreadyUploadedURL && (
                  <a
                    href={alreadyUploadedURL}
                    target="_blank"
                    download
                    className="text-xs text-blue-600 underline hover:text-blue-800"
                  >
                    Download
                  </a>
                )}
              </div>

              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => handleFileChange(e, typedKey)}
                className="w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 file:cursor-pointer cursor-pointer"
              />

              {renderPreview(file, typedKey)}

              {status === 'error' && (
                <div className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded mt-1">✗ Upload failed. Please try again.</div>
              )}

              <button
                onClick={() => handleUpload(typedKey)}
                disabled={!file || isUploading}
                className={`w-full py-1.5 px-3 text-xs font-medium rounded-md transition-colors duration-200 ${
                  file && !isUploading
                    ? 'bg-green-600 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isUploading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <svg className="animate-spin h-3 w-3 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Uploading...</span>
                  </div>
                ) : (
                  <>
                    <svg className="w-3 h-3 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    Upload
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      <div className="px-4 py-3 bg-gray-50 rounded-b-lg border-t border-gray-200">
        <div className="flex items-center space-x-1 text-xs text-gray-500">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Accepted formats: PDF, JPG, JPEG, PNG</span>
        </div>
      </div>
    </div>
  );
};

export default PatientDocumentUpload;
