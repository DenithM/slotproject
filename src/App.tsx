import './App.css'
import { useState } from 'react'
import Login from "./assets/Login";
import Register from "./assets/Register";
import Dashboard from "./assets/Dashboard";
import Appointment from "./assets/Appointment";
import DoctorList from "./assets/DoctorList";
import ViewDetails from "./assets/Viewdetails";
import Patientinfo from "./assets/Patientinfo";
import Report from "./assets/Report";
import PatientHistory from "./assets/PatientHistory";
import Feedback from "./assets/Feedback";

function App() {
  const [currentView, setCurrentView] = useState<'login' | 'register' | 'dashboard' | 'appointment' | 'doctorlist' | 'viewdetails' | 'patientinfo' | 'report' | 'history' | 'feedback'>('login');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [appointmentToReschedule, setAppointmentToReschedule] = useState<any>(null);
  const [currentPatientId, setCurrentPatientId] = useState<string | null>(null);

  const handleNavigateToPatientInfo = (patientId?: string) => {
    setCurrentPatientId(patientId || null);
    setCurrentView('patientinfo');
  };

  const handleNavigateToReport = () => {
    setCurrentView('report');
  };

  const handleNavigateToHistory = () => {
    setCurrentView('history');
  };

  const handleNavigateToFeedback = () => {
    setCurrentView('feedback');
  };

  const handleNavigateToAppointment = () => {
    setAppointmentToReschedule(null);
    setCurrentView('appointment');
  };

  const handleLogout = () => {
    setSelectedAppointment(null);
    setAppointmentToReschedule(null);
    setCurrentPatientId(null);
    setCurrentView('login');
  };

  const handleBackToDashboard = () => {
    setAppointmentToReschedule(null);
    setRefreshTrigger(prev => prev + 1);
    setCurrentView('dashboard');
  };

  const handleNavigateToViewDetails = (appointment: any) => {
    setAppointmentToReschedule(null);
    setSelectedAppointment(appointment);
    setCurrentView('viewdetails');
  };

  const handleRescheduleAppointment = (appointment: any) => {
    setAppointmentToReschedule(appointment);
    setCurrentView('appointment');
  };

  const handleCancelAppointment = (_appointment: any) => {
    setAppointmentToReschedule(null);
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
        <Appointment
          onBack={handleBackToDashboard}
          onNavigateToReport={handleNavigateToReport}
          onNavigateToDoctorList={() => setCurrentView('doctorlist')}
          onNavigateToHistory={handleNavigateToHistory}
          onNavigateToFeedback={handleNavigateToFeedback}
          onLogout={handleLogout}
          appointmentToReschedule={appointmentToReschedule}
          onNavigateToViewDetails={handleNavigateToViewDetails}
        />
      ) : currentView === 'doctorlist' ? (
        <DoctorList
          onNavigateToOverview={() => setCurrentView('dashboard')}
          onNavigateToAppointment={handleNavigateToAppointment}
          onNavigateToReport={handleNavigateToReport}
          onNavigateToHistory={handleNavigateToHistory}
          onNavigateToFeedback={handleNavigateToFeedback}
          onLogout={handleLogout}
        />
      ) : currentView === 'viewdetails' ? (
        <ViewDetails
          appointment={selectedAppointment}
          onBack={handleBackToDashboard}
          onReschedule={handleRescheduleAppointment}
          onCancel={handleCancelAppointment}
          onNavigateToReport={handleNavigateToReport}
          onNavigateToDoctorList={() => setCurrentView('doctorlist')}
          onNavigateToAppointment={handleNavigateToAppointment}
          onNavigateToHistory={handleNavigateToHistory}
          onNavigateToFeedback={handleNavigateToFeedback}
          onLogout={handleLogout}
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
      ) : currentView === 'history' ? (
        <PatientHistory
          onBack={handleBackToDashboard}
          onNavigateToDashboard={handleBackToDashboard}
          onNavigateToAppointment={handleNavigateToAppointment}
          onNavigateToDoctorList={() => setCurrentView('doctorlist')}
          onNavigateToFeedback={handleNavigateToFeedback}
          onNavigateToReport={handleNavigateToReport}
          onLogout={handleLogout}
          refreshTrigger={refreshTrigger}
        />
      ) : currentView === 'feedback' ? (
        <Feedback
          onBack={handleBackToDashboard}
          onNavigateToDashboard={handleBackToDashboard}
          onNavigateToAppointment={handleNavigateToAppointment}
          onNavigateToDoctorList={() => setCurrentView('doctorlist')}
          onNavigateToHistory={handleNavigateToHistory}
          onNavigateToReport={handleNavigateToReport}
          onLogout={handleLogout}
        />
      ) : currentView === 'report' ? (
        <Report
          onNavigateToDashboard={handleBackToDashboard}
          onNavigateToAppointment={handleNavigateToAppointment}
          onNavigateToDoctorList={() => setCurrentView('doctorlist')}
          onNavigateToHistory={handleNavigateToHistory}
          onNavigateToFeedback={handleNavigateToFeedback}
          onLogout={handleLogout}
        />
      ) : (
        <Dashboard
          onNavigateToAppointment={handleNavigateToAppointment}
          onNavigateToDoctorList={() => setCurrentView('doctorlist')}
          onNavigateToViewDetails={handleNavigateToViewDetails}
          onNavigateToPatientInfo={handleNavigateToPatientInfo}
          onNavigateToReport={handleNavigateToReport}
          onNavigateToHistory={handleNavigateToHistory}
          onNavigateToFeedback={handleNavigateToFeedback}
          onLogout={handleLogout}
          refreshTrigger={refreshTrigger}
        />
      )}
    </div>
  )
}

export default App
