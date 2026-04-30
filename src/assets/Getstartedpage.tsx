import React, { useState, useEffect } from 'react'
import { supabase } from '../../client/superbase'
import { useAuth } from '../contexts/AuthContext'

interface GetstartedpageProps {
  onNavigateToPatientInfo: (patientId?: string) => void;
  onNavigateToDashboard: () => void;
}

const Getstartedpage: React.FC<GetstartedpageProps> = ({ onNavigateToPatientInfo, onNavigateToDashboard }) => {
  const { user } = useAuth()
  const [checking, setChecking] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    
    const checkExistingPatientData = async () => {
      if (!user) {
        setChecking(false)
        return
      }

      try {
        const { data, error } = await supabase
          .from('patients')
          .select('id')
          .eq('user_id', user.id)
          .single()

        if (error && error.code !== 'PGRST116') {
          console.error('Error checking patient data:', error)
        }

        if (data) {
          
          console.log('Existing user found, navigating to dashboard')
          // setTimeout(() => onNavigateToDashboard(), 1000)
        } else {
          
          console.log('New user, staying on getstarted page')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setChecking(false)
      }
    }

    checkExistingPatientData()
  }, [user])

  const handleGetStarted = () => {
    if(!user){
      onNavigateToPatientInfo();
      return;
    }
    onNavigateToDashboard();
  }

  if (checking) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Checking your account...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="text-center">
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-700 font-medium">{error}</p>
          </div>
          <button 
            onClick={() => setError(null)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (    
    <div className="relative">
      {/* <div className="absolute right-[90%] size-[250px] ">
        <img src='/public/HealthNovaLogo.png' alt='logo' />
      </div> */}
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="mb-8">
        <h1>  <img src='/family.jpg' alt='image'/></h1>
      </div>
      <h1 className=" font-bold mb-4 text-blue-600">Start Your Journey to Better Health Today</h1>
     <h2 className="text-lg text-gray-600 mb-8">Create your account to book appointments, consult with doctors, and manage your health records easily.</h2>
     <br />
      <button 
        onClick={handleGetStarted} 
        className="bg-blue-500 text-white px-6 py-5 rounded-lg hover:bg-blue-600 transition-colors text-lg"
      >
        Get Started
      </button>
    </div>
    </div>
  )
}

export default Getstartedpage