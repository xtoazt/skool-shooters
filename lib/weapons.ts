// Weapons and power-ups system
import { Weapon, WeaponType, PowerUp, PowerUpType, PowerUpEffect } from './types';

export class WeaponManager {
  private static weapons: Map<string, Weapon> = new Map();

  static initializeWeapons(): void {
    // Pistol
    this.weapons.set('pistol', {
      id: 'pistol',
      name: 'Pistol',
      damage: 25,
      range: 50,
      fireRate: 300, // ms between shots
      ammo: 12,
      maxAmmo: 12,
      reloadTime: 2000, // ms
      type: WeaponType.PISTOL
    });

    // Rifle
    this.weapons.set('rifle', {
      id: 'rifle',
      name: 'Assault Rifle',
      damage: 35,
      range: 100,
      fireRate: 150,
      ammo: 30,
      maxAmmo: 30,
      reloadTime: 2500,
      type: WeaponType.RIFLE
    });

    // Shotgun
    this.weapons.set('shotgun', {
      id: 'shotgun',
      name: 'Shotgun',
      damage: 80,
      range: 25,
      fireRate: 800,
      ammo: 8,
      maxAmmo: 8,
      reloadTime: 3000,
      type: WeaponType.SHOTGUN
    });

    // Sniper
    this.weapons.set('sniper', {
      id: 'sniper',
      name: 'Sniper Rifle',
      damage: 100,
      range: 200,
      fireRate: 1500,
      ammo: 5,
      maxAmmo: 5,
      reloadTime: 4000,
      type: WeaponType.SNIPER
    });

    // Machine Gun
    this.weapons.set('machine_gun', {
      id: 'machine_gun',
      name: 'Machine Gun',
      damage: 20,
      range: 80,
      fireRate: 100,
      ammo: 100,
      maxAmmo: 100,
      reloadTime: 5000,
      type: WeaponType.MACHINE_GUN
    });
  }

  static getWeapon(weaponId: string): Weapon | undefined {
    return this.weapons.get(weaponId);
  }

  static getAllWeapons(): Weapon[] {
    return Array.from(this.weapons.values());
  }

  static getWeaponByType(type: WeaponType): Weapon | undefined {
    return Array.from(this.weapons.values()).find(weapon => weapon.type === type);
  }

  static createWeaponInstance(weaponId: string): Weapon | null {
    const weapon = this.weapons.get(weaponId);
    if (!weapon) return null;

    return {
      ...weapon,
      ammo: weapon.maxAmmo
    };
  }
}

export class PowerUpManager {
  private static powerUps: Map<string, PowerUp> = new Map();

  static initializePowerUps(): void {
    // Health Pack
    this.powerUps.set('health_pack', {
      id: 'health_pack',
      type: PowerUpType.HEALTH,
      position: { x: 0, y: 0, z: 0 },
      effect: {
        type: PowerUpType.HEALTH,
        value: 50,
        duration: 0
      },
      duration: 0,
      isActive: true
    });

    // Ammo Pack
    this.powerUps.set('ammo_pack', {
      id: 'ammo_pack',
      type: PowerUpType.AMMO,
      position: { x: 0, y: 0, z: 0 },
      effect: {
        type: PowerUpType.AMMO,
        value: 1, // Refills current weapon
        duration: 0
      },
      duration: 0,
      isActive: true
    });

    // Speed Boost
    this.powerUps.set('speed_boost', {
      id: 'speed_boost',
      type: PowerUpType.SPEED,
      position: { x: 0, y: 0, z: 0 },
      effect: {
        type: PowerUpType.SPEED,
        value: 1.5, // 50% speed increase
        duration: 10000 // 10 seconds
      },
      duration: 10000,
      isActive: true
    });

    // Damage Boost
    this.powerUps.set('damage_boost', {
      id: 'damage_boost',
      type: PowerUpType.DAMAGE,
      position: { x: 0, y: 0, z: 0 },
      effect: {
        type: PowerUpType.DAMAGE,
        value: 2.0, // 100% damage increase
        duration: 15000 // 15 seconds
      },
      duration: 15000,
      isActive: true
    });

    // Shield
    this.powerUps.set('shield', {
      id: 'shield',
      type: PowerUpType.SHIELD,
      position: { x: 0, y: 0, z: 0 },
      effect: {
        type: PowerUpType.SHIELD,
        value: 50, // 50 shield points
        duration: 0
      },
      duration: 0,
      isActive: true
    });

    // Invisibility
    this.powerUps.set('invisibility', {
      id: 'invisibility',
      type: PowerUpType.INVISIBILITY,
      position: { x: 0, y: 0, z: 0 },
      effect: {
        type: PowerUpType.INVISIBILITY,
        value: 1, // Invisible
        duration: 8000 // 8 seconds
      },
      duration: 8000,
      isActive: true
    });
  }

  static getPowerUp(powerUpId: string): PowerUp | undefined {
    return this.powerUps.get(powerUpId);
  }

  static getAllPowerUps(): PowerUp[] {
    return Array.from(this.powerUps.values());
  }

  static getPowerUpByType(type: PowerUpType): PowerUp | undefined {
    return Array.from(this.powerUps.values()).find(powerUp => powerUp.type === type);
  }

  static createPowerUpInstance(powerUpId: string, position: { x: number; y: number; z: number }): PowerUp | null {
    const powerUp = this.powerUps.get(powerUpId);
    if (!powerUp) return null;

    return {
      ...powerUp,
      position,
      isActive: true
    };
  }

  static getRandomPowerUp(): PowerUp {
    const powerUps = Array.from(this.powerUps.values());
    return powerUps[Math.floor(Math.random() * powerUps.length)];
  }

  static spawnRandomPowerUp(position: { x: number; y: number; z: number }): PowerUp {
    const randomPowerUp = this.getRandomPowerUp();
    return this.createPowerUpInstance(randomPowerUp.id, position)!;
  }
}

// Initialize weapons and power-ups when module loads
WeaponManager.initializeWeapons();
PowerUpManager.initializePowerUps();
