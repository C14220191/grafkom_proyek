import * as THREE from 'three';
import { Sonic, SonicController, ThirdPersonCamera } from './sonic.js';

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

        // Plane
        this.planeSize = 30; // Store the plane size for boundary checks
        var plane = new THREE.Mesh(
            new THREE.PlaneGeometry(this.planeSize, this.planeSize),
            new THREE.MeshPhongMaterial({ color: 0xcbcbcb })
        );
        this.scene.add(plane);
        plane.rotation.x = -Math.PI / 2;
        plane.receiveShadow = true;

        // Directional light
        var directionalLight = new THREE.DirectionalLight(0xffffff, 1); // Increase the intensity
        directionalLight.position.set(0, 20, 0);
        directionalLight.castShadow = true;
        directionalLight.shadow.camera.left = -this.planeSize / 2;
        directionalLight.shadow.camera.right = this.planeSize / 2;
        directionalLight.shadow.camera.top = this.planeSize / 2;
        directionalLight.shadow.camera.bottom = -this.planeSize / 2;
        directionalLight.shadow.camera.near = 0.1;
        directionalLight.shadow.camera.far = 100;
        directionalLight.shadow.mapSize.width = 1024;
        directionalLight.shadow.mapSize.height = 1024;
        this.scene.add(directionalLight);

        // Ambient light
        var ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Add ambient light with half intensity
        this.scene.add(ambientLight);

        // Camera helper for debugging
        var helper = new THREE.CameraHelper(directionalLight.shadow.camera);
        this.scene.add(helper);

        this.Sonic = new Sonic(
            new ThirdPersonCamera(
                this.camera, new THREE.Vector3(-5, 5, 0), new THREE.Vector3(0, 0, 0)),
            new SonicController(),
            this.scene,
            1 // Adjust speed as necessary
        );

        // Add event listener for zooming
        window.addEventListener('wheel', this.onMouseWheel.bind(this), false);
    }

    static render(dt) {
        this.checkBoundaries(dt);
        this.Sonic.update(dt);
        this.renderer.render(this.scene, this.camera);
    }

    static checkBoundaries(dt) {
        if (!this.Sonic.mesh) return;

        var position = this.Sonic.mesh.position;
        var speed = this.Sonic.speed * dt;

        // Define the boundaries
        var halfSize = this.planeSize / 2;
        var minX = -halfSize + speed;
        var maxX = halfSize - speed;
        var minZ = -halfSize + speed;
        var maxZ = halfSize - speed;

        // Adjust the speed based on the boundaries
        if (position.x < minX) {
            this.Sonic.mesh.position.x = minX;
        } else if (position.x > maxX) {
            this.Sonic.mesh.position.x = maxX;
        }

        if (position.z < minZ) {
            this.Sonic.mesh.position.z = minZ;
        } else if (position.z > maxZ) {
            this.Sonic.mesh.position.z = maxZ;
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
}

var clock = new THREE.Clock();
Main.init();
requestAnimationFrame(animate);
function animate() {
    Main.render(clock.getDelta());
    requestAnimationFrame(animate);
}
