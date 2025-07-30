import React, { useState, useEffect } from 'react';
import { FileText, Download, MessageSquare, Eye, Plus } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { addHealthRecordNote, updateHealthRecord, getPatientHPRecords } from '../../redux/actions/healthRecordActions';
import { toast } from 'react-toastify';

interface MedicalRecordTabProps {
  patient: any;
  records: any;
}

const MedicalRecordTab: React.FC<MedicalRecordTabProps> = ({ patient, records }) => {
  const dispatch = useAppDispatch();
  const { handpRecord, loading } = useAppSelector(state => state.healthRecord);
  const [newNote, setNewNote] = useState('');
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<any>({});

  useEffect(() => {
    if (patient?.id) {
      dispatch(getPatientHPRecords(patient.id));
    }
  }, [dispatch, patient?.id]);

  const handleAddNote = async () => {
    if (!newNote.trim()) {
      toast.error('Please enter a note');
      return;
    }
    const patientId = patient._id || patient.id;
  
    if (!patientId) {
    toast.error('Patient ID is missing');
    return;
    }

    try {
      await dispatch(addHealthRecordNote({ patientId: patient.id, note: newNote })).unwrap();
      setNewNote('');
      setShowNoteForm(false);
      toast.success('Note added successfully');
    } catch (error) {
      toast.error('Failed to add note');
    }
  };

  const handleUpdateField = async (field: string, value: string) => {
    try {
      await dispatch(updateHealthRecord({ 
        patientId: patient.id, 
        updateData: { [field]: value }
      })).unwrap();
      setEditingField(null);
      setEditValues({});
      toast.success('Record updated successfully');
    } catch (error) {
      toast.error('Failed to update record');
    }
  };

  const medicalFields = [
    { key: 'height', label: 'Height', type: 'text' },
    { key: 'weight', label: 'Weight', type: 'text' },
    { key: 'bloodType', label: 'Blood Type', type: 'text' },
    { key: 'allergies', label: 'Allergies', type: 'textarea' },
    { key: 'medications', label: 'Current Medications', type: 'textarea' },
    { key: 'chronicIssues', label: 'Chronic Issues', type: 'textarea' },
  ];

  return (
    <div className="space-y-6">
      {/* H&P Record Management */}
      <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-800">Health & Physical Record</h3>
          <button
            onClick={() => setShowNoteForm(!showNoteForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Note</span>
          </button>
        </div>

        {/* Editable Medical Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {medicalFields.map((field) => (
            <div key={field.key} className="space-y-2">
              <label className="text-sm font-medium text-gray-700">{field.label}</label>
              {editingField === field.key ? (
                <div className="space-y-2">
                  {field.type === 'textarea' ? (
                    <textarea
                      value={editValues[field.key] || handpRecord?.[field.key] || ''}
                      onChange={(e) => setEditValues(prev => ({ ...prev, [field.key]: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                    />
                  ) : (
                    <input
                      type={field.type}
                      value={editValues[field.key] || handpRecord?.[field.key] || ''}
                      onChange={(e) => setEditValues(prev => ({ ...prev, [field.key]: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  )}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleUpdateField(field.key, editValues[field.key] || handpRecord?.[field.key] || '')}
                      className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setEditingField(null);
                        setEditValues({});
                      }}
                      className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-800">
                    {handpRecord?.[field.key] || 'Not specified'}
                  </span>
                  <button
                    onClick={() => setEditingField(field.key)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Add Note Form */}
        {showNoteForm && (
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h4 className="font-medium text-gray-900 mb-3">Add Doctor Note</h4>
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Enter your medical note here..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
            />
            <div className="flex space-x-3 mt-3">
              <button
                onClick={handleAddNote}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Note
              </button>
              <button
                onClick={() => {
                  setShowNoteForm(false);
                  setNewNote('');
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Doctor Notes */}
        {handpRecord?.doctorNotes && handpRecord.doctorNotes.length > 0 && (
          <div className="mt-6">
            <h4 className="font-medium text-gray-900 mb-3">Doctor Notes</h4>
            <div className="space-y-3">
              {handpRecord.doctorNotes.map((note: any, index: number) => (
                <div key={index} className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-900">
                      {note.doctorId?.fullName || 'Doctor'}
                    </span>
                    <span className="text-xs text-blue-600">
                      {new Date(note.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{note.note}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Health Documents */}
      <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Health Documents</h3>
        
        {Object.keys(records || {}).length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-gray-900 mb-2">No Documents Found</h4>
            <p className="text-gray-600">This patient hasn't uploaded any health documents yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(records || {}).map(([docType, url]) => (
              <div key={docType} className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">📄</span>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{docType}</h4>
                      <p className="text-xs text-blue-600">Health Document</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <a
                      href={url as string}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View Document"
                    >
                      <Eye className="w-4 h-4" />
                    </a>
                    <a
                      href={url as string}
                      download
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  </div>
                  <span className="text-xs text-gray-500">Available</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading medical records...</span>
        </div>
      )}
    </div>
  );
};

export default MedicalRecordTab;
