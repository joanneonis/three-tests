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
var SEPARATION = 100, AMOUNTX = 64, AMOUNTY = 64;

var camera, scene, renderer;
var controls;

var particles, count = 0;

// Audio dingen
const URL = './../sound/bohfoitoch.mp3';
	
const context = new AudioContext();
const playButton = document.querySelector('#play');
	
let soundBuffer;
// eind

let analyser;
let dataArray;
let bufferLength;

//
let positions;
let scales;


let avgChange;

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

	//

	var numParticles = AMOUNTX * AMOUNTY;

	positions = new Float32Array( numParticles * 3 );
	scales = new Float32Array( numParticles );

	var i = 0, j = 0;

	for ( var ix = 0; ix < AMOUNTX; ix ++ ) {

		for ( var iy = 0; iy < AMOUNTY; iy ++ ) {

			positions[ i ] = ix * SEPARATION - ( ( AMOUNTX * SEPARATION ) / 2 ); // x
			positions[ i + 1 ] = 0; // y
			positions[ i + 2 ] = iy * SEPARATION - ( ( AMOUNTY * SEPARATION ) / 2 ); // z

			scales[ j ] = 30;

			i += 3;
			j ++;

		}

	}

	var geometry = new THREE.BufferGeometry();
	geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
	geometry.addAttribute( 'scale', new THREE.BufferAttribute( scales, 1 ) );

	var material = new THREE.ShaderMaterial( {

		uniforms: {
			color: { value: new THREE.Color( 0xffffff ) },
		},
		vertexShader: document.getElementById( 'vertexshader' ).textContent,
		fragmentShader: document.getElementById( 'fragmentshader' ).textContent

	} );

	//

	particles = new THREE.Points( geometry, material );
	scene.add( particles );

	//

	
	document.body.appendChild( renderer.domElement );

	window.addEventListener( 'resize', onWindowResize, false );

}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );
}

//

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

	console.log(camera);

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
	const source = context.createBufferSource();
	source.buffer = audioBuffer;
	// source.connect(context.destination);
	source.start();

	analyser = context.createAnalyser();
	analyser.connect(context.destination);
	analyser.fftSize = AMOUNTX * 2; // 2048
	bufferLength = analyser.frequencyBinCount;
	dataArray = new Uint8Array(bufferLength);
	analyser.getByteTimeDomainData(dataArray);

	source.connect(analyser);
}

function audioThingies() {
	if (analyser) { 
		analyser.getByteTimeDomainData(dataArray); 
		
		avgChange = avg(dataArray);

	// 	for (let x = 0; x < bufferLength; x++) {
	// 		var amp = dataArray[x];
	// 		var y = THREE.Math.clamp(amp, 0, 10);
	// 		positions[x] = y;
	// 		scales[x] = y;
	// 		console.log(y);
	// 	}
	}

	positions = particles.geometry.attributes.position.array;
	scales = particles.geometry.attributes.scale.array;
	
	var i = 0, j = 0;

	// console.log(AMOUNTX * AMOUNTY);

	for ( var ix = 0; ix < AMOUNTX; ix ++ ) {

		scales[ ix ] = 80;
		positions[ ix ] = 80;

		for ( var iy = 0; iy < AMOUNTY; iy ++ ) {


			// positions[ i + 1 ] = count;
			// scales[ ix ] = 80;
			// scales[ i + 1 ] = 40;
			// scales[ i + 2 ] = 20;

			// console.log(i, j);

			// positions[ i + 1 ] = ( Math.sin( ( 1 + count ) * 0.3 ) * 50 ) +
			// 				( Math.sin( ( 2 + count ) * 0.5 ) * 50 );

			// scales[ j ] = ( Math.sin( ( 1 + count ) * 0.3 ) + 1 ) * 8 +
			// 				( Math.sin( ( 2 + count ) * 0.5 ) + 1 ) * 8;

			// scales[ j ] = 30;

			
			i += 3;
			j ++;

		}

	}
	
}


//some helper functions here
function fractionate(val, minVal, maxVal) {
	return (val - minVal)/(maxVal - minVal);
}

function modulate(val, minVal, maxVal, outMin, outMax) {
	var fr = fractionate(val, minVal, maxVal);
	var delta = outMax - outMin;
	return outMin + (fr * delta);
}

function avg(arr){
	var total = arr.reduce(function(sum, b) { return sum + b; });
	return (total / arr.length);
}

function max(arr){
	return arr.reduce(function(a, b){ return Math.max(a, b); })
}


function initControls() {
	controls = new THREE.OrbitControls(camera, renderer.domElement);
	// controls.minDistance = 0;
	// controls.maxDistance = 700;
	controls.enableKeys = false;
}