import * as THREE from 'three';
import * as dat from 'dat.gui';

import 'three/examples/js/controls/OrbitControls';

import 'three/examples/js/shaders/CopyShader';
import 'three/examples/js/shaders/LuminosityShader';
import 'three/examples/js/shaders/SobelOperatorShader';

import 'three/examples/js/postprocessing/EffectComposer';
import 'three/examples/js/postprocessing/RenderPass';
import 'three/examples/js/postprocessing/ShaderPass';

import 'three/examples/js/loaders/OBJLoader';

var letters;
var camera, scene, renderer, composer;

			var effectSobel;

			var params = {
				enable: true
			};

			init();
			animate();

			function init() {

				//

				scene = new THREE.Scene();

				camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 1000 );
				camera.position.set( 0, 10, 50 );
				camera.lookAt( scene.position );

				//

				// var geometry = new THREE.TorusKnotBufferGeometry( 8, 3, 256, 32, 2, 3 );
				// var material = new THREE.MeshPhongMaterial( { color: 0xffff00 } );

				// var mesh = new THREE.Mesh( geometry, material );
				// scene.add( mesh );

				//

				var ambientLight = new THREE.AmbientLight( 0xcccccc, 0.4 );
				scene.add( ambientLight );

				var pointLight = new THREE.PointLight( 0xffffff, 0.8 );
				camera.add( pointLight );
				scene.add( camera );

				//

				renderer = new THREE.WebGLRenderer();
				renderer.setPixelRatio( window.devicePixelRatio );
				renderer.setSize( window.innerWidth, window.innerHeight );
				document.body.appendChild( renderer.domElement );

				// postprocessing

				composer = new THREE.EffectComposer( renderer );
				var renderPass = new THREE.RenderPass( scene, camera );
				composer.addPass( renderPass );

				// color to grayscale conversion

				var effectGrayScale = new THREE.ShaderPass( THREE.LuminosityShader );
				composer.addPass( effectGrayScale );

				// you might want to use a gaussian blur filter before
				// the next pass to improve the result of the Sobel operator

				// Sobel operator

				effectSobel = new THREE.ShaderPass( THREE.SobelOperatorShader );
				effectSobel.uniforms[ "resolution" ].value.x = window.innerWidth;
				effectSobel.uniforms[ "resolution" ].value.y = window.innerHeight;
				composer.addPass( effectSobel );

				var controls = new THREE.OrbitControls( camera );

				//

				var gui = new dat.GUI();

				gui.add( params, 'enable' );
				gui.open();

				//

				window.addEventListener( 'resize', onWindowResize, false );

			}

			function onWindowResize() {

				camera.aspect = window.innerWidth / window.innerHeight;
				camera.updateProjectionMatrix();

				renderer.setSize( window.innerWidth, window.innerHeight );
				composer.setSize( window.innerWidth, window.innerHeight );

				effectSobel.uniforms[ "resolution" ].value.x = window.innerWidth;
				effectSobel.uniforms[ "resolution" ].value.y = window.innerHeight;

			}

			function animate() {

				requestAnimationFrame( animate );

				if ( params.enable === true ) {

					composer.render();

				} else {

					renderer.render( scene, camera );

				}

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
		'./sobel-2.obj',
		// called when resource is loaded
		function ( object ) {
			letters = object;

			object.children.forEach(element => {
				element.position.set(0, 0, 5);
				element.castShadow = true; 
				element.receiveShadow = true;
			});

			scene.add( letters );
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