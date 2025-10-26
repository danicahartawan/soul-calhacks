# Soul - React Native App

A React Native (Expo) app with Supabase integration, starting with an animated "Soul" screen.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up Supabase:
   - Create a new project at [supabase.com](https://supabase.com)
   - Copy your project URL and anon key
   - Update `lib/supabase.js` with your credentials:
     ```javascript
     const supabaseUrl = 'YOUR_SUPABASE_URL'
     const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY'
     ```

3. Run the app:
   ```bash
   npm start
   ```

## Features

- Animated "Soul" text screen with smooth entrance animation
- Supabase integration ready for backend functionality
- React Native Reanimated for smooth animations
- Clean, minimalist design matching iOS aesthetics

## Project Structure

- `screens/SoulScreen.js` - Main animated screen
- `lib/supabase.js` - Supabase configuration
- `App.js` - Main app component
