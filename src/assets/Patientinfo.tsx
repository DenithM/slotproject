import React, { useState, useEffect } from 'react';

import { supabase } from '../../client/superbase';



interface PatientFormData {

  firstName: string;

  lastName: string;

  email: string;

  phone: string;

  dateOfBirth: string;

  gender: string;

  bloodType: string;

  height: string;

  weight: string;

  address: string;

  city: string;

  state: string;

  zipCode: string;

  country: string;

  allergies: string;

  medications: string;

  medicalHistory: string;

  emergencyContactName: string;

  emergencyContactPhone: string;

  emergencyContactRelation: string;

  insurance: string;

  insuranceNumber: string;

  notes: string;

}



interface PatientinfoProps {

  onBack?: () => void;

  onSave?: (patient: PatientFormData) => void;

  patientId?: string;

  onNavigateToAppointment?: () => void;

  onNavigateToReport?: () => void;

  onNavigateToHistory?: () => void;

  onNavigateToFeedback?: () => void;

  onLogout?: () => void;

}



const Patientinfo: React.FC<PatientinfoProps> = ({ 
  onBack, 
  onSave, 
  patientId, 
  onNavigateToAppointment, 
  onNavigateToReport, 
  onNavigateToHistory, 
  onNavigateToFeedback, 
  onLogout 
}) => {

  const [formData, setFormData] = useState<PatientFormData>({

    firstName: '',

    lastName: '',

    email: '',

    phone: '',

    dateOfBirth: '',

    gender: '',

    bloodType: '',

    height: '',

    weight: '',

    address: '',

    city: '',

    state: '',

    zipCode: '',

    country: '',

    allergies: '',

    medications: '',

    medicalHistory: '',

    emergencyContactName: '',

    emergencyContactPhone: '',

    emergencyContactRelation: '',

    insurance: '',

    insuranceNumber: '',

    notes: ''

  });



  const [loading, setLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [success, setSuccess] = useState<string | null>(null);



  // Clear error state on component mount and when patientId changes
  useEffect(() => {
    setError(null);
  }, []);

  // Load existing patient data if patientId is provided
  useEffect(() => {
    // Clear any existing errors when patientId changes
    setError(null);
    
    if (patientId) {
      fetchPatientData();
    }
  }, [patientId]);



  const fetchPatientData = async () => {

    try {

      setLoading(true);

      const { data, error } = await supabase

        .from('patients')

        .select('*')

        .eq('id', patientId)

        .single();



      if (error) {
        // Handle case where patient doesn't exist yet
        if (error.code === 'PGRST116') {
          console.log('No existing patient data found for this ID, treating as new patient');
          setError(null); // Clear error since this is expected for new patients
        } else {
          console.error('Error fetching patient data:', error);
          setError('Failed to load patient data');
        }
      } else if (data) {

        setFormData({

          firstName: data.first_name || '',

          lastName: data.last_name || '',

          email: data.email || '',

          phone: data.phone || '',

          dateOfBirth: data.date_of_birth || '',

          gender: data.gender || '',

          bloodType: data.blood_type || '',

          height: data.height || '',

          weight: data.weight || '',

          address: data.address || '',

          city: data.city || '',

          state: data.state || '',

          zipCode: data.zip_code || '',

          country: data.country || '',

          allergies: data.allergies || '',

          medications: data.medications || '',

          medicalHistory: data.medical_history || '',

          emergencyContactName: data.emergency_contact_name || '',

          emergencyContactPhone: data.emergency_contact_phone || '',

          emergencyContactRelation: data.emergency_contact_relation || '',

          insurance: data.insurance || '',

          insuranceNumber: data.insurance_number || '',

          notes: data.notes || ''

        });

      }

    } catch (err) {

      console.error('Error:', err);

      setError('An error occurred while loading patient data');

    } finally {

      setLoading(false);

    }

  };



  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {

    const { name, value } = e.target;

    setFormData(prev => ({

      ...prev,

      [name]: value

    }));

  };



  const testSupabaseConnection = async () => {

    try {

      console.log('Testing Supabase connection...');

      

      // Test if we can access the patients table

      const { error } = await supabase

        .from('patients')

        .select('id')

        .limit(1);

      

      if (error) {

        console.error('Supabase connection test failed:', error);

        console.error('Error code:', error.code);

        console.error('Error message:', error.message);

        return false;

      } else {

        console.log('Supabase connection test passed');

        return true;

      }

    } catch (err) {

      console.error('Connection test exception:', err);

      return false;

    }

  };



  const handleSubmit = async (e: React.FormEvent) => {

    e.preventDefault();

    setLoading(true);

    setError(null);

    setSuccess(null);



    try {

      // Test Supabase connection first

      const isConnected = await testSupabaseConnection();

      if (!isConnected) {

        setError('Cannot connect to database. Please check your internet connection and try again.');

        setLoading(false);

        return;

      }



      // Validate required fields

      const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'dateOfBirth'];

      const missingFields = requiredFields.filter(field => !formData[field as keyof PatientFormData]);

      

      if (missingFields.length > 0) {

        setError('Please fill in all required fields');

        setLoading(false);

        return;

      }



      // Validate email format

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(formData.email)) {

        setError('Please enter a valid email address');

        setLoading(false);

        return;

      }



      // Validate phone format

      const phoneRegex = /^[\d\s\-\(\)]+$/;

      if (!phoneRegex.test(formData.phone)) {

        setError('Please enter a valid phone number');

        setLoading(false);

        return;

      }



      // Prepare data for Supabase

      const patientData = {

        first_name: formData.firstName,

        last_name: formData.lastName,

        email: formData.email,

        phone: formData.phone,

        date_of_birth: formData.dateOfBirth,

        gender: formData.gender,

        blood_type: formData.bloodType,

        height: formData.height,

        weight: formData.weight,

        address: formData.address,

        city: formData.city,

        state: formData.state,

        zip_code: formData.zipCode,

        country: formData.country,

        allergies: formData.allergies,

        medications: formData.medications,

        medical_history: formData.medicalHistory,

        emergency_contact_name: formData.emergencyContactName,

        emergency_contact_phone: formData.emergencyContactPhone,

        emergency_contact_relation: formData.emergencyContactRelation,

        insurance: formData.insurance,

        insurance_number: formData.insuranceNumber,

        notes: formData.notes,

        updated_at: new Date().toISOString()

      };



      let result;

      if (patientId) {

        // Update existing patient

        result = await supabase

          .from('patients')

          .update(patientData)

          .eq('id', patientId);

      } else {

        // Create new patient

        result = await supabase

          .from('patients')

          .insert({

            ...patientData,

            created_at: new Date().toISOString()

          });

      }



      if (result.error) {

        console.error('Error saving patient data:', result.error);

        console.error('Full error details:', JSON.stringify(result.error, null, 2));

        console.error('Patient data being saved:', JSON.stringify(patientData, null, 2));

        setError(`Failed to save patient information: ${result.error.message || 'Unknown error'}`);

      } else {

        setSuccess(`Patient information ${patientId ? 'updated' : 'saved'} successfully!`);

        onSave?.(formData);

        

        // If creating new patient, clear form

        if (!patientId) {

          setFormData({

            firstName: '',

            lastName: '',

            email: '',

            phone: '',

            dateOfBirth: '',

            gender: '',

            bloodType: '',

            height: '',

            weight: '',

            address: '',

            city: '',

            state: '',

            zipCode: '',

            country: '',

            allergies: '',

            medications: '',

            medicalHistory: '',

            emergencyContactName: '',

            emergencyContactPhone: '',

            emergencyContactRelation: '',

            insurance: '',

            insuranceNumber: '',

            notes: ''

          });

        }

      }

    } catch (err) {

      console.error('Error:', err);

      setError('An error occurred while saving patient information');

    } finally {

      setLoading(false);

    }

  };



  return (

    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-8">

      <div className="max-w-4xl mx-auto">

        {/* Header */}

        <div className="flex items-center justify-between mb-8">

          <button

            onClick={onBack}

            className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors duration-300"

          >

            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">

              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7 7" />

            </svg>

            <span className="font-medium">Back</span>

          </button>

          

          <div className="text-center w-[70%]">

            <h1 className="text-3xl font-bold text-left text-blue-900 mb-2">

              {patientId ? 'Edit Patient Information' : 'Add New Patient'}

            </h1>

            <p className="text-gray-600 w-[70%]">Fill in the patient details below</p>

          </div>

        </div>



        {/* Success/Error Messages */}

        {success && (

          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">

            <p className="text-green-700 font-medium">{success}</p>

          </div>

        )}

        

        {error && (

          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">

            <p className="text-red-700 font-medium">{error}</p>

          </div>

        )}



        {/* Form */}

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Personal Information */}

            <div className="space-y-4">

              <h2 className="text-xl font-bold text-blue-900 mb-4 pb-2 border-b border-gray-200">

                Personal Information

              </h2>

              

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>

                <input

                  type="text"

                  name="firstName"

                  value={formData.firstName}

                  onChange={handleInputChange}

                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"

                  required

                />

              </div>



              <div>

                <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>

                <input

                  type="text"

                  name="lastName"

                  value={formData.lastName}

                  onChange={handleInputChange}

                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"

                  required

                />

              </div>



              <div>

                <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>

                <input

                  type="email"

                  name="email"

                  value={formData.email}

                  onChange={handleInputChange}

                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"

                  required

                />

              </div>



              <div>

                <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>

                <input

                  type="tel"

                  name="phone"

                  value={formData.phone}

                  onChange={handleInputChange}

                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"

                  placeholder="(555) 123-4567"

                  required

                />

              </div>



              <div>

                <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth *</label>

                <input

                  type="date"

                  name="dateOfBirth"

                  value={formData.dateOfBirth}

                  onChange={handleInputChange}

                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"

                  required

                />

              </div>



              <div>

                <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>

                <select

                  name="gender"

                  value={formData.gender}

                  onChange={handleInputChange}

                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"

                >

                  <option value="">Select Gender</option>

                  <option value="Male">Male</option>

                  <option value="Female">Female</option>

                  <option value="Other">Other</option>

                </select>

              </div>



              <div>

                <label className="block text-sm font-medium text-gray-700 mb-2">Blood Type</label>

                <select

                  name="bloodType"

                  value={formData.bloodType}

                  onChange={handleInputChange}

                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"

                >

                  <option value="">Select Blood Type</option>

                  <option value="A+">A+</option>

                  <option value="A-">A-</option>

                  <option value="B+">B+</option>

                  <option value="B-">B-</option>

                  <option value="AB+">AB+</option>

                  <option value="AB-">AB-</option>

                  <option value="O+">O+</option>

                  <option value="O-">O-</option>

                </select>

              </div>

            </div>



            {/* Physical Information */}

            <div className="space-y-4">

              <h2 className="text-xl font-bold text-blue-900 mb-4 pb-2 border-b border-gray-200">

                Physical Information

              </h2>

              

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-2">Height</label>

                <input

                  type="text"

                  name="height"

                  value={formData.height}

                  onChange={handleInputChange}

                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"

                  placeholder="e.g., 5'10&quot;"

                />

              </div>



              <div>

                <label className="block text-sm font-medium text-gray-700 mb-2">Weight</label>

                <input

                  type="text"

                  name="weight"

                  value={formData.weight}

                  onChange={handleInputChange}

                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"

                  placeholder="e.g., 180 lbs"

                />

              </div>



              <div>

                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>

                <input

                  type="text"

                  name="address"

                  value={formData.address}

                  onChange={handleInputChange}

                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"

                  placeholder="123 Main St"

                />

              </div>



              <div className="grid grid-cols-3 gap-4">

                <div>

                  <label className="block text-sm font-medium text-gray-700 mb-2">City</label>

                  <input

                    type="text"

                    name="city"

                    value={formData.city}

                    onChange={handleInputChange}

                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"

                  />

                </div>



                <div>

                  <label className="block text-sm font-medium text-gray-700 mb-2">State</label>

                  <input

                    type="text"

                    name="state"

                    value={formData.state}

                    onChange={handleInputChange}

                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"

                  />

                </div>



                <div>

                  <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code</label>

                  <input

                    type="text"

                    name="zipCode"

                    value={formData.zipCode}

                    onChange={handleInputChange}

                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"

                  />

                </div>

              </div>



              <div>

                <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>

                <input

                  type="text"

                  name="country"

                  value={formData.country}

                  onChange={handleInputChange}

                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"

                />

              </div>

            </div>

          </div>



          {/* Medical Information */}

          <div className="mt-8 space-y-4">

            <h2 className="text-xl font-bold text-blue-900 mb-4 pb-2 border-b border-gray-200">

              Medical Information

            </h2>



            <div>

              <label className="block text-sm font-medium text-gray-700 mb-2">Allergies</label>

              <textarea

                name="allergies"

                value={formData.allergies}

                onChange={handleInputChange}

                rows={3}

                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"

                placeholder="List any known allergies..."

              />

            </div>



            <div>

              <label className="block text-sm font-medium text-gray-700 mb-2">Current Medications</label>

              <textarea

                name="medications"

                value={formData.medications}

                onChange={handleInputChange}

                rows={3}

                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"

                placeholder="List current medications..."

              />

            </div>



            <div>

              <label className="block text-sm font-medium text-gray-700 mb-2">Medical History</label>

              <textarea

                name="medicalHistory"

                value={formData.medicalHistory}

                onChange={handleInputChange}

                rows={3}

                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"

                placeholder="Brief medical history..."

              />

            </div>

          </div>



          {/* Emergency Contact */}

          <div className="mt-8 space-y-4">

            <h2 className="text-xl font-bold text-blue-900 mb-4 pb-2 border-b border-gray-200">

              Emergency Contact

            </h2>



            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-2">Contact Name</label>

                <input

                  type="text"

                  name="emergencyContactName"

                  value={formData.emergencyContactName}

                  onChange={handleInputChange}

                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"

                  placeholder="Jane Doe"

                />

              </div>



              <div>

                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>

                <input

                  type="tel"

                  name="emergencyContactPhone"

                  value={formData.emergencyContactPhone}

                  onChange={handleInputChange}

                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"

                  placeholder="(555) 987-6543"

                />

              </div>



              <div>

                <label className="block text-sm font-medium text-gray-700 mb-2">Relationship</label>

                <select

                  name="emergencyContactRelation"

                  value={formData.emergencyContactRelation}

                  onChange={handleInputChange}

                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"

                >

                  <option value="">Select Relationship</option>

                  <option value="Spouse">Spouse</option>

                  <option value="Parent">Parent</option>

                  <option value="Child">Child</option>

                  <option value="Sibling">Sibling</option>

                  <option value="Friend">Friend</option>

                  <option value="Other">Other</option>

                </select>

              </div>

            </div>

          </div>



          {/* Insurance */}

          <div className="mt-8 space-y-4">

            <h2 className="text-xl font-bold text-blue-900 mb-4 pb-2 border-b border-gray-200">

              Insurance Information

            </h2>



            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-2">Insurance Provider</label>

                <input

                  type="text"

                  name="insurance"

                  value={formData.insurance}

                  onChange={handleInputChange}

                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"

                  placeholder="Blue Cross Blue Shield"

                />

              </div>



              <div>

                <label className="block text-sm font-medium text-gray-700 mb-2">Policy Number</label>

                <input

                  type="text"

                  name="insuranceNumber"

                  value={formData.insuranceNumber}

                  onChange={handleInputChange}

                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"

                  placeholder="POL-123456789"

                />

              </div>

            </div>



            <div>

              <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>

              <textarea

                name="notes"

                value={formData.notes}

                onChange={handleInputChange}

                rows={3}

                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"

                placeholder="Any additional notes or special requirements..."

              />

            </div>

          </div>



          {/* Submit Button */}

          <div className="mt-8 flex justify-end space-x-4">

            <button

              type="button"

              onClick={onBack}

              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"

            >

              Cancel

            </button>

            <button

              type="submit"

              disabled={loading}

              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"

            >

              {loading ? (

                <span className="flex items-center space-x-2">

                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>

                  {patientId ? 'Updating...' : 'Saving...'}

                </span>

              ) : (

                <span>{patientId ? 'Update Patient' : 'Save Patient'}</span>

              )}

            </button>

          </div>

        </form>

      </div>

    </div>

  );

};



export default Patientinfo;

