# The Red Alliance

A FIRST Robotics Competition companion app — a red-themed knockoff of The Blue Alliance.

## Features

- **Teams** — browse, search, and filter 20 FRC teams with win/loss records and awards
- **Events** — view Regional, District, and Championship events with dates and locations
- **Match Results** — qualification and playoff match scores with alliance breakdowns
- **Rankings** — event rankings table with RP and average scores
- **iPhone installable** — full PWA support for adding to your home screen

## Installing on iPhone

1. Open the app URL in **Safari** on your iPhone
2. Tap the **Share** button (box with arrow at the bottom)
3. Scroll down and tap **"Add to Home Screen"**
4. Tap **Add** — the app icon will appear on your home screen

The app runs in standalone (full-screen) mode with no browser chrome, just like a native app.

## Development

```bash
npm install
npm run dev      # dev server at http://localhost:5173
npm run build    # production build
npm run preview  # preview production build
```

## Tech Stack

- React 18 + TypeScript
- Vite 5 + vite-plugin-pwa
- React Router v6
- Pure CSS (no UI framework)
- Service Worker for offline support
