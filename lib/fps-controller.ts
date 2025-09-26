// FPS Controller for SkoolShooters
import * as THREE from 'three';
import { Vector3, Player, Weapon } from './types';

export class FPSController {
  private camera: THREE.PerspectiveCamera;
  private player: Player;
  private velocity: THREE.Vector3 = new THREE.Vector3();
  private direction: THREE.Vector3 = new THREE.Vector3();
  private moveForward = false;
  private moveBackward = false;
  private moveLeft = false;
  private moveRight = false;
  private canJump = false;
  private isJumping = false;
  private isAiming = false;
  private isShooting = false;
  private lastShotTime = 0;
  private raycaster: THREE.Raycaster = new THREE.Raycaster();
  private mouseSensitivity = 0.003;
  private moveSpeed = 8.0;
  private sprintSpeed = 12.0;
  private jumpSpeed = 10.0;
  private gravity = -30.0;
  private groundY = 0;
  private acceleration = 50.0;
  private friction = 0.85;
  private airFriction = 0.95;

  // Event callbacks
  private onShootCallback?: (target: THREE.Vector3) => void;
  private onReloadCallback?: () => void;
  private onPlayerMoveCallback?: (position: Vector3, rotation: Vector3) => void;

  constructor(camera: THREE.PerspectiveCamera, player: Player) {
    this.camera = camera;
    this.player = player;
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // Keyboard events
    document.addEventListener('keydown', this.onKeyDown.bind(this));
    document.addEventListener('keyup', this.onKeyUp.bind(this));

    // Mouse events
    document.addEventListener('mousedown', this.onMouseDown.bind(this));
    document.addEventListener('mouseup', this.onMouseUp.bind(this));
    document.addEventListener('mousemove', this.onMouseMove.bind(this));

    // Pointer lock events
    document.addEventListener('pointerlockchange', this.onPointerLockChange.bind(this));
  }

  private onKeyDown(event: KeyboardEvent): void {
    switch (event.code) {
      case 'KeyW':
        this.moveForward = true;
        break;
      case 'KeyS':
        this.moveBackward = true;
        break;
      case 'KeyA':
        this.moveLeft = true;
        break;
      case 'KeyD':
        this.moveRight = true;
        break;
      case 'Space':
        if (this.canJump) {
          this.velocity.y = this.jumpSpeed;
          this.canJump = false;
          this.isJumping = true;
        }
        event.preventDefault();
        break;
      case 'KeyR':
        this.reload();
        break;
      case 'KeyE':
        this.interact();
        break;
      case 'ShiftLeft':
        // Sprint handled in update method
        break;
    }
  }

  private onKeyUp(event: KeyboardEvent): void {
    switch (event.code) {
      case 'KeyW':
        this.moveForward = false;
        break;
      case 'KeyS':
        this.moveBackward = false;
        break;
      case 'KeyA':
        this.moveLeft = false;
        break;
      case 'KeyD':
        this.moveRight = false;
        break;
      case 'ShiftLeft':
        // Sprint handled in update method
        break;
    }
  }

  private onMouseDown(event: MouseEvent): void {
    if (event.button === 0) { // Left click
      this.shoot();
    } else if (event.button === 2) { // Right click
      this.isAiming = true;
      this.camera.fov = 30; // Zoom in
      this.camera.updateProjectionMatrix();
    }
  }

  private onMouseUp(event: MouseEvent): void {
    if (event.button === 0) { // Left click
      this.isShooting = false;
    } else if (event.button === 2) { // Right click
      this.isAiming = false;
      this.camera.fov = 75; // Normal FOV
      this.camera.updateProjectionMatrix();
    }
  }

  private onMouseMove(event: MouseEvent): void {
    if (document.pointerLockElement === document.body) {
      const deltaX = event.movementX * this.mouseSensitivity;
      const deltaY = event.movementY * this.mouseSensitivity;

      // Rotate camera
      this.camera.rotation.y -= deltaX;
      this.camera.rotation.x -= deltaY;

      // Clamp vertical rotation
      this.camera.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.camera.rotation.x));

