import React, { useState, useEffect } from 'react';
import { supabase } from '../../client/superbase';
import Sidebar from './Sidebar';

interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  gender: string;
  blood_type: string;
  height?: string;
  weight?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  allergies?: string;
  medications?: string;
  medical_history?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relation?: string;
  insurance?: string;
  insurance_number?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

interface AppointmentDetails {
  id: string;
  doctorName: string;
  specialization: string;
  date: string;
  time: string;
  status: 'Active' | 'Upcoming' | 'Completed';
  avatar: string;
  location?: string;
  patientName?: string;
  patientEmail?: string;
  patientPhone?: string;
  notes?: string;
  prescription?: string;
  followUpDate?: string;
  medicalHistory?: string;
  allergies?: string;
  currentMedications?: string;
  testResults?: string;
  diagnosis?: string;
  treatmentPlan?: string;
  patient_id?: string;
}

interface ViewDetailsProps {
  appointment: AppointmentDetails;
  onBack?: () => void;
  onReschedule?: (appointment: AppointmentDetails) => void;
  onCancel?: (appointment: AppointmentDetails) => void;
  onNavigateToReport?: () => void;
  onNavigateToDoctorList?: () => void;
  onNavigateToAppointment?: () => void;
  onNavigateToHistory?: () => void;
  onNavigateToFeedback?: () => void;
  onLogout?: () => void;
}

