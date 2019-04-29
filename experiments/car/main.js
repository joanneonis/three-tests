/* eslint-disable no-unused-vars */
import * as dat from 'dat.gui';
import * as THREE from 'three';
import 'three/examples/js/controls/OrbitControls';
import {
	SpotLight, 
	PointLight,
	HemisphereLight,
	DirectionalLight,
	AmbientLight
} from '../../helpers/classes/lights';

import {
	createObjects
} from '../../helpers/functions/basic-objects';

// helpers
import 'three/src/helpers/SpotLightHelper';
import 'three/src/helpers/DirectionalLightHelper';
import 'three/src/helpers/PointLightHelper';
import 'three/src/helpers/HemisphereLightHelper';
 
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

// TODO !as import 
let activeLightSettings = { type: 'Spotlight' };
// TODO end

var controls;

var ambulanceMesh;

function init() {

	initRenderer();
	
	scene = new THREE.Scene();
	
	camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 1, 1000);
	camera.position.set(0, 0, -300);
	
	initControls();

	var ambient = new THREE.AmbientLight(0xffffff, 0.1);
	scene.add(ambient);
	
	scene.add(new THREE.AxesHelper(10));

	var meshes = createObjects();
	for(let i = 2; i < meshes.length; i++) {
		scene.add(meshes[i]);
	}

	// ambulanceMesh = loadModel('Ambulance');
	// console.log(ambulanceMesh);
	// scene.add(ambulanceMesh);

	test();
	// mesh.castShadow = true;
	// controls.target.copy(meshes[0].position);

	window.addEventListener('resize', onResize, false);

	scene.userData.activeLightSettings = activeLightSettings;
	scene.userData.gui = gui;

	setlightType('SpotLight', scene);
	changeLightType('SpotLight', scene);
	buildGui(scene);
}

async function test() {
	let hoi = await loadModel('Ambulance');
	return hoi;
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
}

initGui();
init();
render();


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
