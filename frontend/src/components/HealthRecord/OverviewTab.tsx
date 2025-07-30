import React, { useEffect } from 'react';
import { FileText, Calendar, Pill, Activity, User, Phone, Mail } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { getPatientHPRecords, getPatientPrescriptions, getPatientAppointments } from '../../redux/actions/healthRecordActions';

interface OverviewTabProps {
  patient: any;
  records: any;
}

const OverviewTab: React.FC<OverviewTabProps> = ({ patient, records }) => {
  const dispatch = useAppDispatch();
  const { handpRecord, prescriptions, appointments, loading } = useAppSelector(state => state.healthRecord);

  useEffect(() => {
    if (patient?.id) {
      dispatch(getPatientHPRecords(patient.id));
      dispatch(getPatientPrescriptions(patient.id));
      dispatch(getPatientAppointments(patient.id));
    }
  }, [dispatch, patient?.id]);

  const totalDocuments = Object.keys(records || {}).length;
  const totalPrescriptions = prescriptions?.length || 0;
  const totalAppointments = appointments?.length || 0;
  const recentAppointments = appointments?.filter((apt: any) => {
    const appointmentDate = new Date(apt.scheduledFor);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return appointmentDate > thirtyDaysAgo;
  })?.length || 0;

  const stats = [
    {
      title: 'Health Documents',
      value: totalDocuments,
      icon: FileText,
      color: 'bg-blue-500',
    },
    {
      title: 'Prescriptions',
      value: totalPrescriptions,
      icon: Pill,
      color: 'bg-green-500',
    },
    {
      title: 'Total Appointments',
      value: totalAppointments,
      icon: Calendar,
      color: 'bg-purple-500',
    },
    {
      title: 'Recent (30 days)',
      value: recentAppointments,
      icon: Activity,
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Patient Basic Info */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Patient Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3">
            <User className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Full Name</p>
              <p className="font-medium text-gray-900">{patient?.fullName || 'N/A'}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Mail className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-medium text-gray-900">{patient?.email || 'N/A'}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Phone className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Phone</p>
              <p className="font-medium text-gray-900">{patient?.phone || 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <div className="flex items-center">
                <div className={`${stat.color} p-2 rounded-lg`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="ml-3">
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-600">{stat.title}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Health Documents */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Health Documents</h3>
        
        {totalDocuments === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No health documents found</p>
            <p className="text-sm text-gray-400 mt-1">Patient hasn't uploaded any documents yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(records || {}).map(([docType, url]) => (
              <div key={docType} className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{docType}</p>
                    <a 
                      href={url as string} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      View Document
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading patient data...</span>
        </div>
      )}
    </div>
  );
};

export default OverviewTab;
