# Ads Upload Dashboard

A React dashboard for creating and managing ad campaigns with targeting and assets. **Now runs completely independently** - no API server required!

## Features

- Create ad campaigns with targeting by genres and user segments
- Support for multiple ad types (static, tap-reveal, pour-animation, swipe-sequence)
- Asset management with image/video URLs
- Campaign duration and skip delay configuration
- View and manage existing campaigns
- Responsive design
- Direct Supabase integration (no API dependency)
- Works independently for web hosting

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure Supabase credentials:
```bash
cp .env.example .env
```

Edit `.env` file:
```env
# Supabase Configuration (required)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

3. Start development server:
```bash
npm run dev
```

## Database Requirements

The dashboard expects this Supabase table:

### `ad_campaigns` table:
```sql
CREATE TABLE ad_campaigns (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  brand_name TEXT NOT NULL,
  ad_type TEXT DEFAULT 'static',
  image_url TEXT,
  video_url TEXT,
  duration_seconds INTEGER DEFAULT 15,
  skip_delay_seconds INTEGER DEFAULT 5,
  target_genres TEXT[],
  user_segment TEXT DEFAULT 'free',
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 1,
  weight INTEGER DEFAULT 50,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Environment Variables

- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key

## Campaign Configuration

### Ad Types
- **Static**: Simple image ad
- **Tap Reveal**: Interactive ad with tap-to-reveal functionality
- **Pour Animation**: Animated ad with pouring effect
- **Swipe Sequence**: Multi-stage ad requiring swipes

### Targeting Options
- **Genres**: Target specific music genres (comma-separated)
- **User Segments**: Target free users, premium users, or all users

### Asset Requirements
- **Image URL**: Required for visual ads
- **Video URL**: Optional for video-based ads
- **Duration**: Ad display time (5-60 seconds)
- **Skip Delay**: Time before skip button appears (0+ seconds)

## Deployment

1. Build for production:
```bash
npm run build
```

2. Set your Supabase credentials in your deployment environment:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

3. Deploy the `dist` folder to any static web host (Netlify, Vercel, etc.)

## Independent Operation

This dashboard is completely self-contained and doesn't require:
- Local API server running
- Backend infrastructure
- CORS configuration
- API endpoints

It communicates directly with Supabase for all operations.

## Usage

1. Fill in campaign details (name, brand, ad type)
2. Configure targeting (genres, user segments)
3. Add asset URLs (images/videos)
4. Set timing parameters (duration, skip delay)
5. Submit to create the campaign
6. View and manage campaigns in the list below
