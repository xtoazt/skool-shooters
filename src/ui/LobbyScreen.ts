// Lobby screen for multiplayer games
import { GameApp } from '../game/GameApp';
import { GameRoom, Player } from '../../lib/types';
import { GameRoomService } from '../../lib/firebase';

export class LobbyScreen {
  private gameApp: GameApp;
  private unsubscribe: (() => void) | null = null;

  constructor(gameApp: GameApp) {
    this.gameApp = gameApp;
  }

  render(container: HTMLElement, room: GameRoom): void {
    // Load CSS if not already loaded
    if (!document.getElementById('lobby-styles')) {
      const link = document.createElement('link');
      link.id = 'lobby-styles';
      link.rel = 'stylesheet';
      link.href = '/src/styles/lobby.css';
      document.head.appendChild(link);
    }

    container.innerHTML = `
      <div class="lobby-screen">
        <div class="lobby-header">
          <h1>Game Lobby</h1>
          <button class="back-btn" id="back-to-home">← Back to Home</button>
        </div>
        
        <div class="lobby-content">
          <div class="room-info">
            <h2>${room.name}</h2>
            <div class="room-details">
              <div class="detail-item">
                <span class="label">Join Code:</span>
                <span class="value join-code">${room.joinCode}</span>
                <button class="copy-btn" id="copy-join-code">📋</button>
              </div>
              <div class="detail-item">
                <span class="label">Location:</span>
                <span class="value">${room.location.city}, ${room.location.country}</span>
              </div>
              <div class="detail-item">
                <span class="label">Players:</span>
                <span class="value">${room.players.length}/${room.maxPlayers}</span>
              </div>
              <div class="detail-item">
                <span class="label">Status:</span>
                <span class="value status-${room.gameState}">${this.getStatusText(room.gameState)}</span>
              </div>
            </div>
          </div>
          
          <div class="players-section">
            <h3>Players</h3>
            <div class="players-list" id="players-list">
              ${this.renderPlayersList(room.players)}
            </div>
          </div>
          
          <div class="lobby-actions">
            ${this.renderLobbyActions(room)}
          </div>
        </div>
      </div>
    `;

    this.attachEventListeners(room);
    this.subscribeToRoomUpdates(room.id);
  }

  private renderPlayersList(players: Player[]): string {
    return players.map(player => `
      <div class="player-card ${player.id === this.gameApp.getCurrentPlayer()?.id ? 'current-player' : ''}">
        <div class="player-avatar">
          <div class="avatar" style="background-color: ${player.character.skinColor}">
            👤
          </div>
        </div>
        <div class="player-info">
          <div class="player-name">${player.name}</div>
          <div class="player-stats">
            <span>Kills: ${player.kills}</span>
            <span>Deaths: ${player.deaths}</span>
          </div>
        </div>
        <div class="player-status">
          ${player.id === this.gameApp.getCurrentPlayer()?.id ? 'You' : 'Ready'}
        </div>
      </div>
    `).join('');
  }

  private renderLobbyActions(room: GameRoom): string {
    const isHost = room.hostId === this.gameApp.getCurrentPlayer()?.id;
    const canStart = room.players.length >= 2 && room.gameState === 'waiting';

    if (isHost) {
      return `
        <div class="host-actions">
          <button class="action-btn secondary" id="customize-character">
            👤 Customize Character
          </button>
          <button class="action-btn ${canStart ? 'primary' : 'disabled'}" 
                  id="start-game" ${!canStart ? 'disabled' : ''}>
            🎮 Start Game
          </button>
        </div>
      `;
    } else {
      return `
        <div class="player-actions">
          <button class="action-btn secondary" id="customize-character">
            👤 Customize Character
          </button>
          <button class="action-btn danger" id="leave-game">
            🚪 Leave Game
          </button>
        </div>
      `;
    }
  }

  private getStatusText(gameState: string): string {
    switch (gameState) {
      case 'waiting': return 'Waiting for players';
      case 'starting': return 'Starting game...';
      case 'playing': return 'Game in progress';
      case 'ended': return 'Game ended';
      default: return 'Unknown';
    }
  }

