/* eslint-disable no-unused-vars */
import * as dat from 'dat.gui';
import * as THREE from 'three';

import 'three/examples/js/controls/OrbitControls';
import 'three/examples/js/loaders/GLTFLoader';
import 'three/examples/js/AnimationClipCreator';

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

var controls;
var tractorObj;

var blobbyMinSpeed = 0.1;
//? test
var tractor = {
	x: 0, y: 0,
	vx: 0, vy: 0,
	ax: 0, ay: 0,
	vr: 0, ar:0,
	sr: 0, r: 0,
	update: function(){
		if (scene.userData.model) {
			scene.userData.model.updateMatrix();
			scene.userData.model.position.z = this.x;
			scene.userData.model.position.x = this.y;
			scene.userData.model.rotation.z = (THREE.Math.degToRad(this.r));

			let currentDirection = Math.sign(this.vx);
			
			if (currentDirection !== 0 && Math.abs(this.vx) > blobbyMinSpeed) {
				tractorObj.morphTargetInfluences[0] = this.vx * 2;
			}

			if (currentDirection !== 0 && Math.abs(this.vr) > blobbyMinSpeed) {
				tractorObj.morphTargetInfluences[2] = this.vr / 5;
			}
		}
	}
};

var friction = 0.9;
var rFriction = 0.7;
var keys = [];
//? end

function init() {

	initRenderer();

	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
	camera.position.set(cameraPos.x, cameraPos.y, cameraPos.z);
	
	initControls();
	
	scene.add(new THREE.AxesHelper(10));

	let bgColor = new THREE.Color('#a3e1fe');

	scene.add(new THREE.AmbientLight());

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

	posCalcs();
}

function initGui() {
	gui = new dat.GUI();
	initCameraGui();
}

initGui();
init();
render();
loadModelThingies();

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

function loadModelThingies() {
	var loader = new THREE.GLTFLoader();

	loader.load('trekker-morph-5.glb', function (gltf) {
		var model = gltf.scene;

		
		tractorObj = model.children[0];

		scene.userData.model = tractorObj;
		var expressions = Object.keys( tractorObj.morphTargetDictionary );
		var expressionFolder = gui.addFolder('Blob');
		for ( var i = 0; i < expressions.length; i++ ) {
			expressionFolder.add( tractorObj.morphTargetInfluences, i, 0, 1, 0.01 ).name( expressions[ i ] );
		}

		scene.add( model );
	});
}

function initCameraGui() {
	var cameraFolder = gui.addFolder('Camera');
	cameraFolder.add(cameraPos, 'x', -100, 100).onChange((val) => { camera.position.x = val });
	cameraFolder.add(cameraPos, 'y', -100, 100).onChange((val) => { camera.position.y = val });
	cameraFolder.add(cameraPos, 'z', -100, 100).onChange((val) => { camera.position.z = val });
}

function posCalcs() {
	if (keys[37]) {
		tractor.ar -= 0.05;
		tractor.sr -= 0.05;
	} else if (keys[39]) {
		tractor.ar += 0.05;
		tractor.sr += 0.05;
	} else {
		tractor.ar = 0;
	}

	//thrust
	if(keys[38]){
		tractor.ax = Math.cos(tractor.sr) * 0.05;
		tractor.ay = Math.sin(tractor.sr) * 0.05;
	} else if(keys[40]) {
		tractor.ax = Math.cos(tractor.sr) * -0.05;
		tractor.ay = Math.sin(tractor.sr) * -0.05;
	} else {
		tractor.ax = 0;
		tractor.ay = 0;
	}

	updatePosition(tractor);
	tractor.update();
}

document.addEventListener('keydown', function(e){
	keys[e.which] = true;
});
document.addEventListener('keyup', function(e){
	keys[e.which] = false;
});

function applyFriction(obj){
	obj.vx *= friction;
	obj.vy *= friction;
	obj.vr *= rFriction;
}

function updatePosition(obj){
	//update velocity
	obj.vx += obj.ax;
	obj.vy += obj.ay;
	obj.vr += obj.ar;
	
	applyFriction(obj);
	
	//update position
	obj.x += obj.vx;
	obj.y += obj.vy;
	obj.r += obj.vr;
}
