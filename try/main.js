import './assets/scss/main.scss';

import * as dat from 'dat.gui';
import * as THREE from 'three';

import 'three/examples/js/controls/OrbitControls';
import 'three/examples/js/loaders/GLTFLoader';

import { TweenLite, Elastic, Bounce, Back, Power3 } from 'gsap'; 

//?--------------------------------------------------------------------
//?		Base
//?--------------------------------------------------------------------

// Scene bare minimum
var renderer,
		scene,
		camera,
		theCanvas = document.getElementById('gl-canvas');

// Gui menu
var gui;

// Gui camera settings
var cameraSettings = {
	cameraPos: {x: 15, y: 10, z: 10},
	all: 30,
};

// Orbit controls, for dragging and zooming scene
var controls;

var tween;
var cube;
var easings = [
	{
		name: 'Bounce',
		easing: Bounce.easeOut
	}, {
		name: 'Elastic',
		easing: Elastic.easeOut.config(1, 0.3)
	},
	{
		name: 'Overdo',
		easing: Back.easeOut.config(1.7)
	},
	{
		name: 'Ease out',
		easing: Power3.easeOut,
	}
];
var activeEasing = easings[1];


function init() {
	// set renderer basics
	initRenderer();

	// init scene
	scene = new THREE.Scene();

	// init camera
	camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
	camera.position.set(cameraSettings.cameraPos.x, cameraSettings.cameraPos.y, cameraSettings.cameraPos.z);
	
	// init Orbitcontrols
	initControls();

	// add helper, visualises x y and z axis
	scene.add(new THREE.AxesHelper(10));

	// pretty bg color
	let bgColor = new THREE.Color('#a3e1fe');
	scene.background = bgColor;

	// resize everything based on window
	window.addEventListener('resize', onResize, false);

	// Create a PointLight and turn on shadows for the light
	var light = new THREE.PointLight( 0xffffff, 1, 100 );
	light.position.set( 10, 10, 0 );
	light.castShadow = true;            // default false
	scene.add( light );

	//Set up shadow properties for the light
	light.shadow.mapSize.width = 512;  // default
	light.shadow.mapSize.height = 512; // default
	light.shadow.camera.near = 0.5;       // default
	light.shadow.camera.far = 500      // default

	// Groundplane
	var geometry = new THREE.PlaneGeometry( 5000, 2000, 32 );
	var material = new THREE.MeshBasicMaterial( {color: new THREE.Color('#87CBEB'), side: THREE.DoubleSide} );
	var plane = new THREE.Mesh( geometry, material );
	plane.position.y = 0;
	plane.rotation.x = -90 * (Math.PI / 180);
	plane.receiveShadow = true;
	plane.castShadow = false;
	scene.add( plane );
}


function onResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize(window.innerWidth, window.innerHeight);
}

function render() {
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

	loader.load('./assets/models/cube - v2.glb', function (gltf) {
		var model = gltf.scene;

		model.traverse( function( node ) {
			if ( node instanceof THREE.Mesh ) { node.castShadow = true; }
		} );

		scene.add(model);

		// Select cube
		cube = model.children[0];

		// place cube
		cube.geometry.computeBoundingBox();
		cube.position.y = cube.geometry.boundingBox.max.y / 2;

		generateMorphGui(cube);
		animations();
	});
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

function rotateObject(object, degreeX = 0, degreeY = 0, degreeZ = 0) {
  object.rotateX(THREE.Math.degToRad(degreeX));
  object.rotateY(THREE.Math.degToRad(degreeY));
	object.rotateZ(THREE.Math.degToRad(degreeZ));
} 

function generateMorphGui(obj) {
	var expressions = Object.keys( obj.morphTargetDictionary );
	var expressionFolder = gui.addFolder('Cube transforms');

	for ( var i = 0; i < expressions.length; i++ ) {
		expressionFolder.add( obj.morphTargetInfluences, i, -1, 1, 0.01 ).name( expressions[ i ] );
	}
	expressionFolder.open();
}

function animations() {
	tween = TweenLite.to(cube.morphTargetInfluences, 3, {
		[0]: 1,
		ease: activeEasing.easing,
	});

	// control buttons
	var reverseBtn = document.getElementById("reverseBtn"),
	timeScaleSlowBtn = document.getElementById("timeScaleSlowBtn"),
	timeScaleNormalBtn = document.getElementById("timeScaleNormalBtn"),
	timeScaleFastBtn = document.getElementById("timeScaleFastBtn"),
	restartBtn = document.getElementById("restartBtn");

	// selectlist
	var selectList = document.getElementById('easings');
	
	easings.forEach((item) => {
		var option = document.createElement("option");
		option.text = item.name;
		option.value = item.name;
		selectList.add(option);
	});	

	selectList.onchange = function(e){
		var selected = easings.filter(obj => {
			return obj.name === this.value
		})
	
		// activeEasing = selected[0];
		tween = TweenLite.to(cube.morphTargetInfluences, 3, {
			[0]: 1,
			ease: selected[0].easing,
		});
		// playTween();
		tween.restart();
	};
	
	reverseBtn.onclick = function() {
		tween.reverse();
	}

	timeScaleSlowBtn.onclick = function() {
	//timescale of 0.5 will make the tween play at half-speed (slower).
	//Tween will take 12 seconds to complete (normal duration is 6 seconds).
	tween.timeScale(0.5);
	}
	timeScaleNormalBtn.onclick = function() {
	//timescale of 1 will make tween play at normal speed.
	tween.timeScale(1);
	}
	timeScaleFastBtn.onclick = function() {
	//timescale of 1 will make the tween play at double-speed (faster).
	//Tween will take 3 seconds to complete (normal duration is 6 seconds).
	tween.timeScale(2);
	}
	restartBtn.onclick = function() {
	//Start playing from a progress of 0.
	tween.restart();
	}
}