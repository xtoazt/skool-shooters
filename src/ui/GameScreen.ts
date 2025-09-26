// Game screen with 3D FPS gameplay
import { GameApp } from '../game/GameApp';
import { GameRoom, Player } from '../../lib/types';
import { ThreeEngine } from '../../lib/three-engine';
import { FPSController } from '../../lib/fps-controller';

export class GameScreen {
  private gameApp: GameApp;
  private gameContainer: HTMLElement | null = null;
  private threeEngine: ThreeEngine;
  private fpsController: FPSController | null = null;
  private currentRoom: GameRoom | null = null;
  private currentPlayer: Player | null = null;
  private lastSyncTime = 0;
  private syncInterval = 100; // Sync every 100ms instead of every frame

  constructor(gameApp: GameApp) {
    this.gameApp = gameApp;
    this.threeEngine = new ThreeEngine();
  }

  render(container: HTMLElement, room: GameRoom, player: Player): void {
    this.currentRoom = room;
    this.currentPlayer = player;

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
          
          <div class="minimap">
            <div class="minimap-title">Map</div>
            <div class="minimap-content" id="minimap">
              <div class="minimap-player" id="minimap-player"></div>
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
      // Initialize Three.js engine
      if (this.gameContainer) {
        this.gameContainer.innerHTML = '';
        await this.threeEngine.initialize(this.gameContainer);
      }

      // Load Street View as skybox
      await this.threeEngine.loadStreetView(room.location);

      // Initialize FPS controller
      this.fpsController = new FPSController(this.threeEngine.getCamera(), player);
      this.setupFPSController();

      // Add current player to scene
      this.threeEngine.addPlayer(player);

      // Add other players to scene
      room.players.forEach(p => {
        if (p.id !== player.id) {
          this.threeEngine.addPlayer(p);
        }
      });

      // Spawn some power-ups
      this.spawnPowerUps();

      // Initialize game mechanics
      this.initializeGameMechanics(room, player);
      
    } catch (error) {
      console.error('Failed to initialize game:', error);
      this.showError('Failed to load game world. Please try again.');
    }
  }

  private setupFPSController(): void {
    if (!this.fpsController) return;

    // Set up shooting callback
    this.fpsController.setOnShoot((target) => {
      this.handleShoot(target);
    });

    // Set up reload callback
    this.fpsController.setOnReload(() => {
      this.handleReload();
    });

    // Set up movement callback
    this.fpsController.setOnPlayerMove((position, rotation) => {
      this.handlePlayerMove(position, rotation);
    });
  }

  private spawnPowerUps(): void {
    const powerUpTypes = ['health', 'ammo', 'speed', 'damage', 'shield', 'invisibility'];
    
    for (let i = 0; i < 10; i++) {
      const type = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
      const position = {
        x: (Math.random() - 0.5) * 100,
        y: 1,
        z: (Math.random() - 0.5) * 100
      };
      
      this.threeEngine.addPowerUp(`powerup_${i}`, type, position);
    }
  }

  private handleShoot(target: THREE.Vector3): void {
    if (!this.currentPlayer) return;

    // Create bullet trail
    const startPos = this.threeEngine.getCamera().position;
    const endPos = startPos.clone().add(target.multiplyScalar(100));
    
    // Check for hits
    this.checkForHits(startPos, endPos);
    
    // Update UI
    this.updateAmmoDisplay();
    
    // Fire weapon in Three.js
    this.threeEngine.fireWeapon(this.currentPlayer.weapon.id);
  }

  private handleReload(): void {
    if (!this.currentPlayer) return;
    
    // Show reload animation
    this.showReloadAnimation();
    
    // Update UI after reload
    setTimeout(() => {
      this.updateAmmoDisplay();
    }, this.currentPlayer.weapon.reloadTime);
  }

  private handlePlayerMove(position: Vector3, rotation: Vector3): void {
    if (!this.currentPlayer || !this.currentRoom) return;

    // Update player position
    this.currentPlayer.position = position;
    this.currentPlayer.rotation = rotation;

    // Update Three.js scene
    this.threeEngine.updatePlayer(this.currentPlayer);

    // Check for power-up collection
    this.checkPowerUpCollection(position);

    // Send to Firebase for multiplayer sync
    this.syncPlayerPosition(position, rotation);
  }

  private checkForHits(startPos: THREE.Vector3, endPos: THREE.Vector3): void {
    // Simple hit detection - in a real game, this would be more sophisticated
    const raycaster = new THREE.Raycaster();
    raycaster.set(startPos, endPos.clone().sub(startPos).normalize());
    
    // Check against other players
    if (this.currentRoom) {
      this.currentRoom.players.forEach(player => {
        if (player.id !== this.currentPlayer?.id) {
          // Simple distance check
          const playerPos = new THREE.Vector3(player.position.x, player.position.y, player.position.z);
          const distance = startPos.distanceTo(playerPos);
          
          if (distance < 5) { // Hit!
            this.handlePlayerHit(player);
          }
        }
      });
    }
  }

  private handlePlayerHit(targetPlayer: Player): void {
    if (!this.currentPlayer) return;

    // Apply damage
    const damage = this.currentPlayer.weapon.damage;
    targetPlayer.health -= damage;

    // Update UI
    this.updateHealthDisplay();

    // Check if player died
    if (targetPlayer.health <= 0) {
      this.handlePlayerDeath(targetPlayer);
    }

    // Update Three.js scene
    this.threeEngine.updatePlayer(targetPlayer);
  }

  private handlePlayerDeath(player: Player): void {
    player.isAlive = false;
    player.deaths++;
    
    // Award kill to shooter
    if (this.currentPlayer) {
      this.currentPlayer.kills++;
    }

    // Respawn after delay
    setTimeout(() => {
      this.respawnPlayer(player);
    }, 5000);
  }

  private respawnPlayer(player: Player): void {
    player.health = player.maxHealth;
    player.isAlive = true;
    player.position = { x: 0, y: 0, z: 0 }; // Respawn at center
    
    this.threeEngine.updatePlayer(player);
  }

  private checkPowerUpCollection(position: Vector3): void {
    // Check if player is near any power-ups
    // This would use more sophisticated collision detection in a real game
    console.log('Checking power-up collection at:', position);
  }

  private syncPlayerPosition(position: Vector3, rotation: Vector3): void {
    // Throttle Firebase updates for better performance
    const now = Date.now();
    if (now - this.lastSyncTime < this.syncInterval) {
      return;
    }
    this.lastSyncTime = now;
    
    // Send position update to Firebase for multiplayer sync
    if (this.currentPlayer && this.currentRoom) {
      // This would update Firebase with the new position
      console.log('Syncing player position:', position);
    }
  }

  private updateAmmoDisplay(): void {
    if (!this.currentPlayer) return;
    
    const ammoElement = document.querySelector('.ammo-count');
    if (ammoElement) {
      ammoElement.textContent = `${this.currentPlayer.weapon.ammo}/${this.currentPlayer.weapon.maxAmmo}`;
    }
  }

  private updateHealthDisplay(): void {
    if (!this.currentPlayer) return;
    
    const healthBar = document.querySelector('.bar-fill.health') as HTMLElement;
    if (healthBar) {
      const healthPercent = (this.currentPlayer.health / this.currentPlayer.maxHealth) * 100;
      healthBar.style.width = `${healthPercent}%`;
    }
    
    const healthValue = document.querySelector('.stat-value');
    if (healthValue) {
      healthValue.textContent = `${this.currentPlayer.health}/${this.currentPlayer.maxHealth}`;
    }
  }

  private showReloadAnimation(): void {
    // Show reload animation in UI
    const weaponName = document.querySelector('.weapon-name');
    if (weaponName) {
      weaponName.textContent = 'Reloading...';
      setTimeout(() => {
        if (this.currentPlayer) {
          weaponName.textContent = this.currentPlayer.weapon.name;
        }
      }, this.currentPlayer?.weapon.reloadTime || 2000);
    }
  }

  private initializeGameMechanics(room: GameRoom, player: Player): void {
    console.log('Initializing game mechanics for room:', room.id);
    console.log('Player:', player.name);
    
    // Start game loop
    this.startGameLoop();
  }

  private startGameLoop(): void {
    let lastTime = 0;
    const targetFPS = 60;
    const frameTime = 1000 / targetFPS;
    
    const gameLoop = (currentTime: number) => {
      // Calculate delta time with capping
      const deltaTime = Math.min((currentTime - lastTime) / 1000, 1/30);
      lastTime = currentTime;
      
      if (this.fpsController) {
        this.fpsController.update(deltaTime);
      }
      
      requestAnimationFrame(gameLoop);
    };
    
    gameLoop(0);
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
