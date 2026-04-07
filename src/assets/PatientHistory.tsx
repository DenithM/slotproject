import React, { useState, useEffect } from "react";
import { supabase } from '../../client/superbase';
import Sidebar from "./Sidebar";

interface Appointment {
    id: string;
    doctor_id: string;
    patient_id: string;
    date: string;
    time: string;
    status: string;
    type: string;
    doctor: {
        name: string;
        specialization: string;
        consultationFee?: string;
    };
}

interface Patient {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
}

interface PatientHistoryProps {
    onBack: () => void;
    onNavigateToDashboard: () => void;
    onNavigateToAppointment: () => void;
    onNavigateToDoctorList: () => void;
    onNavigateToFeedback: () => void;
    onNavigateToReport: () => void;
    onLogout: () => void;
    refreshTrigger?: number;
}

const PatientHistory: React.FC<PatientHistoryProps> = ({
    onBack,
    onNavigateToDashboard,
    onNavigateToAppointment,
    onNavigateToDoctorList,
    onNavigateToFeedback,
    onNavigateToReport,
    onLogout,
    refreshTrigger
}) => {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
    const [patient, setPatient] = useState<Patient | null>(null);
    const [showBill, setShowBill] = useState(false);

    const userEmail = 'denithrokith@gmail.com'; // Hardcoded as per existing project logic

    useEffect(() => {
        fetchData();
    }, [refreshTrigger]);

    const fetchData = async () => {
        console.log('Fetching patient history for:', userEmail);
        try {
            setLoading(true);

            // Fetch patient details
            const { data: patientData, error: patientError } = await supabase
                .from('patients')
                .select('*')
                .eq('email', userEmail)
                .single();

            if (patientError) throw patientError;
            setPatient(patientData);

            // Fetch appointments with doctor details
            const { data: apptData, error: apptError } = await supabase
                .from('appointments')
                .select(`
          *,
          doctor:doctor_id (
            name,
            specialization
          )
        `)
                .eq('patient_id', patientData.id)
                .order('date', { ascending: false });

            if (apptError) throw apptError;
            console.log('Appointments fetched:', apptData?.length || 0);
            setAppointments(apptData || []);
        } catch (error) {
            console.error('Error fetching history:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewBill = (appt: Appointment) => {
        setSelectedAppointment(appt);
        setShowBill(true);
    };

    const getConsultationFee = (specialization: string | undefined): string => {
        if (!specialization) return '100.00';
        const spec = specialization.toLowerCase();
        if (spec.includes('cardio')) return '250.00';
        if (spec.includes('neuro')) return '350.00';
        if (spec.includes('ortho')) return '200.00';
        if (spec.includes('dentist')) return '150.00';
        if (spec.includes('pediatri')) return '120.00';
        if (spec.includes('dermato')) return '180.00';
        return '100.00';
    };

    const SidebarWrapper = () => (
        <Sidebar
            activeItem="history"
            onItemClick={(item) => {
                switch (item) {
                    case 'overview': onNavigateToDashboard(); break;
                    case 'appointments': onNavigateToAppointment(); break;
                    case 'doctors': onNavigateToDoctorList(); break;
                    case 'history': break; // Already on history
                    case 'reports': onNavigateToReport(); break;
                    case 'feedback': onNavigateToFeedback(); break;
                    case 'logout': onLogout(); break;
                }
            }}
        />
    );

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            <SidebarWrapper />

            <div className="flex-1 ml-64 p-8">
                <div className="max-w-5xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">Appointment History</h1>
                            <p className="text-gray-600 mt-1">Track your past and upcoming medical consultations</p>
                        </div>
                        <button
                            onClick={onBack}
                            className="px-4 py-2 text-gray-600 hover:text-blue-600 font-medium flex items-center transition-colors"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back to Dashboard
                        </button>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                    ) : appointments.length === 0 ? (
                        <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-gray-100">
                            <div className="text-5xl mb-4">📅</div>
                            <h3 className="text-xl font-semibold text-gray-800">No appointments found</h3>
                            <p className="text-gray-500 mt-2">You haven't booked any appointments yet.</p>
                            <button
                                onClick={onNavigateToAppointment}
                                className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Book Your First Appointment
                            </button>
                        </div>
                    ) : (
                        <div className="grid gap-6">
                            {appointments.map((appt) => (
                                <div key={appt.id} className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100 flex items-center justify-between">
                                    <div className="flex items-center space-x-6">
                                        <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-2xl">
                                            👨‍⚕️
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900">{appt.doctor?.name || 'Unknown Doctor'}</h3>
                                            <p className="text-sm text-blue-600 font-medium">{appt.doctor?.specialization}</p>
                                            <div className="flex items-center mt-2 text-sm text-gray-500 space-x-4">
                                                <span className="flex items-center">
                                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    {new Date(appt.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                                </span>
                                                <span className="flex items-center">
                                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    {appt.time}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-4">
                                        <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${appt.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                                            appt.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                'bg-gray-100 text-gray-700'
                                            }`}>
                                            {appt.status}
                                        </span>
                                        <button
                                            onClick={() => handleViewBill(appt)}
                                            className="bg-gray-900 text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-black transition-colors shadow-lg active:scale-95 transform"
                                        >
                                            View Bill
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Bill Modal */}
            {showBill && selectedAppointment && patient && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl transform transition-all animate-in fade-in zoom-in duration-300">
                        {/* Modal Content */}
                        <div className="p-5">
                            <div className="flex justify-between items-start mb-5">
                                <div>
                                    <h2 className="text-xl font-black text-gray-900 italic tracking-tighter">HEALTHCARE.</h2>
                                    <p className="text-[10px] text-gray-400 font-medium uppercase tracking-tight">INVOICE #{selectedAppointment.id.slice(0, 8).toUpperCase()}</p>
                                </div>
                                <button
                                    onClick={() => setShowBill(false)}
                                    className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="space-y-3.5">
                                <div>
                                    <h4 className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Patient Details</h4>
                                    <p className="text-sm font-bold text-gray-900">{patient.first_name} {patient.last_name}</p>
                                    <div className="flex justify-between items-center text-[11px] text-gray-500 mt-0.5">
                                        <span>{patient.email}</span>
                                        <span>{patient.phone}</span>
                                    </div>
                                </div>

                                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                                    <h4 className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2">Appointment Summary</h4>
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between">
                                            <span className="text-xs text-gray-500">Doctor Name:</span>
                                            <span className="text-xs font-bold text-gray-900">{selectedAppointment.doctor?.name}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-xs text-gray-500">Specialization:</span>
                                            <span className="text-xs font-bold text-blue-600">{selectedAppointment.doctor?.specialization}</span>
                                        </div>
                                        <div className="flex justify-between border-t border-gray-200 border-dashed pt-1.5 mt-1">
                                            <div className="flex items-center">
                                                <span className="text-xs text-gray-500 mr-1.5">Date:</span>
                                                <span className="text-xs font-bold text-gray-900">{new Date(selectedAppointment.date).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex items-center">
                                                <span className="text-xs text-gray-500 mr-1.5">Time:</span>
                                                <span className="text-xs font-bold text-gray-900">{selectedAppointment.time}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-3 border-t border-dashed border-gray-200">
                                    <div className="flex justify-between items-center bg-gray-900 text-white p-4 rounded-xl shadow-lg">
                                        <div>
                                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Total Bill Amount</p>
                                            <p className="text-[10px] text-blue-300">Paid via Credit Card</p>
                                        </div>
                                        <span className="text-2xl font-black">
                                            ₹{getConsultationFee(selectedAppointment.doctor?.specialization)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 text-center">
                                <p className="text-[9px] text-gray-400 font-medium italic">Thank you for choosing Healthcare. Stay healthy!</p>
                            </div>

                            <button
                                onClick={() => window.print()}
                                className="w-full mt-4 py-2 bg-white border border-gray-200 hover:border-gray-900 rounded-xl text-sm font-bold text-gray-900 transition-all flex items-center justify-center space-x-2 shadow-sm"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                </svg>
                                <span>Print Receipt</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PatientHistory;
