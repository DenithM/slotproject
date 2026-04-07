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

  const handleLogout = () => {
    setSelectedAppointment(null);
    setCurrentPatientId(null);
    setCurrentView('login');
  };

  const handleBackToDashboard = () => {
    setRefreshTrigger(prev => prev + 1);
    setCurrentView('dashboard');
  };

  const handleNavigateToViewDetails = (appointment: any) => {
    setSelectedAppointment(appointment);
    setCurrentView('viewdetails');
  };

  const handleRescheduleAppointment = (_appointment: any) => {
    // Handle reschedule logic - could navigate to appointment booking with pre-filled data
    setCurrentView('appointment');
  };

  const handleCancelAppointment = (_appointment: any) => {
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
        <Appointment
          onBack={handleBackToDashboard}
          onNavigateToReport={handleNavigateToReport}
          onNavigateToDoctorList={() => setCurrentView('doctorlist')}
          onNavigateToHistory={handleNavigateToHistory}
          onNavigateToFeedback={handleNavigateToFeedback}
          onLogout={handleLogout}
          onNavigateToViewDetails={handleNavigateToViewDetails}
        />
      ) : currentView === 'doctorlist' ? (
        <DoctorList
          onNavigateToOverview={() => setCurrentView('dashboard')}
          onNavigateToAppointment={() => setCurrentView('appointment')}
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
          onNavigateToAppointment={() => setCurrentView('appointment')}
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
          onNavigateToAppointment={() => setCurrentView('appointment')}
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
          onNavigateToAppointment={() => setCurrentView('appointment')}
          onNavigateToDoctorList={() => setCurrentView('doctorlist')}
          onNavigateToHistory={handleNavigateToHistory}
          onNavigateToReport={handleNavigateToReport}
          onLogout={handleLogout}
        />
      ) : currentView === 'report' ? (
        <Report
          onNavigateToDashboard={handleBackToDashboard}
          onNavigateToAppointment={() => setCurrentView('appointment')}
          onNavigateToDoctorList={() => setCurrentView('doctorlist')}
          onNavigateToHistory={handleNavigateToHistory}
          onNavigateToFeedback={handleNavigateToFeedback}
          onLogout={handleLogout}
        />
      ) : (
        <Dashboard
          onNavigateToAppointment={() => setCurrentView('appointment')}
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
