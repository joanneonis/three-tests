/* eslint-disable no-unused-vars */
import * as dat from 'dat.gui';
import * as THREE from 'three';

import 'three/examples/js/controls/OrbitControls';
import 'three/examples/js/loaders/GLTFLoader';
import 'three/examples/js/AnimationClipCreator';

import { setlightType, buildGui, changeLightType } from '../../helpers/functions/lights';
// let json = require('/Users/Documents/workspace/test.json');


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

var model;
let meshes = [];
let theData;
let GridSize = 10;

function init() {

	initRenderer();

	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
	camera.position.set(cameraSettings.cameraPos.x, cameraSettings.cameraPos.y, cameraSettings.cameraPos.z);
	
	initControls();

	
	scene.add(new THREE.AxesHelper(100));

	let bgColor = new THREE.Color('#a3e1fe');

	let ambient = new THREE.AmbientLight();
	scene.add(ambient);

	// let point = new THREE.PointLight();
	// scene.add(point);

	scene.background = bgColor;

	window.addEventListener('resize', onResize, false);

	scene.userData.activeLightSettings = { type: 'PointLight' };
	scene.userData.gui = gui;

	// Groundplane
	// var geometry = new THREE.PlaneGeometry( 5000, 2000, 32 );
	// var material = new THREE.MeshBasicMaterial( {color: new THREE.Color('#87CBEB'), side: THREE.DoubleSide} );
	// var plane = new THREE.Mesh( geometry, material );
	// plane.position.y = 0;
	// plane.rotation.x = -90 * (Math.PI / 180);
	// plane.receiveShadow = true;
	// plane.castShadow = false;
	// scene.add( plane );

	// var geometry = new THREE.BoxGeometry(10, 10, 10);
	// var material = new THREE.MeshBasicMaterial({
	// 	color: 0x00ff44
	// });
	// scene.add(new THREE.Mesh(geometry, material));

	setlightType('PointLight', scene);
	changeLightType('PointLight', scene);
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
}

function initGui() {
	gui = new dat.GUI();

	initCameraGui();
}

initGui();
init();
render();

loadJSON(function(response) {
// Parse JSON string into object
	theData = JSON.parse(response);

	console.log(theData);
	loadModelThingies();
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
	controls.enableKeys = false;
}

function loadModelThingies() {
	var loader = new THREE.GLTFLoader();

	loader.load('./models/piramidthing2.glb', function (gltf) {
		model = gltf.scene.children[2];

		createGrid(GridSize, GridSize, model);
	});
}

function setMorphGui(numbr, newMesh) {
	var expressions = Object.keys( newMesh.morphTargetDictionary );
	var expressionFolder = gui.addFolder(`blob ${numbr}`);
	
	for ( var i = 0; i < expressions.length; i++ ) {
		expressionFolder.add( newMesh.morphTargetInfluences, i, -1, 2, 0.01 ).name( expressions[ i ] );
	}
}

function initCameraGui() {
	var cameraFolder = gui.addFolder('Camera');
	cameraFolder.add(cameraSettings.cameraPos, 'x', -100, 100).onChange((val) => { camera.position.x = val });
	cameraFolder.add(cameraSettings.cameraPos, 'y', -100, 100).onChange((val) => { camera.position.y = val });
	cameraFolder.add(cameraSettings.cameraPos, 'z', -100, 100).onChange((val) => { camera.position.z = val });
	cameraFolder.add(cameraSettings, 'all', -100, 100, 0.1).onChange((val) => {
		camera.position.set(val, val, val);
	});
}

function createGrid(x, y, model) {
	let count = 0;
	var xDistance = 2.1;
	var zDistance = 2.1;

	//initial offset so does not start in middle.
	var xOffset = -GridSize;
	var yOffset = -GridSize;

	for (var i = 0; i < x; i++) {
		for (var j = 0; j < y; j++) {
			var newModel = model.clone();
			newModel.position.x = (xDistance * i) + xOffset;
			newModel.position.z = (zDistance * j) + yOffset;

			newModel.morphTargetInfluences[6] = THREE.Math.mapLinear((theData[i][2015 - j]) / 1000000, 0, 4.4, -1, 2);
			// console.log((theData[i][2015 - j]) / 1000000);
			newModel.morphTargetInfluences[2] = THREE.Math.mapLinear((theData[j][2015 - i]) / 1000000, 0, 4.4, -1, 1);
			// console.log(theData[i][2015 - j]);
			// // save meshes instead of adding to scene (for merging later)
			// meshes[count] = mesh;
			count++;
			setMorphGui(count, newModel);

			scene.add(newModel);
		}
	}
}



function loadJSON(callback) {   

	var xobj = new XMLHttpRequest();
			xobj.overrideMimeType("application/json");
	xobj.open('GET', './data/per-region.json', true); // Replace 'my_data' with the path to your file
	xobj.onreadystatechange = function () {
				if (xobj.readyState == 4 && xobj.status == "200") {
					// Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
					callback(xobj.responseText);
				}
	};
	xobj.send(null);  
}
