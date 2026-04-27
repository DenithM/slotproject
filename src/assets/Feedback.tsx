import React, { useState,useEffect } from 'react';
import Sidebar from './Sidebar';
import { supabase } from '../../client/superbase';
import { useAuth } from '../contexts/AuthContext';
interface FeedbackProps {
    onBack: () => void;
    onNavigateToDashboard: () => void;
    onNavigateToAppointment: () => void;
    onNavigateToDoctorList: () => void;
    onNavigateToHistory: () => void;
    onNavigateToReport: () => void;
    onLogout: () => void;
    onNavigateToPatientInfo: (patientId: string) => void;
}

const Feedback: React.FC<FeedbackProps> = ({
    // onBack,
    onNavigateToDashboard,
    onNavigateToAppointment,
    onNavigateToDoctorList,
    onNavigateToHistory,
    onNavigateToReport,
    onLogout,
    onNavigateToPatientInfo,
}) => {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [category, setCategory] = useState('overall-experience');
    const [message, setMessage] = useState('');
    const [recommendation, setRecommendation] = useState<'yes' | 'maybe' | 'no'>('yes');
    const [submitted, setSubmitted] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
    const ratingLabels = ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];
    const [patientData,setPatientData]=useState<any>(null);
    const { user } = useAuth();

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

    const handleSidebarClick = (item: string) => {
        switch (item) {
            case 'overview':
                onNavigateToDashboard();
                break;
            case 'appointments':
                onNavigateToAppointment();
                break;
            case 'doctors':
                onNavigateToDoctorList();
                break;
            case 'history':
                onNavigateToHistory();
                break;
            case 'feedback':
                break;
            case 'reports':
                onNavigateToReport();
                break;
            case 'logout':
                onLogout();
                break;
            case 'profile-icon':
                onNavigateToPatientInfo(patientData?.id);
                break;
            case 'settings':
                console.log('Navigate to settings');
                break;
            default:
                console.log(`Navigating to: ${item}`);
        }
    };

    const handleToggleSidebar = () => {
        setIsSidebarCollapsed(!isSidebarCollapsed);
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setSubmitted(true);
        alert('Feedback submitted successfully!');
    };

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            <Sidebar 
                activeItem="feedback" 
                onItemClick={handleSidebarClick} 
                isCollapsed={isSidebarCollapsed}
                onToggleCollapse={handleToggleSidebar}
            />

            <div className={`flex-1 px-8 py-10 transition-all duration-300 ${isSidebarCollapsed ? 'ml-0' : 'ml-64'}`}>
                <div className="max-w-5xl mx-auto space-y-8">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">Patient Experience</p>
                            <h1 className="text-4xl font-bold text-slate-900 mt-2">Share your feedback</h1>
                            <p className="text-slate-600 mt-3 max-w-2xl">
                                Tell us how your appointment experience felt so we can keep improving care, scheduling, and follow-up support.
                            </p>
                        </div>
                        {/* <button
                            onClick={onBack}
                            className="px-5 py-3 rounded-xl border border-slate-200 bg-white text-slate-700 font-medium hover:border-blue-300 hover:text-blue-700 transition-colors"
                        >
                            Back to Dashboard
                        </button> */}
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-[1.4fr_0.9fr] gap-8">
                        <form
                            onSubmit={handleSubmit}
                            className="bg-white/90 backdrop-blur rounded-3xl border border-white shadow-xl p-8 space-y-6"
                        >
                            <div>
                                <label className="block text-sm font-semibold text-slate-800 mb-2">Feedback category</label>
                                <select
                                    value={category}
                                    onChange={(event) => setCategory(event.target.value)}
                                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="overall-experience">Overall experience</option>
                                    <option value="doctor-consultation">Doctor consultation</option>
                                    <option value="booking-process">Booking process</option>
                                    <option value="billing-support">Billing and support</option>
                                </select>
                            </div>

                            <div>
                                <p className="text-sm font-semibold text-slate-800 mb-3">Rate your experience</p>
                                <div className="flex items-center gap-3">
                                    {[1, 2, 3, 4, 5].map((value) => (
                                        <button
                                            key={value}
                                            type="button"
                                            onClick={() => setRating(value)}
                                            onMouseEnter={() => setHoverRating(value)}
                                            onMouseLeave={() => setHoverRating(0)}
                                            
                                            className="transition-transform hover:scale-110 focus:outline-none"
                                            aria-label={`Rate ${value} star${value > 1 ? 's' : ''}`}
                                        >
                                            <svg
                                                className={`w-10 h-10 ${value <= (hoverRating || rating) ? 'text-amber-400' : 'text-slate-300'}`}
                                                viewBox="0 0 24 24"
                                                fill="currentColor"
                                                aria-hidden="true"
                                            >
                                                <path d="M12 2.75l2.91 5.9 6.52.95-4.72 4.6 1.11 6.49L12 17.64 6.18 20.69l1.11-6.49-4.72-4.6 6.52-.95L12 2.75z" />
                                            </svg>
                                        </button>
                                    ))}
                                </div>
                                <p className="mt-3 text-sm font-medium text-slate-600">
                                    {rating}/5 - {ratingLabels[rating - 1]}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm font-semibold text-slate-800 mb-3">Would you recommend us?</p>
                                <div className="flex flex-wrap gap-3">
                                    {(['yes', 'maybe', 'no'] as const).map((option) => (
                                        <button
                                            key={option}
                                            type="button"
                                            onClick={() => setRecommendation(option)}
                                            className={`px-5 py-3 rounded-2xl border text-sm font-semibold capitalize transition-all ${recommendation === option
                                                ? 'border-indigo-600 bg-indigo-600 text-white shadow-lg'
                                                : 'border-slate-200 bg-white text-slate-700 hover:border-indigo-300'
                                                }`}
                                        >
                                            {option}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-800 mb-2">Your comments</label>
                                <textarea
                                    value={message}
                                    onChange={(event) => setMessage(event.target.value)}
                                    rows={6}
                                    placeholder="Share what worked well and what we should improve."
                                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="flex items-center justify-between gap-4">
                                <p className="text-sm text-slate-500">
                                    Your response stays in this session for now and is ready to be connected to storage later.
                                </p>
                                <button
                                    type="submit"
                                    className="px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold whitespace-nowrap shadow-lg hover:from-blue-700 hover:to-indigo-700 transition-all"
                                >
                                    Submit feedback
                                </button>
                            </div>
                        </form>

                        <div className="space-y-6">
                            <div className="bg-slate-900 text-white rounded-3xl p-8 shadow-xl">
                                <p className="text-sm uppercase tracking-[0.2em] text-blue-200">Current response</p>
                                <div className="mt-6 space-y-4">
                                    <div>
                                        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Rating</p>
                                        <div className="mt-2 flex items-center gap-1">
                                            {[1, 2, 3, 4, 5].map((value) => (
                                                <svg
                                                    key={value}
                                                    
                                                    className={`w-6 h-6 ${value <= rating ? 'text-amber-400' : 'text-slate-600'}`}
                                                    viewBox="0 0 24 24"
                                                    fill="currentColor"
                                                    aria-hidden="true"
                                                >
                                                    <path d="M12 2.75l2.91 5.9 6.52.95-4.72 4.6 1.11 6.49L12 17.64 6.18 20.69l1.11-6.49-4.72-4.6 6.52-.95L12 2.75z" />
                                                </svg>
                                            ))}
                                        </div>
                                        <p className="text-3xl font-bold mt-2">{rating}/5</p>
                                    </div>
                                    <div>
                                        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Category</p>
                                        <p className="text-lg font-semibold mt-1">{category.replace(/-/g, ' ')}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Recommendation</p>
                                        <p className="text-lg font-semibold mt-1 capitalize">{recommendation}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white/90 rounded-3xl border border-white shadow-xl p-8">
                                <h2 className="text-xl font-bold text-slate-900">Status</h2>
                                {submitted ? (
                                    <div className="mt-4 space-y-3">
                                        <p className="text-green-700 font-semibold">Feedback submitted successfully.</p>
                                        <p className="text-slate-600">
                                            Thanks for sharing your experience. You can continue browsing other sections from the sidebar.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="mt-4 space-y-3 text-slate-600">
                                        <p>Your form is ready to submit.</p>
                                        <p>
                                            Add any specific comments about appointments, doctors, reports, or billing to make the feedback more useful.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Feedback;
