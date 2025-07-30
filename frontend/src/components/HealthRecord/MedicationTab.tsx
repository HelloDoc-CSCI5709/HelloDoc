import React, { useState, useEffect } from 'react';
import { Pill, Plus, Calendar, User, Trash2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { getPatientPrescriptions, createPrescription } from '../../redux/actions/healthRecordActions';
import { toast } from 'react-toastify';

interface MedicationTabProps {
  patient: any;
}

const MedicationTab: React.FC<MedicationTabProps> = ({ patient }) => {
  const dispatch = useAppDispatch();
  const { prescriptions, loading } = useAppSelector(state => state.healthRecord);
  const [showNewPrescription, setShowNewPrescription] = useState(false);
  const [newPrescription, setNewPrescription] = useState({
    medications: [{ name: '', dosage: '', frequency: '', duration: '' }],
    notes: ''
  });

  useEffect(() => {
    if (patient?.id) {
      dispatch(getPatientPrescriptions(patient.id));
    }
  }, [dispatch, patient?.id]);

  const handleAddMedication = () => {
    setNewPrescription(prev => ({
      ...prev,
      medications: [...prev.medications, { name: '', dosage: '', frequency: '', duration: '' }]
    }));
  };

  const handleMedicationChange = (index: number, field: string, value: string) => {
    setNewPrescription(prev => ({
      ...prev,
      medications: prev.medications.map((med, i) => 
        i === index ? { ...med, [field]: value } : med
      )
    }));
  };

  const handleRemoveMedication = (index: number) => {
    setNewPrescription(prev => ({
      ...prev,
      medications: prev.medications.filter((_, i) => i !== index)
    }));
  };

  const handleCreatePrescription = async () => {
    const validMedications = newPrescription.medications.filter(med => 
      med.name.trim() && med.dosage.trim() && med.frequency.trim()
    );

    if (validMedications.length === 0) {
      toast.error('Please add at least one complete medication');
      return;
    }

    try {
      await dispatch(createPrescription({
        patientId: patient.id,
        medications: validMedications,
        notes: newPrescription.notes
      })).unwrap();

      setNewPrescription({
        medications: [{ name: '', dosage: '', frequency: '', duration: '' }],
        notes: ''
      });
      setShowNewPrescription(false);
      toast.success('Prescription created successfully');
    } catch (error) {
      toast.error('Failed to create prescription');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">Medication Management</h3>
        <button
          onClick={() => setShowNewPrescription(!showNewPrescription)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>New Prescription</span>
        </button>
      </div>

      {/* New Prescription Form */}
      {showNewPrescription && (
        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
          <h4 className="text-md font-semibold text-gray-800 mb-4">Create New Prescription</h4>
          
          {/* Medications */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Medications</label>
              <button
                onClick={handleAddMedication}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                + Add Medication
              </button>
            </div>

            {newPrescription.medications.map((medication, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="text-xs text-gray-600">Medication Name</label>
                  <input
                    type="text"
                    value={medication.name}
                    onChange={(e) => handleMedicationChange(index, 'name', e.target.value)}
                    className="w-full mt-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Metformin"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600">Dosage</label>
                  <input
                    type="text"
                    value={medication.dosage}
                    onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)}
                    className="w-full mt-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 500mg"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600">Frequency</label>
                  <input
                    type="text"
                    value={medication.frequency}
                    onChange={(e) => handleMedicationChange(index, 'frequency', e.target.value)}
                    className="w-full mt-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Twice daily"
                  />
                </div>
                <div className="flex items-end space-x-2">
                  <div className="flex-1">
                    <label className="text-xs text-gray-600">Duration</label>
                    <input
                      type="text"
                      value={medication.duration}
                      onChange={(e) => handleMedicationChange(index, 'duration', e.target.value)}
                      className="w-full mt-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 30 days"
                    />
                  </div>
                  {newPrescription.medications.length > 1 && (
                    <button
                      onClick={() => handleRemoveMedication(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Notes */}
          <div className="mt-4">
            <label className="text-sm font-medium text-gray-700">Notes</label>
            <textarea
              value={newPrescription.notes}
              onChange={(e) => setNewPrescription(prev => ({ ...prev, notes: e.target.value }))}
              className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Additional instructions or notes..."
            />
          </div>

          {/* Actions */}
          <div className="flex space-x-3 mt-6">
            <button
              onClick={handleCreatePrescription}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Create Prescription
            </button>
            <button
              onClick={() => {
                setShowNewPrescription(false);
                setNewPrescription({
                  medications: [{ name: '', dosage: '', frequency: '', duration: '' }],
                  notes: ''
                });
              }}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Existing Prescriptions */}
      <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
        <h4 className="text-md font-semibold text-gray-800 mb-4">Prescription History</h4>
        
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading prescriptions...</span>
          </div>
        ) : prescriptions.length === 0 ? (
          <div className="text-center py-8">
            <Pill className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-gray-900 mb-2">No Prescriptions Found</h4>
            <p className="text-gray-600">No prescriptions have been created for this patient yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {prescriptions.map((prescription: any) => (
              <div key={prescription._id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {new Date(prescription.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {prescription.doctorId?.fullName || 'Doctor'}
                    </span>
                  </div>
                </div>

                {/* Medications */}
                <div className="space-y-3">
                  <h5 className="text-sm font-medium text-gray-800">Medications:</h5>
                  {prescription.medications?.map((medication: any, index: number) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-2">
                        <Pill className="w-4 h-4 text-blue-600" />
                        <span className="font-medium text-gray-900">{medication.name}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Dosage:</span> {medication.dosage}
                        </div>
                        <div>
                          <span className="font-medium">Frequency:</span> {medication.frequency}
                        </div>
                        <div>
                          <span className="font-medium">Duration:</span> {medication.duration}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Notes */}
                {prescription.notes && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <h5 className="text-sm font-medium text-gray-800 mb-2">Notes:</h5>
                    <p className="text-sm text-gray-700">{prescription.notes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicationTab;
