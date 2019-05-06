/* eslint-disable no-unused-vars */
import '../../assets/base.scss';
import Prism from 'prismjs';

import * as dat from 'dat.gui';
import * as THREE from 'three';

import 'three/examples/js/controls/OrbitControls';
import 'three/examples/js/loaders/GLTFLoader';
import 'three/examples/js/AnimationClipCreator';

import { setlightType, buildGui, changeLightType } from '../../helpers/functions/lights';

Prism.highlightAll();

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
var wheelObjects;

var blobbyMinSpeed = 0.1;
//? test
var tractor = {
	x: 0, y: 0,
	vx: 0, vy: 0,
	ax: 0, ay: 0,
	vr: 0, ar:0,
	sr: 0, r: 0,
	update: function(){
		if (tractorObj) {
			this.vx = THREE.Math.clamp(this.vx, -1.0, 1.0); //float (-1) otherwise it will see it as a boolean
			this.vy = THREE.Math.clamp(this.vy, -1.0, 1.0);
			this.vr = THREE.Math.clamp(this.vr, -10.0, 10.0);

			let rotation = THREE.Math.degToRad(this.vr) * 10; // !
			
			rotateObject(tractorObj.parent, 0, rotation, 0);
			tractorObj.parent.translateZ(this.vx);
			
			wheelObjects[0].rotation.x += (THREE.Math.degToRad(this.vx) * 10);
			wheelObjects[1].rotation.x += (THREE.Math.degToRad(this.vx) * 10);
			
			var smallerVr = THREE.Math.clamp(this.vr, -1.0, 1.0);
			var newX = THREE.Math.degToRad(this.x) * 10; // Rolling
			var newY = THREE.Math.degToRad(this.vr) * 2; // Steering
			
			// XZY (fix the gimbal problem  =)
			var euler = new THREE.Euler( newX, newY, 0, 'YXZ' );
			wheelObjects[2].setRotationFromEuler(euler);
		
			if (Math.abs(this.vx) > blobbyMinSpeed) {
				tractorObj.morphTargetInfluences[0] = this.vx;
				tractorObj.morphTargetInfluences[2] = this.vr * 0.1;
			}
		}
	}
};

var friction = 0.9;
var rFriction = 0.9;
var keys = [];
//? end

function init() {

	initRenderer();

	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
	camera.position.set(cameraPos.x, cameraPos.y, cameraPos.z);
	
	initControls();

	
	// scene.add(new THREE.AxesHelper(10));

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

	loader.load('trekker-morph-1-multipart.glb', function (gltf) {
		var model = gltf.scene;

		
		tractorObj = model.children[0];
		wheelObjects = [model.children[1], model.children[2], model.children[3]];

		// plaeObj(wheelObjects[2]);
		resetWheel();
		plaeObj(wheelObjects[2]);
		
		var expressions = Object.keys( tractorObj.morphTargetDictionary );
		var expressionFolder = gui.addFolder('Blob');
		for ( var i = 0; i < expressions.length; i++ ) {
			expressionFolder.add( tractorObj.morphTargetInfluences, i, 0, 1, 0.01 ).name( expressions[ i ] );
		}
		tractorObj.userData.velocity = 0;
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
		tractor.ar += 0.05;
		tractor.sr += 0.05;
	} else if (keys[39]) {
		tractor.ar -= 0.05;
		tractor.sr -= 0.05;
	} else {
		tractor.ar = 0;
	}

	//thrust
	if(keys[38]){
		// tractor.ax = Math.cos(tractor.sr) * 0.05;
		// tractor.ay = Math.sin(tractor.sr) * 0.05;
		tractor.ax += 0.005;
		tractor.ay += 0.005;
	} else if(keys[40]) {
		tractor.ax -= 0.005;
		tractor.ay -= 0.005;
		// tractor.ax = Math.cos(tractor.sr) * -0.05;
		// tractor.ay = Math.sin(tractor.sr) * -0.05;
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

function plaeObj(object) {
	var objFolder = gui.addFolder('place');
	objFolder.add(object.position, 'x', -10, 10, .3);
	objFolder.add(object.position, 'y', -10, 10, .3);
	objFolder.add(object.position, 'z', -10, 10, .3);
	objFolder.add(object.rotation, 'x', -10, 10, .3);
	objFolder.add(object.rotation, 'y', -10, 10, .3);
	objFolder.add(object.rotation, 'z', -10, 10, .3);
}

function resetWheel() {
	wheelObjects[0].geometry.center();
	wheelObjects[1].geometry.center();
	wheelObjects[2].geometry.center();
	
	wheelObjects[0].position.set(3.6, 3.4, -4.8);
	wheelObjects[1].position.set(-3.6, 3.9, -5.4);
	wheelObjects[2].position.set(0, 2.1, 4.5);
}


function rotateObject(object, degreeX = 0, degreeY = 0, degreeZ = 0) {
  object.rotateX(THREE.Math.degToRad(degreeX));
  object.rotateY(THREE.Math.degToRad(degreeY));
	object.rotateZ(THREE.Math.degToRad(degreeZ));
} 

// Rotate an object around an arbitrary axis in object space
var rotObjectMatrix;
function rotateAroundObjectAxis(object, axis, radians) {
    rotObjectMatrix = new THREE.Matrix4();
    rotObjectMatrix.makeRotationAxis(axis.normalize(), radians);

    // old code for Three.JS pre r54:
    // object.matrix.multiplySelf(rotObjectMatrix);      // post-multiply
    // new code for Three.JS r55+:
    object.matrix.multiply(rotObjectMatrix);

    // old code for Three.js pre r49:
    // object.rotation.getRotationFromMatrix(object.matrix, object.scale);
    // old code for Three.js r50-r58:
    // object.rotation.setEulerFromRotationMatrix(object.matrix);
    // new code for Three.js r59+:
    object.rotation.setFromRotationMatrix(object.matrix);
}

var rotWorldMatrix;
// Rotate an object around an arbitrary axis in world space       
function rotateAroundWorldAxis(object, axis, radians) {
    rotWorldMatrix = new THREE.Matrix4();
    rotWorldMatrix.makeRotationAxis(axis.normalize(), radians);

    // old code for Three.JS pre r54:
    //  rotWorldMatrix.multiply(object.matrix);
    // new code for Three.JS r55+:
    rotWorldMatrix.multiply(object.matrix);                // pre-multiply

    object.matrix = rotWorldMatrix;

    // old code for Three.js pre r49:
    // object.rotation.getRotationFromMatrix(object.matrix, object.scale);
    // old code for Three.js pre r59:
    // object.rotation.setEulerFromRotationMatrix(object.matrix);
    // code for r59+:
    object.rotation.setFromRotationMatrix(object.matrix);
}