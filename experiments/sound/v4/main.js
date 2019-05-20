/* eslint-disable no-unused-vars */
import '../../../assets/base.scss';
import Prism from 'prismjs';

// import * as dat from 'dat.gui';
import * as THREE from 'three';

import 'three/examples/js/controls/OrbitControls';
// import 'three/examples/js/WebGL';

Prism.highlightAll();

var panelToggle = document.querySelector('.panel-toggle');
var body = document.querySelector('body');
var panelOpen = false;

panelToggle.onclick = function() {
	body.classList.toggle('panel-open'); 
	
	panelOpen = !panelOpen;

	if (panelOpen) {
		panelToggle.textContent = 'Sluit proces';
	} else {
		panelToggle.textContent = 'Lees proces';
	}
}

//?--------------------------------------------------------------------
//?		Base
//?--------------------------------------------------------------------
var SEPARATION = 20; // 100
var AMOUNTX = 1;
var AMOUNTY = 256; // 64

var camera, scene, renderer;
var controls;

var clock = new THREE.Clock();
let tp;

var particles, count = 0;

// Audio dingen
const URL = '../sound/testvideo.mp3';
	
const context = new AudioContext();
const playButton = document.querySelector('#play');
	
let soundBuffer;
// eind

let analyser;
let bufferLength;
let dataArray;

// applied transforms
let positions;
let scales;

init();
animate();

function init() {

	camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 10000 );
	// camera = new THREE.OrthographicCamera( window.innerWidth / - 2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, 0, 10000 );
	camera.position.x = -5837.563823462691;
	camera.position.y = 300;
	camera.position.z = 600;

	scene = new THREE.Scene();

	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );

	initControls();

	var numParticles = AMOUNTX * AMOUNTY;

	positions = new Float32Array( numParticles * 3 ); //*  *3, because xyz per dot
	scales = new Float32Array( numParticles ); //* scale per dot

	var i = 0, j = 0;

	for ( var ix = 0; ix < AMOUNTX; ix ++ ) {

		for ( var iy = 0; iy < AMOUNTY; iy ++ ) {

			positions[ i ] = ix * SEPARATION - ( ( AMOUNTX * SEPARATION ) / 2 ); // x
			positions[ i + 1 ] = 0; // y
			positions[ i + 2 ] = iy * SEPARATION - ( ( AMOUNTY * SEPARATION ) / 2 ); // z

			scales[ j ] = 80;

			i += 3; // skip to nex pos
			j ++;

		}

	}

	var geometry = new THREE.BufferGeometry();
	geometry.addAttribute( 'position', new THREE.BufferAttribute( new Float32Array([...positions]), 3 ) );
	geometry.addAttribute( 'scale', new THREE.BufferAttribute( scales, 1 ) );

	// got from example three dotwaves
	var material = new THREE.ShaderMaterial( {
		uniforms: {
			color: { value: new THREE.Color( '#9B8F78' ) },
		},
		vertexShader: document.getElementById( 'vertexshader' ).textContent,
		fragmentShader: document.getElementById( 'fragmentshader' ).textContent
	} );

	particles = new THREE.Points( geometry, material );
	scene.add( particles );

	scene.background = new THREE.Color('#1E2B31');
	document.body.appendChild( renderer.domElement );
	window.addEventListener( 'resize', onWindowResize, false );
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );
}

function animate() {
	requestAnimationFrame( animate );
	render();
}

function render() {
	camera.lookAt( scene.position );
	
	audioThingies();
	
	particles.geometry.attributes.position.needsUpdate = true;
	particles.geometry.attributes.scale.needsUpdate = true;

	renderer.render( scene, camera );

	tp = clock.getDelta();

	count += 0.1;
}

window.fetch(URL)
	.then(response => response.arrayBuffer())
	.then(arrayBuffer => context.decodeAudioData(arrayBuffer))
	.then(audioBuffer => {
		playButton.disabled = false;
		soundBuffer = audioBuffer;
	});
	
playButton.onclick = () => play(soundBuffer);

function play(audioBuffer) {
	playButton.style.display = 'none';
	const source = context.createBufferSource();
	source.buffer = audioBuffer;
	source.start();

	analyser = context.createAnalyser();
	analyser.connect(context.destination);
	analyser.fftSize = AMOUNTY * 4;
	bufferLength = analyser.frequencyBinCount;
	
	analyser.smoothingTimeConstant = .1;

	bufferLength = analyser.fftSize;
	dataArray = new Float32Array(bufferLength);

	source.connect(analyser);
}

function audioThingies() {
	if (dataArray) { 
		analyser.getFloatTimeDomainData(dataArray);
		updateParticlePos();

	} else {
		return;
	}
}



function updateParticlePos() {
	positions = particles.geometry.attributes.position.array;
	scales = particles.geometry.attributes.scale.array;

	let scaleFactor = 800;
	let smoothFactor = 10;
	var posArray = 0, loopStep = 0;

	let smoothedValues = smoothArray(dataArray, smoothFactor);

	for ( var ix = 0; ix < AMOUNTX; ix ++ ) {
		for ( var iy = 0; iy < AMOUNTY; iy ++ ) {
			
			if (loopStep < AMOUNTY) {
				positions[posArray + 1] = THREE.Math.mapLinear(smoothedValues[loopStep], 0, 1, 0, scaleFactor);
			}

			posArray += 3;
			loopStep ++;
		}
	}
}

function initControls() {
	controls = new THREE.OrbitControls(camera, renderer.domElement);
	controls.enableKeys = false;
	controls.enablePan = true;
}

function smoothArray(array, smoothing) {
	var newArray = [];
	for (let i = 0; i < array.length; i++) {
			var sum = 0;

			for (let index = i - smoothing; index <= i + smoothing; index++) {
					var thisIndex = index < 0 ? index + array.length : index % array.length;
					sum += array[thisIndex];
			}
			newArray[i] = sum/((smoothing*2)+1);
	}

	return newArray;
}