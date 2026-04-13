
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


CREATE TABLE IF NOT EXISTS doctors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  specialization VARCHAR(255) NOT NULL,
  avatar VARCHAR(50) DEFAULT '👨‍⚕️',
  available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_id UUID REFERENCES doctors(id) ON DELETE SET NULL,
  patient_id VARCHAR(255), -- You can add patient authentication later
  date DATE NOT NULL,
  time VARCHAR(10) NOT NULL,
  reason TEXT NOT NULL,
  type VARCHAR(20) CHECK (type IN ('in-person', 'online')) DEFAULT 'in-person',
  status VARCHAR(20) CHECK (status IN ('scheduled', 'completed', 'cancelled')) DEFAULT 'scheduled',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);



CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_doctors_specialization ON doctors(specialization);
CREATE INDEX IF NOT EXISTS idx_doctors_available ON doctors(available);


ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;


CREATE POLICY "Anyone can view patients" ON patients
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert patients" ON patients
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update patients" ON patients
  FOR UPDATE USING (true);

-- Create policies for doctors table
CREATE POLICY "Anyone can view doctors" ON doctors
  FOR SELECT USING (true);

CREATE POLICY "Only authenticated users can insert doctors" ON doctors
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Only authenticated users can update doctors" ON doctors
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Create policies for appointments table
CREATE POLICY "Users can view their own appointments" ON appointments
  FOR SELECT USING (auth.uid()::text = patient_id);

CREATE POLICY "Users can insert their own appointments" ON appointments
  FOR INSERT WITH CHECK (auth.uid()::text = patient_id);

CREATE POLICY "Users can update their own appointments" ON appointments
  FOR UPDATE USING (auth.uid()::text = patient_id);


CREATE POLICY "Allow all operations on patients for development" ON patients
  FOR ALL USING (true);

CREATE POLICY "Allow all operations for development" ON appointments
  FOR ALL USING (true);

CREATE POLICY "Allow all operations on doctors for development" ON doctors
  FOR ALL USING (true);
