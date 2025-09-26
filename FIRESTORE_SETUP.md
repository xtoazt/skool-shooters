# Firestore Database Setup Guide

## 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name: `skool-shooters` (or your preferred name)
4. Enable Google Analytics (optional)
5. Click "Create project"

## 2. Enable Firestore Database

1. In your Firebase project, click "Firestore Database" in the left sidebar
2. Click "Create database"
3. Choose "Start in test mode" (we'll secure it later)
4. Select a location close to your users
5. Click "Done"

## 3. Set Up Firestore Security Rules

Go to the "Rules" tab in Firestore and replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Game rooms collection
    match /gameRooms/{roomId} {
      allow read, write: if true; // Allow all access for now
    }
    
    // Players collection
    match /players/{playerId} {
      allow read, write: if true; // Allow all access for now
    }
    
    // Game events collection
    match /gameEvents/{eventId} {
      allow read, write: if true; // Allow all access for now
    }
  }
}
```

## 4. Get Firebase Configuration

1. Go to Project Settings (gear icon)
2. Scroll down to "Your apps" section
3. Click "Add app" and select the web icon (`</>`)
4. Register your app with a nickname like "SkoolShooters Web"
5. Copy the Firebase configuration object

## 5. Update Firebase Configuration

Replace the placeholder config in `lib/firebase.ts` with your actual Firebase config:

```typescript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};
```

## 6. Firestore Collections Structure

Your Firestore database will have these collections:

### `gameRooms` Collection
Each document represents a game room:

```json
{
  "id": "auto-generated-doc-id",
  "name": "My Awesome Game",
  "joinCode": "ABC123",
  "hostId": "player-id-123",
  "players": [
    {
      "id": "player-id-123",
      "name": "Player1",
      "position": { "x": 0, "y": 0, "z": 0 },
      "rotation": { "x": 0, "y": 0, "z": 0 },
      "health": 100,
      "maxHealth": 100,
      "weapon": {
        "id": "pistol",
        "name": "Pistol",
        "damage": 25,
        "range": 50,
        "fireRate": 300,
        "ammo": 12,
        "maxAmmo": 12,
        "reloadTime": 2000,
        "type": "pistol"
      },
      "character": {
        "skinColor": "#FDBCB4",
        "hairColor": "#8B4513",
        "outfit": "casual",
        "accessories": []
      },
      "isAlive": true,
      "kills": 0,
      "deaths": 0
    }
  ],
  "maxPlayers": 4,
  "location": {
    "lat": 40.7128,
    "lng": -74.0060,
    "heading": 0,
    "pitch": 0,
    "city": "New York",
    "country": "USA"
  },
  "gameState": "waiting",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### `gameEvents` Collection
Each document represents a game event:

```json
{
  "id": "auto-generated-doc-id",
  "roomId": "game-room-id",
  "type": "player_move",
  "playerId": "player-id-123",
  "data": {
    "position": { "x": 10, "y": 0, "z": 5 },
    "rotation": { "x": 0, "y": 45, "z": 0 }
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### `players` Collection (Optional)
For persistent player data:

```json
{
  "id": "player-id-123",
  "name": "Player1",
  "totalKills": 150,
  "totalDeaths": 75,
  "gamesPlayed": 25,
  "favoriteWeapon": "rifle",
  "character": {
    "skinColor": "#FDBCB4",
    "hairColor": "#8B4513",
    "outfit": "military",
    "accessories": ["glasses", "watch"]
  },
  "lastSeen": "2024-01-01T00:00:00.000Z"
}
```

## 7. Test Your Setup

1. Start your development server: `npm run dev`
2. Open the game in your browser
3. Try creating a game room
4. Check your Firestore console to see if documents are being created

## 8. Production Security Rules

For production, update your Firestore rules to be more secure:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Game rooms - allow read/write for authenticated users
    match /gameRooms/{roomId} {
      allow read, write: if request.auth != null;
    }
    
    // Players - users can only access their own data
    match /players/{playerId} {
      allow read, write: if request.auth != null && request.auth.uid == playerId;
    }
    
    // Game events - allow read/write for room participants
    match /gameEvents/{eventId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 9. Enable Authentication (Optional)

If you want user authentication:

1. Go to "Authentication" in Firebase Console
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable "Anonymous" authentication for guest play
5. Optionally enable "Email/Password" for registered users

## 10. Monitoring and Analytics

1. Enable Firebase Analytics for usage insights
2. Set up Firebase Performance Monitoring
3. Configure Firebase Crashlytics for error tracking

## Troubleshooting

### Common Issues:

1. **Permission denied**: Check your Firestore rules
2. **API key issues**: Verify your Firebase config is correct
3. **Network errors**: Check your internet connection and Firebase project status
4. **CORS errors**: Make sure your domain is added to Firebase authorized domains

### Testing Commands:

```bash
# Check if Firebase is working
npm run dev
# Open browser console and look for Firebase connection messages
```

## Next Steps

Once your Firestore is set up:

1. Test creating and joining game rooms
2. Verify real-time updates work
3. Test character customization persistence
4. Implement game event synchronization

Your database is now ready for SkoolShooters! 🎮
