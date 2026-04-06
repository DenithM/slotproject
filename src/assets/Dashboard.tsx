import React, { useState, useEffect } from "react";
import { supabase } from '../../client/superbase';

interface Vital {
  label: string;
  value: string;
  unit: string;
  icon?: string;
  trend?: 'up' | 'down' | 'stable';
  color?: string;
}

interface Report {
  id: string;
  name: string;
  date: string;
  type?: string;
  status?: 'normal' | 'attention' | 'critical';
}

interface Appointment {
  id: string;
  doctorName: string;
  specialization: string;
  date: string;
  time: string;
  status: 'Active' | 'Upcoming' | 'Completed';
  avatar: string;
  location?: string;
}

interface DashboardProps {
  onNavigateToAppointment?: () => void;
  onNavigateToDoctorList?: () => void;
  onNavigateToViewDetails?: (appointment: Appointment) => void;
  onNavigateToPatientInfo?: (patientId?: string) => void;
  onNavigateToFeedback?: () => void;
  onLogout?: () => void;
  refreshTrigger?: number;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigateToAppointment, onNavigateToDoctorList, onNavigateToViewDetails, onNavigateToPatientInfo, onNavigateToFeedback, onLogout, refreshTrigger }) => {
  const [vitals, setVitals] = useState<Vital[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [patientData, setPatientData] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (refreshTrigger) {
      fetchData();
    }
  }, [refreshTrigger]);

  // Fetch patient data to check if profile is complete
  useEffect(() => {
    fetchPatientData();
  }, []);

  const fetchPatientData = async () => {
    try {
      // Get current user from auth (you may need to implement auth context)
      // For now, we'll use the same email as in the patient form
      const userEmail = 'denithrokith@gmail.com'; // This should come from auth context

      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('email', userEmail)
        .single();

      if (error) {
        console.error('Error fetching patient data:', error);
        setPatientData(null);
      } else if (data && data.first_name) {
        setPatientData(data);
      } else {
        setPatientData(null);
      }
    } catch (err) {
      console.error('Error fetching patient data:', err);
      setPatientData(null);
    }
  };

  const fetchData = async () => {
    // Fetch appointments from database
    const fetchAppointments = async () => {
      try {
        // Get current user's appointments
        const userEmail = 'denithrokith@gmail.com'; // This should come from auth context

        const { data: patientData, error: patientError } = await supabase
          .from('patients')
          .select('id')
          .eq('email', userEmail)
          .single();

        if (patientError || !patientData) {
          console.error('Error finding patient:', patientError);
          setAppointments([]);
          return;
        }

        const { data, error } = await supabase
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
          .order('date', { ascending: true });

        if (error) {
          console.error('Error fetching appointments:', error);
          setAppointments([]);
        } else {
          // Transform the data to match the Appointment interface
          const transformedAppointments = (data || []).map((apt: any): Appointment => ({
            id: apt.id,
            doctorName: apt.doctors?.name || 'Unknown Doctor',
            specialization: apt.doctors?.specialization || 'General',
            date: new Date(apt.date).toLocaleDateString('en-US', {
              month: '2-digit',
              day: '2-digit',
              year: 'numeric'
            }),
            time: apt.time,
            status: apt.status === 'scheduled' ? 'Upcoming' :
              apt.status === 'completed' ? 'Completed' : 'Active',
            avatar: apt.doctors?.avatar || '👨‍⚕️',
            location: apt.type === 'online' ? 'Online' : 'Hospital'
          }));

          setAppointments(transformedAppointments);
        }
      } catch (error) {
        console.error('Error:', error);
        setAppointments([]);
      }
    };

    // Fetch patient data
    fetchPatientData();

    // Fetch appointments
    fetchAppointments();

    // Fetch vitals and reports
    // For now, we'll use mock data
    setVitals([
      { label: 'Body Temperature', value: '36.2', unit: '°C', icon: '🌡️', trend: 'stable', color: 'blue' },
      { label: 'Pulse', value: '85', unit: 'bpm', icon: '❤️', trend: 'up', color: 'red' },
      { label: 'Blood Pressure', value: '80/70', unit: 'mm/Hg', icon: '💉', trend: 'stable', color: 'purple' },
      { label: 'Breathing Rate', value: '15', unit: 'breaths/m', icon: '🫁', trend: 'down', color: 'green' },
    ]);

    setReports([
      { id: '1', name: 'Glucose', date: '02/11/2023', type: 'Blood Test', status: 'normal' },
      { id: '2', name: 'Blood Count', date: '02/11/2023', type: 'CBC', status: 'normal' },
      { id: '3', name: 'Full Body X-Ray', date: '02/11/2023', type: 'Imaging', status: 'attention' },
      { id: '4', name: 'Hepatitis Panel', date: '02/11/2023', type: 'Blood Test', status: 'normal' },
      { id: '5', name: 'Calcium', date: '02/11/2023', type: 'Blood Test', status: 'critical' },
    ]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Upcoming': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Completed': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusDot = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-emerald-500';
      case 'Upcoming': return 'bg-blue-500';
      case 'Completed': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getReportStatusColor = (status?: string) => {
    switch (status) {
      case 'normal': return 'bg-green-50 border-green-200 text-green-700';
      case 'attention': return 'bg-yellow-50 border-yellow-200 text-yellow-700';
      case 'critical': return 'bg-red-50 border-red-200 text-red-700';
      default: return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };

  const getVitalColor = (color?: string) => {
    switch (color) {
      case 'blue': return 'from-blue-400 to-blue-600';
      case 'red': return 'from-red-400 to-red-600';
      case 'purple': return 'from-purple-400 to-purple-600';
      case 'green': return 'from-green-400 to-green-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const upcomingAppointments = appointments.filter(appointment => {
    const appointmentDate = new Date(appointment.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of day for accurate comparison
    appointmentDate.setHours(0, 0, 0, 0);
    return appointmentDate >= today;
  });

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'up': return '📈';
      case 'down': return '📉';
      case 'stable': return '➡️';
      default: return '';
    }
  };

  const getAppointmentForDate = (date: Date): Appointment | null => {
    const dateString = date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    });
    return appointments.find(apt => apt.date === dateString) || null;
  };

  const getBookedDates = (): number[] => {
    return appointments.map(apt => {
      const date = new Date(apt.date);
      return date.getDate();
    });
  };

  const getDaysInMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const handleDateClick = (day: number) => {
    const newDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day);
    setSelectedDate(newDate);
  };

  const formatMonthYear = (date: Date): string => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-50 to-blue-50 w-full">
      {/* Left Sidebar */}
      <div className="w-64 bg-white shadow-xl border-r border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-25 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg">
              Healthcare
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent"></h1>
          </div>
        </div>

        <nav className="mt-6">
          <a href="#" className="flex items-center px-6 py-3 text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg">
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="font-medium">Overview</span>
          </a>
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigateToAppointment?.(); }} className="flex items-center px-6 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 transition-all duration-200 group">
            <svg className="w-5 h-5 mr-3 text-gray-500 group-hover:text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="font-medium">Appointments</span>
          </a>
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigateToDoctorList?.(); }} className="flex items-center px-6 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 transition-all duration-200 group">
            <svg className="w-5 h-5 mr-3 text-gray-500 group-hover:text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="font-medium">Doctors List</span>
          </a>
          <a href="#" className="flex items-center px-6 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 transition-all duration-200 group">
            <svg className="w-5 h-5 mr-3 text-gray-500 group-hover:text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span className="font-medium">Message</span>
          </a>
          <a href="#" className="flex items-center px-6 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 transition-all duration-200 group">
            <svg className="w-5 h-5 mr-3 text-gray-500 group-hover:text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v1a1 1 0 001 1h4a1 1 0 001-1v-1m3-4V8a2 2 0 00-2-2H8a2 2 0 00-2 2v5m3 0h6a2 2 0 002 2v-2m-6 0h6" />
            </svg>
            <span className="font-medium">Reports</span>
          </a>
          <a href="#" className="flex items-center px-6 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 transition-all duration-200 group">
            <svg className="w-5 h-5 mr-3 text-gray-500 group-hover:text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543.94 3.31-.826 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="font-medium">Settings</span>
          </a>
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigateToFeedback?.(); }} className="flex items-center px-6 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 transition-all duration-200 group">
            <svg className="w-5 h-5 mr-3 text-gray-500 group-hover:text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
            <span className="font-medium">Feedback</span>
          </a>
          <a href="#" onClick={(e) => { e.preventDefault(); onLogout?.(); }} className="flex items-center px-6 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 transition-all duration-200 group">
            <svg className="w-5 h-5 mr-3 text-gray-500 group-hover:text-red-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="font-medium">Log out</span>
          </a>
        </nav>

        {/* <div className="absolute bottom-0 w-64 p-6 bg-gradient-to-r from-blue-500 to-blue-600">
          <a href="#" className="flex items-center text-white hover:bg-white hover:bg-opacity-10 rounded-xl p-3 transition-all duration-200">
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8.25v4.5m0-4.5h.008v4.5h-.008z" />
            </svg>
            <span className="font-medium">Help Center</span>
          </a>
        </div> */}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        <div className="flex-1 p-8">
          {/* Greeting */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-light text-gray-800 mb-1">Good Morning, Denith! 👋</h2>
                <p className="text-gray-600">Here's your health overview for today</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <p className="text-xs text-gray-400">Last updated: 2 mins ago</p>
              </div>
            </div>
          </div>

          {/* Banner */}
          <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 rounded-2xl p-8 mb-8 text-white relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full -ml-24 -mb-24"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-2xl font-light mb-2">Find best doctors with Health Care</h3>
                  <p className="text-base opacity-90 mb-4">Connect with top medical professionals and manage your health journey</p>
                  <button onClick={onNavigateToAppointment} className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-all duration-200 shadow-lg">
                    Book Appointment →
                  </button>
                </div>
                <div className="text-9xl opacity-20 ml-8">👨‍⚕️</div>
              </div>
            </div>
          </div>

          {/* Vitals Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-light text-gray-800">Vitals</h3>
              <button className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {vitals.map((vital, index) => (
                <div key={index} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 bg-gradient-to-r ${getVitalColor(vital.color)} rounded-xl flex items-center justify-center text-white text-xl shadow-lg`}>
                      {vital.icon}
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="text-lg">{getTrendIcon(vital.trend)}</span>
                    </div>
                  </div>
                  <h4 className="text-sm text-gray-600 mb-2 font-medium">{vital.label}</h4>
                  <div className="flex items-baseline">
                    <span className="text-2xl font-light text-gray-800">{vital.value}</span>
                    <span className="text-base text-gray-600 ml-1">{vital.unit}</span>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Normal range</span>
                      <span className="text-xs font-medium text-green-600">✓ Good</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Appointments Table */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-light text-gray-800">Appointments</h3>
                <button onClick={onNavigateToAppointment} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-all duration-200">
                  + New Appointment
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Doctor</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Specialization</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Time</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Location</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {upcomingAppointments.map((appointment) => (
                    <tr key={appointment.id} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-transparent transition-all duration-200">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-100 to-blue-200 rounded-full flex items-center justify-center text-lg mr-3">
                            {appointment.avatar}
                          </div>
                          <div>
                            <span className="text-sm font-semibold text-gray-900">{appointment.doctorName}</span>
                            <div className="text-xs text-gray-500">ID: {appointment.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-700 font-medium">{appointment.specialization}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{appointment.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{appointment.time}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{appointment.location}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusColor(appointment.status)}`}>
                          <span className={`w-2 h-2 rounded-full ${getStatusDot(appointment.status)} mr-2`}></span>
                          {appointment.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-80 bg-gradient-to-b from-white to-gray-50 p-6 border-l border-gray-100">
          {/* Top Actions */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex space-x-3">
              <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200 relative">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538.214 1.055.595 1.403L5.5 17h5z" />
                  <circle cx="18" cy="6" r="3" fill="currentColor" />
                </svg>
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
              </button>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                {patientData ?
                  `${patientData.first_name?.[0]?.toUpperCase() || 'U'}${patientData.last_name?.[0]?.toUpperCase() || 'I'}` :
                  'UI'
                }
              </div>
              <div className="cursor-pointer" onClick={() => {
                if (onNavigateToPatientInfo) {
                  onNavigateToPatientInfo(patientData?.id);
                }
              }}>
                <p className="text-sm font-semibold text-gray-900">
                  {patientData ? `${patientData.first_name} ${patientData.last_name}` : 'Denith'}
                </p>
                <p className="text-xs text-gray-500">
                  {patientData ? (
                    <span className="text-blue-600 hover:text-blue-700 underline">Edit Profile</span>
                  ) : (
                    <span className="text-blue-600 hover:text-blue-700 underline">Fill the details</span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* My Reports */}
          <div className="bg-white rounded-2xl shadow-lg mb-6 border border-gray-100">
            <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-light text-gray-800">My Reports</h3>
                <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full font-medium">5 Reports</span>
              </div>
            </div>
            <div className="p-4 space-y-2">
              {reports.map((report) => (
                <div key={report.id} className="flex items-center justify-between p-3 hover:bg-gradient-to-r hover:from-gray-50 hover:to-transparent rounded-xl cursor-pointer transition-all duration-200 border border-transparent hover:border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${report.status === 'normal' ? 'bg-green-500' :
                      report.status === 'attention' ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}></div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">{report.name}</span>
                      <div className="text-xs text-gray-500">{report.type}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-gray-500">{report.date}</span>
                    <div className={`text-xs px-2 py-1 rounded-full border ${getReportStatusColor(report.status)}`}>
                      {report.status === 'normal' ? 'Normal' : report.status === 'attention' ? 'Review' : 'Urgent'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Calendar */}
          <div className="bg-white rounded-2xl shadow-lg mb-6 border border-gray-100">
            <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              <h3 className="text-lg font-light text-gray-800">Calendar</h3>
            </div>
            <div className="p-4">
              <div className="text-center mb-4">
                <h4 className="text-lg font-bold text-gray-800">{formatMonthYear(selectedDate)}</h4>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center text-xs">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                  <div key={index} className="font-semibold text-gray-500 py-2">{day}</div>
                ))}
                {Array.from({ length: getFirstDayOfMonth(selectedDate) }, (_, i) => (
                  <div key={`empty-${i}`} className="py-2"></div>
                ))}
                {Array.from({ length: getDaysInMonth(selectedDate) }, (_, i) => i + 1).map((date) => {
                  const isBooked = getBookedDates().includes(date);
                  const isSelected = date === selectedDate.getDate();
                  const isToday = date === new Date().getDate() &&
                    selectedDate.getMonth() === new Date().getMonth() &&
                    selectedDate.getFullYear() === new Date().getFullYear();

                  return (
                    <div
                      key={date}
                      onClick={() => handleDateClick(date)}
                      className={`py-2 rounded-lg cursor-pointer transition-all duration-200 ${isSelected ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold shadow-lg' :
                        isBooked ? 'bg-blue-100 text-blue-600 font-semibold hover:bg-blue-200' :
                          isToday ? 'bg-gray-100 text-gray-900 font-semibold' :
                            'text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                      {date}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Upcoming Appointment Card */}
          <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 rounded-2xl shadow-xl p-5 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
            <div className="relative z-10">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center text-xl mr-3 backdrop-blur-sm">
                  📅
                </div>
                <div>
                  <p className="font-bold text-lg">
                    {selectedDate.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })}
                  </p>
                  <p className="text-sm opacity-90">
                    {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>
              <div className="border-t border-white border-opacity-30 pt-4">
                {(() => {
                  const appointment = getAppointmentForDate(selectedDate);
                  if (appointment) {
                    return (
                      <>
                        <p className="font-bold mb-2 text-lg">{appointment.doctorName}</p>
                        <div className="space-y-1">
                          <p className="text-sm opacity-90 flex items-center">
                            <span className="mr-2">🏥</span> {appointment.specialization}
                          </p>
                          <p className="text-sm opacity-90 flex items-center">
                            <span className="mr-2">🕐</span> {appointment.time}
                          </p>
                          <p className="text-sm opacity-90 flex items-center">
                            <span className="mr-2">📍</span> {appointment.location}
                          </p>
                        </div>
                      </>
                    );
                  } else {
                    return (
                      <div className="text-center py-4">
                        <p className="text-sm opacity-90 mb-2">No appointments scheduled</p>
                        <p className="text-xs opacity-75">Click "Book Appointment" to schedule</p>
                      </div>
                    );
                  }
                })()}
              </div>
              <button
                onClick={() => {
                  const appointment = getAppointmentForDate(selectedDate);
                  if (appointment && onNavigateToViewDetails) {
                    onNavigateToViewDetails(appointment);
                  } else if (onNavigateToAppointment) {
                    onNavigateToAppointment();
                  }
                }}
                className="w-full mt-4 bg-white  text-black bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm rounded-lg py-2 text-sm font-medium transition-all duration-200"
              >
                {getAppointmentForDate(selectedDate) ? 'View Details →' : 'Book Appointment →'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;