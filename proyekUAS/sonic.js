import * as THREE from 'three';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export class Sonic {
    constructor(camera, controller, scene, speed, object) {
        this.camera = camera;
        this.controller = controller;
        this.scene = scene;
        this.speed = speed;
        this.rotationVector = new THREE.Vector3();
        this.object = object || []

        this.state = 'idle';
        this.animations = {};
        this.boxTemp = null; // Add this line in the constructor
        this.boundingBox = new THREE.Box3(); // Inisialisasi boundingBox

        if (this.camera.setup) {
            this.camera.setup(new THREE.Vector3(0, 0, 0), this.rotationVector);
        }
        this.loadModel();
    }

    loadModel() {
        var loader = new FBXLoader();
        loader.setPath('./resources/');
        loader.load('Looking Around.fbx', (fbx) => {
            fbx.scale.setScalar(0.01);
            fbx.rotateY(Math.PI);
            fbx.position.set(0, 0, 10);
            fbx.traverse(c => {
                c.castShadow = true;
                c.receiveShadow = true;
            });
            this.mesh = fbx;
            this.scene.add(this.mesh);
            this.rotationVector.y = Math.PI / 2;

            this.mixer = new THREE.AnimationMixer(this.mesh);
            var onLoad = (animName, anim) => {
                var clip = anim.animations[0];
                var action = this.mixer.clipAction(clip);
                this.animations[animName] = {
                    clip: clip,
                    action: action
                };
            };
            var loader = new FBXLoader();
            loader.setPath('./resources/');
            loader.load('Looking Around.fbx', (fbx) => { onLoad('idle', fbx) });
            loader.load('Running.fbx', (fbx) => { onLoad('start', fbx) });
            this.createPlayerBox()
        });
    }

    createPlayerBox() {
        this.boxTemp = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1, 0.3), new THREE.MeshStandardMaterial({ color: 0x00f000 }));
        
    }
    

    startMoving() {
        if (this.state === 'idle') {
            this.state = 'start';
        }else{
            this.state = 'idle';
        }
    }


    update(dt) {
        if (!this.mesh) return;
        var direction = new THREE.Vector3(0, 0, 0);
        var tilt = 0;
        const maxTilt = Math.PI / 6; // Maximum tilt angle (30 degrees)
        const tiltSpeed = 0.1;
    
        if (this.state === 'idle') {
            if (this.animations['idle']) {
                if (!this.animations['idle'].action.isRunning()) {
                    this.mixer.stopAllAction();
                    this.animations['idle'].action.play();
                }
                this.mixer.update(dt);
            }
        } else if (this.state === 'start') {
            direction.x = 1; // Only move forward if in 'start' state
            if (this.animations['start']) {
                if (!this.animations['start'].action.isRunning()) {
                    this.mixer.stopAllAction();
                    this.animations['start'].action.play();
                }
                this.mixer.update(dt);
            }
            if (this.controller.keys['left']) {
                direction.z = -2;
                tilt = -tiltSpeed; // Tilt to the left
            }
            if (this.controller.keys['right']) {
                direction.z = 2;
                tilt = tiltSpeed; // Tilt to the right
            }
            // if (this.controller.keys['forward']) {
            //     direction.x = 5;
            // }
            if (this.controller.keys['backward']) {
                direction.x = -2;
            }
            if (!this.controller.keys['left'] && !this.controller.keys['right']) {
                if (this.mesh.rotation.y > 0) {
                    this.mesh.rotation.y -= tiltSpeed;
                    if (this.mesh.rotation.y < 0) {
                        this.mesh.rotation.y = 0;
                    }
                } else if (this.mesh.rotation.y < 0) {
                    this.mesh.rotation.y += tiltSpeed;
                    if (this.mesh.rotation.y > 0) {
                        this.mesh.rotation.y = 0;
                    }
                }
            }
        }
    
        // Define the movement vector before using it
        var forwardVector = new THREE.Vector3(1, 0, 0);
        var rightVector = new THREE.Vector3(0, 0, 1);
        forwardVector.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.rotationVector.y);
        rightVector.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.rotationVector.y);
    
        var movement = new THREE.Vector3();
        movement.add(forwardVector.multiplyScalar(direction.x * this.speed * dt));
        movement.add(rightVector.multiplyScalar(direction.z * this.speed * dt));
    
        this.mesh.position.add(movement);
    
        // Create a bounding box for the mesh if it doesn't exist
        if (!this.boundingBox) {
            this.boundingBox = new THREE.Box3().setFromObject(this.mesh);
        } else {
            this.boundingBox.setFromObject(this.mesh);
        }
    
        // Check for collisions and undo movement if necessary
        for (let obj of this.object) { // Changed objects to object
            if (this.boundingBox.intersectsBox(obj.boundingBox)) {
                this.mesh.position.sub(movement); // Undo the movement
                break; // Exit the loop early to avoid multiple corrections
            }
        }
    
        this.mesh.rotation.y += tilt;
        this.mesh.rotation.y = Math.max(-maxTilt, Math.min(maxTilt, this.mesh.rotation.y));
    
        this.camera.setup(this.mesh.position, new THREE.Vector3(0, 1.5, 0)); // Set angle to zero
    
        // Update the position of boxTemp to match Sonic's position
        if (this.boxTemp) {
            this.boxTemp.position.copy(this.mesh.position);
            this.boxTemp.position.y += 0.5;
        }
    }
        
}

