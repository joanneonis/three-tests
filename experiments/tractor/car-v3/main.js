/* eslint-disable no-unused-vars */
import '../../../assets/base.scss';
import Prism from 'prismjs';

import * as dat from 'dat.gui';
import * as THREE from 'three';

import 'three/examples/js/controls/OrbitControls';
import 'three/examples/js/loaders/GLTFLoader';
import 'three/examples/js/AnimationClipCreator';

import { setlightType, buildGui, changeLightType } from '../../../helpers/functions/lights';

Prism.highlightAll();

var panelToggle = document.querySelector('.panel-toggle');
var body = document.querySelector('body');
var panelOpen = false;

panelToggle.onclick = function() {
	body.classList.toggle('panel-open');
	
	panelOpen = !panelOpen;

	if (panelOpen) {
		panelToggle.textContent = 'Sluit proces';
	} else {
		panelToggle.textContent = 'Lees proces';
	}
}

//?--------------------------------------------------------------------
//?		Base
//?--------------------------------------------------------------------

var renderer,
		scene,
		camera,
		theCanvas = document.getElementById('gl-canvas');

var gui;

var cameraSettings = {
	cameraPos: {x: 58, y: 36, z: 36},
	followTractor: false,
	lookAt: true,
	all: 30,
};

var controls;
var tractorObj;
var wheelObjects;

var goal;
var temp = new THREE.Vector3;

var model;

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

			let rotation = THREE.Math.degToRad(this.vr) * 10;
			
			rotateObject(tractorObj.parent, 0, rotation, 0);
			tractorObj.parent.translateZ(this.vx);
			
			wheelObjects[0].rotation.x += (THREE.Math.degToRad(this.vx) * 10);
			wheelObjects[1].rotation.x += (THREE.Math.degToRad(this.vx) * 10);
			
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
	camera.position.set(cameraSettings.cameraPos.x, cameraSettings.cameraPos.y, cameraSettings.cameraPos.z);
	
	initControls();

	
	// scene.add(new THREE.AxesHelper(10));

	let bgColor = new THREE.Color('#a3e1fe');

	let ambient = new THREE.AmbientLight();
	// ambient.castShadow = true;
	scene.add(ambient);

	let point = new THREE.PointLight();
	// ambient.castShadow = true;
	scene.add(point);

	scene.background = bgColor;

	window.addEventListener('resize', onResize, false);

	scene.userData.activeLightSettings = { type: 'Spotlight' };
	scene.userData.gui = gui;

	// Groundplane
	var geometry = new THREE.PlaneGeometry( 5000, 2000, 32 );
	var material = new THREE.MeshBasicMaterial( {color: new THREE.Color('#87CBEB'), side: THREE.DoubleSide} );
	var plane = new THREE.Mesh( geometry, material );
	plane.position.y = 0;
	plane.rotation.x = -90 * (Math.PI / 180);
	plane.receiveShadow = true;
	plane.castShadow = false;
	scene.add( plane );

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

	if (goal && cameraSettings.followTractor) {
		temp.setFromMatrixPosition(goal.matrixWorld);
    
		camera.position.lerp(temp, 0.2);
		
		if (cameraSettings.lookAt) {
			camera.lookAt( model.position );
		}
	}
	
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
		model = gltf.scene;

		model.traverse( function( node ) {
			if ( node instanceof THREE.Mesh ) { node.castShadow = true; node.receiveShadow = false; }
		} );
		
		tractorObj = model.children[0];
		wheelObjects = [model.children[1], model.children[2], model.children[3]];

		goal = new THREE.Object3D;
		goal.position.set(20, 20, 20);
    
    model.add( goal );

		// plaeObj(wheelObjects[2]);
		resetWheel();
		plaeObj(wheelObjects[2]);
		
		var expressions = Object.keys( tractorObj.morphTargetDictionary );
		var expressionFolder = gui.addFolder('Blob');
		for ( var i = 0; i < expressions.length; i++ ) {
			expressionFolder.add( tractorObj.morphTargetInfluences, i, 0, 1, 0.01 ).name( expressions[ i ] );
		}
		tractorObj.userData.velocity = 0;

		model.castShadow = true;
		scene.add( model );
	});
}

function initCameraGui() {
	var cameraFolder = gui.addFolder('Camera');
	cameraFolder.add(cameraSettings, 'followTractor');
	cameraFolder.add(cameraSettings, 'lookAt');
	cameraFolder.add(cameraSettings.cameraPos, 'x', -100, 100).onChange((val) => { camera.position.x = val });
	cameraFolder.add(cameraSettings.cameraPos, 'y', -100, 100).onChange((val) => { camera.position.y = val });
	cameraFolder.add(cameraSettings.cameraPos, 'z', -100, 100).onChange((val) => { camera.position.z = val });
	cameraFolder.add(cameraSettings, 'all', -100, 100, 0.1).onChange((val) => {
		camera.position.set(val, val, val);

		if (cameraSettings.followTractor) {
			goal.position.set(val, val, val);
		}
	});
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

	if(keys[38]){
		tractor.ax += 0.005;
		tractor.ay += 0.005;
	} else if(keys[40]) {
		tractor.ax -= 0.005;
		tractor.ay -= 0.005;
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
