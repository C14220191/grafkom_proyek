import * as THREE from 'three';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';

export class Sonic {
    constructor(camera, controller, scene, speed) {
        this.camera = camera;
        this.controller = controller;
        this.scene = scene;
        this.speed = speed;
        this.rotationVector = new THREE.Vector3();

        this.state = 'idle';
        this.animations = {};

        if (this.camera.setup) {
            this.camera.setup(new THREE.Vector3(0, 0, 0), this.rotationVector);
        }
        this.loadModel();
    }

    loadModel(path) {
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
        });
    }

    startMoving() {
        this.state = 'start';
    }

    update(dt) {
        if (!this.mesh) return;
        var direction = new THREE.Vector3(0, 0, 0);
        var tilt = 0;
        const maxTilt = Math.PI / 6; // Maximum tilt angle (30 degrees)
        const tiltSpeed = 0.05;

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
                direction.z = -5;
                tilt = -tiltSpeed; // Tilt to the left
            }
            if (this.controller.keys['right']) {
                direction.z = 5;
                tilt = tiltSpeed; // Tilt to the right
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

        var forwardVector = new THREE.Vector3(1, 0, 0);
        var rightVector = new THREE.Vector3(0, 0, 1);
        forwardVector.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.rotationVector.y);
        rightVector.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.rotationVector.y);

        this.mesh.position.add(forwardVector.multiplyScalar(direction.x * this.speed * dt));
        this.mesh.position.add(rightVector.multiplyScalar(direction.z * this.speed * dt));

        this.mesh.rotation.y += tilt;
        this.mesh.rotation.y = Math.max(-maxTilt, Math.min(maxTilt, this.mesh.rotation.y));

        this.camera.setup(this.mesh.position, new THREE.Vector3(0, 1.5, 0)); // Set angle to zero
    }
}

export class SonicController {
    constructor() {
        this.keys = {
            "left": false,
            "right": false
        };

        document.addEventListener('keydown', (e) => this.onKeyDown(e), false);
        document.addEventListener('keyup', (e) => this.onKeyUp(e), false);
    }

    onKeyDown(event) {
        switch (event.key) {
            case 'a':
            case 'A':
                this.keys.left = true;
                break;
            case 'd':
            case 'D':
                this.keys.right = true;
                break;
        }
    }

    onKeyUp(event) {
        switch (event.key) {
            case 'a':
            case 'A':
                this.keys.left = false;
                break;
            case 'd':
            case 'D':
                this.keys.right = false;
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
    constructor(camera) {
        this.camera = camera;
        this.moveSpeed = 5;
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
            case 'q':
                this.keys.rollLeft = true;
                break;
            case 'e':
                this.keys.rollRight = true;
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
            case 'q':
                this.keys.rollLeft = false;
                break;
            case 'e':
                this.keys.rollRight = false;
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
        }
    }
    setup(target, angle){
        
    }
    update(dt) {
        var moveSpeed = this.moveSpeed * dt;
        var rotationSpeed = this.rotationSpeed * dt;

        if (this.keys.forward) {
            this.camera.translateZ(-moveSpeed);
        }
        if (this.keys.backward) {
            this.camera.translateZ(moveSpeed);
        }
        if (this.keys.left) {
            this.camera.translateX(-moveSpeed);
        }
        if (this.keys.right) {
            this.camera.translateX(moveSpeed);
        }
        if (this.keys.up) {
            this.camera.translateY(moveSpeed);
        }
        if (this.keys.down) {
            this.camera.translateY(-moveSpeed);
        }
        if (this.keys.pitchUp) {
            this.camera.rotation.x -= rotationSpeed;
        }
        if (this.keys.pitchDown) {
            this.camera.rotation.x += rotationSpeed;
        }
        if (this.keys.yawLeft) {
            this.camera.rotation.y -= rotationSpeed;
        }
        if (this.keys.yawRight) {
            this.camera.rotation.y += rotationSpeed;
        }
        if (this.keys.rollLeft) {
            this.camera.rotation.z -= rotationSpeed;
        }
        if (this.keys.rollRight) {
            this.camera.rotation.z += rotationSpeed;
        }
    }
}
