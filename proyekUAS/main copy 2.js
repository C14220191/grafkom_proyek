import * as THREE from 'three';
import { Sonic, SonicController, ThirdPersonCamera, FirstPersonCamera, FreeRoamCamera, OrbitCamera } from './sonic.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

class Main {
    static init() {
        var canvasReference = document.getElementById("canvas");
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            canvas: canvasReference
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0xffffff, 1);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Soft shadows

        const loader = new GLTFLoader().setPath('resources/building/').load('building.gltf', (gltf) => {
            console.log(gltf); // Log to see if the model is loaded correctly
            gltf.scene.traverse((object) => {
                if (object.isMesh) {       
                    //object set scalar by xyz
                    object.scale.set(23, 30, 50);
                    object.castShadow = true;
                    object.receiveShadow = true;
                }
                gltf.scene.position.set(-9.5, -5.1, 0.1)
                this.scene.add(gltf.scene)
            });
        }, undefined, (error) => {
            console.error('An error happened', error);
        });

        // Plane
        const ModelTexture = new THREE.TextureLoader().load('resources/sandTexture.jpg');

        this.planeSize = 30; // Store the plane size for boundary checks
        var planeGeometry = new THREE.PlaneGeometry(this.planeSize, this.planeSize);
        var planeMaterial = new THREE.MeshStandardMaterial({ map: ModelTexture });

        var plane = new THREE.Mesh(planeGeometry, planeMaterial);
        this.scene.add(plane);
        plane.rotation.x = -Math.PI / 2;
        plane.receiveShadow = true;

        var hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 1);
        hemiLight.position.set(0, 20, 0);
        this.scene.add(hemiLight);
        var hemiLightHelper = new THREE.HemisphereLightHelper(hemiLight, 1);
        this.scene.add(hemiLightHelper);

        // Directional light for shadows
        var directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(3, 10, 10);
        directionalLight.castShadow = true;

        // Adjust shadow settings
        directionalLight.shadow.mapSize.width = 1024; // Optional: increase shadow map size
        directionalLight.shadow.mapSize.height = 1024; // Optional: increase shadow map size

        // Set up shadow camera frustum
        var d = 15;
        directionalLight.shadow.camera.left = -d;
        directionalLight.shadow.camera.right = d;
        directionalLight.shadow.camera.top = d;
        directionalLight.shadow.camera.bottom = -d;

        var directionalShadowHelper = new THREE.CameraHelper(directionalLight.shadow.camera);
        this.scene.add(directionalShadowHelper);
        var directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight, 1);
        this.scene.add(directionalLightHelper);
        this.scene.add(directionalLight);

        // Set up Sonic
        this.firstPersonCamera = new FirstPersonCamera(
            this.camera, new THREE.Vector3(-0.5, 1.5, 0) // Offset for head height
        );
        this.thirdPersonCamera = new ThirdPersonCamera(
            this.camera, new THREE.Vector3(-2, 2, 0), new THREE.Vector3(0, 0, 0)
        );
        this.freeRoamCamera = new FreeRoamCamera(this.camera, 100); // Speed set to 5 for FreeRoamCamera
        this.orbitCamera = new OrbitCamera(this.camera, this.renderer.domElement);

        this.currentCamera = this.thirdPersonCamera;

        this.sonic = new Sonic(
            this.currentCamera,
            new SonicController(),
            this.scene,
            1 // Adjust speed as necessary
        );

        // Add a light specifically for Sonic
        this.sonicLight = new THREE.PointLight(0xffffff, 7, 50); // Bright white light
        this.scene.add(this.sonicLight);

        // Add event listeners for zooming and switching cameras
        window.addEventListener('wheel', this.onMouseWheel.bind(this), false);
        window.addEventListener('keydown', this.onKeyDown.bind(this), false);
    }

    static render(dt) {
        this.checkBoundaries(dt);
        this.sonic.update(dt);

        // Update the position of the light to follow Sonic
        if (this.sonic.mesh) {
            this.sonicLight.position.set(
                this.sonic.mesh.position.x,
                this.sonic.mesh.position.y + 1.5, // Slightly above sonic
                this.sonic.mesh.position.z
            );
        }

        // Update camera if it's a FreeRoamCamera
        if (this.currentCamera instanceof FreeRoamCamera) {
            this.currentCamera.update(dt);
        } else if (this.currentCamera instanceof OrbitCamera) {
            this.currentCamera.setup(this.sonic.mesh.position);
            this.currentCamera.update();
        }

        this.renderer.render(this.scene, this.camera);
    }

    static checkBoundaries(dt) {
        if (!this.sonic.mesh) return;

        var position = this.sonic.mesh.position;
        var speed = this.sonic.speed * dt;

        // Define the boundaries
        var halfSize = this.planeSize / 2;
        var minX = -halfSize + speed;
        var maxX = halfSize - speed;
        var minZ = -halfSize + speed;
        var maxZ = halfSize - speed;

        // Adjust the speed based on the boundaries
        if (position.x < minX) {
            this.sonic.mesh.position.x = minX;
        } else if (position.x > maxX) {
            this.sonic.mesh.position.x = maxX;
        }

        if (position.z < minZ) {
            this.sonic.mesh.position.z = minZ;
        } else if (position.z > maxZ) {
            this.sonic.mesh.position.z = maxZ;
        }
    }

    static onMouseWheel(event) {
        if (event.deltaY > 0) {
            this.camera.fov = Math.min(100, this.camera.fov + 1);
        } else {
            this.camera.fov = Math.max(30, this.camera.fov - 1);
        }
        this.camera.updateProjectionMatrix();
    }

    static onKeyDown(event) {
        if (event.key === 'c') { // 'c' key to switch camera
            if (this.currentCamera instanceof FirstPersonCamera) {
                this.currentCamera = this.thirdPersonCamera;
            } else if (this.currentCamera instanceof ThirdPersonCamera) {
                this.currentCamera = this.freeRoamCamera;
            } else if (this.currentCamera instanceof FreeRoamCamera) {
                this.currentCamera = this.orbitCamera;
            } else {
                this.currentCamera = this.firstPersonCamera;
            }
            this.sonic.camera = this.currentCamera; // Update Sonic's camera directly
        }
        if (event.key === ' ') {
            this.sonic.startMoving();
        }
    }
}

var clock = new THREE.Clock();
Main.init();
requestAnimationFrame(animate);
function animate() {
    Main.render(clock.getDelta());
    requestAnimationFrame(animate);
}
