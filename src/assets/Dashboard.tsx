import React, { useState, useEffect } from "react";

import { supabase } from '../../client/superbase';

import Sidebar from './Sidebar';
import { useAuth } from '../contexts/AuthContext';



// interface Vital {

//   label: string;

//   value: string;

//   unit: string;

//   icon?: string;

//   trend?: 'up' | 'down' | 'stable';

//   color?: string;

// }



// interface Report {

//   id: string;

//   name: string;

//   date: string;

//   type?: string;

//   status?: 'normal' | 'attention' | 'critical';

// }



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

  onNavigateToReport?: () => void;

  onNavigateToHistory?: () => void;

  onNavigateToFeedback?: () => void;

  onLogout?: () => void;

  refreshTrigger?: number;

}



const Dashboard: React.FC<DashboardProps> = ({ onNavigateToAppointment, onNavigateToDoctorList, onNavigateToViewDetails, onNavigateToPatientInfo, onNavigateToReport, onNavigateToHistory, onNavigateToFeedback, onLogout, refreshTrigger }) => {
  const { user } = useAuth();

  // const [vitals, setVitals] = useState<Vital[]>([]);

  // const [reports, setReports] = useState<Report[]>([]);

  const [appointments, setAppointments] = useState<Appointment[]>([]);

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const [patientData, setPatientData] = useState<any>(null);

  const [activeMenuItem, setActiveMenuItem] = useState<string>('overview');

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);



  useEffect(() => {
    console.log('=== DASHBOARD REFRESH TRIGGERED ===');
    console.log('refreshTrigger value:', refreshTrigger);
    console.log('Timestamp:', new Date().toISOString());
    console.log('Current appointments count before refresh:', appointments.length);
    
    fetchData();
    
    
    setTimeout(() => {
      console.log('Appointments count after refresh:', appointments.length);
    }, 1000);

  }, [refreshTrigger]);


  useEffect(() => {
    console.log('=== DASHBOARD MOUNT/VISIBLE ===');
    console.log('Fetching initial data...');
    fetchData();
  }, [user]); 


  useEffect(() => {
    if (patientData) {
      console.log('=== PATIENT DATA UPDATED ===');
      console.log('Fetching appointments for updated patient data...');
      fetchAppointments();
    }
  }, [patientData]); // Depend on patientData to refetch appointments when it changes



  const fetchPatientData = async () => {

    if (!user) {

      setPatientData(null);

      return;

    }



    try {

      // First try to find patient by auth user_id
      let { data, error } = await supabase

        .from('patients')

        .select('*')

        .eq('user_id', String(user.id)) // Convert to string for UUID compatibility

        .single();



      // If not found by user_id, try by email (for backward compatibility)
      if (error && error.code === 'PGRST116') {

        const { data: emailData, error: emailError } = await supabase

          .from('patients')

          .select('*')

          .eq('email', user.email)

          .single();



        if (!emailError && emailData) {

          // Update the patient record to include user_id for future queries
          await supabase

            .from('patients')

            .update({ user_id: String(user.id) }) // Convert to string

            .eq('id', String(emailData.id)); // Convert to string

          data = emailData;

          error = null;

        }

      }



      if (error) {

        console.error('Error fetching patient data:', error);

        setPatientData(null);

      } else if (data && data.first_name) {

        console.log('Patient data found:', data);
        setPatientData(data);

      } else {

        console.log('No patient data found or incomplete data');
        setPatientData(null);

      }

    } catch (err) {

      console.error('Error fetching patient data:', err);

      setPatientData(null);

    }

  };



  const fetchData = async () => {
    try {
      console.log('=== FETCH DATA START ===');
      
      await fetchPatientData();
      console.log('Patient data fetch completed');
      
      if (patientData) {
        await fetchAppointments();
        console.log('Appointments fetch completed');
      } else {
        console.log('No patient data available, skipping appointments fetch');
      }
      console.log('=== FETCH DATA END ===');
    } catch (error) {
      console.error('Error in fetchData:', error);
      setAppointments([]);
    }
  };

  const fetchAppointments = async () => {

      if (!user) {

        console.log('No user found, clearing appointments');
        setAppointments([]);

        return;

      }



      try {

        
        if (!patientData) {

          console.log('No patient data found, clearing appointments');
          setAppointments([]);

          return;

        }

        console.log('Dashboard fetching appointments for patient:', {
          patientId: patientData.id,
          patientIdType: typeof patientData.id
        });

        console.log('Attempting appointments query with patient_id:', patientData.id);
        
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

        console.log('Patient ID:', patientData.id);
        console.log('Patient ID type:', typeof patientData.id);
        console.log('Raw data:', data);
        
        if (data && data.length > 0) {
          console.log('=== APPOINTMENT DETAILS ===');
          data.forEach((apt, index) => {
            console.log(`Appointment ${index + 1}:`, {
              id: apt.id,
              patient_id: apt.patient_id,
              doctor_id: apt.doctor_id,
              status: apt.status,
              date: apt.date,
              time: apt.time
            });
          });
        }

        if (error) {
          console.error('Error fetching appointments:', error);
          console.error('Error details:', JSON.stringify(error, null, 2));
          console.error('Patient ID used:', patientData?.id);
          setAppointments([]);
        } else {
          console.log('All appointments from database:', data || []);
          const visibleAppointments = (data || []).filter(
            (apt: any) => {
              // Only filter out truly cancelled/rescheduled appointments
              const isVisible = !['cancelled', 'rescheduled', 'deleted'].includes(apt.status?.toLowerCase());
              console.log(`Appointment ${apt.id}: status=${apt.status}, visible=${isVisible}`);
              return isVisible;
            }
          );
          console.log('Visible appointments after filtering:', visibleAppointments);
          console.log('Setting appointments state with', visibleAppointments.length, 'items');

          // Transform the data to match the Appointment interface
          const transformedAppointments = visibleAppointments.map((apt: any): Appointment => ({
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
            avatar: apt.doctors?.avatar || '??',
            location: apt.type === 'online' ? 'Online' : 'Hospital'
          }));

          setAppointments(transformedAppointments);

        }

      } catch (error) {
        console.error('Error:', error);
        setAppointments([]);
      }

    };

    // For now, we'll use mock data

    // setVitals([

    //   { label: 'Body Temperature', value: '36.2', unit: '°C', icon: '🌡️', trend: 'stable', color: 'blue' },

    //   { label: 'Pulse', value: '85', unit: 'bpm', icon: '❤️', trend: 'up', color: 'red' },

    //   { label: 'Blood Pressure', value: '80/70', unit: 'mm/Hg', icon: '💉', trend: 'stable', color: 'purple' },

    //   { label: 'Breathing Rate', value: '15', unit: 'breaths/m', icon: '🫁', trend: 'down', color: 'green' },

    // ]);



    // setReports([

    //   { id: '1', name: 'Glucose', date: '02/11/2023', type: 'Blood Test', status: 'normal' },

    //   { id: '2', name: 'Blood Count', date: '02/11/2023', type: 'CBC', status: 'normal' },

    //   { id: '3', name: 'Full Body X-Ray', date: '02/11/2023', type: 'Imaging', status: 'attention' },

    //   { id: '4', name: 'Hepatitis Panel', date: '02/11/2023', type: 'Blood Test', status: 'normal' },

    //   { id: '5', name: 'Calcium', date: '02/11/2023', type: 'Blood Test', status: 'critical' },

    // ]);

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



  // const getReportStatusColor = (status?: string) => {

  //   switch (status) {

  //     case 'normal': return 'bg-green-50 border-green-200 text-green-700';

  //     case 'attention': return 'bg-yellow-50 border-yellow-200 text-yellow-700';

  //     case 'critical': return 'bg-red-50 border-red-200 text-red-700';

  //     default: return 'bg-gray-50 border-gray-200 text-gray-700';

  //   }

  // };



  // const getVitalColor = (color?: string) => {

  //   switch (color) {

  //     case 'blue': return 'from-blue-400 to-blue-600';

  //     case 'red': return 'from-red-400 to-red-600';

  //     case 'purple': return 'from-purple-400 to-purple-600';

  //     case 'green': return 'from-green-400 to-green-600';

  //     default: return 'from-gray-400 to-gray-600';

  //   }

  // };



  // Temporarily show all appointments to debug
  const upcomingAppointments = appointments; // Remove date filtering for testing
  console.log('Total appointments being displayed:', appointments.length);



  // const getTrendIcon = (trend?: string) => {

  //   switch (trend) {

  //     case 'up': return '📈';

  //     case 'down': return '📉';

  //     case 'stable': return '➡️';

  //     default: return '';

  //   }

  // };



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



  const handlePreviousMonth = () => {

    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1));

  };



  const handleNextMonth = () => {

    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1));

  };



  const handleSidebarClick = (item: string) => {

    setActiveMenuItem(item);



    // Handle navigation logic

    switch (item) {

      case 'overview':

        // Already on dashboard

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

      case 'profile-icon':

        onNavigateToPatientInfo?.(patientData?.id);

        break;

      case 'logout':

        onLogout?.();

        break;

      default:

        console.log(`Navigating to: ${item}`);

    }

  };



  const handleToggleSidebar = () => {

    setIsSidebarCollapsed(!isSidebarCollapsed);

  };



  return (

    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 w-full">

      <Sidebar 

        activeItem={activeMenuItem} 

        onItemClick={handleSidebarClick} 

        isCollapsed={isSidebarCollapsed}

        onToggleCollapse={handleToggleSidebar}

      />



      {/* Main Content */}

      <div className={`flex-1 flex transition-all duration-300 ease-in-out ${
        isSidebarCollapsed 
          ? 'ml-0 lg:ml-0' 
          : 'ml-0 lg:ml-64'
      }`}>

        <div className="flex-1 p-4 sm:p-6 lg:p-8 xl:p-10">

          {/* Greeting */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-light text-gray-800 mb-2">Welcome {patientData?.first_name || 'User'}! You look nice today</h1>
          <p className="text-gray-600 text-sm sm:text-base">Here's your health overview for today.</p>
        </div>



          {/* Banner */}

          <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 rounded-2xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 text-white relative overflow-hidden shadow-2xl w-[80%]">

            <div className="absolute top-0 right-0 w-32 sm:w-48 lg:w-64 h-32 sm:h-48 lg:h-64 bg-white opacity-5 rounded-full -mr-16 sm:-mr-24 lg:-mr-32 -mt-16 sm:-mt-24 lg:-mt-32"></div>

            <div className="absolute bottom-0 left-0 w-24 sm:w-36 lg:w-48 h-24 sm:h-36 lg:h-48 bg-white opacity-5 rounded-full -ml-12 sm:-ml-18 lg:-ml-24 -mb-12 sm:-mb-18 lg:-mb-24"></div>

            <div className="relative z-10">

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

                <div className="flex-1">

                  <h3 className="text-xl sm:text-2xl font-light mb-2">Find best doctors with Health Care</h3>

                  <p className="text-sm sm:text-base opacity-90 mb-4">Connect with top medical professionals and manage your health journey</p>
                  <br/>
                  <button onClick={() => {

                  const patientId2 = patientData?.id;

                  if (!patientId2) {
                     onNavigateToPatientInfo?.();   
                  } else {
                     onNavigateToAppointment?.();  
                  }
                }} className="bg-white text-blue-600 px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:bg-blue-50 transition-all duration-200 shadow-lg w-full sm:w-auto">

                   {!patientData? 'Create Profile →' : 'Book Appointment →'}

                  </button>

                </div>

                <div className="text-6xl sm:text-8xl lg:text-9xl opacity-20 sm:ml-4 lg:ml-8 text-center sm:text-right">👨‍⚕️</div>

              </div>

            </div>

          </div>



          {/* Vitals Section

          <div className="mb-8">

            <div className="flex items-center justify-between mb-6">

              <h3 className="text-xl font-light text-gray-800">Vitals</h3>

              <button className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center">

                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">

                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />

                </svg>

                Refresh

              </button>

            </div> */}

            {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

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

            </div> */}

          {/* </div> */}



          {/* Appointments Table */}

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden w-[80%]">

            <div className="p-4 sm:p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

                <h3 className="text-lg font-light text-gray-800">Appointments</h3>

                <button onClick={onNavigateToAppointment} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-all duration-200 w-full sm:w-auto">

                  + New Appointment

                </button>

              </div>

            </div>

            <div className="overflow-x-auto">

              <table className="w-full min-w-[600px]">

                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">

                  <tr>

                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Doctor</th>

                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden sm:table-cell">Specialization</th>

                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>

                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Time</th>

                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden md:table-cell">Location</th>

                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>

                  </tr>

                </thead>

                <tbody className="bg-white divide-y divide-gray-100">

                  {upcomingAppointments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 sm:px-6 py-6 sm:py-8 text-center text-gray-500">
                        <div className="text-4xl mb-2">??</div>
                        <div>No appointments found. Debug info: {appointments.length} total appointments loaded. Patient data: {patientData ? 'Found' : 'Not found'}, User: {user ? 'Logged in' : 'Not logged in'}</div>
                      </td>
                    </tr>
                  ) : (
                    upcomingAppointments.map((appointment) => (

                    <tr key={appointment.id} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-transparent transition-all duration-200">

                      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">

                        <div className="flex items-center">

                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-100 to-blue-200 rounded-full flex items-center justify-center text-sm sm:text-lg mr-2 sm:mr-3">

                            {appointment.avatar}

                          </div>

                          <div>

                            <button 
                              onClick={() => onNavigateToViewDetails?.(appointment)}
                              className="text-sm font-semibold text-gray-900 hover:text-blue-600 transition-colors duration-200 cursor-pointer"
                            >
                              {appointment.doctorName}
                            </button>

                            <div className="text-xs text-gray-500 hidden sm:block">ID: {appointment.id}</div>

                            <div className="text-xs text-gray-500 sm:hidden">{appointment.specialization}</div>

                          </div>

                        </div>

                      </td>

                      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap hidden sm:table-cell">

                        <span className="text-sm text-gray-700 font-medium">{appointment.specialization}</span>

                      </td>

                      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-600">{appointment.date}</td>

                      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-600">{appointment.time}</td>

                      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-600 hidden md:table-cell">{appointment.location}</td>

                      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">

                        <span className={`px-2 sm:px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusColor(appointment.status)}`}>

                          <span className={`w-2 h-2 rounded-full ${getStatusDot(appointment.status)} mr-1 sm:mr-2`}></span>

                          {appointment.status}

                        </span>

                      </td>

                    </tr>
                    ))
                  )}
                </tbody>

              </table>

            </div>

          </div>

        </div>



        {/* Right Sidebar */}

        <div className="hidden xl:block w-80 bg-gradient-to-b from-white to-gray-50 p-6 border-l border-gray-100 fixed right-0 top-0 h-full overflow-y-auto">

          {/* Patient Information Card */}
          {/* {patientData ? (
            <div className="bg-white rounded-2xl shadow-lg mb-6 border border-gray-100">
              <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-light text-gray-800">Patient Information</h3>
                  <button 
                    onClick={() => onNavigateToPatientInfo?.(patientData?.id)}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Edit
                  </button>
                </div>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                    {patientData.first_name?.[0]?.toUpperCase() || 'U'}{patientData.last_name?.[0]?.toUpperCase() || 'I'}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{patientData.first_name} {patientData.last_name}</p>
                    <p className="text-sm text-gray-500">{patientData.email}</p>
                    <p className="text-sm text-gray-500">{patientData.phone}</p>
                  </div>
                </div>
                
                {(patientData.date_of_birth || patientData.gender || patientData.blood_type) && (
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    {patientData.date_of_birth && (
                      <div>
                        <span className="text-gray-500">DOB:</span>
                        <span className="ml-1 font-medium">{new Date(patientData.date_of_birth).toLocaleDateString()}</span>
                      </div>
                    )}
                    {patientData.gender && (
                      <div>
                        <span className="text-gray-500">Gender:</span>
                        <span className="ml-1 font-medium">{patientData.gender}</span>
                      </div>
                    )}
                    {patientData.blood_type && (
                      <div>
                        <span className="text-gray-500">Blood:</span>
                        <span className="ml-1 font-medium">{patientData.blood_type}</span>
                      </div>
                    )}
                  </div>
                )}
                
                {(patientData.address || patientData.city || patientData.state) && (
                  <div className="text-xs">
                    <span className="text-gray-500">Address:</span>
                    <span className="ml-1 font-medium">
                      {[patientData.address, patientData.city, patientData.state, patientData.zip_code, patientData.country]
                        .filter(Boolean)
                        .join(', ')}
                    </span>
                  </div>
                )}
                
                {patientData.allergies && (
                  <div className="text-xs">
                    <span className="text-gray-500">Allergies:</span>
                    <span className="ml-1 font-medium text-red-600">{patientData.allergies}</span>
                  </div>
                )}
                
                {patientData.medications && (
                  <div className="text-xs">
                    <span className="text-gray-500">Medications:</span>
                    <span className="ml-1 font-medium text-blue-600">{patientData.medications}</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg mb-6 border border-gray-100">
              <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <h3 className="text-lg font-light text-gray-800">Patient Information</h3>
              </div>
              <div className="p-4 text-center">
                <div className="text-6xl mb-4">??</div>
                <h4 className="text-lg font-semibold text-gray-800 mb-2">No Patient Profile</h4>
                <p className="text-sm text-gray-500 mb-4">Create your patient profile to manage appointments and personal health information</p>
                <button 
                  onClick={() => onNavigateToPatientInfo?.()}
                  className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-blue-700 transition-all duration-200 shadow-lg"
                >
                  Create Patient Profile
                </button>
              </div>
            </div>
          )} */}

          


          {/* My Reports */}

          {/* <div className="bg-white rounded-2xl shadow-lg mb-6 border border-gray-100">

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

          </div> */}



          {/* Calendar */}

          <div className="bg-white rounded-2xl shadow-lg mb-6 border border-gray-100">

            <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">

              <h3 className="text-lg font-light text-center font-bold text-gray-800">Calendar</h3>

            </div>

            <div className="p-4">

              <div className="flex items-center justify-between mb-4">

                <button 
                  onClick={handlePreviousMonth}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  aria-label="Previous month"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <h4 className="text-lg font-bold text-gray-800">{formatMonthYear(selectedDate)}</h4>

                <button 
                  onClick={handleNextMonth}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  aria-label="Next month"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

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

