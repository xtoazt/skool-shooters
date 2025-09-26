// Main game application class
import { HomeScreen } from '../ui/HomeScreen';
import { GameScreen } from '../ui/GameScreen';
import { LobbyScreen } from '../ui/LobbyScreen';
import { CharacterCustomizationScreen } from '../ui/CharacterCustomizationScreen';
import { GoogleMapsService } from '../../lib/google-maps';
import { GameRoomService } from '../../lib/firebase';
import { GameRoom, Player, GameLocation } from '../../lib/types';

export class GameApp {
  private homeScreen: HomeScreen;
  private gameScreen: GameScreen;
  private lobbyScreen: LobbyScreen;
  private characterScreen: CharacterCustomizationScreen;
  private googleMapsService: GoogleMapsService;
  private currentPlayer: Player | null = null;
  private currentRoom: GameRoom | null = null;
  private appContainer: HTMLElement;

  constructor() {
    this.appContainer = document.getElementById('app')!;
    this.googleMapsService = new GoogleMapsService(); // Uses default API key
    
    // Initialize screens
    this.homeScreen = new HomeScreen(this);
    this.gameScreen = new GameScreen(this);
    this.lobbyScreen = new LobbyScreen(this);
    this.characterScreen = new CharacterCustomizationScreen(this);
  }

  async initialize(): Promise<void> {
    try {
      // Show home screen first
      this.showHomeScreen();
      
      // Initialize Google Maps in background (non-blocking)
      this.googleMapsService.initialize().catch(error => {
        console.warn('Google Maps initialization failed, but game will continue:', error);
      });
    } catch (error) {
      console.error('Failed to initialize game app:', error);
      throw error;
    }
  }

  // Screen navigation methods
  showHomeScreen(): void {
    this.clearContainer();
    this.homeScreen.render(this.appContainer);
  }

  showLobbyScreen(room: GameRoom): void {
    this.currentRoom = room;
    this.clearContainer();
    this.lobbyScreen.render(this.appContainer, room);
  }

  showGameScreen(room: GameRoom, player: Player): void {
    this.currentRoom = room;
    this.currentPlayer = player;
    this.clearContainer();
    this.gameScreen.render(this.appContainer, room, player);
  }

  showCharacterCustomization(): void {
    this.clearContainer();
    this.characterScreen.render(this.appContainer);
  }

  private clearContainer(): void {
    this.appContainer.innerHTML = '';
  }

  // Game state management
  getCurrentPlayer(): Player | null {
    return this.currentPlayer;
  }

  getCurrentRoom(): GameRoom | null {
    return this.currentRoom;
  }

  getGoogleMapsService(): GoogleMapsService {
    return this.googleMapsService;
  }

  // Player management
  setCurrentPlayer(player: Player): void {
    this.currentPlayer = player;
  }

  // Room management
  async createRoom(roomName: string, maxPlayers: number, location: GameLocation): Promise<string> {
    const room: Omit<GameRoom, 'id' | 'createdAt'> = {
      name: roomName,
      joinCode: this.generateJoinCode(),
      hostId: this.currentPlayer?.id || 'unknown',
      players: this.currentPlayer ? [this.currentPlayer] : [],
      maxPlayers,
      location,
      gameState: 'waiting' as any
    };

    const roomId = await GameRoomService.createRoom(room);
    return roomId;
  }

  async joinRoom(joinCode: string): Promise<GameRoom | null> {
    const room = await GameRoomService.getRoomByJoinCode(joinCode);
    if (room && this.currentPlayer) {
      await GameRoomService.joinRoom(room.id, this.currentPlayer);
      return room;
    }
    return null;
  }

  private generateJoinCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  // Location management
  async getRandomLocation(): Promise<GameLocation | null> {
    try {
      const randomCity = GoogleMapsService.getRandomCity();
      const streetViewData = await this.googleMapsService.getStreetViewData(randomCity.lat, randomCity.lng);
      
      if (streetViewData) {
        return {
          lat: streetViewData.position.lat,
          lng: streetViewData.position.lng,
          heading: streetViewData.pov.heading,
          pitch: streetViewData.pov.pitch,
          city: randomCity.city,
          country: randomCity.country
        };
      }
    } catch (error) {
      console.warn('Google Maps failed, using fallback location:', error);
    }
    
    // Fallback to a default location if Google Maps fails
    return {
      lat: 40.7128,
      lng: -74.0060,
      heading: 0,
      pitch: 0,
      city: 'New York',
      country: 'USA'
    };
  }

  async getLocationByCoordinates(lat: number, lng: number): Promise<GameLocation | null> {
    const streetViewData = await this.googleMapsService.getStreetViewData(lat, lng);
    
    if (streetViewData) {
      return {
        lat: streetViewData.position.lat,
        lng: streetViewData.position.lng,
        heading: streetViewData.pov.heading,
        pitch: streetViewData.pov.pitch,
        city: 'Custom Location',
        country: 'Unknown'
      };
    }
    
    return null;
  }
}