export class SonicController {
    constructor() {
        this.keys = {
            "left": false,
            "right": false,
            "forward": false,
            "backward": false
        };

        document.addEventListener('keydown', (e) => this.onKeyDown(e), false);
        document.addEventListener('keyup', (e) => this.onKeyUp(e), false);
    }

    onKeyDown(event) {
        switch (event.key) {
            case 'ArrowLeft':
                this.keys.left = true;
                break;
            case 'ArrowRight':
                this.keys.right = true;
                break;
            case 'ArrowUp':
                this.keys.forward = true;
                break;
            case 'ArrowDown':
                this.keys.backward = true;
                break;
        }
    }

    onKeyUp(event) {
        switch (event.key) {
            case 'ArrowLeft':
                this.keys.left = false;
                break;
            case 'ArrowRight':
                this.keys.right = false;
                break;
            case 'ArrowUp':
                this.keys.forward = false;
                break;
            case 'ArrowDown':
                this.keys.backward = false;
                break;
        }
    }
}

export class ThirdPersonCamera {
    constructor(camera, positionOffset, targetOffset) {
        this.camera = camera;
        this.positionOffset = positionOffset;
        this.targetOffset = targetOffset;
    }
    
    setup(target, angle) {
        var temp = new THREE.Vector3();
        temp.copy(this.positionOffset);
        temp.applyAxisAngle(new THREE.Vector3(0, 1, 0), angle.y);
        temp.applyAxisAngle(new THREE.Vector3(0, 0, 1), angle.z);

        temp.addVectors(target, temp);
        this.camera.position.copy(temp);

        temp = new THREE.Vector3();
        temp.addVectors(target, this.targetOffset);
        this.camera.lookAt(temp);
    }

    updatePositionOffset(newOffset) {
        this.positionOffset.copy(newOffset);
    }
}

export class FirstPersonCamera {
    constructor(camera, targetOffset) {
        this.camera = camera;
        this.targetOffset = targetOffset;
    }

    setup(target, angle) {
        var temp = new THREE.Vector3();
        temp.copy(this.targetOffset);
        temp.applyAxisAngle(new THREE.Vector3(0, 1, 0), angle.y);

        temp.addVectors(target, temp);
        this.camera.position.copy(temp);

        temp = new THREE.Vector3();
        temp.addVectors(target, new THREE.Vector3(0, 1.5, 0)); // Offset for head height
        this.camera.lookAt(temp);
    }
}

export class FreeRoamCamera {
    constructor(camera, obstacles) {
        this.camera = camera;
        this.moveSpeed = 10;
        this.rotationSpeed = 1;
        this.keys = {
            "forward": false,
            "backward": false,
            "left": false,
            "right": false,
            "up": false,
            "down": false,
            "pitchUp": false,
            "pitchDown": false,
            "yawLeft": false,
            "yawRight": false,
            "rollLeft": false,
            "rollRight": false
        };
        this.rotationVector = new THREE.Vector3(0, 0, 0);
        this.tempCameraPos = new THREE.Vector3(); // Add temporary position vector
        this.obstacles = obstacles || []; // Obstacle array for collision detection
        this.cameraBox = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3()); // Bounding box for the camera

