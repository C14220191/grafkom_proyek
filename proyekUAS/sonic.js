import * as THREE from 'three';
import {FBXLoader} from 'three/addons/loaders/FBXLoader.js';

export class Sonic{
    constructor(camera, scene, speed){
        this.camera = camera;
        // this.controller = controller;
        this.scene = scene;
        this.speed = speed;
        this.rotationVector = new THREE.Vector3();

        this.state = 'idle';
        this.animations = {};
        
        this.camera.setup(new THREE.Vector3(0, 0, 0),this.rotationVector);
        this.loadModel();
    }

    loadModel(path){
        var loader = new FBXLoader();
        loader.setPath('./resources/');
        loader.load('Looking Around.fbx', (fbx) => {
            fbx.scale.setScalar(0.01);
            fbx.traverse(c => {
                c.castShadow = true;
                c.receiveShadow = true;
            });
            this.mesh = fbx;
            this.scene.add(this.mesh);
            this.rotationVector.y = Math.PI/2;

            this.mixer = new THREE.AnimationMixer(this.mesh);
            var onLoad =(animName, anim) => {
                var clip = anim.animations[0];
                var action = this.mixer.clipAction(clip);
                this.animations[animName] = {
                    clip:clip,
                    action:action
                };
            };   
            var loader = new FBXLoader();
            loader.setPath('./resources/');
            loader.load('Looking Around.fbx', (fbx) => {onLoad('idle', fbx)});
            loader.load('Running.fbx', (fbx) => {onLoad('start', fbx)});
        });
    }
    update(dt){}
}

export class ThirdPersonCamera{
    constructor(camera, positionOffset, targetOffset){
        this.camera = camera;
        this.positionOffset = positionOffset;
        this.targetOffset = targetOffset;
    }
    setup(target, angle){
        var temp = new THREE.Vector3();
        temp.copy(this.positionOffset);
        temp.applyAxisAngle(new THREE.Vector3(0,1,0), angle.y);
        temp.applyAxisAngle(new THREE.Vector3(0,0,1), angle.z);

        temp.addVectors(target, temp);
        this.camera.position.copy(temp);


        temp = new THREE.Vector3();
        temp.addVectors(target, this.targetOffset);
        this.camera.lookAt(temp);

    }
}