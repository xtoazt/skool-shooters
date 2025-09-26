// Home screen with main navigation options
import { GameApp } from '../game/GameApp';
import { GoogleMapsService } from '../../lib/google-maps';
import { Player, GameLocation } from '../../lib/types';
import { v4 as uuidv4 } from 'uuid';

export class HomeScreen {
  private gameApp: GameApp;

  constructor(gameApp: GameApp) {
    this.gameApp = gameApp;
  }

  render(container: HTMLElement): void {
    // Load CSS if not already loaded
    if (!document.getElementById('home-styles')) {
      const link = document.createElement('link');
      link.id = 'home-styles';
      link.rel = 'stylesheet';
      link.href = '/src/styles/home.css';
      document.head.appendChild(link);
    }

    container.innerHTML = `
      <div class="home-screen">
        <div class="header">
          <h1 class="game-title">SkoolShooters</h1>
          <p class="game-subtitle">Multiplayer 3D FPS in Real World Locations</p>
        </div>
        
        <div class="main-menu">
          <div class="menu-section">
            <h2>Quick Play</h2>
            <button class="menu-button primary" id="random-city-btn">
              <span class="button-icon">🌍</span>
              Random City
            </button>
            <button class="menu-button" id="select-city-btn">
              <span class="button-icon">📍</span>
              Select City
            </button>
          </div>
          
          <div class="menu-section">
            <h2>Multiplayer</h2>
            <button class="menu-button" id="create-game-btn">
              <span class="button-icon">🎮</span>
              Create Game
            </button>
            <button class="menu-button" id="join-game-btn">
              <span class="button-icon">🔗</span>
              Join Game
            </button>
          </div>
          
          <div class="menu-section">
            <h2>Customization</h2>
            <button class="menu-button" id="customize-character-btn">
              <span class="button-icon">👤</span>
              Customize Character
            </button>
          </div>
        </div>
        
        <div class="footer">
          <p>Fight in real-world locations using Google Street View</p>
        </div>
      </div>
    `;

    this.attachEventListeners();
    this.initializePlayer();
  }

  private attachEventListeners(): void {
    // Random City
    document.getElementById('random-city-btn')?.addEventListener('click', () => {
      this.handleRandomCity();
    });

    // Select City
    document.getElementById('select-city-btn')?.addEventListener('click', () => {
      this.showCitySelector();
    });

    // Create Game
    document.getElementById('create-game-btn')?.addEventListener('click', () => {
      this.showCreateGameModal();
    });

    // Join Game
    document.getElementById('join-game-btn')?.addEventListener('click', () => {
      this.showJoinGameModal();
    });

    // Customize Character
    document.getElementById('customize-character-btn')?.addEventListener('click', () => {
      this.gameApp.showCharacterCustomization();
    });
  }

  private async initializePlayer(): Promise<void> {
    // Create a default player if none exists
    if (!this.gameApp.getCurrentPlayer()) {
      const player: Player = {
        id: uuidv4(),
        name: 'Player',
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        health: 100,
        maxHealth: 100,
        weapon: {
          id: 'pistol',
          name: 'Pistol',
          damage: 25,
          range: 50,
          fireRate: 300,
          ammo: 12,
          maxAmmo: 12,
          reloadTime: 2000,
          type: 'pistol' as any
        },
        character: {
          skinColor: '#FDBCB4',
          hairColor: '#8B4513',
          outfit: 'casual',
          accessories: []
        },
        isAlive: true,
        kills: 0,
        deaths: 0
      };
      this.gameApp.setCurrentPlayer(player);
    }
  }

  private async handleRandomCity(): Promise<void> {
    const button = document.getElementById('random-city-btn') as HTMLButtonElement;
    const originalText = button.innerHTML;
    
    button.innerHTML = '<span class="button-icon">⏳</span> Finding Location...';
    button.disabled = true;

    try {
      const location = await this.gameApp.getRandomLocation();
      if (location) {
        // Create a single-player game with random location
        const room = await this.createSinglePlayerRoom(location);
        this.gameApp.showGameScreen(room, this.gameApp.getCurrentPlayer()!);
      } else {
        this.showError('Could not find a suitable location. Please try again.');
      }
    } catch (error) {
      console.error('Error getting random location:', error);
      this.showError('Failed to load location. Please check your internet connection.');
    } finally {
      button.innerHTML = originalText;
      button.disabled = false;
    }
  }

