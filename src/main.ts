// Main entry point for SkoolShooters
import { GameApp } from './game/GameApp';

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const app = new GameApp();
    await app.initialize();
  } catch (error) {
    console.error('Failed to initialize game:', error);
    document.getElementById('app')!.innerHTML = `
      <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: white; text-align: center;">
        <h2>Failed to load SkoolShooters</h2>
        <p>Please check your internet connection and try again.</p>
        <button onclick="location.reload()" style="padding: 10px 20px; margin-top: 20px; background: #667eea; color: white; border: none; border-radius: 5px; cursor: pointer;">
          Retry
        </button>
      </div>
    `;
  }
});
