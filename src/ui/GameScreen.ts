// Game screen with 3D FPS gameplay
import { GameApp } from '../game/GameApp';
import { GameRoom, Player } from '../../lib/types';

export class GameScreen {
  private gameApp: GameApp;
  private gameContainer: HTMLElement | null = null;

  constructor(gameApp: GameApp) {
    this.gameApp = gameApp;
  }

  render(container: HTMLElement, room: GameRoom, player: Player): void {
    // Load CSS if not already loaded
    if (!document.getElementById('game-styles')) {
      const link = document.createElement('link');
      link.id = 'game-styles';
      link.rel = 'stylesheet';
      link.href = '/src/styles/game.css';
      document.head.appendChild(link);
    }

    container.innerHTML = `
      <div class="game-screen">
        <div class="game-ui">
          <div class="top-hud">
            <div class="game-info">
              <span class="location">${room.location.city}, ${room.location.country}</span>
              <span class="players-count">${room.players.length}/${room.maxPlayers} players</span>
            </div>
            <div class="game-controls">
              <button class="ui-btn" id="pause-btn">⏸️</button>
              <button class="ui-btn" id="settings-btn">⚙️</button>
              <button class="ui-btn" id="leave-btn">🚪</button>
            </div>
          </div>
          
          <div class="bottom-hud">
            <div class="player-stats">
              <div class="health-bar">
                <span class="stat-label">Health</span>
                <div class="bar">
                  <div class="bar-fill health" style="width: ${(player.health / player.maxHealth) * 100}%"></div>
                </div>
                <span class="stat-value">${player.health}/${player.maxHealth}</span>
              </div>
              <div class="ammo-info">
                <span class="weapon-name">${player.weapon.name}</span>
                <span class="ammo-count">${player.weapon.ammo}/${player.weapon.maxAmmo}</span>
              </div>
            </div>
            
            <div class="crosshair">
              <div class="crosshair-dot"></div>
            </div>
            
            <div class="scoreboard">
              <div class="kills">Kills: ${player.kills}</div>
              <div class="deaths">Deaths: ${player.deaths}</div>
            </div>
          </div>
        </div>
        
        <div class="game-world" id="game-world">
          <div class="loading-message">
            <div class="spinner"></div>
            <p>Loading Street View...</p>
          </div>
        </div>
      </div>
    `;

    this.gameContainer = document.getElementById('game-world');
    this.attachEventListeners();
    this.initializeGame(room, player);
  }

  private attachEventListeners(): void {
    // Pause button
    document.getElementById('pause-btn')?.addEventListener('click', () => {
      this.togglePause();
    });

    // Settings button
    document.getElementById('settings-btn')?.addEventListener('click', () => {
      this.showSettings();
    });

    // Leave button
    document.getElementById('leave-btn')?.addEventListener('click', () => {
      this.leaveGame();
    });

    // Keyboard controls
    document.addEventListener('keydown', (e) => {
      this.handleKeyDown(e);
    });

    document.addEventListener('keyup', (e) => {
      this.handleKeyUp(e);
    });

    // Mouse controls
    document.addEventListener('mousedown', (e) => {
      this.handleMouseDown(e);
    });

    document.addEventListener('mouseup', (e) => {
      this.handleMouseUp(e);
    });

    document.addEventListener('mousemove', (e) => {
      this.handleMouseMove(e);
    });
  }

  private async initializeGame(room: GameRoom, player: Player): Promise<void> {
    try {
      // Initialize Google Street View
      const streetViewContainer = document.createElement('div');
      streetViewContainer.style.width = '100%';
      streetViewContainer.style.height = '100%';
      
      if (this.gameContainer) {
        this.gameContainer.innerHTML = '';
        this.gameContainer.appendChild(streetViewContainer);
      }

      const streetView = this.gameApp.getGoogleMapsService().createStreetView(streetViewContainer, {
        position: { lat: room.location.lat, lng: room.location.lng },
        pov: { heading: room.location.heading, pitch: room.location.pitch },
        zoom: 1,
        visible: true
      });

      // Initialize game mechanics
      this.initializeGameMechanics(room, player);
      
    } catch (error) {
      console.error('Failed to initialize game:', error);
      this.showError('Failed to load game world. Please try again.');
    }
  }

  private initializeGameMechanics(room: GameRoom, player: Player): void {
    // This will be expanded with Three.js integration
    console.log('Initializing game mechanics for room:', room.id);
    console.log('Player:', player.name);
  }

  private handleKeyDown(event: KeyboardEvent): void {
    // Handle keyboard input for movement and actions
    switch (event.code) {
      case 'KeyW':
        // Move forward
        break;
      case 'KeyS':
        // Move backward
        break;
      case 'KeyA':
        // Move left
        break;
      case 'KeyD':
        // Move right
        break;
      case 'Space':
        // Jump
        event.preventDefault();
        break;
      case 'KeyR':
        // Reload
        this.reloadWeapon();
        break;
      case 'KeyE':
        // Interact
        break;
    }
  }

  private handleKeyUp(event: KeyboardEvent): void {
    // Handle key release
  }

  private handleMouseDown(event: MouseEvent): void {
    if (event.button === 0) { // Left click
      this.shoot();
    } else if (event.button === 2) { // Right click
      this.aim();
    }
  }

  private handleMouseUp(event: MouseEvent): void {
    if (event.button === 0) { // Left click release
      this.stopShooting();
    } else if (event.button === 2) { // Right click release
      this.stopAiming();
    }
  }

  private handleMouseMove(event: MouseEvent): void {
    // Handle mouse look
    const sensitivity = 0.002;
    const deltaX = event.movementX * sensitivity;
    const deltaY = event.movementY * sensitivity;
    
    // Update camera rotation
    this.updateCameraRotation(deltaX, deltaY);
  }

  private shoot(): void {
    console.log('Shooting!');
    // Implement shooting logic
  }

  private stopShooting(): void {
    console.log('Stopped shooting');
    // Implement stop shooting logic
  }

  private aim(): void {
    console.log('Aiming');
    // Implement aiming logic
  }

  private stopAiming(): void {
    console.log('Stopped aiming');
    // Implement stop aiming logic
  }

  private reloadWeapon(): void {
    console.log('Reloading weapon');
    // Implement reload logic
  }

  private updateCameraRotation(deltaX: number, deltaY: number): void {
    // Update camera rotation based on mouse movement
    console.log('Camera rotation:', deltaX, deltaY);
  }

  private togglePause(): void {
    console.log('Toggle pause');
    // Implement pause functionality
  }

  private showSettings(): void {
    console.log('Show settings');
    // Implement settings modal
  }

  private leaveGame(): void {
    if (confirm('Are you sure you want to leave the game?')) {
      this.gameApp.showHomeScreen();
    }
  }

  private showError(message: string): void {
    if (this.gameContainer) {
      this.gameContainer.innerHTML = `
        <div class="error-message">
          <h3>Error</h3>
          <p>${message}</p>
          <button onclick="location.reload()">Retry</button>
        </div>
      `;
    }
  }
}