  private attachEventListeners(room: GameRoom): void {
    // Back to home
    document.getElementById('back-to-home')?.addEventListener('click', () => {
      this.cleanup();
      this.gameApp.showHomeScreen();
    });

    // Copy join code
    document.getElementById('copy-join-code')?.addEventListener('click', () => {
      navigator.clipboard.writeText(room.joinCode).then(() => {
        this.showNotification('Join code copied to clipboard!');
      });
    });

    // Customize character
    document.getElementById('customize-character')?.addEventListener('click', () => {
      this.gameApp.showCharacterCustomization();
    });

    // Start game (host only)
    document.getElementById('start-game')?.addEventListener('click', async () => {
      if (room.hostId === this.gameApp.getCurrentPlayer()?.id) {
        await this.startGame(room);
      }
    });

    // Leave game
    document.getElementById('leave-game')?.addEventListener('click', async () => {
      await this.leaveGame(room);
    });
  }

  private async startGame(room: GameRoom): Promise<void> {
    try {
      // Update game state to starting
      const { doc, updateDoc } = await import('firebase/firestore');
      const { db } = await import('../../lib/firebase');
      const roomRef = doc(db, 'gameRooms', room.id);
      await updateDoc(roomRef, { gameState: 'starting' });

      // Wait a moment for the update to propagate
      setTimeout(() => {
        this.gameApp.showGameScreen(room, this.gameApp.getCurrentPlayer()!);
      }, 1000);
    } catch (error) {
      console.error('Error starting game:', error);
      this.showNotification('Failed to start game. Please try again.');
    }
  }

  private async leaveGame(room: GameRoom): Promise<void> {
    try {
      const currentPlayer = this.gameApp.getCurrentPlayer();
      if (currentPlayer) {
        await GameRoomService.leaveRoom(room.id, currentPlayer.id);
      }
      this.cleanup();
      this.gameApp.showHomeScreen();
    } catch (error) {
      console.error('Error leaving game:', error);
      this.showNotification('Failed to leave game. Please try again.');
    }
  }

  private subscribeToRoomUpdates(roomId: string): void {
    this.unsubscribe = GameRoomService.subscribeToRoom(roomId, (updatedRoom) => {
      if (updatedRoom) {
        this.updateLobbyDisplay(updatedRoom);
        
        // Check if game has started
        if (updatedRoom.gameState === 'playing') {
          this.gameApp.showGameScreen(updatedRoom, this.gameApp.getCurrentPlayer()!);
        }
      } else {
        // Room was deleted
        this.showNotification('Room was deleted by the host.');
        this.cleanup();
        this.gameApp.showHomeScreen();
      }
    });
  }

  private updateLobbyDisplay(room: GameRoom): void {
    // Update players list
    const playersList = document.getElementById('players-list');
    if (playersList) {
      playersList.innerHTML = this.renderPlayersList(room.players);
    }

    // Update player count
    const playerCountElement = document.querySelector('.detail-item .value');
    if (playerCountElement) {
      playerCountElement.textContent = `${room.players.length}/${room.maxPlayers}`;
    }

    // Update status
    const statusElement = document.querySelector('.status-waiting, .status-starting, .status-playing, .status-ended');
    if (statusElement) {
      statusElement.className = `value status-${room.gameState}`;
      statusElement.textContent = this.getStatusText(room.gameState);
    }

    // Update start game button state
    const startButton = document.getElementById('start-game') as HTMLButtonElement;
    if (startButton) {
      const canStart = room.players.length >= 2 && room.gameState === 'waiting';
      startButton.disabled = !canStart;
      startButton.className = `action-btn ${canStart ? 'primary' : 'disabled'}`;
    }
  }

  private showNotification(message: string): void {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #4CAF50;
      color: white;
      padding: 15px 20px;
      border-radius: 5px;
      z-index: 10000;
      animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 3000);
  }

  private cleanup(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
  }
}
