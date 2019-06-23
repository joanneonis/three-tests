/* eslint-disable no-unused-vars */
import * as THREE from 'three';
import 'three/examples/js/controls/OrbitControls';
import {
	createObjects
} from '../lights/js/basicObjects';
 

//?--------------------------------------------------------------------
//?		Base
//?  used this example: https://github.com/mrdoob/three.js/blob/master/examples/webgl_camera_array.html
//?--------------------------------------------------------------------

var renderer,
		scene,
		camera,
		theCanvas = document.getElementById('gl-canvas');


		var windowWidth, windowHeight;
		var views = [
			{
				left: 0,
				bottom: 0,
				width: 0.5,
				height: 1.0,
				background: new THREE.Color( 0.5, 0.5, 0.7 ),
				eye: [ 0, 300, 1800 ],
				up: [ 0, 1, 0 ],
				fov: 30,
				updateCamera: function ( camera, scene, mouseX ) {
					// camera.position.x += mouseX * 0.05;
					// camera.position.x = Math.max( Math.min( camera.position.x, 2000 ), - 2000 );
					// camera.lookAt( scene.position );
				}
			},
			{
				left: 0.5,
				bottom: 0,
				width: 0.5,
				height: 1,
				background: new THREE.Color( 0.7, 0.5, 0.5 ),
				eye: [ 0, 300, 1800 ],
				up: [ 0, 1, 0 ],
				fov: 30,
				updateCamera: function ( camera, scene, mouseX ) {
					// camera.position.x -= mouseX * 0.05;
					// camera.position.x = Math.max( Math.min( camera.position.x, 2000 ), - 2000 );
					// camera.lookAt( camera.position.clone().setY( 0 ) );
				}
			},
		];

var gui;

var controls;

var meshes = createObjects();

function init() {

	initRenderer();
	scene = new THREE.Scene();

	// Add some basic shapes
	
	for(let i = 0; i < meshes.length - 1; i++) { // -1 because i dont want the floorplane
		scene.add(meshes[i]);
	}

	
	for ( var ii = 0; ii < views.length; ++ ii ) {
		var view = views[ ii ];
		var camera = new THREE.PerspectiveCamera( view.fov, window.innerWidth / window.innerHeight, 1, 10000 );
		// var helper = new THREE.CameraHelper( camera );
		// scene.add( helper );
		camera.position.fromArray( view.eye );
		camera.up.fromArray( view.up );
		view.camera = camera;

		initControls(camera); 
	}

	var light = new THREE.DirectionalLight( 0xffffff );
	light.position.set( 0, 0, 1 );
	scene.add( light );

	var ambient = new THREE.AmbientLight(0xffffff, 0.1);
	scene.add(ambient);


	// window.addEventListener('resize', onResize, false);
}

function onResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize(window.innerWidth, window.innerHeight);
}

function render() {
	updateSize();
	// TODO update camera?
	for ( var ii = 0; ii < views.length; ++ ii ) {
		var view = views[ ii ];
		var camera = view.camera;
		view.updateCamera( camera, scene, 0, 0 );
		var left = Math.floor( windowWidth * view.left );
		var bottom = Math.floor( windowHeight * view.bottom );
		var width = Math.floor( windowWidth * view.width );
		var height = Math.floor( windowHeight * view.height );
		renderer.setViewport( left, bottom, width, height );
		renderer.setScissor( left, bottom, width, height );
		renderer.setScissorTest( true );
		renderer.setClearColor( view.background );

		if (camera) {
		camera.aspect = width / height;
		camera.updateProjectionMatrix();
		}
		renderer.render( scene, camera );
	}
}

init();
render();

function initRenderer() {
	renderer = new THREE.WebGLRenderer({
		canvas: theCanvas, 
		antialias: true
	});
}

function initControls(cameraObj) {
	controls = new THREE.OrbitControls(cameraObj, renderer.domElement);
	controls.addEventListener('change', render);
	controls.minDistance = 0;
	controls.maxDistance = 700;
	controls.enablePan = true;

	// controls.target.copy(meshes[0].position);
	controls.update();
}

function updateSize() {
	if ( windowWidth != window.innerWidth || windowHeight != window.innerHeight ) {
		windowWidth = window.innerWidth;
		windowHeight = window.innerHeight;
		renderer.setSize( windowWidth, windowHeight );
	}
}
