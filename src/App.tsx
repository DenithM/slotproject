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
import Feedback from "./assets/Feedback";
import PatientHistory from "./assets/PatientHistory";
import { AuthProvider } from "./contexts/AuthContext";

function App() {
  const [currentView, setCurrentView] = useState<'login' | 'register' | 'dashboard' | 'appointment' | 'doctorlist' | 'viewdetails' | 'patientinfo' | 'report' | 'feedback' | 'history'>('login');
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

  const handleNavigateToFeedback = () => {
    setCurrentView('feedback');
  };

  const handleNavigateToHistory = () => {
    setCurrentView('history');
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
    setSelectedAppointment(appointment);
    setCurrentView('appointment');
  };
  
  const handleLogout = () => {
    setCurrentView('login');
  };

  const handleCancelAppointment = () => {
    setRefreshTrigger(prev => prev + 1);
    setCurrentView('dashboard');
  };

  return (
    <AuthProvider>
      <div>
        {currentView === 'login' ? (
          <Login onSwitchToRegister={() => setCurrentView('register')} onLoginSuccess={() => setCurrentView('dashboard')} onNavigateToPatientInfo={handleNavigateToPatientInfo} />
        ) : currentView === 'register' ? (
          <Register onSwitchToLogin={() => setCurrentView('login')} />
        ) : currentView === 'appointment' ? (
          <Appointment 
            onBack={handleBackToDashboard} 
            onNavigateToReport={handleNavigateToReport}
            onNavigateToDoctorList={() => setCurrentView('doctorlist')}
            onNavigateToViewDetails={handleNavigateToViewDetails}
            onNavigateToHistory={handleNavigateToHistory}
            onNavigateToFeedback={handleNavigateToFeedback}
            onRefreshDashboard={() => setRefreshTrigger(prev => prev + 1)}
            onLogout={handleLogout}
            onNavigateToPatientInfo={handleNavigateToPatientInfo}
            appointmentToReschedule={selectedAppointment ? { id: selectedAppointment.id } : null}
          />
        ) : currentView === 'doctorlist' ? (
          <DoctorList 
            onNavigateToOverview={() => setCurrentView('dashboard')} 
            onNavigateToAppointment={() => setCurrentView('appointment')}
            onNavigateToReport={handleNavigateToReport}
            onNavigateToHistory={handleNavigateToHistory}
            onNavigateToFeedback={handleNavigateToFeedback}
            onLogout={handleLogout}
            onNavigateToPatientInfo={handleNavigateToPatientInfo}
          />
        ) : currentView === 'viewdetails' ? (
          <ViewDetails 
            appointment={selectedAppointment} 
            onBack={handleBackToDashboard} 
            onReschedule={handleRescheduleAppointment}
            onCancel={handleCancelAppointment}
            onNavigateToReport={handleNavigateToReport}
            onNavigateToDoctorList={() => setCurrentView('doctorlist')}
            onNavigateToHistory={handleNavigateToHistory}
            onNavigateToFeedback={handleNavigateToFeedback}
            onLogout={handleLogout}
            
          />
        ) : currentView === 'patientinfo' ? (
          <Patientinfo 
            onNavigateToAppointment={() => setCurrentView('appointment')}
            onNavigateToReport={handleNavigateToReport}
            onNavigateToHistory={handleNavigateToHistory}
            onNavigateToFeedback={handleNavigateToFeedback}
            onLogout={handleLogout}
            onBack={handleBackToDashboard}
            onSave={() => {
              setRefreshTrigger(prev => prev + 1);
              setCurrentView('dashboard');
            }}
            patientId={currentPatientId || undefined}
          />
        ) : currentView === 'report' ? (
          <Report 
            onNavigateToDashboard={handleBackToDashboard}
            onNavigateToAppointment={() => setCurrentView('appointment')}
            onNavigateToDoctorList={() => setCurrentView('doctorlist')}
            onNavigateToHistory={handleNavigateToHistory}
            onNavigateToFeedback={handleNavigateToFeedback}
            onLogout={handleLogout}
            onNavigateToPatientInfo={handleNavigateToPatientInfo}
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
            onNavigateToPatientInfo={handleNavigateToPatientInfo}
          />
        ) : currentView === 'history' ? (
          <PatientHistory 
            onBack={handleBackToDashboard}
            onNavigateToDashboard={handleBackToDashboard}
            onNavigateToAppointment={() => setCurrentView('appointment')}
            onNavigateToDoctorList={() => setCurrentView('doctorlist')}
            onNavigateToFeedback={handleNavigateToFeedback}
            onNavigateToReport={handleNavigateToReport}
            refreshTrigger={refreshTrigger}
            onLogout={handleLogout}
            onNavigateToPatientInfo={handleNavigateToPatientInfo}
          />
        ) : (
          <Dashboard 
            key={`dashboard-${refreshTrigger}`} // Force re-render when refreshTrigger changes
            onNavigateToAppointment={() => setCurrentView('appointment')} 
            onNavigateToDoctorList={() => setCurrentView('doctorlist')} 
            onNavigateToViewDetails={handleNavigateToViewDetails}
            onNavigateToPatientInfo={handleNavigateToPatientInfo}
            onNavigateToReport={handleNavigateToReport}
            onNavigateToFeedback={handleNavigateToFeedback}
            onNavigateToHistory={handleNavigateToHistory}
            refreshTrigger={refreshTrigger} 
            onLogout={handleLogout}
            // onRefresh={() => setRefreshTrigger(prev => prev + 1)}
          />
        )}
      </div>
    </AuthProvider>
  )
}

export default App
