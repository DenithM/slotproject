import React, { useState, useEffect } from 'react';
import { supabase } from '../../client/superbase';

interface AppointmentDetails {
  id: string;
  doctorName: string;
  specialization: string;
  date: string;
  time: string;
  status: 'Active' | 'Upcoming' | 'Completed';
  avatar: string;
  location?: string;
  patientId?: string;
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
}

interface ViewDetailsProps {
  appointment: AppointmentDetails;
  onBack?: () => void;
  onReschedule?: (appointment: AppointmentDetails) => void;
  onCancel?: (appointment: AppointmentDetails) => void;
}

const ViewDetails: React.FC<ViewDetailsProps> = ({ appointment, onBack, onReschedule, onCancel }) => {
  const [patientData, setPatientData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<'reschedule' | 'cancel' | null>(null);

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Active': return 'bg-emerald-600 text-white';
      case 'Upcoming': return 'bg-blue-600 text-white';
      case 'Completed': return 'bg-gray-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  const getStatusDot = (status: string) => {
    switch(status) {
      case 'Active': return 'bg-emerald-400';
      case 'Upcoming': return 'bg-blue-400';
      case 'Completed': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  useEffect(() => {
    const fetchCompleteAppointmentData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🔍 Starting to fetch appointment data for ID:', appointment.id);
        
        // First, fetch the complete appointment with doctor and patient details
        const { data: appointmentData, error: appointmentError } = await supabase
          .from('appointments')
          .select(`
            *,
            doctors:doctor_id (
              id,
              name,
              specialization,
              avatar,
              available
            ),
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

        console.log('📊 Appointment query result:', { appointmentData, appointmentError });

        if (appointmentError) {
          console.error('Error fetching appointment data:', appointmentError);
          setError('Failed to load appointment details');
          
          // Fallback to mock data
          const mockPatientData = {
            id: 'mock-patient-id',
            first_name: 'John',
            last_name: 'Doe',
            email: 'john.doe@example.com',
            phone: '+1 (555) 123-4567',
            date_of_birth: '1990-01-15',
            blood_type: 'O+',
            allergies: 'Penicillin, Peanuts',
            medications: 'Lisinopril 10mg daily',
            medical_history: 'Hypertension, Type 2 Diabetes',
            emergency_contact_name: 'Jane Doe',
            emergency_contact_phone: '+1 (555) 987-6543',
            address: '123 Main St, City, State 12345',
            gender: 'Male',
            height: '5\'10"',
            weight: '180 lbs',
            insurance: 'Blue Cross Blue Shield',
            notes: 'Regular checkup patient'
          };
          
          console.log('📋 Using mock patient data:', mockPatientData);
          setPatientData(mockPatientData);
        } else {
          // Step 1: Try to get patient from appointment relationship
          if (appointmentData.patients) {
            console.log('✅ Found patient data from appointment:', appointmentData.patients);
            setPatientData(appointmentData.patients);
          } else {
            console.log('⚠️ No patient data in appointment, trying email lookup...');
            // Step 2: Try to find patient by email
            const userEmail = 'denithrokith@gmail.com'; // Use the same email as other components
            const { data: patientData, error: patientError } = await supabase
              .from('patients')
              .select('*')
              .eq('email', userEmail)
              .single();
            
            console.log('📊 Email lookup result:', { patientData, patientError });
            
            if (patientError) {
              console.error('Error fetching patient by email:', patientError);
              // Step 3: Try to find ANY patient in the database
              console.log('⚠️ Email lookup failed, trying to find any patient...');
              const { data: anyPatient, error: anyError } = await supabase
                .from('patients')
                .select('*')
                .limit(1)
                .single();
              
              if (anyError) {
                console.error('❌ No patients found in database:', anyError);
                // Step 4: Only use mock data as last resort
                const fallbackData = {
                  id: 'mock-patient-id',
                  first_name: 'John',
                  last_name: 'Doe',
                  email: 'john.doe@example.com',
                  phone: '+1 (555) 123-4567',
                  date_of_birth: '1990-01-15',
                  blood_type: 'O+',
                  allergies: 'Penicillin, Peanuts',
                  medications: 'Lisinopril 10mg daily',
                  medical_history: 'Hypertension, Type 2 Diabetes',
                  emergency_contact_name: 'Jane Doe',
                  emergency_contact_phone: '+1 (555) 987-6543',
                  address: '123 Main St, City, State 12345',
                  gender: 'Male',
                  height: '5\'10"',
                  weight: '180 lbs',
                  insurance: 'Blue Cross Blue Shield',
                  notes: 'Regular checkup patient'
                };
                console.log('📋 Using mock patient data as last resort:', fallbackData);
                setPatientData(fallbackData);
              } else {
                console.log('✅ Found a patient in database:', anyPatient);
                setPatientData(anyPatient);
              }
            } else {
              console.log('✅ Found patient by email:', patientData);
              setPatientData(patientData);
            }
          }
        }
      } catch (err) {
        console.error('❌ Unexpected error:', err);
        setError('An error occurred while loading appointment details');
        
        // Set fallback data on error
        const fallbackData = {
          first_name: 'Patient',
          last_name: 'Data Unavailable',
          email: 'N/A',
          phone: 'N/A',
          date_of_birth: 'N/A',
          blood_type: 'N/A',
          allergies: 'N/A',
          medications: 'N/A',
          medical_history: 'N/A',
          emergency_contact_name: 'N/A',
          emergency_contact_phone: 'N/A'
        };
        console.log('📋 Using emergency fallback data:', fallbackData);
        setPatientData(fallbackData);
      } finally {
        setLoading(false);
        console.log('🏁 Fetch complete, loading set to false');
      }
    };

    if (appointment.id) {
      fetchCompleteAppointmentData();
    } else {
      console.log('⚠️ No appointment ID provided');
      setLoading(false);
    }
  }, [appointment]);

  const handleReschedule = async () => {
    try {
      setActionLoading('reschedule');
      
      // Update appointment status in database
      const { error } = await supabase
        .from('appointments')
        .update({ 
          status: 'rescheduled',
          updated_at: new Date().toISOString(),
          // Add reschedule reason or notes if needed
          reschedule_reason: 'Patient requested reschedule'
        })
        .eq('id', appointment.id);
        
      if (error) {
        console.error('Error rescheduling appointment:', error);
        alert('Failed to reschedule appointment. Please try again.');
      } else {
        // Log the reschedule action
        await supabase
          .from('appointment_logs')
          .insert({
            appointment_id: appointment.id,
            action: 'rescheduled',
            created_at: new Date().toISOString(),
            user_id: patientData?.id || 'unknown'
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
      
      // Update appointment status in database
      const { error } = await supabase
        .from('appointments')
        .update({ 
          status: 'cancelled',
          updated_at: new Date().toISOString(),
          cancelled_at: new Date().toISOString(),
          cancellation_reason: 'Patient cancelled appointment'
        })
        .eq('id', appointment.id);
        
      if (error) {
        console.error('Error cancelling appointment:', error);
        alert('Failed to cancel appointment. Please try again.');
      } else {
        // Log the cancellation action
        await supabase
          .from('appointment_logs')
          .insert({
            appointment_id: appointment.id,
            action: 'cancelled',
            created_at: new Date().toISOString(),
            user_id: patientData?.id || 'unknown'
          });
          
        // Send notification (if you have a notifications table)
        await supabase
          .from('notifications')
          .insert({
            user_id: patientData?.id || 'unknown',
            type: 'appointment_cancelled',
            message: `Your appointment with ${appointment.doctorName} on ${appointment.date} has been cancelled`,
            created_at: new Date().toISOString(),
            read: false
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-8 relative overflow-hidden font-sans">
      {/* Background decoration */}
      <div className="absolute inset-0 z-0 opacity-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob"></div>
        <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-4000"></div>
      </div>
      
      {/* Debug Info - Remove in production */}
      <div className="fixed top-4 right-4 bg-yellow-100 border-2 border-yellow-300 rounded-lg p-4 z-50 max-w-sm">
        <h4 className="font-bold text-sm mb-2">Debug Info:</h4>
        <div className="text-xs space-y-1">
          <p>Loading: {loading ? 'Yes' : 'No'}</p>
          <p>Error: {error || 'None'}</p>
          <p>Patient Data: {patientData ? 'Exists' : 'Null'}</p>
          <p>Appointment ID: {appointment.id || 'None'}</p>
          {patientData && (
            <div className="mt-2">
              <p>Patient: {`${patientData.first_name || ''} ${patientData.last_name || ''}`}</p>
              <p>Email: {patientData.email || 'None'}</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Header */}
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex items-center justify-between mb-12">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors duration-300 group"
          >
            <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7 7" />
            </svg>
            <span className="font-medium">Back to Dashboard</span>
          </button>
          
          <div className="text-center">
            <h1 className="text-4xl font-bold text-blue-900 mb-2">Appointment Details</h1>
            <p className="text-gray-600">Healthcare Management System</p>
          </div>
          
          <div className="w-24"></div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Doctor & Status */}
          <div className="lg:col-span-1 space-y-6">
            {/* Doctor Card */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 hover:shadow-2xl transition-all duration-300">
              <h2 className="text-2xl font-bold text-blue-900 mb-6">Doctor Information</h2>
              
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                  {appointment.avatar || '👨‍⚕️'}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    {appointment.doctorName || 'Dr. Unknown'}
                  </h3>
                  <p className="text-gray-600">
                    {appointment.specialization || 'General Practice'}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
                  <span className="text-gray-700 font-medium">Status:</span>
                  <span className={`px-4 py-2 rounded-full text-sm font-bold ${getStatusColor(appointment.status)}`}>
                    {appointment.status}
                  </span>
                </div>
                
                {appointment.location && (
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
                    <span className="text-gray-700 font-medium">Location:</span>
                    <span className="text-gray-900 font-bold">{appointment.location}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Appointment Status Card */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 hover:shadow-2xl transition-all duration-300">
              <h2 className="text-2xl font-bold text-blue-900 mb-6">Appointment Status</h2>
              
              <div className="space-y-6">
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full ${getStatusDot(appointment.status)} animate-pulse`}></div>
                  <span className="text-xl font-bold text-gray-900">{appointment.status}</span>
                </div>
                
                <div className="text-gray-600">
                  {appointment.status === 'Active' && 'Your appointment is currently in progress.'}
                  {appointment.status === 'Upcoming' && 'Your appointment is scheduled for the future.'}
                  {appointment.status === 'Completed' && 'Your appointment has been completed successfully.'}
                </div>
              </div>
            </div>
          </div>

          {/* Middle Column - Date & Time */}
          <div className="lg:col-span-1 space-y-6">
            {/* Date & Time Card */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 hover:shadow-2xl transition-all duration-300">
              <h2 className="text-2xl font-bold text-blue-900 mb-6">Date & Time</h2>
              
              <div className="space-y-6">
                <div className="bg-blue-50 rounded-xl p-6 border-2 border-blue-200">
                  <div className="flex items-center space-x-3 mb-3">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-blue-900 font-bold text-lg">Date</span>
                  </div>
                  <p className="text-3xl font-bold text-blue-900">{appointment.date}</p>
                </div>
                
                <div className="bg-blue-50 rounded-xl p-6 border-2 border-blue-200">
                  <div className="flex items-center space-x-3 mb-3">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-blue-900 font-bold text-lg">Time</span>
                  </div>
                  <p className="text-3xl font-bold text-blue-900">{appointment.time}</p>
                </div>
              </div>
            </div>

            {/* Follow-up Date */}
            {appointment.followUpDate && (
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 hover:shadow-2xl transition-all duration-300">
                <h2 className="text-2xl font-bold text-blue-900 mb-6">Follow-up Date</h2>
                <div className="bg-blue-50 rounded-xl p-6 border-2 border-blue-200">
                  <div className="flex items-center space-x-3 mb-3">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <span className="text-blue-900 font-bold text-lg">Follow-up</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-900">{appointment.followUpDate}</p>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Patient & Medical Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Patient Information */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 hover:shadow-2xl transition-all duration-300">
              <h2 className="text-2xl font-bold text-blue-900 mb-6">Patient Information</h2>
              
              <div className="space-y-4">
                {loading ? (
                  <div className="p-4 bg-blue-50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-gray-600">Loading patient information...</span>
                    </div>
                  </div>
                ) : patientData ? (
                  <>
                    <div className="p-4 bg-blue-50 rounded-xl">
                      <span className="text-gray-700 block text-sm font-medium mb-1">Patient Name:</span>
                      <p className="text-gray-900 font-bold text-lg">
                        {`${patientData.first_name || ''} ${patientData.last_name || ''}`.trim() || 'N/A'}
                      </p>
                    </div>
                    
                    <div className="p-4 bg-blue-50 rounded-xl">
                      <span className="text-gray-700 block text-sm font-medium mb-1">Email:</span>
                      <p className="text-gray-900 font-bold text-lg">{patientData.email || 'N/A'}</p>
                    </div>
                    
                    <div className="p-4 bg-blue-50 rounded-xl">
                      <span className="text-gray-700 block text-sm font-medium mb-1">Phone:</span>
                      <p className="text-gray-900 font-bold text-lg">{patientData.phone || 'N/A'}</p>
                    </div>
                    
                    <div className="p-4 bg-blue-50 rounded-xl">
                      <span className="text-gray-700 block text-sm font-medium mb-1">Date of Birth:</span>
                      <p className="text-gray-900 font-bold text-lg">
                        {patientData.date_of_birth ? new Date(patientData.date_of_birth).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    
                    <div className="p-4 bg-blue-50 rounded-xl">
                      <span className="text-gray-700 block text-sm font-medium mb-1">Blood Type:</span>
                      <p className="text-gray-900 font-bold text-lg">{patientData.blood_type || 'N/A'}</p>
                    </div>
                    
                    {patientData.gender && (
                      <div className="p-4 bg-blue-50 rounded-xl">
                        <span className="text-gray-700 block text-sm font-medium mb-1">Gender:</span>
                        <p className="text-gray-900 font-bold text-lg">{patientData.gender}</p>
                      </div>
                    )}
                    
                    {(patientData.address || patientData.city || patientData.state) && (
                      <div className="p-4 bg-blue-50 rounded-xl">
                        <span className="text-gray-700 block text-sm font-medium mb-1">Address:</span>
                        <p className="text-gray-900 font-bold text-lg">
                          {[
                            patientData.address,
                            patientData.city,
                            patientData.state,
                            patientData.zip_code,
                            patientData.country
                          ].filter(Boolean).join(', ') || 'N/A'}
                        </p>
                      </div>
                    )}
                  </>
                ) : error ? (
                  <div className="p-4 bg-red-50 rounded-xl border-2 border-red-200">
                    <p className="text-red-600">{error}</p>
                  </div>
                ) : (
                  <div className="p-4 bg-blue-50 rounded-xl">
                    <p className="text-gray-600">No patient information available</p>
                  </div>
                )}
              </div>
            </div>

            {/* Medical Information */}
            {patientData && (
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 hover:shadow-2xl transition-all duration-300">
                <h2 className="text-2xl font-bold text-blue-900 mb-6">Medical Information</h2>
                
                <div className="space-y-4">
                  {patientData.allergies && (
                    <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
                      <div className="flex items-center space-x-2 mb-2">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <span className="text-blue-900 font-bold">Allergies</span>
                      </div>
                      <p className="text-gray-700">{patientData.allergies}</p>
                    </div>
                  )}
                  
                  {patientData.medications && (
                    <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
                      <div className="flex items-center space-x-2 mb-2">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-1.735l-7-7A2 2 0 003.172-3.172L7.828 9.428A2 2 0 006.586 8.657l7 7a2 2 0 002.828 2.828z" />
                        </svg>
                        <span className="text-blue-900 font-bold">Current Medications</span>
                      </div>
                      <p className="text-gray-700">{patientData.medications}</p>
                    </div>
                  )}
                  
                  {patientData.medical_history && (
                    <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
                      <div className="flex items-center space-x-2 mb-2">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="text-blue-900 font-bold">Medical History</span>
                      </div>
                      <p className="text-gray-700">{patientData.medical_history}</p>
                    </div>
                  )}
                  
                  {(patientData.emergency_contact_name || patientData.emergency_contact_phone) && (
                    <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
                      <div className="flex items-center space-x-2 mb-2">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <span className="text-blue-900 font-bold">Emergency Contact</span>
                      </div>
                      <p className="text-gray-700">
                        {[
                          patientData.emergency_contact_name,
                          patientData.emergency_contact_phone,
                          patientData.emergency_contact_relation && `(${patientData.emergency_contact_relation})`
                        ].filter(Boolean).join(' - ') || 'N/A'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Prescription */}
            {appointment.prescription && (
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 hover:shadow-2xl transition-all duration-300">
                <h2 className="text-2xl font-bold text-blue-900 mb-6">Prescription</h2>
                <div className="bg-blue-50 rounded-xl p-6 border-2 border-blue-200">
                  <div className="flex items-start space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 flex-shrink-0">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-1.735l-7-7A2 2 0 003.172-3.172L7.828 9.428A2 2 0 006.586 8.657l7 7a2 2 0 002.828 2.828z" />
                      </svg>
                    </div>
                    <div>
                      <span className="text-blue-900 font-medium text-sm block mb-2">Prescribed Medication</span>
                      <p className="text-gray-700 text-sm">{appointment.prescription}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-12 flex justify-center space-x-6">
          <button 
            onClick={handleReschedule}
            disabled={actionLoading !== null || appointment.status === 'Completed'}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            <span className="flex items-center space-x-3">
              {actionLoading === 'reschedule' ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Rescheduling...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>Reschedule Appointment</span>
                </>
              )}
            </span>
          </button>
          <button 
            onClick={handleCancel}
            disabled={actionLoading !== null || appointment.status === 'Completed'}
            className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            <span className="flex items-center space-x-3">
              {actionLoading === 'cancel' ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Cancelling...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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