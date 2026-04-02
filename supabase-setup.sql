-- Copy and paste this entire script into your Supabase SQL Editor
-- Go to: https://supabase.com/dashboard/project/htqsidmrqueojdobwzzv/sql

-- Step 1: Create the patients table
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
);

-- Step 2: Enable Row Level Security
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

-- Step 3: Create policies to allow operations
CREATE POLICY "Anyone can view patients" ON patients
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert patients" ON patients
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update patients" ON patients
  FOR UPDATE USING (true);

-- Step 4: Development policy (allows all operations)
CREATE POLICY "Allow all operations on patients for development" ON patients
  FOR ALL USING (true);

-- Step 5: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_patients_email ON patients(email);
CREATE INDEX IF NOT EXISTS idx_patients_phone ON patients(phone);

-- Step 6: Test the table (optional)
SELECT 'Patients table created successfully!' as status;
