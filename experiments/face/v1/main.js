import * as dat from 'dat.gui';
import * as THREE from 'three';

import 'three/examples/js/controls/OrbitControls';
import 'three/examples/js/loaders/GLTFLoader';
// import 'three/examples/js/AnimationClipCreator';

import { setlightType, buildGui, changeLightType } from '../../../helpers/functions/lights';


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

var goal;
var temp = new THREE.Vector3;

var model;

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

	loader.load('../assets/suzanne/test-5.glb', function (gltf) {
		model = gltf.scene; 

		// console.log(model.children[0].children[1].children[0].skeleton.bones);

		// model.traverse( function( node ) {
		// 	if ( node instanceof THREE.Mesh ) { node.castShadow = true; node.receiveShadow = false; }
		// } );
		
		// var expressions = Object.keys( tractorObj.morphTargetDictionary );
		// var expressionFolder = gui.addFolder('Blob');
		// for ( var i = 0; i < expressions.length; i++ ) {
		// 	expressionFolder.add( tractorObj.morphTargetInfluences, i, 0, 1, 0.01 ).name( expressions[ i ] );
		// }

		// model.castShadow = true;
		// setupDatGui();

		
		scene.add( model );
	});
}


function setupDatGui() {

	var folder = gui.addFolder( "General Options" );

	// folder.add( state, "animateBones" );
	// folder.__controllers[ 0 ].name( "Animate Bones" );

	// folder.add( model, "pose" );
	// folder.__controllers[ 1 ].name( ".pose()" );

	var bones = model.children[0].children[1].children[0].skeleton.bones;

	for ( var i = 0; i < bones.length; i ++ ) {

		var bone = bones[ i ];

		folder = gui.addFolder( `Bone - ${i} ${bones[ i ].name}` );

		folder.add( bone.position, 'x', - 10 + bone.position.x, 10 + bone.position.x );
		folder.add( bone.position, 'y', - 10 + bone.position.y, 10 + bone.position.y );
		folder.add( bone.position, 'z', - 10 + bone.position.z, 10 + bone.position.z );

		folder.add( bone.rotation, 'x', - Math.PI * 0.5, Math.PI * 0.5 );
		folder.add( bone.rotation, 'y', - Math.PI * 0.5, Math.PI * 0.5 );
		folder.add( bone.rotation, 'z', - Math.PI * 0.5, Math.PI * 0.5 );

		folder.add( bone.scale, 'x', 0, 2 );
		folder.add( bone.scale, 'y', 0, 2 );
		folder.add( bone.scale, 'z', 0, 2 );

		folder.__controllers[ 0 ].name( "position.x" );
		folder.__controllers[ 1 ].name( "position.y" );
		folder.__controllers[ 2 ].name( "position.z" );

		folder.__controllers[ 3 ].name( "rotation.x" );
		folder.__controllers[ 4 ].name( "rotation.y" );
		folder.__controllers[ 5 ].name( "rotation.z" );

		folder.__controllers[ 6 ].name( "scale.x" );
		folder.__controllers[ 7 ].name( "scale.y" );
		folder.__controllers[ 8 ].name( "scale.z" );
	}
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
