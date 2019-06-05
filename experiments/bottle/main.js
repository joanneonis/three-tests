import * as dat from 'dat.gui';
import * as THREE from 'three';

import 'three/examples/js/controls/OrbitControls';
import 'three/examples/js/loaders/GLTFLoader';
import 'three/examples/js/loaders/ColladaLoader';

import { setlightType, buildGui, changeLightType } from '../../helpers/functions/lights';


var renderer,
		scene,
		camera,
		theCanvas = document.getElementById('gl-canvas');

var gui;

var cameraSettings = {
	cameraPos: {x: 58, y: 36, z: 36},
	all: 30,
};

var controls;

var goal;

var model;
var canLabel, testingTex;

function init() {

	initRenderer();

	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
	camera.position.set(cameraSettings.cameraPos.x, cameraSettings.cameraPos.y, cameraSettings.cameraPos.z);
	
	initControls();

	
	// scene.add(new THREE.AxesHelper(10));

	let bgColor = new THREE.Color('#a3e1fe');

	// let ambient = new THREE.AmbientLight();
	// ambient.castShadow = true;
	// scene.add(ambient);

	// let point = new THREE.PointLight();
	// ambient.castShadow = true;
	// scene.add(point);

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

	setlightType('DirectionalLight', scene);
	changeLightType('DirectionalLight', scene);
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
loadModelThingies();
// loadModel2();

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

function frameArea(sizeToFitOnScreen, boxSize, boxCenter, camera) {
	const halfSizeToFitOnScreen = sizeToFitOnScreen * 0.5;
	const halfFovY = THREE.Math.degToRad(camera.fov * .5);
	const distance = halfSizeToFitOnScreen / Math.tan(halfFovY);
	// compute a unit vector that points in the direction the camera is now
	// in the xz plane from the center of the box
	const direction = (new THREE.Vector3())
			.subVectors(camera.position, boxCenter)
			.multiply(new THREE.Vector3(1, 0, 1))
			.normalize();

	// move the camera to a position distance units way from the center
	// in whatever direction the camera was from the center already
	camera.position.copy(direction.multiplyScalar(distance).add(boxCenter));

	// pick some near and far values for the frustum that
	// will contain the box.
	camera.near = boxSize / 100;
	camera.far = boxSize * 100;

	camera.updateProjectionMatrix();

	// point the camera to look at the center of the box
	camera.lookAt(boxCenter.x, boxCenter.y, boxCenter.z);
}

function loadModelThingies() {
	var loader = new THREE.GLTFLoader();

	loader.load('./models/blikje2.glb', 
		function ( gltf ) {

			let root = gltf.scene;
			canLabel = gltf.scene.children[2].children[1].children[0].children[0];

			updateCanLabel();

			scene.add( root );

			// renderer.gammaOutput = true;
			// renderer.gammaFactor = 2.2;

      // compute the box that contains all the stuff
      // from root and below
      const box = new THREE.Box3().setFromObject(root);

      const boxSize = box.getSize(new THREE.Vector3()).length();
      const boxCenter = box.getCenter(new THREE.Vector3());

      // set the camera to frame the box
      // frameArea(boxSize * 0.5, boxSize, boxCenter, camera);

      // update the Trackball controls to handle the new size
      controls.maxDistance = boxSize * 10;
      controls.target.copy(boxCenter);
      controls.update();

		},
	);
}

// function loadModel2() {
// 	var loader = new THREE.ColladaLoader();
// 	loader.load( './models/Coca_Cola.dae', function ( collada ) {

// 		// var animations = collada.animations;
// 		var bottle = collada.scene;

// 		// mixer = new THREE.AnimationMixer( avatar );
// 		// var action = mixer.clipAction( animations[ 0 ] ).play();

// 		scene.add( bottle );

// 	} );
// }

function initCameraGui() {
	var cameraFolder = gui.addFolder('Camera');
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

function updateCanLabel() {
	var map = new THREE.TextureLoader().load('textures/cokecan.jpg');

	canLabel.material.needsUpdate = true;
	canLabel.material.map = map;
	canLabel.material.map.flipY = false;
	canLabel.material.metalness = 0.3;
}