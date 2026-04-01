# Appointment Booking System

This document describes the appointment booking functionality that has been added to the healthcare dashboard application.

## Features

- **Appointment Booking**: Users can book appointments with available doctors
- **Doctor Selection**: Choose from a list of specialized doctors
- **Date & Time Scheduling**: Select preferred date and time slots
- **Appointment Type**: Choose between in-person or online consultations
- **Supabase Integration**: Full database integration for storing appointments
- **Responsive Design**: Mobile-friendly interface
- **Navigation**: Seamless navigation between dashboard and appointment booking

## Files Added/Modified

### New Files
- `src/assets/Appointment.tsx` - Main appointment booking component
- `database-setup.sql` - SQL script for setting up Supabase tables

### Modified Files
- `src/App.tsx` - Updated to handle appointment view navigation
- `src/assets/Dashboard.tsx` - Added navigation links and buttons

## Database Setup

### 1. Supabase Configuration
Ensure your Supabase client is properly configured in `client/superbase.ts`:
```typescript
import { createClient } from "@supabase/supabase-js";

const supabaseUrl: string = "YOUR_SUPABASE_URL";
const supabaseAnonKey: string = "YOUR_SUPABASE_ANON_KEY";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### 2. Database Tables
Run the `database-setup.sql` script in your Supabase SQL editor to create the necessary tables:

#### Doctors Table
- `id` (UUID, Primary Key)
- `name` (VARCHAR) - Doctor's name
- `specialization` (VARCHAR) - Medical specialization
- `avatar` (VARCHAR) - Emoji avatar
- `available` (BOOLEAN) - Availability status
- `created_at`, `updated_at` (TIMESTAMP)

#### Appointments Table
- `id` (UUID, Primary Key)
- `doctor_id` (UUID, Foreign Key to doctors)
- `patient_id` (VARCHAR) - Patient identifier
- `date` (DATE) - Appointment date
- `time` (VARCHAR) - Appointment time
- `reason` (TEXT) - Reason for visit
- `type` (VARCHAR) - 'in-person' or 'online'
- `status` (VARCHAR) - 'scheduled', 'completed', or 'cancelled'
- `created_at`, `updated_at` (TIMESTAMP)

### 3. Row Level Security (RLS)
The SQL script includes RLS policies for security. For development, policies allow all operations. In production, you should:
- Restrict appointment access to authenticated users
- Implement proper patient identification
- Add role-based access control

## Component Structure

### Appointment Component (`Appointment.tsx`)
- **Props**: `onBack: () => void` - Navigation callback
- **State Management**: Uses React hooks for form data and UI state
- **Supabase Integration**: Fetches doctors and saves appointments
- **Form Validation**: Required field validation
- **Error Handling**: User-friendly error messages
- **Loading States**: Visual feedback during operations

### Key Features
1. **Doctor Selection**: Dropdown populated from Supabase
2. **Date Picker**: HTML5 date input with minimum date validation
3. **Time Slots**: Predefined time slots for selection
4. **Appointment Type**: Radio buttons for in-person/online
5. **Reason Textarea**: Multi-line text input for visit reason
6. **Form Submission**: Async submission to Supabase with feedback

## Navigation Flow

1. **Dashboard → Appointment**: 
   - Click "Book Appointment" button in banner
   - Click "+ New Appointment" button in appointments table
   - Click "Appointments" in sidebar

2. **Appointment → Dashboard**:
   - Click "Back to Dashboard" in sidebar
   - Click "Cancel" button in form

## Usage Instructions

1. **From Dashboard**:
   - Click any "Book Appointment" button or link
   - You'll be redirected to the appointment booking page

2. **Booking an Appointment**:
   - Select a doctor from the dropdown
   - Choose your preferred date (future dates only)
   - Select a time slot from available options
   - Choose appointment type (in-person/online)
   - Provide a reason for your visit
   - Click "Book Appointment"

3. **After Booking**:
   - Success message appears if booking is successful
   - Form resets for new bookings
   - Click "Back to Dashboard" to return

## Error Handling

- **Network Errors**: Displays user-friendly error messages
- **Validation Errors**: Form validation prevents invalid submissions
- **Database Errors**: Graceful fallback with mock data if Supabase fails
- **Loading States**: Visual feedback during async operations

## Styling

- **Tailwind CSS**: Consistent with existing dashboard design
- **Responsive Design**: Works on mobile and desktop
- **Hover Effects**: Interactive elements with smooth transitions
- **Color Scheme**: Matches healthcare theme (blue/white gradient)

## Future Enhancements

1. **Authentication**: Integrate user authentication
2. **Real-time Updates**: WebSocket for live appointment status
3. **Calendar View**: Visual calendar for date selection
4. **Doctor Profiles**: Detailed doctor information
5. **Appointment History**: View past and upcoming appointments
6. **Notifications**: Email/SMS appointment reminders
7. **Payment Integration**: Online payment for consultations
8. **Video Calling**: Integrated telemedicine features

## Troubleshooting

### Common Issues
1. **Supabase Connection**: Verify URL and keys in `superbase.ts`
2. **CORS Errors**: Ensure Supabase allows your domain
3. **RLS Policies**: Check Row Level Security settings
4. **Missing Data**: Run the SQL setup script

### Debug Mode
The component includes console logging for debugging. Check browser console for:
- Doctor fetch errors
- Appointment creation errors
- Network issues

## Dependencies

The appointment system uses existing project dependencies:
- `@supabase/supabase-js` - Database client
- `react` - Component framework
- `tailwindcss` - Styling
- `typescript` - Type safety

No additional dependencies are required.
