# Quick Setup Guide

## 🚀 Get SkoolShooters Running in 5 Minutes

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Firebase (Required for Multiplayer)

1. **Create Firebase Project:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Create a project"
   - Name it "skool-shooters" (or your choice)
   - Enable Google Analytics (optional)

2. **Enable Firestore:**
   - Click "Firestore Database" in sidebar
   - Click "Create database"
   - Choose "Start in test mode"
   - Select location (choose closest to you)

3. **Get Firebase Config:**
   - Go to Project Settings (gear icon)
   - Scroll to "Your apps" section
   - Click "Add app" → Web icon
   - Copy the config object

4. **Update Firebase Config:**
   - Open `lib/firebase.ts`
   - Replace the placeholder config with your actual config

### 3. Google Maps API (Already Configured!)
✅ Your API key is already set up: `AIzaSyB9vKASqiPS-xWAVBy5YlqOJLEvLwpA6iw`

### 4. Start the Game
```bash
npm run dev
```

### 5. Open Your Browser
Navigate to `http://localhost:3000`

## 🎮 What You Can Do Right Now

- ✅ **Home Screen** - Navigate between different game modes
- ✅ **Random City** - Get dropped into random worldwide locations
- ✅ **Select City** - Choose from popular cities
- ✅ **Character Customization** - Customize your player appearance
- ✅ **Create Game** - Host multiplayer games
- ✅ **Join Game** - Join games with 6-digit codes
- ✅ **Lobby System** - Wait for players and manage games

## 🔧 Firebase Collections You'll See

Once you start using the game, these collections will be created in your Firestore:

- `gameRooms` - All active game rooms
- `gameEvents` - Real-time game events
- `players` - Player data (optional)

## 🐛 Troubleshooting

**"Permission denied" errors:**
- Make sure Firestore is in "test mode"
- Check that your Firebase config is correct

**"Google Maps not loading":**
- Your API key is already configured
- Make sure you have internet connection

**"Cannot create game room":**
- Check Firebase connection
- Verify Firestore is enabled

## 📱 Test the Features

1. **Single Player:** Click "Random City" to test Street View
2. **Character Customization:** Click "Customize Character"
3. **Multiplayer:** Create a game and share the join code
4. **Lobby:** Wait for players and start the game

## 🎯 Next Development Steps

The foundation is complete! Next features to implement:
- Three.js 3D rendering
- FPS shooting mechanics
- Real-time player synchronization
- Weapon and power-up systems

---

**Ready to play?** Run `npm run dev` and start shooting! 🎮
