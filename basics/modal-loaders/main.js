/* eslint-disable no-unused-vars */
import * as dat from 'dat.gui';
import * as THREE from 'three';
import 'three/examples/js/controls/OrbitControls';
import 'three/examples/js/loaders/DDSLoader';
import 'three/examples/js/loaders/MTLLoader';
import 'three/examples/js/loaders/OBJLoader';

//?--------------------------------------------------------------------
//?		Base
//?--------------------------------------------------------------------

let renderer,
		scene,
		camera,
		controls,
		theCanvas = document.getElementById('gl-canvas');

var gui;

function init() {
	initRenderer();
	
	scene = new THREE.Scene();
	
	camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000);
	camera.position.z = 3;
	
	initControls();
	
	var light = new THREE.DirectionalLight(0xffffff, 1);
	light.position.set(5,3,5);
	scene.add(light);

	scene.add(new THREE.HemisphereLight( 0xffffbb, 0x080820, 1 ))

	scene.add( new THREE.AmbientLight( 0x404040 ) );
	scene.background = new THREE.Color('#f9f9f9');

	modelLoaders();
// TODO

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
}


init();
render();
initGui();


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

function modelLoaders() {

	var onProgress = function ( xhr ) {

		if ( xhr.lengthComputable ) {

			var percentComplete = xhr.loaded / xhr.total * 100;
			console.log( Math.round( percentComplete, 2 ) + '% downloaded' );

		}

	};

	var onError = function (e) {
		console.log(e);
	};

	THREE.Loader.Handlers.add( /\.dds$/i, new THREE.DDSLoader() );

	// model source: https://poly.google.com/view/63bZ3bfzQcq
	new THREE.MTLLoader()
		.setPath( './models/robot/' )
		.load( 'robot.mtl', function ( materials ) {

			materials.preload();

			new THREE.OBJLoader()
				.setMaterials( materials )
				.setPath( './models/robot/' )
				.load( 'robot.obj', function ( object ) {

					object.position.y = 0;

					rotateObject(object, 15, 220, 0);

					scene.add( object );

				}, onProgress, onError );

		} );
}

function rotateObject(object, degreeX = 0, degreeY = 0, degreeZ = 0) {
  object.rotateX(THREE.Math.degToRad(degreeX));
  object.rotateY(THREE.Math.degToRad(degreeY));
  object.rotateZ(THREE.Math.degToRad(degreeZ));
}