  private showCitySelector(): void {
    const cities = GoogleMapsService.getPopularCities();
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal">
        <div class="modal-header">
          <h3>Select City</h3>
          <button class="close-btn" id="close-city-modal">&times;</button>
        </div>
        <div class="modal-content">
          <div class="city-grid">
            ${cities.map(city => `
              <div class="city-card" data-lat="${city.lat}" data-lng="${city.lng}" data-city="${city.city}" data-country="${city.country}">
                <h4>${city.city}</h4>
                <p>${city.country}</p>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Close modal
    document.getElementById('close-city-modal')?.addEventListener('click', () => {
      document.body.removeChild(modal);
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        document.body.removeChild(modal);
      }
    });

    // City selection
    modal.querySelectorAll('.city-card').forEach(card => {
      card.addEventListener('click', async () => {
        const lat = parseFloat(card.getAttribute('data-lat')!);
        const lng = parseFloat(card.getAttribute('data-lng')!);
        const city = card.getAttribute('data-city')!;
        const country = card.getAttribute('data-country')!;

        document.body.removeChild(modal);
        
        const location = await this.gameApp.getLocationByCoordinates(lat, lng);
        if (location) {
          location.city = city;
          location.country = country;
          const room = await this.createSinglePlayerRoom(location);
          this.gameApp.showGameScreen(room, this.gameApp.getCurrentPlayer()!);
        } else {
          this.showError('Street View not available at this location.');
        }
      });
    });
  }

  private showCreateGameModal(): void {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal">
        <div class="modal-header">
          <h3>Create Game</h3>
          <button class="close-btn" id="close-create-modal">&times;</button>
        </div>
        <div class="modal-content">
          <form id="create-game-form">
            <div class="form-group">
              <label for="room-name">Room Name</label>
              <input type="text" id="room-name" placeholder="Enter room name" required>
            </div>
            <div class="form-group">
              <label for="max-players">Max Players</label>
              <select id="max-players">
                <option value="2">2 Players</option>
                <option value="4" selected>4 Players</option>
                <option value="6">6 Players</option>
                <option value="8">8 Players</option>
              </select>
            </div>
            <div class="form-group">
              <label>Location</label>
              <div class="location-options">
                <button type="button" class="location-btn" id="random-location-btn">Random City</button>
                <button type="button" class="location-btn" id="select-location-btn">Select City</button>
              </div>
            </div>
            <div class="form-actions">
              <button type="button" class="btn-secondary" id="cancel-create">Cancel</button>
              <button type="submit" class="btn-primary">Create Game</button>
            </div>
          </form>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Close modal
    document.getElementById('close-create-modal')?.addEventListener('click', () => {
      document.body.removeChild(modal);
    });

    document.getElementById('cancel-create')?.addEventListener('click', () => {
      document.body.removeChild(modal);
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        document.body.removeChild(modal);
      }
    });

    // Form submission
    document.getElementById('create-game-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      // This will be handled by the location selection
    });

    // Location selection handlers
    document.getElementById('random-location-btn')?.addEventListener('click', async () => {
      const location = await this.gameApp.getRandomLocation();
      if (location) {
        await this.createMultiplayerRoom(location, modal);
      }
    });

    document.getElementById('select-location-btn')?.addEventListener('click', () => {
      // Show city selector and then create room
      this.showCitySelectorForCreate(modal);
    });
  }

  private showJoinGameModal(): void {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal">
        <div class="modal-header">
          <h3>Join Game</h3>
          <button class="close-btn" id="close-join-modal">&times;</button>
        </div>
        <div class="modal-content">
          <form id="join-game-form">
            <div class="form-group">
              <label for="join-code">Join Code</label>
              <input type="text" id="join-code" placeholder="Enter 6-digit code" maxlength="6" required>
            </div>
            <div class="form-actions">
              <button type="button" class="btn-secondary" id="cancel-join">Cancel</button>
              <button type="submit" class="btn-primary">Join Game</button>
            </div>
          </form>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Close modal
    document.getElementById('close-join-modal')?.addEventListener('click', () => {
      document.body.removeChild(modal);
    });

    document.getElementById('cancel-join')?.addEventListener('click', () => {
      document.body.removeChild(modal);
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        document.body.removeChild(modal);
      }
    });

    // Form submission
    document.getElementById('join-game-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const joinCode = (document.getElementById('join-code') as HTMLInputElement).value.toUpperCase();
      
      try {
        const room = await this.gameApp.joinRoom(joinCode);
        if (room) {
          document.body.removeChild(modal);
          this.gameApp.showLobbyScreen(room);
        } else {
          this.showError('Invalid join code or room not found.');
        }
      } catch (error) {
        console.error('Error joining room:', error);
        this.showError('Failed to join game. Please try again.');
      }
    });
  }

  private async createSinglePlayerRoom(location: GameLocation): Promise<any> {
    return {
      id: 'single-player',
      name: 'Single Player',
      joinCode: 'SP',
      hostId: this.gameApp.getCurrentPlayer()?.id || 'player',
      players: [this.gameApp.getCurrentPlayer()!],
      maxPlayers: 1,
      location,
      gameState: 'playing' as any,
      createdAt: new Date()
    };
  }

  private async createMultiplayerRoom(location: GameLocation, modal: HTMLElement): Promise<void> {
    const roomName = (document.getElementById('room-name') as HTMLInputElement).value;
    const maxPlayers = parseInt((document.getElementById('max-players') as HTMLSelectElement).value);

    try {
      const roomId = await this.gameApp.createRoom(roomName, maxPlayers, location);
      document.body.removeChild(modal);
      this.gameApp.showLobbyScreen(await this.gameApp.getCurrentRoom()!);
    } catch (error) {
      console.error('Error creating room:', error);
      this.showError('Failed to create game. Please try again.');
    }
  }

  private showCitySelectorForCreate(createModal: HTMLElement): void {
    const cities = GoogleMapsService.getPopularCities();
    
    const cityModal = document.createElement('div');
    cityModal.className = 'modal-overlay';
    cityModal.innerHTML = `
      <div class="modal">
        <div class="modal-header">
          <h3>Select City for Game</h3>
          <button class="close-btn" id="close-city-select-modal">&times;</button>
        </div>
        <div class="modal-content">
          <div class="city-grid">
            ${cities.map(city => `
              <div class="city-card" data-lat="${city.lat}" data-lng="${city.lng}" data-city="${city.city}" data-country="${city.country}">
                <h4>${city.city}</h4>
                <p>${city.country}</p>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(cityModal);

    // Close modal
    document.getElementById('close-city-select-modal')?.addEventListener('click', () => {
      document.body.removeChild(cityModal);
    });

    cityModal.addEventListener('click', (e) => {
      if (e.target === cityModal) {
        document.body.removeChild(cityModal);
      }
    });

    // City selection
    cityModal.querySelectorAll('.city-card').forEach(card => {
      card.addEventListener('click', async () => {
        const lat = parseFloat(card.getAttribute('data-lat')!);
        const lng = parseFloat(card.getAttribute('data-lng')!);
        const city = card.getAttribute('data-city')!;
        const country = card.getAttribute('data-country')!;

        document.body.removeChild(cityModal);
        
        const location = await this.gameApp.getLocationByCoordinates(lat, lng);
        if (location) {
          location.city = city;
          location.country = country;
          await this.createMultiplayerRoom(location, createModal);
        } else {
          this.showError('Street View not available at this location.');
        }
      });
    });
  }

  private showError(message: string): void {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #ff4444;
      color: white;
      padding: 15px 20px;
      border-radius: 5px;
      z-index: 10000;
      animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(errorDiv);

    setTimeout(() => {
      if (document.body.contains(errorDiv)) {
        document.body.removeChild(errorDiv);
      }
    }, 5000);
  }
}
