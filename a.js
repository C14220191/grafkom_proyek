class FreeRoamCamera {
    constructor(params) {
      this._params = params;
      this._camera = params.camera;
  
      this._currentPosition = new THREE.Vector3();
      this._currentLookat = new THREE.Vector3();
  
      this._enabled = false;
      this._prevCameraPosition = null;
      this._prevCameraQuaternion = null;
  
      this._rotationSpeed = 0.05; // Adjust rotation speed as needed
      this._rollSpeed = 0.05; // Adjust roll speed as needed
  
      document.addEventListener('keydown', (e) => this._onKeyDown(e), false);
    }
  
    _onKeyDown(event) {
      switch (event.key) {
        case 'i': // 'I' key for forward
          this._moveCameraForward();
          break;
        case 'k': // 'K' key for backward
          this._moveCameraBackward();
          break;
        case 'j': // 'J' key for left
          this._moveCameraLeft();
          break;
        case 'l': // 'L' key for right
          this._moveCameraRight();
          break;
        case 'ArrowUp': // Up arrow key for rotating up
          this._rotateCameraUp();
          break;
        case 'ArrowDown': // Down arrow key for rotating down
          this._rotateCameraDown();
          break;
        case 'ArrowLeft': // Left arrow key for rotating left
          this._rotateCameraLeft();
          break;
        case 'ArrowRight': // Right arrow key for rotating right
          this._rotateCameraRight();
          break;
        case ',': // ',' key for rolling left
          this._rollCameraLeft();
          break;
        case '.': // '.' key for rolling right
          this._rollCameraRight();
          break;
        case '2': // '2' key for toggling free roam
          this._toggleFreeRoam();
          break;
      }
    }
  
    _toggleFreeRoam() {
      this._enabled = !this._enabled;
      if (this._enabled) {
        this._enableFreeRoam();
      } else {
        this._disableFreeRoam();
      }
    }
  
    _enableFreeRoam() {
      this._prevCameraPosition = this._camera.position.clone();
      this._prevCameraQuaternion = this._camera.quaternion.clone();
  
      // Set camera to a fixed position
      this._camera.position.set(0, 50, -50);
      this._camera.lookAt(0, 0, 0);
  
      // Disable third person camera behavior if it's active
      this._params.disableThirdPersonCamera();
    }
  
    _disableFreeRoam() {
      if (this._prevCameraPosition) {
        this._camera.position.copy(this._prevCameraPosition);
      }
      if (this._prevCameraQuaternion) {
        this._camera.quaternion.copy(this._prevCameraQuaternion);
      }
  
      this._prevCameraPosition = null;
      this._prevCameraQuaternion = null;
  
      // Re-enable third person camera behavior if needed
      this._params.enableThirdPersonCamera();
    }
  
    _moveCameraForward() {
      if (!this._enabled) return;
      const moveSpeed = 2; // Adjust movement speed as needed
      this._camera.translateZ(-moveSpeed);
    }
  
    _moveCameraBackward() {
      if (!this._enabled) return;
      const moveSpeed = 2; // Adjust movement speed as needed
      this._camera.translateZ(moveSpeed);
    }
  
    _moveCameraLeft() {
      if (!this._enabled) return;
      const moveSpeed = 2; // Adjust movement speed as needed
      this._camera.translateX(-moveSpeed);
    }
  
    _moveCameraRight() {
      if (!this._enabled) return;
      const moveSpeed = 2; // Adjust movement speed as needed
      this._camera.translateX(moveSpeed);
    }
  
    _rotateCameraUp() {
      if (!this._enabled) return;
      this._camera.rotation.x -= this._rotationSpeed;
    }
  
    _rotateCameraDown() {
      if (!this._enabled) return;
      this._camera.rotation.x += this._rotationSpeed;
    }
  
    _rotateCameraLeft() {
      if (!this._enabled) return;
      this._camera.rotation.y -= this._rotationSpeed;
    }
  
    _rotateCameraRight() {
      if (!this._enabled) return;
      this._camera.rotation.y += this._rotationSpeed;
    }
  
    _rollCameraLeft() {
      if (!this._enabled) return;
      this._camera.rotation.z += this._rollSpeed;
    }
  
    _rollCameraRight() {
      if (!this._enabled) return;
      this._camera.rotation.z -= this._rollSpeed;
    }
  
    Update(timeElapsed) {
      if (!this._enabled) return;
  
      // Update lookAt position based on camera movement
      this._camera.updateMatrixWorld();
      this._camera.getWorldPosition(this._currentPosition);
      this._camera.getWorldDirection(this._currentLookat);
      this._currentLookat.add(this._currentPosition);
    }
  }