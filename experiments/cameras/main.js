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
		camera,
		theCanvas = document.getElementById('gl-canvas');

var gui;
var activeCameraType = { type : 'PerspectiveCamera' };

var controls;

function init() {

	initRenderer();
	
	scene = new THREE.Scene();
	
	camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 1, 1000);
	camera.position.set(0, 0, -300);
	
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
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize(window.innerWidth, window.innerHeight);
}

function render() {
	// TODO update camera?
	renderer.render(scene, camera);
}

function initGui() {
	gui = new dat.GUI();
	gui.add(
		activeCameraType,
		'type',
		['OrthographicCamera', 'PerspectiveCamera'] 
	)
	.onChange((val) => {
		// TODO set activeCamera
		render();
	}
	);
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
	controls = new THREE.OrbitControls(camera, renderer.domElement);
	controls.addEventListener('change', render);
	controls.minDistance = 0;
	controls.maxDistance = 700;
	controls.enablePan = true;
}