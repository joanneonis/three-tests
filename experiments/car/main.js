/* eslint-disable no-unused-vars */
import * as dat from 'dat.gui';
import * as THREE from 'three';
import 'three/examples/js/controls/OrbitControls';

import {
	createObjects
} from '../../helpers/functions/basic-objects';

import { loadModel } from '../../helpers/functions/load-model';
import { setlightType, buildGui, changeLightType } from '../../helpers/functions/lights';

//?--------------------------------------------------------------------
//?		Base
//?--------------------------------------------------------------------

var renderer,
		scene,
		camera,
		theCanvas = document.getElementById('gl-canvas');

var gui;
var cameraPos = {x: 58, y: 36, z: 36};

// TODO !as import 
// let activeLightSettings = { type: 'Spotlight' };
// TODO end

var controls;

var ambulanceInit = {
	x: 0, y: 0,
	vx: 0, vy: 0,
	ax: 0, ay: 0,
	r: 0,
	direction: null,
}
var friction = 0.97;

function init() {

	initRenderer();
	
	scene = new THREE.Scene();
	
	camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
	camera.position.set(cameraPos.x, cameraPos.y, cameraPos.z);
	
	initControls();
	
	scene.add(new THREE.AxesHelper(10));

	var meshes = createObjects(0);
	for(let i = 2; i < meshes.length; i++) {
		scene.add(meshes[i]);
	}

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
	controls.update();

	requestAnimationFrame(render);
	renderer.render(scene, camera);


	if(activeKey === 'ArrowUp'){
		scene.userData.ambulanceMesh.userData.direction = 'forwards';
		scene.userData.ambulanceMesh.userData.ax = Math.cos(0) * 0.05;
		scene.userData.ambulanceMesh.userData.ay = Math.sin(0) * 0.05;
	} 
	if(activeKey === 'ArrowDown'){
		scene.userData.ambulanceMesh.userData.direction = 'backwards';
		scene.userData.ambulanceMesh.userData.ax = Math.cos(0) * 0.05;
		scene.userData.ambulanceMesh.userData.ay = Math.sin(0) * 0.05;
	} 
	if (activeKey === null) {
		scene.userData.ambulanceMesh.userData.ax = 0;
		scene.userData.ambulanceMesh.userData.ay = 0;
	}

	updatePosition(scene.userData.ambulanceMesh);
}

function initGui() {
	gui = new dat.GUI();

	// gui.add(cameraPos, 'x', -1000, 1000).onChange((val) => { camera.position.x = val });
	// gui.add(cameraPos, 'y', -1000, 1000).onChange((val) => { camera.position.y = val });
	// gui.add(cameraPos, 'z', -1000, 1000).onChange((val) => { camera.position.z = val });
}

initGui();
init();
loadModel('Ambulance').then((a) => {
	a.matrixWorldNeedsUpdate = true;
	// a.position.y = 3;

	a.children[0].castShadow = true; // only works when is single mesh

	scene.add(a);
	scene.userData.ambulanceMesh = a;
	scene.userData.ambulanceMesh.userData = ambulanceInit;

	render();
});


var activeKey;

document.addEventListener('keydown', function(e){
	activeKey = e.code;
});
document.addEventListener('keyup', function(e){
	activeKey = null;
});

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
	// controls.enablePan = true;
}

function updatePosition(obj){
	//update velocity
	if (scene.userData.ambulanceMesh.userData.direction === 'forwards') {
		obj.userData.vx += obj.userData.ax;
		obj.userData.vy += obj.userData.ay;
	} else if (scene.userData.ambulanceMesh.userData.direction === 'backwards'){
		obj.userData.vx -= Math.abs(obj.userData.ax);
		obj.userData.vy -= Math.abs(obj.userData.ay);
	}
	
	applyFriction(obj);

	if (scene.userData.ambulanceMesh.userData.direction === 'forwards') {
		obj.userData.x += obj.userData.vx;
		obj.position.z += obj.userData.vx;
	} else if (scene.userData.ambulanceMesh.userData.direction === 'backwards'){
		obj.userData.x -= Math.abs(obj.userData.vx);
		obj.position.z -= Math.abs(obj.userData.vx);
	}

	console.log( obj.userData.vx);
}

function applyFriction(obj){
	obj.userData.vx *= friction;
	obj.userData.vy *= friction;
}

// document.addEventListener('keydown', function(event){
// 	if(event.keyCode === 87) {
// 		// ambulanceTranslates[0] += 1;
// 		// scene.userData.ambulanceMesh.position.x += .1;
// 		// scene.userData.ambulanceMesh.updateMatrix();

// 		// scene.userData.ambulanceMesh.translateZ(1);
// 		// scene.userData.ambulanceMesh.userData.ax = Math.cos(spaceship.r) * 0.05;
// 		updatePosition(scene.userData.ambulanceMesh);
// 	}
// 	if(event.keyCode === 83) {
// 		// ambulanceTranslates[0] -= 1;
// 	}
// } );