        document.addEventListener('keydown', (e) => this.onKeyDown(e), false);
        document.addEventListener('keyup', (e) => this.onKeyUp(e), false);
    }

    onKeyDown(event) {
        switch (event.key) {
            case 'w':
                this.keys.forward = true;
                break;
            case 's':
                this.keys.backward = true;
                break;
            case 'a':
                this.keys.left = true;
                break;
            case 'd':
                this.keys.right = true;
                break;
            case 'r':
                this.keys.up = true;
                break;
            case 'f':
                this.keys.down = true;
                break;
            case 'ArrowUp':
                this.keys.pitchUp = true;
                break;
            case 'ArrowDown':
                this.keys.pitchDown = true;
                break;
            case 'ArrowLeft':
                this.keys.yawLeft = true;
                break;
            case 'ArrowRight':
                this.keys.yawRight = true;
                break;
            case 'q':
                this.keys.rollLeft = true;
                break;
            case 'e':
                this.keys.rollRight = true;
                break;
        }
    }

    onKeyUp(event) {
        switch (event.key) {
            case 'w':
                this.keys.forward = false;
                break;
            case 's':
                this.keys.backward = false;
                break;
            case 'a':
                this.keys.left = false;
                break;
            case 'd':
                this.keys.right = false;
                break;
            case 'r':
                this.keys.up = false;
                break;
            case 'f':
                this.keys.down = false;
                break;
            case 'ArrowUp':
                this.keys.pitchUp = false;
                break;
            case 'ArrowDown':
                this.keys.pitchDown = false;
                break;
            case 'ArrowLeft':
                this.keys.yawLeft = false;
                break;
            case 'ArrowRight':
                this.keys.yawRight = false;
                break;
            case 'q':
                this.keys.rollLeft = false;
                break;
            case 'e':
                this.keys.rollRight = false;
                break;
        }
    }

    update(dt) {
        const moveVector = new THREE.Vector3();
        const rotationVector = new THREE.Vector3();

        if (this.keys.forward) moveVector.z -= this.moveSpeed * dt;
        if (this.keys.backward) moveVector.z += this.moveSpeed * dt;
        if (this.keys.left) moveVector.x -= this.moveSpeed * dt;
        if (this.keys.right) moveVector.x += this.moveSpeed * dt;
        if (this.keys.up) moveVector.y += this.moveSpeed * dt;
        if (this.keys.down) moveVector.y -= this.moveSpeed * dt;

        if (this.keys.pitchUp) rotationVector.x -= this.rotationSpeed * dt;
        if (this.keys.pitchDown) rotationVector.x += this.rotationSpeed * dt;
        if (this.keys.yawLeft) rotationVector.y -= this.rotationSpeed * dt;
        if (this.keys.yawRight) rotationVector.y += this.rotationSpeed * dt;
        if (this.keys.rollLeft) rotationVector.z -= this.rotationSpeed * dt;
        if (this.keys.rollRight) rotationVector.z += this.rotationSpeed * dt;

        // Update rotation
        this.rotationVector.add(rotationVector);
        this.camera.rotation.set(this.rotationVector.x, this.rotationVector.y, this.rotationVector.z);

        // Apply movement
        this.tempCameraPos.copy(this.camera.position); // Store current position
        this.tempCameraPos.add(moveVector.applyEuler(this.camera.rotation)); // Move the temporary position

        // Update the camera bounding box
        this.cameraBox.setFromCenterAndSize(this.tempCameraPos, new THREE.Vector3(1, 1, 1)); // Adjust size as needed

        // Check for collisions
        let collision = false;
        for (let obstacle of this.obstacles) {
            if (this.cameraBox.intersectsBox(obstacle.boundingBox)) {
                collision = true;
                break;
            }
        }

        // If no collision, update the camera position
        if (!collision) {
            this.camera.position.copy(this.tempCameraPos);
        }
    }
    setup(target,angle){
        
    }

}

export class OrbitCamera {
    constructor(camera, scene) {
        this.camera = camera;
        this.controls = new OrbitControls(this.camera, document.getElementById('canvas'));
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.screenSpacePanning = false;
        this.controls.minDistance = 2;
        this.controls.maxDistance = 20;
        this.controls.maxPolarAngle = Math.PI / 2;

        // This target will be updated to Sonic's position
        this.target = new THREE.Vector3();
        this.controls.target.copy(this.target);
    }

    setup(target) {
        this.target.copy(target);
        this.controls.target.copy(this.target);
    }

    update() {
        this.controls.update();
    }
}
