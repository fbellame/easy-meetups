# Development Guide

## Environment Setup

Create a `.env.local` file in the root directory with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Database Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to the SQL Editor in your Supabase dashboard
3. Copy and paste the contents of `supabase/migrations/001_initial_schema.sql`
4. Execute the migration to create all necessary tables

## Running the Application

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

- `/src/app` - Next.js App Router pages
- `/src/components` - Reusable React components
- `/src/lib` - Utility functions and configurations
- `/src/types` - TypeScript type definitions
- `/supabase/migrations` - Database migration files

## Key Features

### Dashboard
- Overview of events, hosts, speakers, and community
- Quick action buttons
- Recent events display

### Event Management
- Create and edit events
- Assign speakers and hosts
- Track registrations
- Manage event status

### Host Directory
- Manage venue information
- Track capacity and amenities
- Event history

### Speaker Management
- Speaker profiles and bios
- Expertise categorization
- Talk abstracts
- Availability tracking

### Community Management
- Member directory
- Participation tracking
- Interest management

### Communication Tools
- Create announcements
- Multi-platform posting
- Scheduling system

## Development Notes

- All components use TypeScript for type safety
- Tailwind CSS for styling
- Supabase for database and authentication
- Responsive design for mobile and desktop
- Modern UI with Heroicons and Headless UI
