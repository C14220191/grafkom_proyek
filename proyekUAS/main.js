import * as THREE from 'three';
import {Sonic,SonicController, ThirdPersonCamera} from './sonic.js';


class Main {
    static init() {
        var canvasReference = document.getElementById("canvas");
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            canvas: canvasReference});
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0xffffff,1);
        this.renderer.shadowMap.enabled = true;


        //plane
        var plane = new THREE.Mesh(
            new THREE.PlaneGeometry(30,30),
            new THREE.MeshPhongMaterial({color: 0xcbcbcb})
        );
        this.scene.add(plane);
        plane.rotation.x = -Math.PI/2;
        plane.receiveShadow = true;
        plane.castShadow = true;


        var hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 1);
        hemiLight.position.set(0, 20, 0);
        this.scene.add(hemiLight);
        var hemiLightHelper = new THREE.HemisphereLightHelper(hemiLight, 1);
        this.scene.add(hemiLightHelper);

        //directional light
        var directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(3,10,10);
        directionalLight.castShadow = true;
        var directionalShadowHelper = new THREE.CameraHelper(directionalLight.shadow.camera);
        this.scene.add(directionalShadowHelper);
        var directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight, 1);
        this.scene.add(directionalLightHelper);
        this.scene.add(directionalLight);


        this.Sonic = new Sonic(
            new ThirdPersonCamera(
                this.camera, new THREE.Vector3(-5,5,0), new THREE.Vector3(0,0,0)),
            new SonicController,
            this.scene,
            1
        )
    }

    static render(dt){
        this.Sonic.update(dt);
        this.renderer.render(this.scene, this.camera);
    }
}
var clock = new THREE.Clock();
Main.init();
requestAnimationFrame(animate); 
function animate(){
    Main.render(clock.getDelta());
    requestAnimationFrame(animate); 
}
