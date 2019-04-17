/* eslint-disable no-unused-vars */
import * as dat from 'dat.gui';
import * as THREE from 'three';
import 'three/examples/js/controls/OrbitControls';
import {
	createObjects
} from '../lights/js/basicObjects';
 

//?--------------------------------------------------------------------
//?		Base
//?--------------------------------------------------------------------

var renderer,
		scene,
		theCanvas = document.getElementById('gl-canvas');

var gui;
var controls;

var cameras = {
	PerspectiveCamera: null,
	OrthographicCamera: null,
	active : 'OrthographicCamera',
	x: 300,
	y: 300,
	z: 300,
	allAxes: 300,
};

function init() {

	initRenderer();
	
	scene = new THREE.Scene();
	
	cameras.PerspectiveCamera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 1, 1000);
	cameras.PerspectiveCamera.position.set(cameras.x, cameras.y, cameras.z);

	cameras.OrthographicCamera = new THREE.OrthographicCamera(window.innerWidth / - 2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, 1, 1000);
	cameras.OrthographicCamera.zoom = 2.8;
	cameras.OrthographicCamera.updateProjectionMatrix();
	cameras.OrthographicCamera.position.set(cameras.x, cameras.y, cameras.z);
	
	initControls();

	// Rise from the dark
	var ambient = new THREE.AmbientLight(0xffffff, 0.4);
	scene.add(ambient);
	scene.add(new THREE.AxesHelper(10));

	var light = new THREE.HemisphereLight( "rgb(255, 255, 255)", "rgb(40, 40, 40)", .4 );
	scene.add( light );

	// Add some basic shapes
	var meshes = createObjects();
	for(let i = 0; i < meshes.length; i++) {
		scene.add(meshes[i]);
	}

	controls.target.copy(meshes[0].position);
	controls.update();

	window.addEventListener('resize', onResize, false);
}

function onResize() {
	cameras[cameras.active].aspect = window.innerWidth / window.innerHeight;
	cameras[cameras.active].updateProjectionMatrix();

	renderer.setSize(window.innerWidth, window.innerHeight);
}

function render() {
	// TODO update camera?
	renderer.render(scene, cameras[cameras.active]);
}

function initGui() {
	gui = new dat.GUI();
	gui.add(
		cameras,
		'active',
		['OrthographicCamera', 'PerspectiveCamera'] 
	)
	.onChange((val) => {
		// TODO set activeCamera
		init();
		render();
	});

	gui.add(
		cameras,
		'x',
		-500, 500
	)
	.onChange((val) => {
		cameras.x = val;
		cameras[cameras.active].position.x = val;
		render();
	});
	gui.add(
		cameras,
		'y',
		-500, 500
	)
	.onChange((val) => {
		cameras.y = val;
		cameras[cameras.active].position.y = val;
		render();
	});
	gui.add(
		cameras,
		'z',
		-500, 500
	)
	.onChange((val) => {
		cameras.z = val;
		cameras[cameras.active].position.z = val;
		render();
	});

	gui.add(
		cameras,
		'allAxes',
		-500, 500
	)
	.onChange((val) => {
		cameras.z = val;
		cameras.y = val;
		cameras.x = val;

		cameras[cameras.active].position.set(val, val, val);
		render();
	});

	
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
}

function initControls() {
	controls = new THREE.OrbitControls(cameras[cameras.active], renderer.domElement);
	controls.addEventListener('change', render);
	controls.minDistance = 0;
	controls.maxDistance = 700;
	controls.enablePan = true;
}


