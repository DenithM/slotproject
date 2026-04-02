import React, { useState } from 'react';
import doctorbg from 'D:/slot pro/project/public/doctorbg.jpg';
import Sidebar from './Sidebar';

interface Doctor {
  id: number;
  name: string;
  specialization: string;
  experience: string;
  rating: number;
  reviews: number;
  consultationFee: string;
  education: string;
  achievements: string[];
  languages: string[];
  availability: string;
  image: string;
  description: string;
  hospital: string;
  nextAvailable: string;
}

interface DoctorListProps {
  onNavigateToOverview?: () => void;
  onNavigateToAppointment?: () => void;
}

const DoctorList: React.FC<DoctorListProps> = ({ onNavigateToOverview, onNavigateToAppointment }) => {
  const [selectedDoctor, setSelectedDoctor] = useState<number | null>(null);
  const [activeMenuItem, setActiveMenuItem] = useState<string>('doctors');

  const handleBookAppointment = () => {
    onNavigateToAppointment?.();
  };

  const handleSidebarClick = (item: string) => {
    setActiveMenuItem(item);
    
    // Handle navigation logic
    switch (item) {
      case 'overview':
        onNavigateToOverview?.();
        break;
      case 'appointments':
        onNavigateToAppointment?.();
        break;
      case 'doctors':
        // Already on doctors list
        break;
      case 'message':
        console.log('Navigate to messages');
        break;
      case 'reports':
        console.log('Navigate to reports');
        break;
      case 'settings':
        console.log('Navigate to settings');
        break;
      case 'logout':
        console.log('Handle logout');
        break;
      default:
        console.log(`Navigating to: ${item}`);
    }
  };

  const doctors: Doctor[] = [
    {
      id: 1,
      name: "Dr. Supriya",
      specialization: "Cardiologist",
      experience: "15+ Years",
      rating: 4.9,
      reviews: 342,
      consultationFee: "250",
      education: "Harvard Medical School, Fellow of American College of Cardiology",
      achievements: [
        "Top Cardiologist Award 2023",
        "Published 50+ Research Papers",
        "Pioneer in Minimally Invasive Heart Surgery"
      ],
      languages: ["English", "Tamil", "French","Hindi"],
      availability: "Mon, Wed, Fri",
      image: "/woman-doctor-wearing-lab-coat-with-stethoscope-isolated.jpg",
      description: "World-renowned cardiologist specializing in interventional cardiology and preventive heart care. Expert in complex cardiac procedures and has saved thousands of lives.",
      hospital: "Mayo Clinic Cardiac Center",
      nextAvailable: "Tomorrow, 2:00 PM"
    },
    {
      id: 2,
      name: "Dr.Ajay",
      specialization: "Neurosurgeon",
      experience: "12+ Years",
      rating: 4.8,
      reviews: 289,
      consultationFee: "350",
      education: "Johns Hopkins University, Board Certified Neurosurgeon",
      achievements: [
        "Excellence in Neurosurgery Award 2022",
        "Pioneer in Brain Mapping Technology",
        "1000+ Successful Brain Surgeries"
      ],
      languages: ["English",  "Tamil"],
      availability: "Tue, Thu, Sat",
      image: "/portrait-3d-male-doctor.jpg",
      description: "Leading neurosurgeon with expertise in complex brain and spine surgeries. Known for innovative surgical techniques and exceptional patient outcomes.",
      hospital: "Cleveland Clinic Neurological Institute",
      nextAvailable: "Today, 4:30 PM"
    },
    {
      id: 3,
      name: "Dr. Prakash",
      specialization: "Orthopedic Surgeon",
      experience: "20+ Years",
      rating: 4.9,
      reviews: 456,
      consultationFee: "200",
      education: "Stanford Medical School, Sports Medicine Specialist",
      achievements: [
        "Olympic Team Physician 2020",
        "Developer of Advanced Joint Replacement Technique",
        "Author of 'Modern Orthopedic Surgery'"
      ],
      languages: ["English", "Tamil"],
      availability: "Daily",
      image: "/portrait-3d-male-doctor (1).jpg",
      description: "Expert orthopedic surgeon specializing in sports medicine and joint replacements. Trusted by professional athletes and known for revolutionary surgical approaches.",
      hospital: "Hospital for Special Surgery",
      nextAvailable: "Today, 10:00 AM"
    }
  ];

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i} className="text-yellow-400">⭐</span>);
    }
    if (hasHalfStar) {
      stars.push(<span key="half" className="text-yellow-400">⭐</span>);
    }
    for (let i = stars.length; i < 5; i++) {
      stars.push(<span key={i} className="text-gray-300">⭐</span>);
    }
    return stars;
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Sidebar activeItem={activeMenuItem} onItemClick={handleSidebarClick} />
      
      <div className="flex-1 ml-64">
        {/* Header */}
        <div className="relative overflow-hidden bg-img" style={{backgroundImage: `url(${doctorbg})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat'}}>
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600"></div>
          <div className="absolute inset-0 bg-black opacity-20"></div>
          
          <div className="relative z-10 text-white py-20 px-8">
            <div className="max-w-7xl mx-auto text-white text-center">
              <div className="mb-6">
                <h1 className="text-6xl font-bold mb-4">
                  World-Class Medical Excellence
                </h1>
                <p className=" ">
                  Experience unparalleled healthcare with our distinguished team of internationally acclaimed physicians, 
                  each bringing decades of expertise and revolutionary treatments to transform your wellness journey
                </p>
              </div>
              
              
              <div className="flex justify-center space-x-8 mt-12">
                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-600 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative bg-white bg-opacity-20 backdrop-blur-lg rounded-2xl px-8 py-6 border border-white border-opacity-30">
                    <p className="text-4xl font-bold text-black mb-2">{doctors.length}+</p>
                    <p className="text-sm text-black font-medium">Elite Specialists</p>
                  </div>
                </div>
                
                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-purple-600 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative bg-white bg-opacity-20 backdrop-blur-lg rounded-2xl px-8 py-6 border border-white border-opacity-30">
                    <p className="text-4xl font-bold text-black mb-2">50+</p>
                    <p className="text-sm text-black font-medium">Years Excellence</p>
                  </div>
                </div>
                
                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-pink-600 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative bg-white bg-opacity-20 backdrop-blur-lg rounded-2xl px-8 py-6 border border-white border-opacity-30">
                    <p className="text-4xl font-bold text-black mb-2">4.9</p>
                    <p className="text-sm text-black font-medium">Perfect Rating</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Enhanced Filter Section */}
        <div className="max-w-7xl mx-auto px-8 py-8">
          <div className="bg-white bg-opacity-80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white border-opacity-50">
            <div className="flex flex-wrap items-center justify-between gap-6">
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <select className="appearance-none bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl px-6 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 font-medium shadow-sm hover:shadow-md transition-shadow">
                    <option>All Specializations</option>
                    <option>Cardiology</option>
                    <option>Neurosurgery</option>
                    <option>Orthopedics</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                
                <div className="relative">
                  <select className="appearance-none bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl px-6 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-700 font-medium shadow-sm hover:shadow-md transition-shadow">
                    <option>Experience</option>
                    <option>5-10 Years</option>
                    <option>10-15 Years</option>
                    <option>15+ Years</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                
                <div className="relative">
                  <select className="appearance-none bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl px-6 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-700 font-medium shadow-sm hover:shadow-md transition-shadow">
                    <option>Price Range</option>
                    <option>0-200</option>
                    <option>200-300</option>
                    <option>300+</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <button className="group relative bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
                  <span className="relative z-10">Search</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white to-transparent opacity-0 group-hover:opacity-20 transition-opacity rounded-xl"></div>
                </button>
                <button className="group relative bg-white border-2 border-gray-200 text-gray-700 px-8 py-3 rounded-xl font-semibold hover:border-gray-300 hover:bg-gray-50 transition-all duration-300 shadow-sm hover:shadow-md">
                  Reset
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Doctors Grid */}
        <div className="max-w-7xl mx-auto px-8 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-10">
            {doctors.map((doctor) => (
              <div
                key={doctor.id}
                className={`group relative bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-700 overflow-hidden border border-gray-100 transform hover:scale-105 hover:-translate-y-2 ${selectedDoctor === doctor.id ? 'ring-4 ring-blue-500 ring-opacity-50' : ''}`}
                onMouseEnter={() => setSelectedDoctor(doctor.id)}
                onMouseLeave={() => setSelectedDoctor(null)}
              >
                {/* Shine Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-all duration-1000"></div>
                
                {/* Doctor Image & Basic Info */}
                <div className="relative">
                  <div className="h-80 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 relative overflow-hidden">
                    <img
                      src={doctor.image}
                      alt={doctor.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM2YjcyODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiPuKAuPCfmKE8L3RleHQ+PC9zdmc+';
                      }}
                    />
                    
                    {/* Enhanced Fee Badge */}
                    <div className="absolute top-4 right-4 group">
                      <div className="bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-full px-4 py-2 shadow-lg transform group-hover:scale-110 transition-transform">
                        <span className="text-sm font-bold">₹{doctor.consultationFee}</span>
                      </div>
                      <div className="absolute inset-0 bg-amber-400 rounded-full blur-lg opacity-50 animate-pulse"></div>
                    </div>
                    
                    {/* Enhanced Name Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6">
                      <h3 className="text-2xl font-bold text-white mb-1 group-hover:text-blue-200 transition-colors">{doctor.name}</h3>
                      <p className="text-white/95 font-medium text-sm group-hover:text-blue-100 transition-colors">{doctor.specialization}</p>
                    </div>
                  </div>
                </div>

                {/* Doctor Details */}
                <div className="p-6">
                  {/* Rating and Reviews */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <div className="flex">{renderStars(doctor.rating)}</div>
                      <span className="text-sm font-semibold text-gray-700">{doctor.rating}</span>
                      <span className="text-sm text-gray-500">({doctor.reviews} reviews)</span>
                    </div>
                    <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
                      Available
                    </div>
                  </div>

                  {/* Experience and Education */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center text-sm">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                      <span className="text-gray-600">Experience:</span>
                      <span className="font-semibold text-gray-800 ml-2">{doctor.experience}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                      <span className="text-gray-600">Education:</span>
                      <span className="font-semibold text-gray-800 ml-2 truncate">{doctor.education.split(',')[0]}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <span className="w-2 h-2 bg-indigo-500 rounded-full mr-3"></span>
                      <span className="text-gray-600">Hospital:</span>
                      <span className="font-semibold text-gray-800 ml-2">{doctor.hospital}</span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{doctor.description}</p>

                  {/* Languages */}
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-2">Languages:</p>
                    <div className="flex flex-wrap gap-2">
                      {doctor.languages.map((lang, index) => (
                        <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-medium">
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Availability */}
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-2">Next Available:</p>
                    <div className="bg-blue-50 text-blue-700 px-3 py-2 rounded-lg text-sm font-medium">
                      📅 {doctor.nextAvailable}
                    </div>
                  </div>

                  {/* Enhanced Action Buttons */}
                  <div className="flex space-x-3 mt-6">
                    <button onClick={handleBookAppointment} className="flex-1 group relative bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
                      <span className="relative z-10 flex items-center justify-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Book Appointment
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-white to-transparent opacity-0 group-hover:opacity-20 transition-opacity rounded-xl"></div>
                    </button>
                    <button className="group relative p-4 bg-gradient-to-r from-pink-50 to-red-50 border-2 border-pink-200 rounded-xl hover:border-pink-300 hover:bg-gradient-to-r hover:from-pink-100 hover:to-red-100 transition-all duration-300 shadow-sm hover:shadow-md">
                      <svg className="w-6 h-6 text-pink-600 group-hover:text-red-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Achievements Badge */}
                {doctor.achievements.length > 0 && (
                  <div className="px-6 pb-4">
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-3">
                      <div className="flex items-center mb-2">
                        <span className="text-amber-600 mr-2">🏆</span>
                        <span className="text-sm font-semibold text-amber-800">Key Achievement</span>
                      </div>
                      <p className="text-xs text-amber-700">{doctor.achievements[0]}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Load More Section */}
        <div className="text-center pb-16">
          <button className="bg-white border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-blue-600 hover:text-white transition-all duration-200 shadow-lg">
            Load More Doctors
          </button>
        </div>
      </div>
    </div>
  );
};

export default DoctorList;