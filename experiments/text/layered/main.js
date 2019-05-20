/* eslint-disable no-unused-vars */
import * as dat from 'dat.gui';
import * as THREE from 'three';
import 'three/examples/js/controls/OrbitControls';
import 'three/examples/js/loaders/OBJLoader';

// import 'three/examples/js/SimplexNoise'; ?couldnt get this to work
import 'three/examples/js/shaders/SSAOShader';
import 'three/examples/js/postprocessing/EffectComposer';
import 'three/examples/js/postprocessing/ShaderPass';
import 'three/examples/js/postprocessing/SSAOPass';
import 'three/examples/js/shaders/CopyShader';

import TWEEN from '@tweenjs/tween.js';
 
import {
	SpotLight, 
	PointLight,
	HemisphereLight,
	DirectionalLight,
	AmbientLight
} from '../../../helpers/classes/lights';

import { setlightType, buildGui, changeLightType } from '../../../helpers/functions/lights';

// helpers
import 'three/src/helpers/SpotLightHelper';
import 'three/src/helpers/DirectionalLightHelper';
import 'three/src/helpers/PointLightHelper';
import 'three/src/helpers/HemisphereLightHelper';

let renderer,
		scene,
		camera,
		gui,
		controls,
		theCanvas = document.getElementById('gl-canvas');

var effectComposer;
var ssaoPass;

var letters;

function init() {
	initRenderer();
	
	scene = new THREE.Scene();
	
	camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000);
	camera.position.set(100, 100, 200);
	
	initControls();
	
	var ambientLight = new THREE.AmbientLight(0xffffff, .5);
	ambientLight.position.set(0,133,73);
	scene.add(ambientLight);

	var pointLight = new THREE.PointLight(0xffffff, 2, 200, .5);
	pointLight.position.set(7,80,67);
	pointLight.castShadow = true; 
	pointLight.shadow.mapSize.width = 2048;
	pointLight.shadow.mapSize.height = 2048;
	scene.add(pointLight);

	// effectComposerStuff();
	// initLightGuiBuilder();

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

initGui();
init();
render();

function initRenderer() {
	renderer = new THREE.WebGLRenderer({
		canvas: theCanvas, 
		antialias: true,
	});

	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap; 

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

loadModel();
function loadModel() {

	var onProgress = function ( xhr ) {
		if ( xhr.lengthComputable ) {
			var percentComplete = xhr.loaded / xhr.total * 100;
			console.log( Math.round( percentComplete, 2 ) + '% downloaded' );
		}
	};

	var onError = function (e) {
		console.log(e);
	};

	// load a resource
	var loader = new THREE.OBJLoader();

	loader.load(
		// resource URL
		'./models/levels-connected.obj',
		// called when resource is loaded
		function ( object ) {
			letters = object;

			object.children.forEach(element => {
				element.castShadow = true; 
				element.receiveShadow = true;
			});

			scene.add( letters );
			animateLetters(letters);
		},
		// called when loading is in progresses
		function ( xhr ) {
			console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
		},
		// called when loading has errors
		function ( error ) {
			console.log( 'An error happened' );
		}
	);
}

function initLightGuiBuilder() {
	scene.userData.activeLightSettings = { type: 'PointLight' };

	scene.userData.activeLightSettings.castShadow = true; 
	scene.userData.gui = gui;

	setlightType('PointLight', scene);
	changeLightType('PointLight', scene);
	buildGui(scene);
}

function effectComposerStuff() {
	ssaoPass = new THREE.SSAOPass( scene, camera, window.innerWidth, window.innerHeight );
	ssaoPass.kernelRadius = 16;
	effectComposer = new THREE.EffectComposer( renderer );
	effectComposer.addPass( ssaoPass );
}

function animateLetters(object) {
	let letterL = object.children[5];
	letterL.matrixWorldNeedsUpdate = true;

	var delay = 0;
	var position = { x: 0, y: -100, z: 0 };
	var target = {  x: 0, y: 0, z: 0 };

	var tween = new TWEEN.Tween(position).to(target, 2000);
		
	tween.onUpdate(function(){
		console.log('updating?');
		// element.position.x = position.x;
		letterL.position.y = position.y;
		// element.position.z = position.z;
	});
}