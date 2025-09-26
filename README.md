# SkoolShooters

A multiplayer 3D first-person shooter game that uses Google Maps Street View to create real-world battlefields. Fight in locations you know - from your street to famous cities around the world!

## Features

### 🎮 Core Gameplay
- **First-Person Shooter**: Classic FPS mechanics with modern controls
- **Real-World Locations**: Battle in actual places using Google Street View
- **Multiplayer Support**: Play with friends using join codes
- **Weapon System**: Multiple weapons with different stats and playstyles
- **Power-ups**: Health packs, ammo, speed boosts, and more

### 🌍 Location System
- **Random City**: Get dropped into a random city worldwide
- **City Selection**: Choose from popular cities like New York, London, Tokyo
- **Custom Locations**: Enter coordinates to play anywhere with Street View
- **Street View Integration**: Seamless 3D world rendering

### 👥 Multiplayer Features
- **Game Rooms**: Create or join games with up to 8 players
- **Join Codes**: Easy 6-digit codes to join friends' games
- **Real-time Sync**: Firebase-powered multiplayer synchronization
- **Lobby System**: Wait for players and customize before starting

### 👤 Character Customization
- **Appearance**: Customize skin color, hair color, and outfit
- **Accessories**: Add glasses, hats, masks, and more
- **Outfit Styles**: Choose from casual, military, sports, formal, punk, or stealth
- **Live Preview**: See changes in real-time

## Tech Stack

- **Frontend**: TypeScript, Vite, HTML5, CSS3
- **3D Graphics**: Three.js (planned)
- **Maps**: Google Maps Street View API
- **Backend**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Real-time**: Firebase Realtime Database

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Google Maps API key
- Firebase project

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/skool-shooters.git
cd skool-shooters
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Create .env file
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
```

4. Start the development server:
```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:3000`

### Firebase Setup

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Firestore Database
3. Enable Authentication (optional for guest play)
4. Copy your Firebase config to `lib/firebase.ts`

### Google Maps Setup

1. Get a Google Maps API key from [Google Cloud Console](https://console.cloud.google.com/)
2. Enable the following APIs:
   - Maps JavaScript API
   - Street View Static API
   - Places API
3. Add your API key to the environment variables

## Game Controls

### Movement
- `W` - Move forward
- `S` - Move backward  
- `A` - Move left
- `D` - Move right
- `Space` - Jump
- `Mouse` - Look around

### Combat
- `Left Click` - Shoot
- `Right Click` - Aim
- `R` - Reload
- `E` - Interact

### UI
- `ESC` - Pause menu
- `Tab` - Scoreboard (planned)

## Project Structure

```
skool-shooters/
├── lib/                    # Shared libraries and utilities
│   ├── types.ts           # TypeScript type definitions
│   ├── firebase.ts        # Firebase configuration and services
│   ├── google-maps.ts     # Google Maps integration
│   └── weapons.ts         # Weapons and power-ups system
├── src/                   # Main application code
│   ├── game/              # Game logic and state management
│   ├── ui/                # User interface components
│   ├── styles/            # CSS stylesheets
│   ├── main.ts            # Application entry point
│   └── index.html         # HTML template
├── package.json           # Dependencies and scripts
└── README.md             # This file
```

## Development Status

### ✅ Completed
- [x] Project structure and setup
- [x] Home screen with navigation
- [x] Character customization system
- [x] Lobby system for multiplayer
- [x] Basic game screen structure
- [x] Firebase integration
- [x] Google Maps Street View integration
- [x] Weapons and power-ups system

### 🚧 In Progress
- [ ] Three.js 3D rendering
- [ ] FPS game mechanics
- [ ] Real-time multiplayer synchronization
- [ ] Advanced weapon system
- [ ] Power-up spawning and effects

### 📋 Planned
- [ ] Sound effects and music
- [ ] Particle effects
- [ ] Advanced graphics and shaders
- [ ] Mobile support
- [ ] Tournament system
- [ ] Leaderboards
- [ ] Replay system

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Google Maps for Street View API
- Firebase for backend services
- Three.js community for 3D graphics
- All contributors and testers

## Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/yourusername/skool-shooters/issues) page
2. Create a new issue with detailed information
3. Join our Discord community (link coming soon)

---

**Happy Shooting!** 🎯
