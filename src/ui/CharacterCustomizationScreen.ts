// Character customization screen
import { GameApp } from '../game/GameApp';
import { Player, CharacterCustomization } from '../../lib/types';

export class CharacterCustomizationScreen {
  private gameApp: GameApp;
  private currentCustomization: CharacterCustomization;

  constructor(gameApp: GameApp) {
    this.gameApp = gameApp;
    this.currentCustomization = this.gameApp.getCurrentPlayer()?.character || {
      skinColor: '#FDBCB4',
      hairColor: '#8B4513',
      outfit: 'casual',
      accessories: []
    };
  }

  render(container: HTMLElement): void {
    // Load CSS if not already loaded
    if (!document.getElementById('character-styles')) {
      const link = document.createElement('link');
      link.id = 'character-styles';
      link.rel = 'stylesheet';
      link.href = '/src/styles/character.css';
      document.head.appendChild(link);
    }

    container.innerHTML = `
      <div class="character-screen">
        <div class="character-header">
          <h1>Character Customization</h1>
          <button class="back-btn" id="back-btn">← Back</button>
        </div>
        
        <div class="character-content">
          <div class="character-preview">
            <h3>Preview</h3>
            <div class="character-model" id="character-model">
              <div class="character-body">
                <div class="character-head" style="background-color: ${this.currentCustomization.skinColor}">
                  <div class="character-hair" style="background-color: ${this.currentCustomization.hairColor}"></div>
                  <div class="character-face">
                    <div class="eye left"></div>
                    <div class="eye right"></div>
                    <div class="nose"></div>
                    <div class="mouth"></div>
                  </div>
                </div>
                <div class="character-torso outfit-${this.currentCustomization.outfit}">
                  <div class="character-arms"></div>
                </div>
                <div class="character-legs"></div>
              </div>
            </div>
          </div>
          
          <div class="customization-options">
            <div class="option-section">
              <h3>Skin Color</h3>
              <div class="color-palette" id="skin-colors">
                ${this.renderColorOptions([
                  { name: 'Light', value: '#FDBCB4' },
                  { name: 'Medium Light', value: '#E8A87C' },
                  { name: 'Medium', value: '#D08B5B' },
                  { name: 'Medium Dark', value: '#A0522D' },
                  { name: 'Dark', value: '#8B4513' },
                  { name: 'Very Dark', value: '#654321' }
                ], 'skinColor')}
              </div>
            </div>
            
            <div class="option-section">
              <h3>Hair Color</h3>
              <div class="color-palette" id="hair-colors">
                ${this.renderColorOptions([
                  { name: 'Black', value: '#000000' },
                  { name: 'Brown', value: '#8B4513' },
                  { name: 'Light Brown', value: '#A0522D' },
                  { name: 'Blonde', value: '#DAA520' },
                  { name: 'Red', value: '#A0522D' },
                  { name: 'Gray', value: '#808080' }
                ], 'hairColor')}
              </div>
            </div>
            
            <div class="option-section">
              <h3>Outfit</h3>
              <div class="outfit-options" id="outfit-options">
                ${this.renderOutfitOptions()}
              </div>
            </div>
            
            <div class="option-section">
              <h3>Accessories</h3>
              <div class="accessory-options" id="accessory-options">
                ${this.renderAccessoryOptions()}
              </div>
            </div>
          </div>
        </div>
        
        <div class="character-actions">
          <button class="action-btn secondary" id="reset-btn">Reset</button>
          <button class="action-btn primary" id="save-btn">Save Character</button>
        </div>
      </div>
    `;

    this.attachEventListeners();
  }

  private renderColorOptions(colors: Array<{ name: string; value: string }>, type: string): string {
    return colors.map(color => `
      <div class="color-option ${this.currentCustomization[type as keyof CharacterCustomization] === color.value ? 'selected' : ''}" 
           data-color="${color.value}" data-type="${type}">
        <div class="color-swatch" style="background-color: ${color.value}"></div>
        <span class="color-name">${color.name}</span>
      </div>
    `).join('');
  }

  private renderOutfitOptions(): string {
    const outfits = [
      { id: 'casual', name: 'Casual', description: 'Everyday clothes' },
      { id: 'military', name: 'Military', description: 'Tactical gear' },
      { id: 'sports', name: 'Sports', description: 'Athletic wear' },
      { id: 'formal', name: 'Formal', description: 'Business attire' },
      { id: 'punk', name: 'Punk', description: 'Rebel style' },
      { id: 'stealth', name: 'Stealth', description: 'Ninja outfit' }
    ];

    return outfits.map(outfit => `
      <div class="outfit-option ${this.currentCustomization.outfit === outfit.id ? 'selected' : ''}" 
           data-outfit="${outfit.id}">
        <div class="outfit-preview outfit-${outfit.id}"></div>
        <div class="outfit-info">
          <h4>${outfit.name}</h4>
          <p>${outfit.description}</p>
        </div>
      </div>
    `).join('');
  }

