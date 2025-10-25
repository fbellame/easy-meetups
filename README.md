# Easy Meetup - Event Management Platform

A comprehensive web application for managing meetup events, built with Next.js, TypeScript, Tailwind CSS, and Supabase.

## Features

### 🎯 Core Functionality
- **Event Management**: Create, plan, and manage meetup events
- **Host Directory**: Manage event hosts and venue information
- **Speaker Directory**: Track speakers, their expertise, and availability
- **Community Management**: Manage community members and participation
- **Communication Tools**: Generate and schedule announcements

### 🏗️ Technical Stack
- **Frontend**: Next.js 14 with App Router
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **TypeScript**: Full type safety
- **Icons**: Heroicons

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd easy-meetup/app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Update `.env.local` with your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up the database**
   - Create a new Supabase project
   - Run the migration file: `supabase/migrations/001_initial_schema.sql`
   - This will create all necessary tables and relationships

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Database Schema

The application uses the following main entities:

- **Hosts**: Event hosts and venue information
- **Speakers**: Speaker profiles and expertise
- **Events**: Meetup events with scheduling
- **Community Members**: Community participant management
- **Announcements**: Communication and marketing tools
- **Talks**: Speaker presentations and abstracts

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Dashboard
│   ├── events/            # Event management
│   ├── hosts/             # Host management
│   ├── speakers/          # Speaker management
│   ├── community/         # Community management
│   └── announcements/     # Communication tools
├── components/            # Reusable UI components
├── lib/                   # Utility functions and configurations
│   ├── supabase.ts       # Supabase client
│   └── supabase/         # Server-side Supabase utilities
└── types/                # TypeScript type definitions
    └── database.ts       # Database schema types
```

## Key Features Implemented

### 📊 Dashboard
- Overview statistics
- Recent events display
- Quick action buttons
- Navigation to all sections

### 🎪 Event Management
- Event creation and editing
- Status tracking (planned, confirmed, completed)
- Speaker assignment
- Registration management
- Venue coordination

### 🏢 Host Directory
- Host and venue information
- Capacity and amenities tracking
- Event history
- Contact management

### 🎤 Speaker Management
- Speaker profiles and bios
- Expertise categorization
- Talk abstracts and materials
- Availability tracking
- Social media links

### 👥 Community Management
- Member directory
- Participation tracking
- Interest categorization
- Activity monitoring

### 📢 Communication Tools
- Announcement creation
- Multi-platform posting (Meetup, Luma, LinkedIn)
- Scheduling system
- Status tracking

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Database Migrations

To apply database changes:

1. Create a new migration file in `supabase/migrations/`
2. Run the SQL migration in your Supabase dashboard
3. Update TypeScript types if schema changes

## Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Environment Variables
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository.