/* eslint-disable no-unused-vars */
import * as dat from 'dat.gui';
import * as THREE from 'three';
import 'three/examples/js/controls/OrbitControls';

import {
	createObjects
} from '../../helpers/functions/basic-objects';


import 'three/examples/js/loaders/GLTFLoader';

import 'three/examples/js/AnimationClipCreator';

// import { loadModel } from '../../helpers/functions/load-model';
import { setlightType, buildGui, changeLightType } from '../../helpers/functions/lights';
// import { SpotLight } from '../../helpers/classes/lights';

//?--------------------------------------------------------------------
//?		Base
//?--------------------------------------------------------------------

var renderer,
		scene,
		camera,
		theCanvas = document.getElementById('gl-canvas');

var gui;
var cameraPos = {x: 58, y: 36, z: 36};

var controls;
let animation;

let mixer;

let sceneTest;

var clock = new THREE.Clock();

function init() {

	initRenderer();

	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
	camera.position.set(cameraPos.x, cameraPos.y, cameraPos.z);
	
	initControls();
	
	scene.add(new THREE.AxesHelper(10));

	let bgColor = new THREE.Color('#a3e1fe');

	var meshes = createObjects();
	for(let i = 0; i < meshes.length; i++) {
		meshes[i].material.color = bgColor;
		scene.add(meshes[i]);
	}

	scene.background = bgColor;

	window.addEventListener('resize', onResize, false);

	scene.userData.activeLightSettings = { type: 'Spotlight' };
	scene.userData.gui = gui;

	setlightType('HemisphereLight', scene);
	changeLightType('HemisphereLight', scene);
	buildGui(scene);
}


function onResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize(window.innerWidth, window.innerHeight);
}

function render() {
	// controls.update();

	requestAnimationFrame(render);
	renderer.render(scene, camera);

	var dt = clock.getDelta()
	if (mixer) { mixer.update(dt); }
}

function initGui() {
	gui = new dat.GUI();
}

initGui();
init();
render();
test();

function initRenderer() {
	renderer = new THREE.WebGLRenderer({
		canvas: theCanvas, 
		antialias: true
	});
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap;
}

function initControls() {
	controls = new THREE.OrbitControls(camera, renderer.domElement);
	controls.minDistance = 0;
	controls.maxDistance = 700;
	controls.enableKeys = false;
}

function test() {
	var loader = new THREE.GLTFLoader();
	loader.load('v0-MDD-2.glb', function (gltf) {
	
		// mixer = new THREE.AnimationMixer( mesh );
		// mixer.clipAction( gltf.animations[ 0 ] ).setDuration( 1 ).play();
		
		// console.log(gltf.animations[0]);

		var model = gltf.scene;
		mixer = new THREE.AnimationMixer(model);
		// var clip1 = gltf.animations[0];
		// gltf.animations[1] = THREE.AnimationClipCreator.CreatePulsationAnimation(10, .8);

		// var track1 = gltf.animations[0].tracks[0].clone();
		// track1.values = track1.values.slice(0, 40);
		// track1.times = track1.times.slice(0, 40);
		
		var sceneLength = gltf.animations[0].duration;
		var frameDuration = sceneLength / 160;

		var animationBase = gltf.animations[0].tracks[0].clone();
		var animationBase2 = gltf.animations[0].tracks[0].clone();

		console.log();
		var clip1test = new THREE.AnimationClip( 'forwards', sceneLength / 4, [  animationBase.trim(frameDuration, frameDuration * 40) ] );
		var clip2test = new THREE.AnimationClip( 'backwards', sceneLength / 4, [  animationBase2.trim(frameDuration + frameDuration * 40, frameDuration * 80).shift( -(frameDuration + frameDuration * 40) ) ] );

		console.log('trimthis', clip2test);
		// clip2test.duration = sceneLength / 4;
		// gltf.animations[3] = new THREE.AnimationClip( 'right', sceneLength / 4, [  animationBase.clone().trim(frameDuration + frameDuration * 80, frameDuration * 120) ] );
		// gltf.animations[4] = new THREE.AnimationClip( 'left', sceneLength / 4, [  animationBase.clone().trim(frameDuration + frameDuration * 120, frameDuration * 160) ] );

		var action1 = mixer.clipAction(clip1test);
		var action2 = mixer.clipAction(clip2test);
		// var action3 = mixer.clipAction(gltf.animations[2]);
		// var action4 = mixer.clipAction(gltf.animations[3]);
		// var action5 = mixer.clipAction(gltf.animations[4]);


		// var track2 = gltf.animations[0].tracks[0].clone();
		// track2.values = track2.values.slice(40, 80);
		// track2.times = track2.times.slice(40, 80);

		// var track3 = gltf.animations[0].tracks[0].clone();
		// track3.values = track3.values.slice(80, 120);
		// track3.times = track3.times.slice(80, 120);

		// gltf.animations[0].tracks.push(track1, track2, track3);

		// gltf.animations[0].tracks[0] = gltf.animations[0].tracks[0].trim(0,4);

		// action1.play();
		action1.play();

		console.log(frameDuration * 10, gltf);


		scene.add( model );
	});
}

// mixer.addEventListener( 'loop', (a) => {
// 	console.log('a', a);
// } );

function createAction() {

}