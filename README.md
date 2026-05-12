# Melody - Premium Music Streaming

Melody is a modern, high-performance music streaming web application built with React 19, Vite, and Tailwind CSS. It provides a seamless, Spotify-like experience with high-quality audio, personalized recommendations, and a beautiful glassmorphic UI.

## Features

- Lightning Fast: Built with Vite 8 for near-instant load times.
- High Quality Streaming: Powered by a private JioSaavn API for 320kbps audio.
- Mobile Optimized: Fully responsive design with touch-friendly gestures and a dedicated mobile playlist view.
- Personalized Home: Dynamic greetings and recommendations based on your listening history.
- Library Management: Create, rename, and manage custom playlists.
- Favorites: Save your favorite tracks with a single tap.
- Smart Sharing: Share playlists instantly via generated QR codes.
- Secure Auth: Firebase Authentication with Google Login support.
- Monetization Ready: Integrated AdSense components for React-friendly ad delivery.
- PWA Ready: Installable on mobile and desktop for an app-like experience.

## Tech Stack

- Frontend: React 19, Tailwind CSS 4
- State Management: Zustand
- Routing: React Router 7
- Backend/Auth: Firebase
- API: Axios + JioSaavn API
- Icons: React Icons (Lucide/Feather)
- Utilities: QRcode.react, PostCSS

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/pandeYtushal/Music.git
   cd Music
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up Environment Variables:
   Create a .env file in the root directory and add your Firebase credentials:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

## Mobile Preview

Melody uses a responsive "Glass" UI that looks stunning on mobile devices. The player supports swipe gestures to skip tracks and an expanded view for immersive listening.

## Contributing

Contributions are welcome. Feel free to open an issue or submit a pull request.

## License

This project is private. All rights reserved.

---

Built by Tushal Pandey
