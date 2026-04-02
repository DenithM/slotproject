import './App.css'
import { useState } from 'react'
import Login from "./assets/Login";
import Register from "./assets/Register";
import Dashboard from "./assets/Dashboard";
import Appointment from "./assets/Appointment";
import DoctorList from "./assets/DoctorList";
import ViewDetails from "./assets/Viewdetails";
import Patientinfo from "./assets/Patientinfo";

function App() {
  const [currentView, setCurrentView] = useState<'login' | 'register' | 'dashboard' | 'appointment' | 'doctorlist' | 'viewdetails' | 'patientinfo'>('login');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [currentPatientId, setCurrentPatientId] = useState<string | null>(null);

  const handleNavigateToPatientInfo = (patientId?: string) => {
    setCurrentPatientId(patientId || null);
    setCurrentView('patientinfo');
  };

  const handleBackToDashboard = () => {
    setRefreshTrigger(prev => prev + 1);
    setCurrentView('dashboard');
  };

  const handleNavigateToViewDetails = (appointment: any) => {
    setSelectedAppointment(appointment);
    setCurrentView('viewdetails');
  };

  const handleRescheduleAppointment = (appointment: any) => {
    // Handle reschedule logic - could navigate to appointment booking with pre-filled data
    setCurrentView('appointment');
  };

  const handleCancelAppointment = (appointment: any) => {
    // Handle cancel logic - could show confirmation and refresh dashboard
    setRefreshTrigger(prev => prev + 1);
    setCurrentView('dashboard');
  };

  return (
    <div>
      {currentView === 'login' ? (
        <Login onSwitchToRegister={() => setCurrentView('register')} onLoginSuccess={() => setCurrentView('dashboard')} />
      ) : currentView === 'register' ? (
        <Register onSwitchToLogin={() => setCurrentView('login')} />
      ) : currentView === 'appointment' ? (
        <Appointment onBack={handleBackToDashboard} />
      ) : currentView === 'doctorlist' ? (
        <DoctorList onNavigateToOverview={() => setCurrentView('dashboard')} onNavigateToAppointment={() => setCurrentView('appointment')} />
      ) : currentView === 'viewdetails' ? (
        <ViewDetails 
          appointment={selectedAppointment} 
          onBack={handleBackToDashboard} 
          onReschedule={handleRescheduleAppointment}
          onCancel={handleCancelAppointment}
        />
      ) : currentView === 'patientinfo' ? (
        <Patientinfo 
          onBack={handleBackToDashboard}
          onSave={() => {
            setRefreshTrigger(prev => prev + 1);
            setCurrentView('dashboard');
          }}
          patientId={currentPatientId || undefined}
        />
      ) : (
        <Dashboard 
          onNavigateToAppointment={() => setCurrentView('appointment')} 
          onNavigateToDoctorList={() => setCurrentView('doctorlist')} 
          onNavigateToViewDetails={handleNavigateToViewDetails}
          onNavigateToPatientInfo={handleNavigateToPatientInfo}
          refreshTrigger={refreshTrigger} 
        />
      )}
    </div>
  )
}

export default App
