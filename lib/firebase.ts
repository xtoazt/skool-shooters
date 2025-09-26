// Firebase configuration and utilities
import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { GameRoom, Player, GameEvent } from './types';

const firebaseConfig = {
  // Add your Firebase config here
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Connect to emulators in development
if (import.meta.env.DEV) {
  try {
    connectFirestoreEmulator(db, 'localhost', 8080);
    connectAuthEmulator(auth, 'http://localhost:9099');
  } catch (error) {
    console.log('Emulators already connected or not available');
  }
}

// Firestore collections
export const COLLECTIONS = {
  GAME_ROOMS: 'gameRooms',
  PLAYERS: 'players',
  GAME_EVENTS: 'gameEvents'
} as const;

// Game room operations
export class GameRoomService {
  static async createRoom(room: Omit<GameRoom, 'id' | 'createdAt'>): Promise<string> {
    const { collection, addDoc } = await import('firebase/firestore');
    const docRef = await addDoc(collection(db, COLLECTIONS.GAME_ROOMS), {
      ...room,
      createdAt: new Date()
    });
    return docRef.id;
  }

  static async joinRoom(roomId: string, player: Player): Promise<void> {
    const { doc, updateDoc, arrayUnion } = await import('firebase/firestore');
    const roomRef = doc(db, COLLECTIONS.GAME_ROOMS, roomId);
    await updateDoc(roomRef, {
      players: arrayUnion(player)
    });
  }

  static async leaveRoom(roomId: string, playerId: string): Promise<void> {
    const { doc, updateDoc, arrayRemove } = await import('firebase/firestore');
    const roomRef = doc(db, COLLECTIONS.GAME_ROOMS, roomId);
    await updateDoc(roomRef, {
      players: arrayRemove({ id: playerId })
    });
  }

  static async updatePlayer(roomId: string, player: Player): Promise<void> {
    const { doc, updateDoc } = await import('firebase/firestore');
    const roomRef = doc(db, COLLECTIONS.GAME_ROOMS, roomId);
    const { collection, query, where, getDocs } = await import('firebase/firestore');
    
    const playersQuery = query(
      collection(db, COLLECTIONS.GAME_ROOMS),
      where('id', '==', roomId)
    );
    
    const snapshot = await getDocs(playersQuery);
    if (!snapshot.empty) {
      const roomData = snapshot.docs[0].data();
      const updatedPlayers = roomData.players.map((p: Player) => 
        p.id === player.id ? player : p
      );
      await updateDoc(roomRef, { players: updatedPlayers });
    }
  }

  static async getRoom(roomId: string): Promise<GameRoom | null> {
    const { doc, getDoc } = await import('firebase/firestore');
    const roomRef = doc(db, COLLECTIONS.GAME_ROOMS, roomId);
    const roomSnap = await getDoc(roomRef);
    
    if (roomSnap.exists()) {
      return { id: roomSnap.id, ...roomSnap.data() } as GameRoom;
    }
    return null;
  }

  static async getRoomByJoinCode(joinCode: string): Promise<GameRoom | null> {
    const { collection, query, where, getDocs } = await import('firebase/firestore');
    const q = query(
      collection(db, COLLECTIONS.GAME_ROOMS),
      where('joinCode', '==', joinCode)
    );
    
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() } as GameRoom;
    }
    return null;
  }

  static subscribeToRoom(roomId: string, callback: (room: GameRoom | null) => void): () => void {
    const { doc, onSnapshot } = import('firebase/firestore');
    const roomRef = doc(db, COLLECTIONS.GAME_ROOMS, roomId);
    
    return onSnapshot(roomRef, (doc) => {
      if (doc.exists()) {
        callback({ id: doc.id, ...doc.data() } as GameRoom);
      } else {
        callback(null);
      }
    });
  }
}

// Game events for real-time multiplayer
export class GameEventService {
  static async sendEvent(roomId: string, event: GameEvent): Promise<void> {
    const { collection, addDoc } = await import('firebase/firestore');
    await addDoc(collection(db, COLLECTIONS.GAME_EVENTS), {
      ...event,
      roomId,
      timestamp: new Date()
    });
  }

  static subscribeToEvents(roomId: string, callback: (event: GameEvent) => void): () => void {
    const { collection, query, where, orderBy, onSnapshot } = import('firebase/firestore');
    const q = query(
      collection(db, COLLECTIONS.GAME_EVENTS),
      where('roomId', '==', roomId),
      orderBy('timestamp', 'desc')
    );
    
    return onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          callback(change.doc.data() as GameEvent);
        }
      });
    });
  }
}
