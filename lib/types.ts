// Core game types and interfaces

export interface Player {
  id: string;
  name: string;
  position: Vector3;
  rotation: Vector3;
  health: number;
  maxHealth: number;
  weapon: Weapon;
  character: CharacterCustomization;
  isAlive: boolean;
  kills: number;
  deaths: number;
}

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface GameRoom {
  id: string;
  name: string;
  joinCode: string;
  hostId: string;
  players: Player[];
  maxPlayers: number;
  location: GameLocation;
  gameState: GameState;
  createdAt: Date;
}

export interface GameLocation {
  lat: number;
  lng: number;
  heading: number;
  pitch: number;
  city: string;
  country: string;
}

export interface Weapon {
  id: string;
  name: string;
  damage: number;
  range: number;
  fireRate: number;
  ammo: number;
  maxAmmo: number;
  reloadTime: number;
  type: WeaponType;
}

export interface PowerUp {
  id: string;
  type: PowerUpType;
  position: Vector3;
  effect: PowerUpEffect;
  duration: number;
  isActive: boolean;
}

export interface CharacterCustomization {
  skinColor: string;
  hairColor: string;
  outfit: string;
  accessories: string[];
}

export enum GameState {
  WAITING = 'waiting',
  STARTING = 'starting',
  PLAYING = 'playing',
  ENDED = 'ended'
}

export enum WeaponType {
  PISTOL = 'pistol',
  RIFLE = 'rifle',
  SHOTGUN = 'shotgun',
  SNIPER = 'sniper',
  MACHINE_GUN = 'machine_gun'
}

export enum PowerUpType {
  HEALTH = 'health',
  AMMO = 'ammo',
  SPEED = 'speed',
  DAMAGE = 'damage',
  SHIELD = 'shield',
  INVISIBILITY = 'invisibility'
}

export interface PowerUpEffect {
  type: PowerUpType;
  value: number;
  duration: number;
}

export interface GameEvent {
  type: string;
  playerId: string;
  data: any;
  timestamp: Date;
}
