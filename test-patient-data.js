import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://htqsidmrqueojdobwzzv.supabase.co';
const supabaseKey = 'sb_publishable_Yi-nnbVR2Jbgyv0IGUY44g_VuoO-Lau';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testPatientData() {
  console.log('🔍 Testing patient data connection...\n');
  
  try {
    // Test 1: Check if patients table exists and has data
    console.log('📋 Testing patients table...');
    const { data: patients, error: patientsError } = await supabase
      .from('patients')
      .select('*')
      .limit(5);
    
    if (patientsError) {
      console.error('❌ Error accessing patients table:', patientsError);
    } else {
      console.log(`✅ Found ${patients.length} patients in database`);
      if (patients.length > 0) {
        console.log('📄 Sample patient data:');
        console.log(JSON.stringify(patients[0], null, 2));
      }
    }
    
    // Test 2: Check appointments with patient relationships
    console.log('\n📋 Testing appointments with patient relationships...');
    const { data: appointments, error: appointmentsError } = await supabase
      .from('appointments')
      .select(`
        *,
        patients:patient_id (
          id,
          first_name,
          last_name,
          email,
          phone,
          date_of_birth,
          blood_type,
          gender
        )
      `)
      .limit(3);
    
    if (appointmentsError) {
      console.error('❌ Error accessing appointments with patients:', appointmentsError);
    } else {
      console.log(`✅ Found ${appointments.length} appointments with patient data`);
      if (appointments.length > 0) {
        console.log('📄 Sample appointment with patient:');
        console.log(JSON.stringify(appointments[0], null, 2));
      }
    }
    
    // Test 3: Try to find patient by the hardcoded email
    console.log('\n📋 Testing patient lookup by email...');
    const userEmail = 'denithrokith@gmail.com';
    const { data: specificPatient, error: specificError } = await supabase
      .from('patients')
      .select('*')
      .eq('email', userEmail)
      .single();
    
    if (specificError) {
      console.error(`❌ Error finding patient with email ${userEmail}:`, specificError);
      
      // Try to find any patient instead
      console.log('\n📋 Trying to find any patient...');
      const { data: anyPatient, error: anyError } = await supabase
        .from('patients')
        .select('*')
        .limit(1)
        .single();
      
      if (anyError) {
        console.error('❌ No patients found in database:', anyError);
      } else {
        console.log('✅ Found a patient:', anyPatient.email);
        console.log('📄 Patient data:');
        console.log(JSON.stringify(anyPatient, null, 2));
      }
    } else {
      console.log('✅ Found patient with email:', userEmail);
      console.log('📄 Patient data:');
      console.log(JSON.stringify(specificPatient, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testPatientData();
