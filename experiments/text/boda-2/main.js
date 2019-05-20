/* eslint-disable no-unused-vars */
import * as dat from 'dat.gui';
import * as THREE from 'three';
import 'three/examples/js/controls/OrbitControls';
import 'three/examples/js/loaders/DDSLoader';
import 'three/examples/js/loaders/OBJLoader';

import 'three/examples/js/postprocessing/EffectComposer';
import 'three/examples/js/postprocessing/RenderPass';
import 'three/examples/js/postprocessing/ShaderPass';
import 'three/examples/js/shaders/CopyShader';
import 'three/examples/js/shaders/LuminosityHighPassShader';
import 'three/examples/js/postprocessing/UnrealBloomPass';

//?--------------------------------------------------------------------
//?		Base
//? 	Earth source: http://blog.mastermaps.com/2013/09/creating-webgl-earth-with-threejs.html
//?--------------------------------------------------------------------

let renderer,
		scene, 
		camera,
		controls,
		theCanvas = document.getElementById('gl-canvas');

var gui;
var materials;
var composer;

var rotation = 0;
var rotationSpeed = 0.009;
var triangle;

let bloomPassSettings = {
	threshold: 0,
	strength: 3.7,
	radius: 1.3,
	exposure: 1.2
};

let bloomPass;

function init() {
	initRenderer();
	
	scene = new THREE.Scene();
	
	camera = new THREE.PerspectiveCamera(7, window.innerWidth / window.innerHeight, 1, 1000);
	camera.position.z = 100;
	
	initControls();
	
	var light = new THREE.DirectionalLight(0xffffff, .1);
	light.position.set(5,3,5);
	scene.add(light);

	scene.add(new THREE.HemisphereLight( 0xffffbb, 0x080820, .1 ))

	scene.add( new THREE.AmbientLight( 0x404040 ) );
	// scene.background = new THREE.Color('#f9f9f9');

	bloomy();

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
	composer.render();
}

function initGui() {
	gui = new dat.GUI();

	let bloomFolder = gui.addFolder('bloom');

	bloomFolder.add(bloomPassSettings, 'threshold', 0, 3, .1).onChange((val) => { bloomPass.threshold = val; });
	bloomFolder.add(bloomPassSettings, 'strength', 0, 10, .1).onChange((val) => { bloomPass.strength = val; });
	bloomFolder.add(bloomPassSettings, 'radius', 0, 10, .1).onChange((val) => { bloomPass.radius = val; });
	bloomFolder.add(bloomPassSettings, 'exposure', 0, 3, .1).onChange((val) => { renderer.toneMappingExposure = Math.pow( val, 4.0 ); });
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

	// THREE.Loader.Handlers.add( /\.dds$/i, new THREE.DDSLoader() );


	materials = new THREE.MeshStandardMaterial({wireframe: false});
	materials.color = new THREE.Color('#F4182F');

	// load a resource
	var loader = new THREE.OBJLoader();

	loader.load(
		// resource URL
		'./triangle-v3.obj',
		// called when resource is loaded
		function ( object ) {
			object.traverse( function ( child ) {
					if ( child instanceof THREE.Mesh ) {
							child.material = materials;
					}
			} );
			
			// rotateObject(object, 20, 0, 0);

			triangle = object.children[0];
			triangle.position.set(-2.0639669336378574 / 2, 0, -0.06514400243759155 / 2);
			// triangle.applyMatrix();
			// x: 2.0639669336378574 //  -2.0639669336378574, -2.2093340158462524, -0.06514400243759155
			// y: 2.2093340158462524
			// z: 0.06514400243759155
			// var box = new THREE.Box3().setFromObject( triangle.children[0] );
			// console.log( box.min, box.max, box.getSize() );
			
			setTriangles(triangle);

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

function rotateObject(object, degreeX = 0, degreeY = 0, degreeZ = 0) {
  object.rotateX(THREE.Math.degToRad(degreeX));
  object.rotateY(THREE.Math.degToRad(degreeY));
  object.rotateZ(THREE.Math.degToRad(degreeZ));
} 


function bloomy() {
	var renderScene = new THREE.RenderPass( scene, camera );

	bloomPass = new THREE.UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85 );
	bloomPass.threshold = bloomPassSettings.threshold;
	bloomPass.strength = bloomPassSettings.strength;
	bloomPass.radius = bloomPassSettings.radius;
	bloomPass.exposure = bloomPassSettings.exposure;
	renderer.toneMappingExposure = Math.pow( bloomPassSettings.exposure, 4.0 );

	composer = new THREE.EffectComposer( renderer );
	composer.setSize( window.innerWidth, window.innerHeight );
	composer.addPass( renderScene );
	composer.addPass( bloomPass );
}

function setTriangles(triangle) {
	for(let i = 0; i < 5; i++) {
		let newTriangle = triangle.clone();

		triangle.position.z = i * 30;
		scene.add( newTriangle );
	}
}