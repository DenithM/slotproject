import { supabase } from './client/superbase.js';

async function createPatientsTable() {
  console.log('Creating patients table...');
  
  try {
    // First, let's try to create the table using raw SQL
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS patients (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        first_name VARCHAR(255) NOT NULL,
        last_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        date_of_birth DATE NOT NULL,
        gender VARCHAR(20),
        blood_type VARCHAR(10),
        height VARCHAR(50),
        weight VARCHAR(50),
        address TEXT,
        city VARCHAR(100),
        state VARCHAR(100),
        zip_code VARCHAR(20),
        country VARCHAR(100),
        allergies TEXT,
        medications TEXT,
        medical_history TEXT,
        emergency_contact_name VARCHAR(255),
        emergency_contact_phone VARCHAR(50),
        emergency_contact_relation VARCHAR(50),
        insurance VARCHAR(255),
        insurance_number VARCHAR(100),
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    // Enable RLS
    const enableRLSSQL = `ALTER TABLE patients ENABLE ROW LEVEL SECURITY`;

    // Create policies
    const policies = [
      `CREATE POLICY "Anyone can view patients" ON patients FOR SELECT USING (true)`,
      `CREATE POLICY "Anyone can insert patients" ON patients FOR INSERT WITH CHECK (true)`,
      `CREATE POLICY "Anyone can update patients" ON patients FOR UPDATE USING (true)`,
      `CREATE POLICY "Allow all operations on patients for development" ON patients FOR ALL USING (true)`
    ];

    console.log('Attempting to create patients table...');
    
    // Try to execute the table creation
    const { error: tableError } = await supabase
      .from('patients')
      .select('id')
      .limit(1);
    
    if (tableError && tableError.code === 'PGRST116') {
      // Table doesn't exist, we need to create it manually
      console.log('Table does not exist. Please run the SQL manually in Supabase dashboard:');
      console.log('===========================================');
      console.log(createTableSQL);
      console.log(enableRLSSQL);
      policies.forEach(policy => console.log(policy));
      console.log('===========================================');
    } else if (tableError) {
      console.error('Other error:', tableError);
    } else {
      console.log('✓ Patients table already exists');
      
      // Test if we can insert data
      const testData = {
        first_name: 'Test',
        last_name: 'User',
        email: 'test@example.com',
        phone: '1234567890',
        date_of_birth: '1990-01-01'
      };
      
      const { error: insertError } = await supabase
        .from('patients')
        .insert(testData);
      
      if (insertError) {
        console.error('Insert test failed:', insertError);
        console.log('You may need to run the RLS policies manually in Supabase dashboard:');
        console.log('===========================================');
        console.log(enableRLSSQL);
        policies.forEach(policy => console.log(policy));
        console.log('===========================================');
      } else {
        console.log('✓ Patients table is working correctly');
        // Clean up test data
        await supabase.from('patients').delete().eq('email', 'test@example.com');
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

createPatientsTable();
