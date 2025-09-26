// Three.js 3D Engine for SkoolShooters
import * as THREE from 'three';
import { Player, Vector3, GameLocation } from './types';

export class ThreeEngine {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private controls: any;
  private clock: THREE.Clock;
  private players: Map<string, THREE.Group> = new Map();
  private weapons: Map<string, THREE.Group> = new Map();
  private powerUps: Map<string, THREE.Group> = new Map();
  private streetViewTexture: THREE.Texture | null = null;
  private isInitialized = false;
  private animationId: number | null = null;

  constructor() {
    this.clock = new THREE.Clock();
  }

  async initialize(container: HTMLElement): Promise<void> {
    if (this.isInitialized) return;

    // Create scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87CEEB); // Sky blue

    // Create camera
    this.camera = new THREE.PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 1.8, 0); // Eye level

    // Create renderer with optimized settings
    this.renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
      stencil: false,
      depth: true
    });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Cap pixel ratio for performance
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.useLegacyLights = true; // Use legacy lights to avoid deprecation warnings
    
    container.appendChild(this.renderer.domElement);

    // Add lighting
    this.setupLighting();

    // Add ground
    this.createGround();

    // Setup controls
    this.setupControls();

    // Handle window resize
    window.addEventListener('resize', () => this.onWindowResize(container));

    this.isInitialized = true;
    this.startRenderLoop();
  }

  private setupLighting(): void {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    this.scene.add(ambientLight);

    // Directional light (sun)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(50, 50, 50);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 500;
    directionalLight.shadow.camera.left = -100;
    directionalLight.shadow.camera.right = 100;
    directionalLight.shadow.camera.top = 100;
    directionalLight.shadow.camera.bottom = -100;
    this.scene.add(directionalLight);

    // Point light for dynamic lighting
    const pointLight = new THREE.PointLight(0xffffff, 0.5, 100);
    pointLight.position.set(0, 10, 0);
    pointLight.castShadow = true;
    this.scene.add(pointLight);
  }

  private createGround(): void {
    // Create a large ground plane
    const groundGeometry = new THREE.PlaneGeometry(200, 200);
    const groundMaterial = new THREE.MeshLambertMaterial({ 
      color: 0x90EE90,
      transparent: true,
      opacity: 0.8
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // Add some buildings/obstacles
    this.createBuildings();
  }

  private createBuildings(): void {
    const buildingCount = 20;
    const buildingPositions: Vector3[] = [];

    for (let i = 0; i < buildingCount; i++) {
      const x = (Math.random() - 0.5) * 180;
      const z = (Math.random() - 0.5) * 180;
      
      // Avoid spawning buildings too close to center
      if (Math.sqrt(x * x + z * z) < 20) continue;

      const height = Math.random() * 20 + 5;
      const width = Math.random() * 8 + 4;
      const depth = Math.random() * 8 + 4;

      const buildingGeometry = new THREE.BoxGeometry(width, height, depth);
      const buildingMaterial = new THREE.MeshLambertMaterial({ 
        color: new THREE.Color().setHSL(Math.random(), 0.3, 0.5)
      });
      const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
      
      building.position.set(x, height / 2, z);
      building.castShadow = true;
      building.receiveShadow = true;
      this.scene.add(building);

      buildingPositions.push({ x, y: height / 2, z });
    }
  }

  private setupControls(): void {
    // Simple mouse look controls
    let isPointerLocked = false;
    let mouseX = 0;
    let mouseY = 0;

    const onMouseMove = (event: MouseEvent) => {
      if (!isPointerLocked) return;

      mouseX += event.movementX * 0.002;
      mouseY += event.movementY * 0.002;
      mouseY = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, mouseY));

      this.camera.rotation.y = -mouseX;
      this.camera.rotation.x = -mouseY;
    };

    const onPointerLockChange = () => {
      isPointerLocked = document.pointerLockElement === this.renderer.domElement;
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('pointerlockchange', onPointerLockChange);

    // Click to lock pointer
    this.renderer.domElement.addEventListener('click', () => {
      if (!isPointerLocked) {
        this.renderer.domElement.requestPointerLock();
      }
    });
  }

  private startRenderLoop(): void {
    let lastTime = 0;
    const targetFPS = 60;
    const frameTime = 1000 / targetFPS;
    
    const animate = (currentTime: number) => {
      this.animationId = requestAnimationFrame(animate);
      
      // Cap delta time to prevent large jumps
      const deltaTime = Math.min((currentTime - lastTime) / 1000, 1/30);
      lastTime = currentTime;
      
      this.update(deltaTime);
      this.renderer.render(this.scene, this.camera);
    };
    
    animate(0);
  }

  private update(deltaTime: number): void {
    const elapsedTime = this.clock.getElapsedTime();
    
    // Update player animations with smooth interpolation
    this.players.forEach((playerGroup, playerId) => {
      if (playerGroup.userData.isMoving) {
        playerGroup.rotation.y += deltaTime * 3;
      }
    });

    // Update power-ups with smooth floating animation
    this.powerUps.forEach((powerUp) => {
      powerUp.rotation.y += deltaTime * 2;
      powerUp.position.y = Math.sin(elapsedTime * 3 + powerUp.userData.offset || 0) * 0.3 + 1;
    });

    // Update weapons with smooth firing animation
    this.weapons.forEach((weapon) => {
      if (weapon.userData.isFiring) {
        weapon.rotation.x += deltaTime * 15;
      }
    });
  }

  private onWindowResize(container: HTMLElement): void {
    this.camera.aspect = container.clientWidth / container.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(container.clientWidth, container.clientHeight);
  }

  // Player management
  addPlayer(player: Player): void {
    const playerGroup = new THREE.Group();
    
    // Create player body
    const bodyGeometry = new THREE.CapsuleGeometry(0.3, 1.2, 4, 8);
    const bodyMaterial = new THREE.MeshLambertMaterial({ 
      color: player.character.skinColor 
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.6;
    body.castShadow = true;
    playerGroup.add(body);

    // Create head
    const headGeometry = new THREE.SphereGeometry(0.2, 8, 8);
    const headMaterial = new THREE.MeshLambertMaterial({ 
      color: player.character.skinColor 
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 1.4;
    head.castShadow = true;
    playerGroup.add(head);

    // Create hair
    const hairGeometry = new THREE.SphereGeometry(0.22, 8, 8);
    const hairMaterial = new THREE.MeshLambertMaterial({ 
      color: player.character.hairColor 
    });
    const hair = new THREE.Mesh(hairGeometry, hairMaterial);
    hair.position.y = 1.5;
    hair.scale.y = 0.7;
    playerGroup.add(hair);

    // Create outfit
    const outfitGeometry = new THREE.CylinderGeometry(0.4, 0.3, 0.8, 8);
    const outfitMaterial = new THREE.MeshLambertMaterial({ 
      color: this.getOutfitColor(player.character.outfit) 
    });
    const outfit = new THREE.Mesh(outfitGeometry, outfitMaterial);
    outfit.position.y = 0.2;
    outfit.castShadow = true;
    playerGroup.add(outfit);

    // Add accessories
    this.addAccessories(playerGroup, player.character.accessories);

    // Position player
    playerGroup.position.set(player.position.x, 0, player.position.z);
    playerGroup.rotation.y = player.rotation.y;

    // Store player data
    playerGroup.userData = {
      playerId: player.id,
      isMoving: false,
      health: player.health,
      maxHealth: player.maxHealth
    };

    this.players.set(player.id, playerGroup);
    this.scene.add(playerGroup);
  }

  updatePlayer(player: Player): void {
    const playerGroup = this.players.get(player.id);
    if (!playerGroup) return;

    // Update position
    playerGroup.position.set(player.position.x, 0, player.position.z);
    playerGroup.rotation.y = player.rotation.y;

    // Update health indicator
    const healthPercent = player.health / player.maxHealth;
    const body = playerGroup.children[0] as THREE.Mesh;
    if (body.material instanceof THREE.MeshLambertMaterial) {
      body.material.color.setHSL(0.3 * healthPercent, 0.8, 0.5);
    }

    // Update movement animation
    playerGroup.userData.isMoving = this.isPlayerMoving(player);
  }

  removePlayer(playerId: string): void {
    const playerGroup = this.players.get(playerId);
    if (playerGroup) {
      this.scene.remove(playerGroup);
      this.players.delete(playerId);
    }
  }

  // Weapon management
  addWeapon(weaponId: string, position: Vector3): void {
    const weaponGroup = new THREE.Group();
    
    // Create weapon model based on type
    const weaponGeometry = new THREE.BoxGeometry(0.1, 0.3, 0.05);
    const weaponMaterial = new THREE.MeshLambertMaterial({ color: 0x444444 });
    const weapon = new THREE.Mesh(weaponGeometry, weaponMaterial);
    weapon.castShadow = true;
    weaponGroup.add(weapon);

    // Add muzzle flash effect
    const muzzleGeometry = new THREE.SphereGeometry(0.05, 8, 8);
    const muzzleMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xffaa00,
      transparent: true,
      opacity: 0
    });
    const muzzleFlash = new THREE.Mesh(muzzleGeometry, muzzleMaterial);
    muzzleFlash.position.set(0, 0, 0.1);
    weaponGroup.add(muzzleFlash);

    weaponGroup.position.set(position.x, position.y, position.z);
    weaponGroup.userData = {
      weaponId,
      isFiring: false,
      muzzleFlash
    };

    this.weapons.set(weaponId, weaponGroup);
    this.scene.add(weaponGroup);
  }

  fireWeapon(weaponId: string): void {
    const weapon = this.weapons.get(weaponId);
    if (!weapon) return;

    weapon.userData.isFiring = true;
    
    // Show muzzle flash
    const muzzleFlash = weapon.userData.muzzleFlash;
    if (muzzleFlash.material instanceof THREE.MeshBasicMaterial) {
      muzzleFlash.material.opacity = 1;
      setTimeout(() => {
        muzzleFlash.material.opacity = 0;
      }, 100);
    }

    // Create bullet trail
    this.createBulletTrail(weapon.position);

    setTimeout(() => {
      weapon.userData.isFiring = false;
    }, 200);
  }

  // Power-up management
  addPowerUp(powerUpId: string, type: string, position: Vector3): void {
    const powerUpGroup = new THREE.Group();
    
    // Create power-up model based on type
    const geometry = new THREE.OctahedronGeometry(0.3);
    const material = new THREE.MeshLambertMaterial({ 
      color: this.getPowerUpColor(type),
      transparent: true,
      opacity: 0.8
    });
    const powerUp = new THREE.Mesh(geometry, material);
    powerUp.castShadow = true;
    powerUpGroup.add(powerUp);

    // Add glow effect
    const glowGeometry = new THREE.SphereGeometry(0.4, 8, 8);
    const glowMaterial = new THREE.MeshBasicMaterial({ 
      color: this.getPowerUpColor(type),
      transparent: true,
      opacity: 0.2
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    powerUpGroup.add(glow);

    powerUpGroup.position.set(position.x, position.y, position.z);
    powerUpGroup.userData = {
      powerUpId,
      type,
      collected: false,
      offset: Math.random() * Math.PI * 2 // Random offset for varied animation
    };

    this.powerUps.set(powerUpId, powerUpGroup);
    this.scene.add(powerUpGroup);
  }

  collectPowerUp(powerUpId: string): void {
    const powerUp = this.powerUps.get(powerUpId);
    if (!powerUp) return;

    powerUp.userData.collected = true;
    
    // Animate collection
    const scale = { x: 1, y: 1, z: 1 };
    const animate = () => {
      scale.x *= 0.9;
      scale.y *= 0.9;
      scale.z *= 0.9;
      powerUp.scale.set(scale.x, scale.y, scale.z);
      
      if (scale.x > 0.1) {
        requestAnimationFrame(animate);
      } else {
        this.scene.remove(powerUp);
        this.powerUps.delete(powerUpId);
      }
    };
    animate();
  }

  // Street View integration
  async loadStreetView(location: GameLocation): Promise<void> {
    // Create a skybox with Street View texture
    const skyboxGeometry = new THREE.SphereGeometry(500, 32, 32);
    const skyboxMaterial = new THREE.MeshBasicMaterial({
      side: THREE.BackSide,
      transparent: true,
      opacity: 0.8
    });

    // Load Street View panorama
    try {
      const panoramaUrl = `https://maps.googleapis.com/maps/api/streetview?size=1024x1024&location=${location.lat},${location.lng}&heading=${location.heading}&pitch=${location.pitch}&key=AIzaSyB9vKASqiPS-xWAVBy5YlqOJLEvLwpA6iw`;
      
      const textureLoader = new THREE.TextureLoader();
      this.streetViewTexture = await new Promise((resolve, reject) => {
        textureLoader.load(panoramaUrl, resolve, undefined, reject);
      });

      skyboxMaterial.map = this.streetViewTexture;
      skyboxMaterial.needsUpdate = true;

      const skybox = new THREE.Mesh(skyboxGeometry, skyboxMaterial);
      this.scene.add(skybox);
    } catch (error) {
      // Silently fallback to solid color - Street View is optional
      skyboxMaterial.color.setHex(0x87CEEB);
    }
  }

  // Utility methods
  private getOutfitColor(outfit: string): number {
    const colors: { [key: string]: number } = {
      casual: 0x3498db,
      military: 0x27ae60,
      sports: 0xe74c3c,
      formal: 0x34495e,
      punk: 0x8e44ad,
      stealth: 0x2c3e50
    };
    return colors[outfit] || colors.casual;
  }

  private getPowerUpColor(type: string): number {
    const colors: { [key: string]: number } = {
      health: 0xff0000,
      ammo: 0xffff00,
      speed: 0x00ff00,
      damage: 0xff8800,
      shield: 0x0088ff,
      invisibility: 0x8800ff
    };
    return colors[type] || 0xffffff;
  }

  private addAccessories(playerGroup: THREE.Group, accessories: string[]): void {
    accessories.forEach(accessory => {
      switch (accessory) {
        case 'glasses':
          const glassesGeometry = new THREE.BoxGeometry(0.3, 0.1, 0.05);
          const glassesMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 });
          const glasses = new THREE.Mesh(glassesGeometry, glassesMaterial);
          glasses.position.set(0, 1.4, 0.2);
          playerGroup.add(glasses);
          break;
        case 'hat':
          const hatGeometry = new THREE.CylinderGeometry(0.25, 0.3, 0.2, 8);
          const hatMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
          const hat = new THREE.Mesh(hatGeometry, hatMaterial);
          hat.position.set(0, 1.6, 0);
          playerGroup.add(hat);
          break;
      }
    });
  }

  private isPlayerMoving(player: Player): boolean {
    // Simple movement detection based on position changes
    return Math.abs(player.position.x) > 0.1 || Math.abs(player.position.z) > 0.1;
  }

  private createBulletTrail(startPosition: THREE.Vector3): void {
    const trailGeometry = new THREE.BufferGeometry();
    const trailMaterial = new THREE.LineBasicMaterial({ 
      color: 0xffff00,
      transparent: true,
      opacity: 0.8
    });

    const points = [
      startPosition,
      new THREE.Vector3(
        startPosition.x + Math.random() * 2 - 1,
        startPosition.y + Math.random() * 2 - 1,
        startPosition.z + 10
      )
    ];

    trailGeometry.setFromPoints(points);
    const trail = new THREE.Line(trailGeometry, trailMaterial);
    this.scene.add(trail);

    // Remove trail after animation
    setTimeout(() => {
      this.scene.remove(trail);
    }, 500);
  }

  // Cleanup
  dispose(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    
    this.renderer.dispose();
    this.scene.clear();
    
    if (this.streetViewTexture) {
      this.streetViewTexture.dispose();
    }
  }

  // Getters
  getCamera(): THREE.PerspectiveCamera {
    return this.camera;
  }

  getScene(): THREE.Scene {
    return this.scene;
  }

  getRenderer(): THREE.WebGLRenderer {
    return this.renderer;
  }
}
