/* eslint-disable no-unused-vars */
import * as dat from 'dat.gui';
import * as THREE from 'three';
import 'three/examples/js/controls/OrbitControls';
import 'three/examples/js/loaders/GLTFLoader';

let renderer,
scene,
camera,
gui,
controls,
theCanvas = document.getElementById('gl-canvas');

let gltfScene;

function init() {
	initRenderer();
	
	scene = new THREE.Scene();
	
	camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000);
	camera.position.z = 5;
	
	initControls();
	
	var light = new THREE.DirectionalLight(0xffffff, 1);
	light.position.set(5,3,5);
	scene.add(light);
	
	// scene.background = new THREE.Color( params.bgColor.bgColor);
	window.addEventListener('resize', onResize, false);
}

function onResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize(window.innerWidth, window.innerHeight);
}


function render() {
	controls.update();
	updateRandomPos();

	requestAnimationFrame(render);
	renderer.render(scene, camera);
}

function initGui() {
	gui = new dat.GUI();

	// gui.add(
	// 	presets,
	// 	'type',
	// 	['dots', 'shade'] 
	// )
	// .onChange((val) => {
	// 	updatePresets(val); 
	// });
}


init();
render();
initGui();
loadModelThingies();

function initRenderer() {
	renderer = new THREE.WebGLRenderer({
		canvas: theCanvas, 
		antialias: true
	});
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
}


function initControls() {
	controls = new THREE.OrbitControls(camera, renderer.domElement); //? NO trackball for gui issues
	// controls.addEventListener('change', render); //? needed if theres no loop going on
	controls.minDistance = 0;
	controls.maxDistance = 700;
	// controls.enablePan = true;
} 
// ./models/test-1.glb

function loadModelThingies() {
	var loader = new THREE.GLTFLoader();

	loader.load(
		// resource URL
		'./models/test-2.glb',
		// called when the resource is loaded
		function ( gltf ) {

			gltf.scene.children.splice(0, 3);
			// console.log(gltf.scene.children);
			scene.add( gltf.scene );
			// scene.userdata.modelParts = gltf.scene.children;

			// gltf.animations; // Array<THREE.AnimationClip>
			// gltf.scene; // THREE.Scene
			// gltf.scenes; // Array<THREE.Scene>
			// gltf.cameras; // Array<THREE.Camera>
			// gltf.asset; // Object
	
		},
		// called while loading is progressing
		function ( xhr ) {
			console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
		},
		// called when loading has errors
		function ( error ) {
			console.log( 'An error happened', error );
		}
	);
}

function updateRandomPos() {
	var objectScene = scene.children[1];

	if (!objectScene) { return; }

	console.log(objectScene.children.length);
	for (let i = 0; i < objectScene.children.length; i++) {
		let axis = getRandomAxis();
		
		objectScene.children[i].rotation.x += Math.random()*0.01;
		objectScene.children[i].rotation.z += Math.random()*0.01;
		// objectScene.children[i].position.x += 0.001;
		// objectScene.children[i].position.y += 0.001;
	}
} 

function getRandomAxis() {
  return new THREE.Vector3(
    Math.random() - 0.5,
    Math.random() - 0.5,
    Math.random() - 0.5
  ).normalize();
}