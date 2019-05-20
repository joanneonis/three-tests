/* eslint-disable no-unused-vars */
import * as dat from 'dat.gui';
import * as THREE from 'three';
import 'three/examples/js/controls/OrbitControls';
import 'three/examples/js/loaders/DDSLoader';
import 'three/examples/js/loaders/OBJLoader';

import 'three/examples/js/postprocessing/EffectComposer.js';
import 'three/examples/js/postprocessing/RenderPass.js';
import 'three/examples/js/postprocessing/ShaderPass.js';
import 'three/examples/js/shaders/CopyShader.js';
import 'three/examples/js/shaders/LuminosityHighPassShader.js';
import 'three/examples/js/postprocessing/UnrealBloomPass.js';

//?--------------------------------------------------------------------
//?		Base
//?--------------------------------------------------------------------

var scene, camera, geometry, controls;
var bloomComposer, bloomPass, finalComposer;
var triangle;
var renderer;
var ENTIRE_SCENE = 0, BLOOM_SCENE = 1;
var bloomLayer = new THREE.Layers();
bloomLayer.set( BLOOM_SCENE );
var params = {
	exposure: 1,
	bloomStrength: 9.1,
	bloomThreshold: 0,
	bloomRadius: .13,
	scene: "Scene with Glow"
};
var darkMaterial = new THREE.MeshBasicMaterial( { color: "black" } );
var materials = {};
var container = document.getElementById( 'container' );

renderer = new THREE.WebGLRenderer( { antialias: true } );
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.toneMapping = THREE.ReinhardToneMapping;
document.body.appendChild( renderer.domElement );
scene = new THREE.Scene();


camera = new THREE.PerspectiveCamera(7, window.innerWidth / window.innerHeight, 1, 1000);
camera.position.z = 500;
// camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 1, 200 );
// camera.position.set( 0, 0, 20 );
camera.lookAt( 0, 0, 0 );
initControls();
scene.add( new THREE.AmbientLight( 0x404040 ) );
var renderScene = new THREE.RenderPass( scene, camera );
initBloom();


initGui();
modelLoaders();

window.onresize = function () {
	var width = window.innerWidth;
	var height = window.innerHeight;
	camera.aspect = width / height;
	camera.updateProjectionMatrix();
	renderer.setSize( width, height );
	bloomComposer.setSize( width * window.devicePixelRatio, height * window.devicePixelRatio );
	finalComposer.setSize( width * window.devicePixelRatio, height * window.devicePixelRatio );
};


function disposeMaterial( obj ) {
	if ( obj.material ) {
		obj.material.dispose();
	}
}
function render() {
	controls.update();
	renderer.render( scene, camera );
	renderBloom( true );
	finalComposer.render();
	requestAnimationFrame(render);
}

render();

function renderBloom( mask ) {
	if ( mask === true ) {
		scene.traverse( darkenNonBloomed );
		bloomComposer.render();
		scene.traverse( restoreMaterial );
	} else {
		camera.layers.set( BLOOM_SCENE );
		bloomComposer.render();
		camera.layers.set( ENTIRE_SCENE );
	}
}
function darkenNonBloomed( obj ) {
	if ( obj.isMesh && bloomLayer.test( obj.layers ) === false ) {
		materials[ obj.uuid ] = obj.material;
		obj.material = darkMaterial;
	}
}
function restoreMaterial( obj ) {
	if ( materials[ obj.uuid ] ) {
		obj.material = materials[ obj.uuid ];
		delete materials[ obj.uuid ];
	}
}

function initBloom() {
	bloomPass = new THREE.UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85 );
	bloomPass.threshold = params.bloomThreshold;
	bloomPass.strength = params.bloomStrength;
	bloomPass.radius = params.bloomRadius;
	bloomComposer = new THREE.EffectComposer( renderer );
	bloomComposer.renderToScreen = false;
	bloomComposer.setSize( window.innerWidth * window.devicePixelRatio, window.innerHeight * window.devicePixelRatio );
	bloomComposer.addPass( renderScene );
	bloomComposer.addPass( bloomPass );

	var finalPass = new THREE.ShaderPass(
		new THREE.ShaderMaterial( {
			uniforms: {
				baseTexture: { value: null },
				bloomTexture: { value: bloomComposer.renderTarget2.texture }
			},
			vertexShader: document.getElementById( 'vertexshader' ).textContent,
			fragmentShader: document.getElementById( 'fragmentshader' ).textContent,
			defines: {}
		} ), "baseTexture"
	);
	finalPass.needsSwap = true;
	finalComposer = new THREE.EffectComposer( renderer );
	finalComposer.setSize( window.innerWidth * window.devicePixelRatio, window.innerHeight * window.devicePixelRatio );
	finalComposer.addPass( renderScene );
	finalComposer.addPass( finalPass );
}

function initControls() {
	controls = new THREE.OrbitControls( camera, renderer.domElement );
	controls.maxPolarAngle = Math.PI * 0.5;
	controls.minDistance = 1;
	controls.maxDistance = 1000;
	// controls.addEventListener( 'change', render );
}

function initGui() {
	var gui = new dat.GUI();
	gui.add( params, 'scene', [ 'Scene with Glow', 'Glow only', 'Scene only' ] ).onChange( function ( value ) {
		switch ( value ) 	{
			case 'Scene with Glow':
				bloomComposer.renderToScreen = false;
				break;
			case 'Glow only':
				bloomComposer.renderToScreen = true;
				break;
			case 'Scene only':
				// nothing to do
				break;
		}
		// render();
	} );
	var folder = gui.addFolder( 'Bloom Parameters' );
	folder.add( params, 'exposure', 0.1, 2 ).onChange( function ( value ) {
		renderer.toneMappingExposure = Math.pow( value, 4.0 );
		// render();
	} );
	folder.add( params, 'bloomThreshold', 0.0, 1.0 ).onChange( function ( value ) {
		bloomPass.threshold = Number( value );
		// render();
	} );
	folder.add( params, 'bloomStrength', 0.0, 10.0 ).onChange( function ( value ) {
		bloomPass.strength = Number( value );
		// render();
	} );
	folder.add( params, 'bloomRadius', 0.0, 1.0 ).step( 0.01 ).onChange( function ( value ) {
		bloomPass.radius = Number( value );
		// render();
	} );
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


	// materials = new THREE.MeshStandardMaterial({wireframe: false});
	// materials.color = new THREE.Color('#F4182F');

	// load a resource
	var loader = new THREE.OBJLoader();

	loader.load(
		// resource URL
		'./triangle-v3.obj',
		// called when resource is loaded
		function ( object ) {
			object.traverse( disposeMaterial );
			// object.traverse( function ( child ) {
			// 		if ( child instanceof THREE.Mesh ) {
			// 				// child.material = materials;
							
			// 		}
			// } );
			
			// rotateObject(object, 20, 0, 0);

			var color = new THREE.Color();
			color.setHSL( Math.random(), 0.7, Math.random() * 0.2 + 0.05 );
			var material = new THREE.MeshBasicMaterial( { color: color } );

			triangle = object.children[0];
			triangle.position.set(-2.0639669336378574 / 2, 0, -0.06514400243759155 / 2);
			triangle.material = material;

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

function setTriangles(triangle) {
	for(let i = 0; i < 5; i++) {
		let newTriangle = triangle.clone();

		triangle.position.z = i * 30;
		newTriangle.layers.enable( BLOOM_SCENE );

		console.log(newTriangle);
		scene.add( newTriangle );
	}
}