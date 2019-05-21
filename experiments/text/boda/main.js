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

import TWEEN from '@tweenjs/tween.js';

//?--------------------------------------------------------------------
//?		Base
//?--------------------------------------------------------------------

var scene, camera, geometry, controls;
var bloomComposer, bloomPass, finalComposer;
var triangle;
var triangles = [];
var triangleCount = 5;
var colors = [[.74, .64, .59], [.27, .235, .117], [.29, .24, .9], [.27, .235, .117]];
var currentColor;
var triangleSpacing = 30;
var cornerStone;

var mouseX, mouseY;
var lines = [];

var renderer;
var ENTIRE_SCENE = 0, BLOOM_SCENE = 1;
var bloomLayer = new THREE.Layers();
bloomLayer.set( BLOOM_SCENE );
var params = {
	exposure: 1.2,
	bloomStrength: 5.1,
	bloomThreshold: 0,
	bloomRadius: .14,
	scene: "Scene with Glow"
};
var darkMaterial = new THREE.MeshBasicMaterial( { color: "black" } );
var materials = {};
var container = document.getElementById( 'container' );
clock = new THREE.Clock();
let cameraStep = 0;

var smokeParticles, clock, material, mesh, delta, cubeSineDriver;

renderer = new THREE.WebGLRenderer( { antialias: true } );
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.toneMapping = THREE.ReinhardToneMapping;
document.body.appendChild( renderer.domElement );
scene = new THREE.Scene();

// smokeThingies();

