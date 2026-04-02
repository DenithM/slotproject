import { supabase } from './client/superbase.js';
import fs from 'fs';

// Read the SQL file
const sql = fs.readFileSync('./database-setup.sql', 'utf8');

// Split the SQL into individual statements
const statements = sql
  .split(';')
  .map(stmt => stmt.trim())
  .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

async function setupDatabase() {
  console.log('Setting up database...');
  
  try {
    // Execute each statement
    for (const statement of statements) {
      if (statement.trim()) {
        console.log('Executing:', statement.substring(0, 100) + '...');
        
        // For Supabase, we need to use RPC for SQL execution
        const { error } = await supabase.rpc('exec_sql', { sql_query: statement });
        
        if (error) {
          console.error('Error executing statement:', error);
          // Continue with other statements
        } else {
          console.log('✓ Statement executed successfully');
        }
      }
    }
    
    console.log('Database setup completed!');
  } catch (error) {
    console.error('Database setup failed:', error);
  }
}

setupDatabase();
