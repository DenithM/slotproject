import React, { useState, useEffect } from 'react';
import { supabase } from '../../client/superbase';
import Sidebar from './Sidebar';

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
  onNavigateToViewDetails?: (appointment: any) => void;
}> = ({ onBack, onNavigateToReport, onNavigateToDoctorList, onNavigateToViewDetails }) => {
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

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('doctors')
        .select('*')
        .eq('available', true);

      if (error) {
        console.error('Error fetching doctors:', error);
        
        setDoctors([
          
        ]);
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

  const checkDoctorAvailability = async (doctorId: string, date: string, time: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('doctor_id', doctorId)
        .eq('date', date)
        .eq('time', time)
        .eq('status', 'scheduled');

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

  const getUnavailableSlots = async (doctorId: string, date: string) => {
    if (!doctorId || !date) {
      setUnavailableSlots([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('time')
        .eq('doctor_id', doctorId)
        .eq('date', date)
        .eq('status', 'scheduled');

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

    // Fetch unavailable slots when doctor or date changes
    if (name === 'doctorId' || name === 'date') {
      const newFormData = { ...formData, [name]: value };
      getUnavailableSlots(
        name === 'doctorId' ? value : newFormData.doctorId,
        name === 'date' ? value : newFormData.date
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      // Check if doctor is available at the selected date and time
      const isAvailable = await checkDoctorAvailability(formData.doctorId, formData.date, formData.time);
      
      if (!isAvailable) {
        setErrorMessage('This doctor is already booked at the selected time. Please choose a different time slot.');
        setSubmitting(false);
        return;
      }

      // Get the current patient (using the same logic as Dashboard)
      const userEmail = 'denithrokith@gmail.com'; // This should come from auth context
      const { data: patientData, error: patientError } = await supabase
        .from('patients')
        .select('id')
        .eq('email', userEmail)
        .single();

      if (patientError || !patientData) {
        setErrorMessage('Patient profile not found. Please complete your patient information first.');
        setSubmitting(false);
        return;
      }

      const { error } = await supabase
        .from('appointments')
        .insert([
          {
            patient_id: patientData.id,
            doctor_id: formData.doctorId,
            date: formData.date,
            time: formData.time,
            reason: formData.reason,
            type: formData.type,
            status: 'scheduled',
            created_at: new Date().toISOString()
          }
        ]);

      if (error) {
        console.error('Error creating appointment:', error);
        setErrorMessage('Failed to book appointment. Please try again.');
      } else {
        setSuccessMessage('Appointment booked successfully!');
        
        // Get the newly created appointment data for navigation
        const { data: newAppointment, error: fetchError } = await supabase
          .from('appointments')
          .select(`
            *,
            doctors:doctor_id (
              name,
              specialization,
              avatar
            )
          `)
          .eq('patient_id', patientData.id)
          .eq('doctor_id', formData.doctorId)
          .eq('date', formData.date)
          .eq('time', formData.time)
          .single();

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
            avatar: newAppointment.doctors?.avatar || '👨‍⚕️',
            location: newAppointment.type === 'online' ? 'Online' : 'Hospital'
          };
          
          onNavigateToViewDetails(appointmentDetails);
        }
        
        setFormData({
          doctorId: '',
          date: '',
          time: '',
          reason: '',
          type: 'in-person'
        });
      }
    } catch (error) {
      console.error('Error:', error);
      setErrorMessage('An unexpected error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const timeSlots = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
    '11:00 AM', '11:30 AM', '02:00 PM', '02:30 PM',
    '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM'
  ];

  const handleSidebarClick = (item: string) => {
    setActiveMenuItem(item);
    
    // Handle navigation logic
    switch (item) {
      case 'overview':
        onBack();
        break;
      case 'appointments':
        // Already on appointments
        break;
      case 'doctors':
        onNavigateToDoctorList?.();
        break;
      case 'message':
        console.log('Navigate to messages');
        break;
      case 'reports':
        onNavigateToReport?.();
        break;
      case 'logout':
        console.log('Handle logout');
        break;
      default:
        console.log(`Navigating to: ${item}`);
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Sidebar activeItem={activeMenuItem} onItemClick={handleSidebarClick} />

       
        <div className="flex-1 ml-64 p-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-light text-gray-800 mb-2">Book an Appointment</h1>
              <p className="text-gray-600">Schedule your consultation with our expert doctors</p>
            </div>

            {/* Success/Error Messages */}
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

            {/* Appointment Form */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Doctor Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Doctor *
                  </label>
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

                {/* Date and Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date *
                    </label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Time *
                    </label>
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
                          <option 
                            key={time} 
                            value={time}
                            disabled={isUnavailable}
                            className={isUnavailable ? 'text-gray-400' : ''}
                          >
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

                {/* Appointment Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Appointment Type *
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="type"
                        value="in-person"
                        checked={formData.type === 'in-person'}
                        onChange={handleInputChange}
                        className="mr-2 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-gray-700">In-Person</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="type"
                        value="online"
                        checked={formData.type === 'online'}
                        onChange={handleInputChange}
                        className="mr-2 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-gray-700">Online Consultation</span>
                    </label>
                  </div>
                </div>

                {/* Reason for Visit */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for Visit *
                  </label>
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

                {/* Submit Button */}
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
                    disabled={submitting}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Booking...' : 'Book Appointment'}
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