  private renderAccessoryOptions(): string {
    const accessories = [
      { id: 'glasses', name: 'Glasses', icon: '👓' },
      { id: 'hat', name: 'Hat', icon: '🎩' },
      { id: 'mask', name: 'Mask', icon: '🎭' },
      { id: 'watch', name: 'Watch', icon: '⌚' },
      { id: 'backpack', name: 'Backpack', icon: '🎒' },
      { id: 'gloves', name: 'Gloves', icon: '🧤' }
    ];

    return accessories.map(accessory => `
      <div class="accessory-option ${this.currentCustomization.accessories.includes(accessory.id) ? 'selected' : ''}" 
           data-accessory="${accessory.id}">
        <div class="accessory-icon">${accessory.icon}</div>
        <span class="accessory-name">${accessory.name}</span>
      </div>
    `).join('');
  }

  private attachEventListeners(): void {
    // Back button
    document.getElementById('back-btn')?.addEventListener('click', () => {
      this.gameApp.showHomeScreen();
    });

    // Color options
    document.querySelectorAll('.color-option').forEach(option => {
      option.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        const color = target.getAttribute('data-color')!;
        const type = target.getAttribute('data-type')!;
        
        // Update selection
        document.querySelectorAll(`.color-option[data-type="${type}"]`).forEach(opt => {
          opt.classList.remove('selected');
        });
        target.classList.add('selected');
        
        // Update customization
        (this.currentCustomization as any)[type] = color;
        this.updatePreview();
      });
    });

    // Outfit options
    document.querySelectorAll('.outfit-option').forEach(option => {
      option.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        const outfit = target.getAttribute('data-outfit')!;
        
        // Update selection
        document.querySelectorAll('.outfit-option').forEach(opt => {
          opt.classList.remove('selected');
        });
        target.classList.add('selected');
        
        // Update customization
        this.currentCustomization.outfit = outfit;
        this.updatePreview();
      });
    });

    // Accessory options
    document.querySelectorAll('.accessory-option').forEach(option => {
      option.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        const accessory = target.getAttribute('data-accessory')!;
        
        // Toggle selection
        target.classList.toggle('selected');
        
        // Update customization
        const index = this.currentCustomization.accessories.indexOf(accessory);
        if (index > -1) {
          this.currentCustomization.accessories.splice(index, 1);
        } else {
          this.currentCustomization.accessories.push(accessory);
        }
        this.updatePreview();
      });
    });

    // Reset button
    document.getElementById('reset-btn')?.addEventListener('click', () => {
      this.resetCustomization();
    });

    // Save button
    document.getElementById('save-btn')?.addEventListener('click', () => {
      this.saveCustomization();
    });
  }

  private updatePreview(): void {
    const characterModel = document.getElementById('character-model');
    if (characterModel) {
      // Update skin color
      const head = characterModel.querySelector('.character-head') as HTMLElement;
      if (head) {
        head.style.backgroundColor = this.currentCustomization.skinColor;
      }
      
      // Update hair color
      const hair = characterModel.querySelector('.character-hair') as HTMLElement;
      if (hair) {
        hair.style.backgroundColor = this.currentCustomization.hairColor;
      }
      
      // Update outfit
      const torso = characterModel.querySelector('.character-torso') as HTMLElement;
      if (torso) {
        torso.className = `character-torso outfit-${this.currentCustomization.outfit}`;
      }
    }
  }

  private resetCustomization(): void {
    this.currentCustomization = {
      skinColor: '#FDBCB4',
      hairColor: '#8B4513',
      outfit: 'casual',
      accessories: []
    };
    
    // Re-render the screen
    this.render(document.getElementById('app')!);
  }

  private saveCustomization(): void {
    const currentPlayer = this.gameApp.getCurrentPlayer();
    if (currentPlayer) {
      currentPlayer.character = { ...this.currentCustomization };
      this.gameApp.setCurrentPlayer(currentPlayer);
      
      this.showNotification('Character saved successfully!');
      
      // Go back to previous screen
      setTimeout(() => {
        this.gameApp.showHomeScreen();
      }, 1000);
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
}
