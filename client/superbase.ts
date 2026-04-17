import { createClient } from "@supabase/supabase-js";

const supabaseUrl: string = "https://htqsidmrqueojdobwzzv.supabase.co";
const supabaseAnonKey: string = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0cXNpZG1ycXVlb2pkb2J3enp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5Mjg3ODIsImV4cCI6MjA5MDUwNDc4Mn0.RhqUAU5GFJy7UBRX0i9jISlWkOp14EImD0lHmP9ksPI";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);