camera = new THREE.PerspectiveCamera(7, window.innerWidth / window.innerHeight, 1, 1000);
// camera.position.z = 300;
// camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 1, 200 );
camera.position.set( 0, 0, 0 );
camera.lookAt( 0, 0, 0 );
initControls();
scene.add( new THREE.AmbientLight( "rgb(255, 255, 255)", 1 ) );
scene.add( new THREE.AmbientLight( "rgb(255, 255, 255)", 1 ) );
scene.add( new THREE.AmbientLight( "rgb(255, 255, 255)", 1 ) );
scene.add( new THREE.AmbientLight( "rgb(255, 255, 255)", 1 ) );
scene.add( new THREE.AmbientLight( "rgb(255, 255, 255)", 1 ) );
scene.add( new THREE.AmbientLight( "rgb(255, 255, 255)", 1 ) );
scene.add( new THREE.AmbientLight( "rgb(255, 255, 255)", 1 ) );
scene.add( new THREE.AmbientLight( "rgb(255, 255, 255)", 1 ) );
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
	TWEEN.update();

	delta = clock.getDelta();
	
	if (smokeParticles) { evolveSmoke(); }

	updateOnMouseMove();
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
	} );
	var folder = gui.addFolder( 'Bloom Parameters' );
	folder.add( params, 'exposure', 0.1, 2 ).onChange( function ( value ) {
		renderer.toneMappingExposure = Math.pow( value, 4.0 );
	} );
	folder.add( params, 'bloomThreshold', 0.0, 1.0 ).onChange( function ( value ) {
		bloomPass.threshold = Number( value );
	} );
	folder.add( params, 'bloomStrength', 0.0, 10.0 ).onChange( function ( value ) {
		bloomPass.strength = Number( value );
	} );
	folder.add( params, 'bloomRadius', 0.0, 1.0 ).step( 0.01 ).onChange( function ( value ) {
		bloomPass.radius = Number( value );
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

	var loader = new THREE.OBJLoader();

	loader.load(
		'./triangle-v5.obj',
		function ( object ) {
			object.traverse( disposeMaterial );

			var color = new THREE.Color();
			color.setHSL( Math.random(), 0.7, Math.random() * 0.2 + 0.05 );

			smokeThingies(color);
			var material = new THREE.MeshBasicMaterial( { color: color } );
			material.needsUpdate = true;

			triangle = object.children[0];
			triangle.geometry.center();
			// triangle.position.set(-2.0639669336378574 / 2, 0, -0.06514400243759155 / 2);
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
	for(let i = 0; i < triangleCount; i++) {
		let newTriangle = triangle.clone();

		triangle.position.z = (i * triangleSpacing);
		newTriangle.layers.enable( BLOOM_SCENE );

		triangles.push(newTriangle);
		scene.add( newTriangle );
	}
}

var textLoader = new THREE.FontLoader();
// https://gero3.github.io/facetype.js/
textLoader.load( './fonts/Cornerstone_Regular.json', function ( font ) {
	animateCameraFurther({ x: 0, y: 0, z: triangleSpacing*(triangleCount - 1) - 8 });
	createTextLines('Challenge your', 'quest-self', font, triangleSpacing*(triangleCount - 2) + 10);
	cornerStone = font;
});

function createTextLines(first, second, font, z) {
	var textMaterial = new THREE.MeshPhongMaterial({color: "hsl(244, 0, 100)"});
	textMaterial.transparent = true;
	var textSettings = {
		font: font,
		size: .15,
		height: .1,
		curveSegments: 12,
		bevelEnabled: false,
	};
	
	var textGeometry = new THREE.TextBufferGeometry( first, textSettings );
	var textGeometry2 = new THREE.TextBufferGeometry( second, textSettings );
	
	textGeometry.center();
	textGeometry2.center();
	
	var textMesh = new THREE.Mesh(textGeometry, textMaterial);
	var textMesh2 = new THREE.Mesh(textGeometry2, textMaterial);
	textMesh.position.set(0, .15, z);
	textMesh2.position.set(0, -.05, z);

	// textMesh2.layers.enable( BLOOM_SCENE );

	scene.add(textMesh);
	scene.add(textMesh2);

	lines.push({firstline: textMesh, secondline: textMesh2});
}

var cameraPos = { x: camera.position.x, y: camera.position.y, z: 200 };
// var cameraEnd = { x: 0, y: 0, z: 50 };

function animateCameraFurther(cameraEnd) {
	var tween = new TWEEN.Tween(cameraPos).to(cameraEnd, 800);
	tween.easing(TWEEN.Easing.Quadratic.Out);
	tween.start();
	camera.lookAt(0, 0, 0);

	tween.onUpdate(function(){
		camera.position.x = cameraPos.x;
		camera.position.y = cameraPos.y;
		camera.position.z = cameraPos.z;
	});

	cameraStep ++;
}

function animateTriangleColor() {
	var newColor = new THREE.Color();
	newColor.setHSL( Math.random(), 0.7, Math.random() * 0.2 + 0.05 ); 
	
	triangles.forEach(shape => {
		shape.material.color = newColor;
	});

	smokeParticles.forEach(element => {
		element.material.color = newColor;
		element.position.z -= triangleSpacing;
	});
}


document.addEventListener("click", function(){
	animateCameraFurther({ x: 0, y: 0, z: triangleSpacing*(triangleCount - (cameraStep + 1)) - 8 });
	animateTriangleColor();
	
	switch ( cameraStep ) 	{
		case 1: 
			console.log('hallo');
			break;
		case 2:
			createTextLines('Find your', 'quest-self', cornerStone, triangleSpacing*(triangleCount - 3) + 10);
			break;
		case 3:
			createTextLines('Find your', 'adventure', cornerStone, triangleSpacing*(triangleCount - 4) + 10);
			break;
		case 4:
				createTextLines('What is', 'your weakness?', cornerStone, triangleSpacing*(triangleCount - 5) + 10);
			break;
	}
});

document.addEventListener( 'mousemove', onDocumentMouseMove, false );

function onDocumentMouseMove( event ) {
	mouseX = ( event.clientX - window.innerWidth / 2 ) / 2;
	mouseY = ( event.clientY - window.innerHeight / 2 ) / 2;
}

function updateOnMouseMove() {
	camera.position.x += ( mouseX - camera.position.x ) * .000005;
	camera.position.y += ( - mouseY - camera.position.y ) * .000008;
}

function evolveSmoke() {
	var sp = smokeParticles.length;
	while(sp--) {
			smokeParticles[sp].rotation.z += (delta * 0.2);
	}
}

function smokeThingies(color) {
	let smokeSize = 15;

	cubeSineDriver = 0;
	
	var smokeTexture = THREE.ImageUtils.loadTexture('./Smoke-Element.png');
	// var smokeColor = new THREE.Color("#F4182F");
	var smokeMaterial = new THREE.MeshLambertMaterial({color: color, map: smokeTexture, transparent: true});
	smokeMaterial.opacity = .3;
	smokeMaterial.needsUpdate = true;
	var smokeGeo = new THREE.PlaneGeometry(smokeSize,smokeSize);
	smokeParticles = [];

	for (let p = 0; p < 10; p++) {
		var randomPos = (Math.random() * smokeSize) - 5;
		console.log(randomPos);
		var randomPosZ = (Math.random() * (smokeSize * 2)) + triangleSpacing*(triangleCount - 5);

		var particle = new THREE.Mesh(smokeGeo,smokeMaterial);
		particle.position.set(randomPos, randomPos, randomPosZ);
		particle.rotation.z = Math.random() * 36;
		scene.add(particle);
		smokeParticles.push(particle);
	}
} 