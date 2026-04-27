import React, { useState, useEffect } from 'react';
import { supabase } from '../../client/superbase';
import Sidebar from './Sidebar';
import { useAuth } from '../contexts/AuthContext';

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  avatar: string;
  available: boolean;
}

interface AppointmentFormData {
  doctorId: string;
  date: string;
  time: string;
  reason: string;
  type: 'in-person' | 'online';
}

const Appointment: React.FC<{
  onBack: () => void;
  onNavigateToReport?: () => void;
  onNavigateToDoctorList?: () => void;
  onNavigateToHistory?: () => void;
  onNavigateToFeedback?: () => void;
  onLogout?: () => void;
  appointmentToReschedule?: { id: string } | null;
  onNavigateToViewDetails?: (appointment: any) => void;
  onRefreshDashboard?: () => void;
  onNavigateToPatientInfo?: (patientId: string) => void;
}> = ({ onBack, onNavigateToReport, onNavigateToDoctorList, onNavigateToHistory, onNavigateToFeedback, onLogout, appointmentToReschedule, onNavigateToViewDetails, onRefreshDashboard, onNavigateToPatientInfo }) => {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [unavailableSlots, setUnavailableSlots] = useState<string[]>([]);
  const [formData, setFormData] = useState<AppointmentFormData>({
    doctorId: '',
    date: '',
    time: '',
    reason: '',
    type: 'in-person'
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [activeMenuItem, setActiveMenuItem] = useState<string>('appointments');
  const [rescheduleLoading, setRescheduleLoading] = useState(false);
  const isRescheduleMode = Boolean(appointmentToReschedule?.id);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [patientData, setPatientData] = useState<any>(null);
  useEffect(() => {
    fetchDoctors();
  }, []);

  
    useEffect(() => {
      const fetchPatientData = async () => {
        if (user) {
          try {
            const { data, error } = await supabase
              .from('patients')
              .select('*')
              .eq('user_id', user.id)
              .single();
  
            if (error) {
              console.error('Error fetching patient data:', error);
            } else if (data) {
              setPatientData(data);
              console.log('Patient data loaded:', data);
            }
          } catch (err) {
            console.error('Error:', err);
          }
        }
      };
  
      fetchPatientData();
    }, [user]);
  
    useEffect(() => {
       if (patientData) {
         console.log('=== PATIENT DATA UPDATED ===');
         console.log('Patient ID:', patientData.id);
       }
     }, [patientData]);
  useEffect(() => {
    const loadAppointmentForReschedule = async () => {
      if (!appointmentToReschedule?.id) {
        return;
      }

      try {
        setRescheduleLoading(true);
        setErrorMessage('');

        const { data, error } = await supabase
          .from('appointments')
          .select('*')
          .eq('id', appointmentToReschedule.id)
          .single();

        if (error || !data) {
          console.error('Error loading appointment for reschedule:', error);
          setErrorMessage('Failed to load appointment details for rescheduling.');
          return;
        }

        const nextFormData: AppointmentFormData = {
          doctorId: data.doctor_id || '',
          date: data.date || '',
          time: data.time || '',
          reason: data.reason || '',
          type: data.type === 'online' ? 'online' : 'in-person',
        };

        setFormData(nextFormData);
        getUnavailableSlots(nextFormData.doctorId, nextFormData.date, appointmentToReschedule.id);
      } catch (error) {
        console.error('Error loading reschedule form:', error);
        setErrorMessage('An unexpected error occurred while loading the appointment.');
      } finally {
        setRescheduleLoading(false);
      }
    };

    loadAppointmentForReschedule();
  }, [appointmentToReschedule?.id]);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('doctors')
        .select('*')
        .eq('available', true);

      if (error) {
        console.error('Error fetching doctors:', error);
        setDoctors([]);
      } else {
        setDoctors(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
      setErrorMessage('Failed to load doctors');
    } finally {
      setLoading(false);
    }
  };

  const checkDoctorAvailability = async (
    doctorId: string,
    date: string,
    time: string,
    excludeAppointmentId?: string
  ): Promise<boolean> => {
    try {
      let query = supabase
        .from('appointments')
        .select('*')
        .eq('doctor_id', doctorId)
        .eq('date', date)
        .eq('time', time)
        .eq('status', 'scheduled');

      if (excludeAppointmentId) {
        query = query.neq('id', excludeAppointmentId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error checking availability:', error);
        return false;
      }

      return (data || []).length === 0;
    } catch (error) {
      console.error('Error:', error);
      return false;
    }
  };

  const getUnavailableSlots = async (doctorId: string, date: string, excludeAppointmentId?: string) => {
    if (!doctorId || !date) {
      setUnavailableSlots([]);
      return;
    }

    try {
      let query = supabase
        .from('appointments')
        .select('time')
        .eq('doctor_id', doctorId)
        .eq('date', date)
        .eq('status', 'scheduled');

      if (excludeAppointmentId) {
        query = query.neq('id', excludeAppointmentId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching unavailable slots:', error);
        setUnavailableSlots([]);
      } else {
        const slots = (data || []).map(apt => apt.time);
        setUnavailableSlots(slots);
      }
    } catch (error) {
      console.error('Error:', error);
      setUnavailableSlots([]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'doctorId' || name === 'date') {
      const newFormData = { ...formData, [name]: value };
      getUnavailableSlots(
        name === 'doctorId' ? value : newFormData.doctorId,
        name === 'date' ? value : newFormData.date,
        appointmentToReschedule?.id
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const isAvailable = await checkDoctorAvailability(
        formData.doctorId,
        formData.date,
        formData.time,
        appointmentToReschedule?.id
      );

      if (!isAvailable) {
        setErrorMessage('This doctor is already booked at the selected time. Please choose a different time slot.');
        setSubmitting(false);
        return;
      }

      if (!user) {
        setErrorMessage('You must be logged in to book an appointment.');
        setSubmitting(false);
        return;
      }

      let { data: patientData, error: patientError } = await supabase
        .from('patients')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (patientError && patientError.code === 'PGRST116') {
        const { data: emailData, error: emailError } = await supabase
          .from('patients')
          .select('*')
          .eq('email', user.email)
          .single();

        if (!emailError && emailData) {
          await supabase
            .from('patients')
            .update({ user_id: user.id })
            .eq('id', emailData.id);

          patientData = emailData;
          patientError = null;
        }
      }

      if (patientError || !patientData) {
        console.error('Patient data error:', patientError);
        setErrorMessage('Patient profile not found. Please complete your patient information first.');
        setSubmitting(false);
        return;
      }

      let formattedDate = formData.date;
      if (formData.date.includes('-')) {
        const dateParts = formData.date.split('-');
        if (dateParts.length === 3 && dateParts[0].length === 2) {
          formattedDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
        }
      }

      let saveError = null;

      if (appointmentToReschedule?.id) {
        const { error } = await supabase
          .from('appointments')
          .update({
            doctor_id: formData.doctorId,
            date: formattedDate,
            time: formData.time,
            reason: formData.reason,
            type: formData.type,
            status: 'scheduled',
            updated_at: new Date().toISOString()
          })
          .eq('id', appointmentToReschedule.id);

        saveError = error;
      } else {
        const { error } = await supabase
          .from('appointments')
          .insert([
            {
              patient_id: patientData.id,
              doctor_id: formData.doctorId,
              date: formattedDate,
              time: formData.time,
              reason: formData.reason,
              type: formData.type,
              status: 'scheduled',
              created_at: new Date().toISOString()
            }
          ]);

        // Email
        saveError = error;
      }

      if (saveError) {
        console.error('Error saving appointment:', saveError);
        setErrorMessage(
          appointmentToReschedule?.id
            ? `Failed to reschedule appointment. ${saveError.message}`
            : `Failed to book appointment. ${saveError.message}`
        );
      } else {
        if (onRefreshDashboard) {
          onRefreshDashboard();
          setTimeout(() => onRefreshDashboard(), 500);
        }

        setSuccessMessage(
          appointmentToReschedule?.id
            ? 'Appointment rescheduled successfully!'
            : 'Appointment booked successfully! A confirmation email has been sent to you.'
        );

        const appointmentQuery = supabase
          .from('appointments')
          .select(`*, doctors:doctor_id (name, specialization, avatar)`)
          .eq('doctor_id', formData.doctorId)
          .eq('date', formData.date)
          .eq('time', formData.time);

        const { data: newAppointment, error: fetchError } = appointmentToReschedule?.id
          ? await appointmentQuery.eq('id', appointmentToReschedule.id).single()
          : await appointmentQuery.eq('patient_id', patientData.id).single();

        if (!fetchError && newAppointment && onNavigateToViewDetails) {
          const appointmentDetails = {
            id: newAppointment.id,
            doctorName: newAppointment.doctors?.name || 'Unknown Doctor',
            specialization: newAppointment.doctors?.specialization || 'General',
            date: new Date(newAppointment.date).toLocaleDateString('en-US', {
              month: '2-digit',
              day: '2-digit',
              year: 'numeric'
            }),
            time: newAppointment.time,
            status: 'Upcoming' as const,
            avatar: newAppointment.doctors?.avatar || '',
            location: newAppointment.type === 'online' ? 'Online' : 'Hospital'
          };

          setTimeout(() => {
            onNavigateToViewDetails(appointmentDetails);
            if (onRefreshDashboard) onRefreshDashboard();
          }, 1000);
        }

        setFormData({ doctorId: '', date: '', time: '', reason: '', type: 'in-person' });
      }
    } catch (error) {
      console.error('Error:', error);
      setErrorMessage('An unexpected error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const getAllTimeSlots = () => [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
    '11:00 AM', '11:30 AM', '02:00 PM', '02:30 PM',
    '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM'
  ];

  const getFutureTimeSlots = () => {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const allSlots = getAllTimeSlots();
    
    
    if (now.getHours() >= 16 || (now.getHours() === 16 && now.getMinutes() > 30)) {
      return allSlots;
    }
    
    return allSlots.filter(slot => {
      const [time, period] = slot.split(' ');
      const [hours, minutes] = time.split(':').map(Number);
      let slotHours = hours;
      
      if (period === 'PM' && hours !== 12) {
        slotHours += 12;
      } else if (period === 'AM' && hours === 12) {
        slotHours = 0;
      }
      
      const slotTime = slotHours * 60 + minutes;
      
      
      if (formData.date && new Date(formData.date).toDateString() === now.toDateString()) {
        return slotTime > currentTime;
      }
      
    
      return true;
    });
  };

  const timeSlots = getFutureTimeSlots();

  const handleSidebarClick = (item: string) => {
    setActiveMenuItem(item);
    switch (item) {
      case 'overview': onBack(); break;
      case 'appointments': break;
      case 'doctors': onNavigateToDoctorList?.(); break;
      case 'history': onNavigateToHistory?.(); break;
      case 'feedback': onNavigateToFeedback?.(); break;
      case 'reports': onNavigateToReport?.(); break;
      case 'logout': onLogout?.(); break;
      case 'profile-icon': onNavigateToPatientInfo?.(patientData?.id); break;
      default: console.log(`Navigating to: ${item}`);
    }
  };

  const handleToggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Sidebar
        activeItem={activeMenuItem}
        onItemClick={handleSidebarClick}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={handleToggleSidebar}
      />

      <div className={`flex-1 p-8 transition-all duration-300 ${isSidebarCollapsed ? 'ml-0' : 'ml-64'}`}>
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-light text-gray-800 mb-2">
              {isRescheduleMode ? 'Reschedule Appointment' : 'Book an Appointment'}
            </h1>
            <p className="text-gray-600">
              {isRescheduleMode
                ? 'Choose a new doctor, date, or time for your existing appointment'
                : 'Schedule your consultation with our expert doctors'}
            </p>
          </div>

          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
              {successMessage}
            </div>
          )}
          {errorMessage && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {errorMessage}
            </div>
          )}
          {rescheduleLoading && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-700">
              Loading your current appointment details...
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Doctor *</label>
                {loading ? (
                  <div className="text-gray-500">Loading doctors...</div>
                ) : (
                  <select
                    name="doctorId"
                    value={formData.doctorId}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Choose a doctor...</option>
                    {doctors.map((doctor) => (
                      <option key={doctor.id} value={doctor.id}>
                        {doctor.avatar} {doctor.name} - {doctor.specialization}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    required
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Time *</label>
                  <select
                    name="time"
                    value={formData.time}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select time...</option>
                    {timeSlots.map((time) => {
                      const isUnavailable = unavailableSlots.includes(time);
                      return (
                        <option key={time} value={time} disabled={isUnavailable} className={isUnavailable ? 'text-gray-400' : ''}>
                          {isUnavailable ? `${time} (Booked)` : time}
                        </option>
                      );
                    })}
                  </select>
                  {unavailableSlots.length > 0 && (
                    <p className="mt-2 text-sm text-gray-500">
                      Time slots marked as "(Booked)" are unavailable for the selected doctor and date.
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Appointment Type *</label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input type="radio" name="type" value="in-person" checked={formData.type === 'in-person'} onChange={handleInputChange} className="mr-2 text-blue-600 focus:ring-blue-500" />
                    <span className="text-gray-700">In-Person</span>
                  </label>
                  <label className="flex items-center">
                    <input type="radio" name="type" value="online" checked={formData.type === 'online'} onChange={handleInputChange} className="mr-2 text-blue-600 focus:ring-blue-500" />
                    <span className="text-gray-700">Online Consultation</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Visit *</label>
                <textarea
                  name="reason"
                  value={formData.reason}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  placeholder="Please describe the reason for your appointment..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={onBack}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || rescheduleLoading}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting
                    ? isRescheduleMode ? 'Rescheduling...' : 'Booking...'
                    : isRescheduleMode ? 'Save Rescheduled Appointment' : 'Book Appointment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Appointment;