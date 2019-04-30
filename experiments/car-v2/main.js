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
		var model = gltf.scene;
		mixer = new THREE.AnimationMixer(model);
		
		var clips = ['forwards', 'backwards', 'right', 'left'];
		var stepLength = 40;
		var actions = new Array(4);

		for (let i = 0; i < clips.length; i++) {
			actions[i] = mixer.clipAction(
				createAction(i, clips[i], gltf.animations[0], stepLength)
			);
		}

		actions[2].play();

		scene.add( model );
	});
}

// mixer.addEventListener( 'loop', (a) => {
// 	console.log('a', a);
// } );

function createAction(index, name, animation, step) {
	let baseTrack = animation.tracks[0];
	let sceneLength = animation.duration;
	let frameDuration = sceneLength / 160;
	let i = index + 1;
	let skipStep = i * step;
	let prevSkipStep = index * step;

	let track = baseTrack.clone().trim(frameDuration + (frameDuration * prevSkipStep), skipStep);
	
	if (index > 0) {
		track.shift(-(frameDuration + frameDuration * prevSkipStep));
	}

	let clip = new THREE.AnimationClip( 
		name, 
		sceneLength / 4, 
		[  
			track
		] 
	);

	return clip;
}