      // Update player rotation
      this.player.rotation.y = this.camera.rotation.y;
    }
  }

  private onPointerLockChange(): void {
    const isLocked = document.pointerLockElement === document.body;
    if (isLocked) {
      // Pointer is locked, enable FPS controls
      this.enableFPSControls();
    } else {
      // Pointer is unlocked, disable FPS controls
      this.disableFPSControls();
    }
  }

  private enableFPSControls(): void {
    // Hide cursor and enable FPS mode
    document.body.style.cursor = 'none';
  }

  private disableFPSControls(): void {
    // Show cursor and disable FPS mode
    document.body.style.cursor = 'default';
    this.moveForward = false;
    this.moveBackward = false;
    this.moveLeft = false;
    this.moveRight = false;
  }

  private shoot(): void {
    const currentTime = Date.now();
    const weapon = this.player.weapon;

    // Check if weapon can fire
    if (currentTime - this.lastShotTime < weapon.fireRate || weapon.ammo <= 0) {
      return;
    }

    this.lastShotTime = currentTime;
    this.isShooting = true;
    weapon.ammo--;

    // Create raycast from camera
    this.raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);
    
    // Get shooting direction
    const shootDirection = new THREE.Vector3();
    this.camera.getWorldDirection(shootDirection);

    // Call shoot callback
    if (this.onShootCallback) {
      this.onShootCallback(shootDirection);
    }

    // Create muzzle flash effect
    this.createMuzzleFlash();

    // Auto-reload when empty
    if (weapon.ammo === 0) {
      setTimeout(() => this.reload(), 100);
    }
  }

  private reload(): void {
    const weapon = this.player.weapon;
    if (weapon.ammo === weapon.maxAmmo) return;

    // Call reload callback
    if (this.onReloadCallback) {
      this.onReloadCallback();
    }

    // Simulate reload time
    setTimeout(() => {
      weapon.ammo = weapon.maxAmmo;
    }, weapon.reloadTime);
  }

  private interact(): void {
    // Raycast to detect interactable objects
    this.raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);
    
    // This would be used to interact with power-ups, doors, etc.
    console.log('Interacting with object');
  }

  private createMuzzleFlash(): void {
    // Create temporary muzzle flash effect
    const flashGeometry = new THREE.SphereGeometry(0.1, 8, 8);
    const flashMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xffaa00,
      transparent: true,
      opacity: 0.8
    });
    const flash = new THREE.Mesh(flashGeometry, flashMaterial);
    
    // Position flash at camera position
    flash.position.copy(this.camera.position);
    flash.position.add(this.camera.getWorldDirection(new THREE.Vector3()).multiplyScalar(0.5));
    
    // Add to scene temporarily
    this.camera.parent?.add(flash);
    
    // Remove after short time
    setTimeout(() => {
      this.camera.parent?.remove(flash);
    }, 100);
  }

  update(deltaTime: number): void {
    // Calculate movement direction
    this.direction.set(0, 0, 0);
    
    if (this.moveForward) this.direction.z -= 1;
    if (this.moveBackward) this.direction.z += 1;
    if (this.moveLeft) this.direction.x -= 1;
    if (this.moveRight) this.direction.x += 1;

    // Normalize direction for consistent diagonal movement
    if (this.direction.length() > 0) {
      this.direction.normalize();
    }

    // Determine current speed based on sprint and aiming
    const isSprinting = this.moveForward && !this.moveBackward && !this.isAiming;
    const currentMoveSpeed = isSprinting ? this.sprintSpeed : this.moveSpeed;
    const finalMoveSpeed = this.isAiming ? currentMoveSpeed * 0.6 : currentMoveSpeed;

    // Calculate movement in world space
    const forward = new THREE.Vector3();
    const right = new THREE.Vector3();
    
    this.camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();
    
    right.crossVectors(forward, new THREE.Vector3(0, 1, 0));
    
    // Calculate desired velocity
    const desiredVelocity = new THREE.Vector3();
    desiredVelocity.addScaledVector(forward, -this.direction.z * finalMoveSpeed);
    desiredVelocity.addScaledVector(right, this.direction.x * finalMoveSpeed);

    // Apply acceleration for smooth movement
    if (this.direction.length() > 0) {
      // Accelerate towards desired velocity
      this.velocity.x += (desiredVelocity.x - this.velocity.x) * this.acceleration * deltaTime;
      this.velocity.z += (desiredVelocity.z - this.velocity.z) * this.acceleration * deltaTime;
    } else {
      // Apply friction when not moving
      const currentFriction = this.canJump ? this.friction : this.airFriction;
      this.velocity.x *= Math.pow(currentFriction, deltaTime * 60);
      this.velocity.z *= Math.pow(currentFriction, deltaTime * 60);
    }

    // Apply gravity
    this.velocity.y += this.gravity * deltaTime;

    // Update position with smooth interpolation
    const newPosition = this.camera.position.clone();
    newPosition.add(this.velocity.clone().multiplyScalar(deltaTime));

    // Ground collision with smooth landing
    if (newPosition.y <= this.groundY + 1.8) {
      newPosition.y = this.groundY + 1.8;
      if (this.velocity.y < 0) {
        this.velocity.y = 0;
        this.canJump = true;
        this.isJumping = false;
      }
    }

    // Update camera position
    this.camera.position.copy(newPosition);

    // Update player position
    this.player.position.x = newPosition.x;
    this.player.position.y = newPosition.y - 1.8;
    this.player.position.z = newPosition.z;

    // Call movement callback with throttling for performance
    if (this.onPlayerMoveCallback && this.isMoving()) {
      this.onPlayerMoveCallback(this.player.position, this.player.rotation);
    }
  }

  // Public methods for setting callbacks
  setOnShoot(callback: (target: THREE.Vector3) => void): void {
    this.onShootCallback = callback;
  }

  setOnReload(callback: () => void): void {
    this.onReloadCallback = callback;
  }

  setOnPlayerMove(callback: (position: Vector3, rotation: Vector3) => void): void {
    this.onPlayerMoveCallback = callback;
  }

  // Getters
  getPlayer(): Player {
    return this.player;
  }

  getCamera(): THREE.PerspectiveCamera {
    return this.camera;
  }

  isMoving(): boolean {
    return this.moveForward || this.moveBackward || this.moveLeft || this.moveRight;
  }

  getIsAiming(): boolean {
    return this.isAiming;
  }

  // Cleanup
  dispose(): void {
    document.removeEventListener('keydown', this.onKeyDown.bind(this));
    document.removeEventListener('keyup', this.onKeyUp.bind(this));
    document.removeEventListener('mousedown', this.onMouseDown.bind(this));
    document.removeEventListener('mouseup', this.onMouseUp.bind(this));
    document.removeEventListener('mousemove', this.onMouseMove.bind(this));
    document.removeEventListener('pointerlockchange', this.onPointerLockChange.bind(this));
  }
}
