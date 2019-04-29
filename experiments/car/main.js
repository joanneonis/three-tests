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
let activeLightSettings = { type: 'Spotlight' };
// TODO end

var controls;

var ambulanceMesh;

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

	scene.userData.activeLightSettings = activeLightSettings;
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

	render();
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
	controls.enablePan = true;
}