const ViewDetails: React.FC<ViewDetailsProps> = ({ appointment, onBack, onReschedule, onCancel, onNavigateToReport, onNavigateToDoctorList, onNavigateToAppointment, onNavigateToHistory, onNavigateToFeedback, onLogout }) => {
  const [patientData, setPatientData] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<'reschedule' | 'cancel' | null>(null);
  const [activeMenuItem, setActiveMenuItem] = useState<string>('appointments');

  // Helper function to create fallback patient data
  const createFallbackPatientData = (level: 'mock' | 'emergency' = 'mock'): Patient => {
    const baseData = {
      id: level === 'mock' ? 'mock-patient-id' : 'emergency-patient-id',
      first_name: level === 'mock' ? 'denith' : 'Patient',
      last_name: level === 'mock' ? 'rokith' : 'Data Unavailable',
      email: level === 'mock' ? 'denithrokith@gmail.com' : 'N/A',
      phone: level === 'mock' ? '+1 (555) 123-4567' : 'N/A',
      date_of_birth: level === 'mock' ? '1990-01-15' : 'N/A',
      blood_type: level === 'mock' ? 'O+' : 'N/A',
      gender: level === 'mock' ? 'Male' : 'N/A',
      height: level === 'mock' ? '5\'10"' : 'N/A',
      weight: level === 'mock' ? '180 lbs' : 'N/A',
      address: level === 'mock' ? '123 Main St, City, State 12345' : 'N/A',
      allergies: level === 'mock' ? 'Penicillin, Peanuts' : 'N/A',
      medications: level === 'mock' ? 'Lisinopril 10mg daily' : 'N/A',
      medical_history: level === 'mock' ? 'Hypertension, Type 2 Diabetes' : 'N/A',
      emergency_contact_name: level === 'mock' ? 'Jane Doe' : 'N/A',
      emergency_contact_phone: level === 'mock' ? '+1 (555) 987-6543' : 'N/A',
      insurance: level === 'mock' ? 'Blue Cross Blue Shield' : 'N/A',
      notes: level === 'mock' ? 'Regular checkup patient' : 'N/A',
    };
    return baseData;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-emerald-300 shadow-lg shadow-emerald-500/20';
      case 'Upcoming':
        return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-300 shadow-lg shadow-blue-500/20';
      case 'Completed':
        return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white border-gray-300 shadow-lg shadow-gray-500/20';
      default:
        return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white border-gray-300 shadow-lg shadow-gray-500/20';
    }
  };

  const getStatusDot = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-emerald-400 shadow-lg shadow-emerald-400/50';
      case 'Upcoming':
        return 'bg-blue-400 shadow-lg shadow-blue-400/50';
      case 'Completed':
        return 'bg-gray-400 shadow-lg shadow-gray-400/50';
      default:
        return 'bg-gray-400 shadow-lg shadow-gray-400/50';
    }
  };

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('🔍 Fetching patient data for appointment:', appointment.id);

        const { data: appointmentData, error: appointmentError } = await supabase
          .from('appointments')
          .select(`
            *,
            patients:patient_id (
              id,
              first_name,
              last_name,
              email,
              phone,
              date_of_birth,
              gender,
              blood_type,
              height,
              weight,
              address,
              city,
              state,
              zip_code,
              country,
              allergies,
              medications,
              medical_history,
              emergency_contact_name,
              emergency_contact_phone,
              emergency_contact_relation,
              insurance,
              insurance_number,
              notes
            )
          `)
          .eq('id', appointment.id)
          .single();

        if (appointmentError) {
          console.error('Error fetching appointment data:', appointmentError);
          setError('Failed to load patient details');
          setPatientData(createFallbackPatientData('mock'));
        } else if (appointmentData.patients) {
          console.log('✅ Found patient data from appointment:', appointmentData.patients);
          setPatientData(appointmentData.patients);
        } else {
          // Try to get current user's patient data
          const userEmail = 'denithrokith@gmail.com';
          const { data: patientData, error: patientError } = await supabase
            .from('patients')
            .select('*')
            .eq('email', userEmail)
            .single();

          if (patientError) {
            console.error('Error fetching patient by email:', patientError);
            setPatientData(createFallbackPatientData('mock'));
          } else {
            console.log('✅ Found patient by email:', patientData);
            setPatientData(patientData);
          }
        }
      } catch (err) {
        console.error('❌ Unexpected error:', err);
        setError('An error occurred while loading patient details');
        setPatientData(createFallbackPatientData('emergency'));
      } finally {
        setLoading(false);
        console.log('🏁 Fetch complete, loading set to false');
      }
    };

    if (appointment.id) {
      fetchPatientData();
    } else {
      console.log('⚠️ No appointment ID provided');
      setLoading(false);
    }
  }, [appointment]);

  const handleReschedule = async () => {
    try {
      setActionLoading('reschedule');

      const { error } = await supabase
        .from('appointments')
        .update({
          status: 'rescheduled',
          updated_at: new Date().toISOString(),
          reschedule_reason: 'Patient requested reschedule',
        })
        .eq('id', appointment.id);

      if (error) {
        console.error('Error rescheduling appointment:', error);
        alert('Failed to reschedule appointment. Please try again.');
      } else {
        await supabase
          .from('appointment_logs')
          .insert({
            appointment_id: appointment.id,
            action: 'rescheduled',
            created_at: new Date().toISOString(),
            user_id: patientData?.id || 'unknown',
          });

        alert('Appointment rescheduled successfully!');
        onReschedule?.(appointment);
      }
    } catch (err) {
      console.error('Error:', err);
      alert('An error occurred while rescheduling.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this appointment?')) {
      return;
    }

    try {
      setActionLoading('cancel');

      const { error } = await supabase
        .from('appointments')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString(),
          cancelled_at: new Date().toISOString(),
          cancellation_reason: 'Patient cancelled appointment',
        })
        .eq('id', appointment.id);

      if (error) {
        console.error('Error cancelling appointment:', error);
        alert('Failed to cancel appointment. Please try again.');
      } else {
        await supabase
          .from('appointment_logs')
          .insert({
            appointment_id: appointment.id,
            action: 'cancelled',
            created_at: new Date().toISOString(),
            user_id: patientData?.id || 'unknown',
          });

        await supabase
          .from('notifications')
          .insert({
            user_id: patientData?.id || 'unknown',
            type: 'appointment_cancelled',
            message: `Your appointment with ${appointment.doctorName} on ${appointment.date} has been cancelled`,
            created_at: new Date().toISOString(),
            read: false,
          });

        alert('Appointment cancelled successfully!');
        onCancel?.(appointment);
      }
    } catch (err) {
      console.error('Error:', err);
      alert('An error occurred while cancelling.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSidebarClick = (item: string) => {
    setActiveMenuItem(item);
    
    // Handle navigation logic
    switch (item) {
      case 'overview':
        onBack?.();
        break;
      case 'appointments':
        onNavigateToAppointment?.();
        break;
      case 'doctors':
        onNavigateToDoctorList?.();
        break;
      case 'history':
        onNavigateToHistory?.();
        break;
      case 'feedback':
        onNavigateToFeedback?.();
        break;
      case 'message':
        console.log('Navigate to messages');
        break;
      case 'reports':
        onNavigateToReport?.();
        break;
      case 'settings':
        console.log('Navigate to settings');
        break;
      case 'logout':
        onLogout?.();
        break;
      default:
        console.log(`Navigating to: ${item}`);
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <Sidebar activeItem={activeMenuItem} onItemClick={handleSidebarClick} />
      
      <div className="flex-1 ml-64 px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors duration-300 group"
          >
            <svg
              className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform duration-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span className="font-medium">Back to Dashboard</span>
          </button>

          <div className="text-center">
            <h1 className="text-3xl font-bold text-blue-900 mb-2">Appointment Details</h1>
            <p className="text-gray-600">Healthcare Management System</p>
          </div>

          <div className="w-24"></div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Doctor & Status */}
          <div className="space-y-6">
            {/* Doctor Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
              <h2 className="text-xl font-bold text-blue-900 mb-4">Doctor Information</h2>

              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  {appointment.avatar || '👨‍⚕️'}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{appointment.doctorName || 'Dr. Unknown'}</h3>
                  <p className="text-gray-600">{appointment.specialization || 'General Practice'}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <span className="text-gray-700 font-medium">Status:</span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-bold ${getStatusColor(
                      appointment.status
                    )}`}
                  >
                    {appointment.status}
                  </span>
                </div>

                {appointment.location && (
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <span className="text-gray-700 font-medium">Location:</span>
                    <span className="text-gray-900 font-bold">{appointment.location}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Appointment Status Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
              <h2 className="text-xl font-bold text-blue-900 mb-4">Appointment Status</h2>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-3 h-3 rounded-full ${getStatusDot(appointment.status)} animate-pulse`}
                  ></div>
                  <span className="text-lg font-bold text-gray-900">{appointment.status}</span>
                </div>

                <div className="text-gray-600 text-sm">
                  {appointment.status === 'Active' && 'Your appointment is currently in progress. Please wait for the doctor to be ready.'}
                  {appointment.status === 'Upcoming' && 'Your appointment is scheduled for the future. Please arrive 15 minutes early.'}
                  {appointment.status === 'Completed' && 'Your appointment has been completed successfully. Follow-up care may be required.'}
                </div>
              </div>
            </div>
          </div>

          {/* Middle Column - Date & Time */}
          <div className="space-y-6">
            {/* Date & Time Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
              <h2 className="text-xl font-bold text-blue-900 mb-4">Date & Time</h2>

              <div className="space-y-4">
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <span className="text-blue-900 font-bold">Date</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-900">{appointment.date}</p>
                </div>

                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <span className="text-blue-900 font-bold">Time</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-900">{appointment.time}</p>
                </div>
              </div>
            </div>

            {/* Follow-up Date */}
            {appointment.followUpDate && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
                <h2 className="text-xl font-bold text-blue-900 mb-4">Follow-up Date</h2>
                <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                      </svg>
                    </div>
                    <span className="text-green-900 font-bold">Follow-up</span>
                  </div>
                  <p className="text-xl font-bold text-green-900">{appointment.followUpDate}</p>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Patient & Medical Info */}
          <div className="space-y-6">
            {/* Patient Information */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
              <h2 className="text-xl font-bold text-blue-900 mb-4">Patient Information</h2>

              <div className="space-y-3">
                {loading ? (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-gray-600">Loading patient information...</span>
                    </div>
                  </div>
                ) : patientData ? (
                  <>
                    {/* Basic Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <span className="text-gray-600 block text-sm font-medium mb-1">Patient Name:</span>
                        <p className="text-gray-900 font-bold">
                          {`${patientData.first_name || ''} ${patientData.last_name || ''}`.trim() || 'N/A'}
                        </p>
                      </div>

                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <span className="text-gray-600 block text-sm font-medium mb-1">Email:</span>
                        <p className="text-gray-900 font-bold">{patientData.email || 'N/A'}</p>
                      </div>

                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <span className="text-gray-600 block text-sm font-medium mb-1">Phone:</span>
                        <p className="text-gray-900 font-bold">{patientData.phone || 'N/A'}</p>
                      </div>

                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <span className="text-gray-600 block text-sm font-medium mb-1">Date of Birth:</span>
                        <p className="text-gray-900 font-bold">
                          {patientData.date_of_birth ? new Date(patientData.date_of_birth).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>

                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <span className="text-gray-600 block text-sm font-medium mb-1">Blood Type:</span>
                        <p className="text-gray-900 font-bold">{patientData.blood_type || 'N/A'}</p>
                      </div>

                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <span className="text-gray-600 block text-sm font-medium mb-1">Gender:</span>
                        <p className="text-gray-900 font-bold">{patientData.gender || 'N/A'}</p>
                      </div>
                    </div>

                    {/* Physical Details */}
                    {(patientData.height || patientData.weight) && (
                      <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                        <div className="flex items-center space-x-2 mb-2">
                          <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span className="text-purple-800 font-bold text-sm">Physical Details</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          {patientData.height && (
                            <div>
                              <span className="text-gray-600 text-xs">Height:</span>
                              <p className="text-gray-900 font-bold text-sm">{patientData.height}</p>
                            </div>
                          )}
                          {patientData.weight && (
                            <div>
                              <span className="text-gray-600 text-xs">Weight:</span>
                              <p className="text-gray-900 font-bold text-sm">{patientData.weight}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Address Information */}
                    {patientData.address && (
                      <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center space-x-2 mb-2">
                          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="text-green-800 font-bold text-sm">Address</span>
                        </div>
                        <p className="text-gray-700 text-sm">
                          {patientData.address}
                          {patientData.city && `, ${patientData.city}`}
                          {patientData.state && `, ${patientData.state}`}
                          {patientData.zip_code && ` ${patientData.zip_code}`}
                          {patientData.country && `, ${patientData.country}`}
                        </p>
                      </div>
                    )}

                    {/* Emergency Contact */}
                    {patientData.emergency_contact_name && (
                      <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                        <div className="flex items-center space-x-2 mb-2">
                          <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          <span className="text-red-800 font-bold text-sm">Emergency Contact</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <span className="text-gray-600 text-xs">Name:</span>
                            <p className="text-gray-900 font-bold text-sm">{patientData.emergency_contact_name}</p>
                          </div>
                          {patientData.emergency_contact_phone && (
                            <div>
                              <span className="text-gray-600 text-xs">Phone:</span>
                              <p className="text-gray-900 font-bold text-sm">{patientData.emergency_contact_phone}</p>
                            </div>
                          )}
                          {patientData.emergency_contact_relation && (
                            <div>
                              <span className="text-gray-600 text-xs">Relation:</span>
                              <p className="text-gray-900 font-bold text-sm">{patientData.emergency_contact_relation}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Insurance Information */}
                    {patientData.insurance && (
                      <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                        <div className="flex items-center space-x-2 mb-2">
                          <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                          <span className="text-indigo-800 font-bold text-sm">Insurance Information</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <span className="text-gray-600 text-xs">Provider:</span>
                            <p className="text-gray-900 font-bold text-sm">{patientData.insurance}</p>
                          </div>
                          {patientData.insurance_number && (
                            <div>
                              <span className="text-gray-600 text-xs">Policy #:</span>
                              <p className="text-gray-900 font-bold text-sm">{patientData.insurance_number}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Patient Notes */}
                    {patientData.notes && (
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center space-x-2 mb-2">
                          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          <span className="text-gray-800 font-bold text-sm">Patient Notes</span>
                        </div>
                        <p className="text-gray-700 text-sm">{patientData.notes}</p>
                      </div>
                    )}
                  </>
                ) : error ? (
                  <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                    <p className="text-red-600">{error}</p>
                  </div>
                ) : (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-gray-600">No patient information available</p>
                  </div>
                )}
              </div>
            </div>

            {/* Medical Information */}
            {patientData && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
                <h2 className="text-xl font-bold text-blue-900 mb-4">Medical Information</h2>

                <div className="space-y-3">
                  {/* Allergies */}
                  <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                    <div className="flex items-center space-x-2 mb-1">
                      <svg
                        className="w-4 h-4 text-yellow-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z"
                        />
                      </svg>
                      <span className="text-yellow-800 font-bold text-sm">Allergies</span>
                    </div>
                    <p className="text-gray-700 text-sm">{patientData.allergies || 'No known allergies'}</p>
                  </div>

                  {/* Current Medications */}
                  <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                    <div className="flex items-center space-x-2 mb-1">
                      <svg
                        className="w-4 h-4 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19.428 15.428a2 2 0 00-1.022-1.735l-7-7A2 2 0 003.172-3.172L7.828 9.428A2 2 0 006.586 8.657l7 7a2 2 0 002.828 2.828z"
                        />
                      </svg>
                      <span className="text-blue-800 font-bold text-sm">Current Medications</span>
                    </div>
                    <p className="text-gray-700 text-sm">{patientData.medications || 'No current medications'}</p>
                  </div>

                  {/* Medical History */}
                  <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                    <div className="flex items-center space-x-2 mb-1">
                      <svg
                        className="w-4 h-4 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <span className="text-green-800 font-bold text-sm">Medical History</span>
                    </div>
                    <p className="text-gray-700 text-sm">{patientData.medical_history || 'No significant medical history'}</p>
                  </div>

                  {/* Physical Details */}
                  {(patientData.height || patientData.weight) && (
                    <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                      <div className="flex items-center space-x-2 mb-1">
                        <svg
                          className="w-4 h-4 text-purple-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                        <span className="text-purple-800 font-bold text-sm">Physical Details</span>
                      </div>
                      <div className="text-gray-700 text-sm">
                        {patientData.height && <p>Height: {patientData.height}</p>}
                        {patientData.weight && <p>Weight: {patientData.weight}</p>}
                      </div>
                    </div>
                  )}

                  {/* Emergency Contact */}
                  {patientData.emergency_contact_name && (
                    <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                      <div className="flex items-center space-x-2 mb-1">
                        <svg
                          className="w-4 h-4 text-red-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                          />
                        </svg>
                        <span className="text-red-800 font-bold text-sm">Emergency Contact</span>
                      </div>
                      <div className="text-gray-700 text-sm">
                        <p>{patientData.emergency_contact_name}</p>
                        {patientData.emergency_contact_phone && <p>Phone: {patientData.emergency_contact_phone}</p>}
                        {patientData.emergency_contact_relation && <p>Relation: {patientData.emergency_contact_relation}</p>}
                      </div>
                    </div>
                  )}

                  {/* Insurance Information */}
                  {patientData.insurance && (
                    <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-200">
                      <div className="flex items-center space-x-2 mb-1">
                        <svg
                          className="w-4 h-4 text-indigo-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                          />
                        </svg>
                        <span className="text-indigo-800 font-bold text-sm">Insurance Information</span>
                      </div>
                      <div className="text-gray-700 text-sm">
                        <p>Provider: {patientData.insurance}</p>
                        {patientData.insurance_number && <p>Policy #: {patientData.insurance_number}</p>}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Medical Notes */}
            {appointment.notes && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
                <h2 className="text-xl font-bold text-blue-900 mb-4">Medical Notes</h2>
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <p className="text-gray-700">{appointment.notes}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-center space-x-4">
          <button
            onClick={handleReschedule}
            disabled={actionLoading !== null || appointment.status === 'Completed'}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="flex items-center space-x-2">
              {actionLoading === 'reschedule' ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Rescheduling...</span>
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span>Reschedule Appointment</span>
                </>
              )}
            </span>
          </button>
          <button
            onClick={handleCancel}
            disabled={actionLoading !== null || appointment.status === 'Completed'}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="flex items-center space-x-2">
              {actionLoading === 'cancel' ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Cancelling...</span>
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  <span>Cancel Appointment</span>
                </>
              )}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};


export default ViewDetails;
