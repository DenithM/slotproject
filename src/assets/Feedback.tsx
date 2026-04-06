import { useEffect, useState } from "react";
import { supabase } from '../../client/superbase';

interface Doctor {
    id: string;
    name: string;
}

interface FeedbackProps {
    onBackToDashboard?: () => void;
}

export default function Feedback({ onBackToDashboard }: FeedbackProps) {
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [selectedDoctor, setSelectedDoctor] = useState("");
    const [doctorRating, setDoctorRating] = useState(0);
    const [websiteRating, setWebsiteRating] = useState(0);
    const [comments, setComments] = useState("");

    useEffect(() => {
        const fetchDoctors = async () => {
            const { data } = await supabase.from("doctors").select("id, name");
            setDoctors(data || []);
        };
        fetchDoctors();
    }, []);



    const renderStars = (rating: number, setRating: any) => {
        return [1, 2, 3, 4, 5].map((star) => (
            <span
                key={star}
                onClick={() => setRating(star)}
                className={`cursor-pointer text-2xl ${star <= rating ? "text-yellow-400" : "text-gray-300"}`}>
                ★
            </span>
        ));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        await supabase.from("feedback").insert([
            {
                doctor_id: selectedDoctor,
                doctor_rating: doctorRating,
                website_rating: websiteRating,
                comments,
            },
        ]);

        alert("Feedback submitted!");
    };
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            <div className="flex">

                {/* Sidebar */}
                <div className="w-64 bg-white shadow-xl border-r border-gray-100 min-h-screen">
                    <div className="p-6 border-b border-gray-100">
                        <div className="flex items-center space-x-3">
                            <div className="w-25 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg px-4">
                                Healthcare
                            </div>
                        </div>
                    </div>

                    <nav className="mt-6">
                        <button
                            onClick={onBackToDashboard}
                            className="w-full flex items-center px-6 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 transition-all duration-200 group"
                        >
                            <svg className="w-5 h-5 mr-3 text-gray-500 group-hover:text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            <span className="font-medium">Back to Dashboard</span>
                        </button>
                        <div className="flex items-center px-6 py-3 text-white bg-gradient-to-r from-blue-500 to-blue-600">
                            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                            </svg>
                            <span className="font-medium">Give Feedback</span>
                        </div>
                    </nav>
                </div>

                {/* Main Content */}
                <div className="flex-1 p-8">
                    <div className="max-w-4xl mx-auto">
                        {/* Header */}
                        <div className="mb-8">
                            <h1 className="text-3xl font-light text-gray-800 mb-2">Give Feedback</h1>
                            <p className="text-gray-600">Share your experience about doctors and our platform</p>
                        </div>

                        {/* Form Card */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                            <form onSubmit={handleSubmit} className="space-y-6">

                                {/* Doctor */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Select Doctor *
                                    </label>
                                    <select
                                        value={selectedDoctor}
                                        onChange={(e) => setSelectedDoctor(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    >
                                        <option value="">Choose a doctor...</option>
                                        {doctors.map((doc) => (
                                            <option key={doc.id} value={doc.id}>
                                                {doc.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Doctor Rating */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Rate Doctor
                                    </label>
                                    <div className="flex space-x-2">
                                        {renderStars(doctorRating, setDoctorRating)}
                                    </div>
                                </div>

                                {/* Website Rating */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Rate our Platform
                                    </label>
                                    <div className="flex space-x-2">
                                        {renderStars(websiteRating, setWebsiteRating)}
                                    </div>
                                </div>

                                {/* Comments */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Feedback
                                    </label>
                                    <textarea
                                        value={comments}
                                        onChange={(e) => setComments(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        rows={4}
                                        placeholder="Write your feedback..."
                                    />
                                </div>

                                {/* Buttons */}
                                <div className="flex justify-end gap-4">
                                    <button
                                        type="button"
                                        onClick={onBackToDashboard}
                                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200"
                                    >
                                        Submit Feedback
                                    </button>
                                </div>

                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}