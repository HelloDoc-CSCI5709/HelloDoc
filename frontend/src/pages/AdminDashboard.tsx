import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import {
  fetchUsers,
  fetchAppointments,
  deleteAppointment,
  fetchPendingCredentials,
  approveDoctorCredential,
  rejectDoctorCredential,
  fetchVideoLogs
} from '../redux/actions/adminActions';
import {
  clearAdminError,
  resetAdminSuccessFlags
} from '../redux/reducers/adminReducer';
import type { User, Credential, VideoLog, DoctorProfile, PatientProfile } from '../redux/actions/adminActions';


const decodeJwt = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
};

const AdminDashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    users,
    appointments,
    credentials,
    videoLogs,
    loading,
    error,
    deleteSuccess,
    approveSuccess,
    rejectSuccess
  } = useAppSelector(state => state.admin);
  const [currentUser, setCurrentUser] = useState<{ fullName?: string; email?: string; role?: string; userId?: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'users' | 'appointments' | 'credentials'>('users');
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedCredential, setSelectedCredential] = useState<Credential | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedVideoLogs, setSelectedVideoLogs] = useState<VideoLog[] | null>(null);

  // Decode JWT on mount and extract adminId
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      const decoded = decodeJwt(token);
      setCurrentUser(decoded);
    }
  }, []);

  // Load data when tab changes
  useEffect(() => {
    if (activeTab === 'users') {
      dispatch(fetchUsers());
    } else if (activeTab === 'appointments') {
      dispatch(fetchAppointments());
    } else if (activeTab === 'credentials') {
      dispatch(fetchPendingCredentials());
    }
  }, [activeTab, dispatch]);

  // Debug users data when it changes
  useEffect(() => {
    console.log('Users loaded:', users);
  }, [users]);

  // Reset success flags after a short delay
  useEffect(() => {
    if (deleteSuccess || approveSuccess || rejectSuccess) {
      const timer = setTimeout(() => {
        dispatch(resetAdminSuccessFlags());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [deleteSuccess, approveSuccess, rejectSuccess, dispatch]);

  // Clear error when leaving a tab
  useEffect(() => {
    return () => {
      if (error) {
        dispatch(clearAdminError());
      }
    };
  }, [activeTab, dispatch, error]);

  // Update selectedVideoLogs when videoLogs state changes
  useEffect(() => {
    if (selectedVideoLogs !== null && videoLogs.length > 0) {
      setSelectedVideoLogs(videoLogs);
    }
  }, [videoLogs]);

  // Handlers
  const handleApprove = (_id: string, doctorId: string) => {
    if (window.confirm('Approve this doctor credential?')) {
      if (!currentUser?.userId) {
        dispatch({ type: 'ADMIN_APPROVE_DOCTOR_FAILURE', payload: 'Admin ID not found in token' });
        return;
      }
      dispatch(approveDoctorCredential(doctorId, _id, currentUser.userId));
    }
  };

  const handleReject = (credential: Credential) => {
    setSelectedCredential(credential);
    setRejectionReason('');
  };

  const confirmReject = () => {
    if (selectedCredential && rejectionReason.trim()) {
      if (!currentUser?.userId) {
        dispatch({ type: 'ADMIN_REJECT_DOCTOR_FAILURE', payload: 'Admin ID not found in token' });
        return;
      }
      dispatch(
        rejectDoctorCredential(
          selectedCredential.doctorId,
          selectedCredential._id,
          rejectionReason.trim(),
          currentUser.userId
        )
      );
      setSelectedCredential(null);
      setRejectionReason('');
    }
  };

  const handleDeleteAppointment = (appointmentId: string) => {
    if (
      window.confirm(
        'Delete this appointment? This action cannot be undone.'
      )
    ) {
      dispatch(deleteAppointment(appointmentId));
    }
  };

  const handleViewLogs = (appointmentId: string) => {
    setSelectedVideoLogs([]); // Reset to show loading state in modal
    dispatch(fetchVideoLogs(appointmentId)).catch((err) => {
      console.error('Failed to fetch video logs:', err);
    });
  };

  const handleCloseLogs = () => {
    setSelectedVideoLogs(null);
    dispatch(clearAdminError()); // Clear any error when closing the modal
  };

  const handleLogout = () => {
    if (window.confirm('Logout?')) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
    }
  };

  const handleViewDetails = (user: User) => {
    setSelectedUser(user);
  };

  const handleCloseDetails = () => {
    setSelectedUser(null);
  };

  // Helpers
  const getStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      approved: 'bg-green-100 text-green-800 border-green-200',
      rejected: 'bg-red-100 text-red-800 border-red-200',
      not_submitted: 'bg-gray-100 text-gray-800 border-gray-200',
      scheduled: 'bg-blue-100 text-blue-800 border-blue-200',
      cancelled: 'bg-gray-100 text-gray-800 border-gray-200',
      completed: 'bg-purple-100 text-purple-800 border-purple-200',
      'no-show': 'bg-red-100 text-red-800 border-red-200',
      rescheduled: 'bg-blue-100 text-blue-800 border-blue-200',
      active: 'bg-green-100 text-green-800 border-green-200',
      suspended: 'bg-red-100 text-red-800 border-red-200',
      verified: 'bg-green-100 text-green-800 border-green-200'
    };
    return map[status.toLowerCase()] || map['pending'];
  };

  const formatDate = (iso?: string) => {
    if (!iso) return 'N/A';
    const d = new Date(iso);
    return isNaN(d.getTime())
      ? 'Invalid Date'
      : d.toLocaleString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });
  };

  const getUserName = (userId: string) => {
    const user = users.find(u => u._id === userId);
    return user ? user.fullName : userId;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-indigo-900 text-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-indigo-200">Manage users, appointments, and credentials</p>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-indigo-200">
              {currentUser?.fullName || currentUser?.email || 'Admin'}
            </span>
            <button
              onClick={handleLogout}
              className="bg-indigo-700 hover:bg-indigo-600 px-4 py-2 rounded text-sm transition-colors duration-200"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 px-4">
        {/* Success / Error Alerts */}
        {deleteSuccess && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-800 rounded">
            Appointment deleted successfully!
          </div>
        )}
        {approveSuccess && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-800 rounded">
            Credential approved successfully!
          </div>
        )}
        {rejectSuccess && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-800 rounded">
            Credential rejected successfully!
          </div>
        )}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-800 rounded flex justify-between">
            <span>{error}</span>
            <button onClick={() => dispatch(clearAdminError())}>×</button>
          </div>
        )}

        {/* Tabs */}
        <nav className="mb-6 border-b border-gray-200">
            {(['users', 'appointments', 'credentials'] as const).map(tab => (
                <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`mr-8 pb-2 ${
                    activeTab === tab
                    ? 'border-b-2 border-indigo-600 text-indigo-600'
                    : 'text-gray-600 hover:text-gray-800'
                } font-medium transition-colors duration-200`}
                >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}{' '}
                {tab === 'users' && `(${users.length})`}
                {tab === 'appointments' && `(${appointments?.length || 0})`}
                {tab === 'credentials' && `(${credentials?.length || 0})`}
                </button>
            ))}
        </nav>

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto" />
            <p className="mt-2 text-gray-600">Loading...</p>
          </div>
        )}

        {/* USERS TAB */}
        {activeTab === 'users' && !loading && (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.length > 0 ? (
                  users.map(user => (
                    <tr key={user._id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap">{user.fullName}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="capitalize">{user.role || 'Unknown'}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${getStatusBadge(
                            user.role === 'doctor' && user.credentialStatus
                              ? user.credentialStatus.status.toLowerCase().replace(' ', '_')
                              : 'not_submitted'
                          )}`}
                        >
                          {user.role === 'doctor' && user.credentialStatus
                            ? user.credentialStatus.status
                            : 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{formatDate(user.createdAt)}</td>
                      <td className="px-6 py-4 whitespace-nowrap space-x-2">
                        <button
                          onClick={() => handleViewDetails(user)}
                          className="text-indigo-600 hover:underline text-sm"
                        >
                          View Details
                        </button>
                        {user.role === 'doctor' && (
                          <button className="text-red-600 hover:underline text-sm">
                            {user.credentialStatus?.status === 'Approved' ? 'Suspend' : 'Activate'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* APPOINTMENTS TAB */}
        {activeTab === 'appointments' && !loading && (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date/Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {appointments.length > 0 ? (
                  appointments.map(apt => (
                    <tr key={apt._id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium">{apt.patientId.fullName}</div>
                        <div className="text-xs text-gray-500">{apt.patientId.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium">{apt.doctorId.fullName}</div>
                        <div className="text-xs text-gray-500">{apt.doctorId.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{formatDate(apt.scheduledFor)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusBadge(apt.status)}`}>
                          {apt.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap space-x-2">
                        <button
                          onClick={() => handleViewLogs(apt._id)}
                          className="text-indigo-600 hover:underline text-sm"
                        >
                          View Logs
                        </button>
                        <button
                          onClick={() => handleDeleteAppointment(apt._id)}
                          className="text-red-600 hover:underline text-sm"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      No appointments found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* CREDENTIALS TAB */}
        {activeTab === 'credentials' && !loading && (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Document</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {credentials.length > 0 ? (
                  credentials.map(cred => (
                    <tr key={cred._id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap">{cred.doctorName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{cred.fileName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{formatDate(cred.submittedAt)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusBadge(cred.status)}`}>
                          {cred.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap space-x-2">
                        {cred.filePath && (
                          <a
                            href={cred.filePath}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 hover:underline text-sm"
                          >
                            View PDF
                          </a>
                        )}
                        <button
                          onClick={() => handleApprove(cred._id, cred.doctorId)}
                          className="text-green-600 hover:underline text-sm"
                          disabled={cred.status !== 'Pending'}
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(cred)}
                          className="text-red-600 hover:underline text-sm"
                          disabled={cred.status !== 'Pending'}
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      No pending credentials.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Video Logs Modal */}
        {selectedVideoLogs !== null && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={handleCloseLogs}
          >
            <div
              className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[80vh] overflow-y-auto transform transition-all duration-300 scale-95"
              onClick={e => e.stopPropagation()}
            >
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800">Video Call Logs</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Logs for Appointment ID: {selectedVideoLogs[0]?.appointmentId || 'N/A'}
                </p>
              </div>
              <div className="px-6 py-4">
                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto" />
                    <p className="mt-2 text-gray-600">Loading logs...</p>
                  </div>
                ) : selectedVideoLogs.length > 0 ? (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined At</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Left At</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedVideoLogs.map(log => (
                        <tr key={log._id} className="hover:bg-gray-50 transition-colors duration-150">
                          <td className="px-6 py-4 whitespace-nowrap text-sm">{getUserName(log.userId)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm capitalize">{log.role}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">{log.roomId}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">{formatDate(log.joinedAt)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {log.leftAt ? formatDate(log.leftAt) : (
                              <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Active</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {log.durationInMin ? `${log.durationInMin} min` : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="p-6 text-center text-gray-500">
                    No call logs for this appointment.
                  </div>
                )}
              </div>
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
                <button
                  onClick={handleCloseLogs}
                  className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 transition-colors duration-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reject Modal */}
        {selectedCredential && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedCredential(null)}
          >
            <div
              className="bg-white rounded-lg shadow-xl max-w-md w-full transform transition-all duration-300 scale-95"
              onClick={e => e.stopPropagation()}
            >
              <div className="px-6 py-4">
                <h2 className="text-lg font-semibold text-gray-800">Reject Credential</h2>
                <p className="mt-2 text-sm text-gray-600">
                  Provide reason for rejecting <strong>{selectedCredential.doctorName}</strong>'s document.
                </p>
                <textarea
                  value={rejectionReason}
                  onChange={e => setRejectionReason(e.target.value)}
                  rows={4}
                  className="mt-4 w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Reason..."
                />
              </div>
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-2">
                <button
                  onClick={() => setSelectedCredential(null)}
                  className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmReject}
                  disabled={!rejectionReason.trim() || loading}
                  className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-colors duration-200"
                >
                  {loading ? 'Processing…' : 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* User Details Modal */}
        {selectedUser && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={handleCloseDetails}
          >
            <div
              className="bg-white rounded-lg shadow-xl max-w-lg w-full transform transition-all duration-300 scale-95"
              onClick={e => e.stopPropagation()}
            >
              <div className="px-6 py-4">
                <h2 className="text-lg font-semibold text-gray-800">User Details</h2>
                <p className="mt-2 text-sm text-gray-600">
                  Details for <strong>{selectedUser.fullName}</strong>
                </p>
                <div className="mt-4 space-y-2">
                  <div>
                    <span className="font-medium text-gray-700">Full Name:</span>{' '}
                    {selectedUser.fullName}
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Email:</span>{' '}
                    {selectedUser.email}
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Role:</span>{' '}
                    {selectedUser.role || 'Unknown'}
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Email Verified:</span>{' '}
                    {selectedUser.emailVerified ? 'Yes' : 'No'}
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Joined:</span>{' '}
                    {formatDate(selectedUser.createdAt)}
                  </div>
                  {selectedUser.role === 'doctor' && selectedUser.credentialStatus && (
                    <div>
                      <span className="font-medium text-gray-700">Credential Status:</span>{' '}
                      {selectedUser.credentialStatus.status}
                    </div>
                  )}
                  {selectedUser.profile ? (
                    selectedUser.role === 'doctor' ? (
                      <>
                        <h3 className="mt-4 text-md font-semibold text-gray-700">Doctor Profile</h3>
                        <div className="space-y-2">
                          <div>
                            <span className="font-medium text-gray-700">Date of Birth:</span>{' '}
                            {(selectedUser.profile as DoctorProfile).dob || 'N/A'}
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Gender:</span>{' '}
                            {(selectedUser.profile as DoctorProfile).gender || 'N/A'}
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Phone:</span>{' '}
                            {(selectedUser.profile as DoctorProfile).phone || 'N/A'}
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Address:</span>{' '}
                            {(selectedUser.profile as DoctorProfile).address || 'N/A'}
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Education:</span>{' '}
                            {(selectedUser.profile as DoctorProfile).education || 'N/A'}
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Specialization:</span>{' '}
                            {(selectedUser.profile as DoctorProfile).specialization?.join(', ') || 'N/A'}
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Bio:</span>{' '}
                            {(selectedUser.profile as DoctorProfile).bio || 'N/A'}
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Profile Picture:</span>{' '}
                            {(selectedUser.profile as DoctorProfile).profilePicture?.path ? (
                              <a
                                href={(selectedUser.profile as DoctorProfile).profilePicture!.path}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-indigo-600 hover:underline"
                              >
                                View Image
                              </a>
                            ) : (
                              'N/A'
                            )}
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Approved:</span>{' '}
                            {(selectedUser.profile as DoctorProfile).isApproved ? 'Yes' : 'No'}
                          </div>
                          {(selectedUser.profile as DoctorProfile).practiceDetails && (
                            <>
                              <h4 className="mt-2 text-sm font-semibold text-gray-700">Practice Details</h4>
                              <div>
                                <span className="font-medium text-gray-700">Practice Name:</span>{' '}
                                {(selectedUser.profile as DoctorProfile).practiceDetails!.practiceName || 'N/A'}
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">Practice Type:</span>{' '}
                                {(selectedUser.profile as DoctorProfile).practiceDetails!.practiceType || 'N/A'}
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">Accepts Insurance:</span>{' '}
                                {(selectedUser.profile as DoctorProfile).practiceDetails!.acceptsInsurance ? 'Yes' : 'No'}
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">Languages:</span>{' '}
                                {(selectedUser.profile as DoctorProfile).practiceDetails!.languages?.join(', ') || 'N/A'}
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">Consultation Fee:</span>{' '}
                                {(selectedUser.profile as DoctorProfile).practiceDetails!.consultationFee?.toString() || 'N/A'}
                              </div>
                            </>
                          )}
                        </div>
                      </>
                    ) : selectedUser.role === 'patient' ? (
                      <>
                        <h3 className="mt-4 text-md font-semibold text-gray-700">Patient Profile</h3>
                        <div className="space-y-2">
                          <div>
                            <span className="font-medium text-gray-700">Date of Birth:</span>{' '}
                            {(selectedUser.profile as PatientProfile).dob || 'N/A'}
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Gender:</span>{' '}
                            {(selectedUser.profile as PatientProfile).gender || 'N/A'}
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Mobile:</span>{' '}
                            {(selectedUser.profile as PatientProfile).mobile || 'N/A'}
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Emergency Contact:</span>{' '}
                            {(selectedUser.profile as PatientProfile).emergencyContact || 'N/A'}
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="mt-4 text-sm text-gray-600">
                        No additional profile details available.
                      </div>
                    )
                  ) : (
                    <div className="mt-4 text-sm text-gray-600">
                      No profile details available.
                    </div>
                  )}
                </div>
              </div>
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
                <button
                  onClick={handleCloseDetails}
                  className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 transition-colors duration-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;