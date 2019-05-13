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
// const URL = '../sound/bohfoitoch.mp3';
const URL = '../sound/testvideo.mp3';
	
const context = new AudioContext();
const playButton = document.querySelector('#play');
	
let soundBuffer;
// eind

let analyser;
let dataArray;
let bufferLength;
let dataArray2;

//
let positions;
let scales;
let opacities;


let avgChange;

let currentSound;
let prevValues;

let skipStep = 0;
let skipSize = 50;
let skipped = 0;

let firstRound = false;

let fullHistory = [];

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

	positions = new Float32Array( numParticles * 3 ); //*  *3, because xyz per dot
	scales = new Float32Array( numParticles ); //* scale per dot
// 	opacities = new Float32Array( numParticles );

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
	geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
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
	// source.connect(context.destination);
	source.start();

	analyser = context.createAnalyser();
	analyser.connect(context.destination);
	analyser.fftSize = AMOUNTY * 4; // 2048
	bufferLength = analyser.frequencyBinCount;
	
	analyser.smoothingTimeConstant = .1;

	dataArray = new Uint8Array(bufferLength);
	analyser.getByteTimeDomainData(dataArray);

	bufferLength = analyser.fftSize;
	dataArray2 = new Float32Array(bufferLength);

	// init length
	prevValues = new Float32Array(bufferLength);
	currentSound = new Float32Array(bufferLength);

	source.connect(analyser);
}

function audioThingies() {
	if (dataArray2) { 
		analyser.getFloatTimeDomainData(dataArray2);
	} else {
		return;
	}

	
	if (skipStep === (skipSize / 2)) {
		console.log('set old', skipped);
		// console.log('first');
		updateParticlePos(0);

		if (skipped === 3) {
			skipped = 0;
			firstRound = true;
		} else {
			skipped ++;
		}
		skipStep = 0;

	} else if (skipStep > skipSize) { // newUpdate
		console.log('new Update', skipped);
		
		updateParticlePos(2);
	}	else {
		if (currentSound && prevValues) {
			console.log('middle: could lerp?',fullHistory[0] !== fullHistory[2]);
			updateParticlePos(1);
		}
	}

	skipStep ++;
}

function updateParticlePos(type) {
	positions = particles.geometry.attributes.position.array;
	scales = particles.geometry.attributes.scale.array;

	let scaleFactor = 800;
	var i = 0, j = 0;

	fullHistory[skipped] = [...positions];

	for ( var ix = 0; ix < AMOUNTX; ix ++ ) {
		for ( var iy = 0; iy < AMOUNTY; iy ++ ) {

			if ( j < AMOUNTY && type === 0) {
				fullHistory[skipped][i + 1] = dataArray2[j];
				positions[i + 1] = THREE.Math.mapLinear(fullHistory[skipped][i + 1], 0, 1, 0, scaleFactor);
			} 

			if ( j < AMOUNTY  && type === 1 && firstRound && skipped === 3) {
				// let posBetweenOldAndNew = THREE.Math.lerp(fullHistory[skipped][i + 1], fullHistory[skipped][i + 1], 0.25);
				// positions[ i + 1] = THREE.Math.mapLinear(posBetweenOldAndNew, 0, 1, 0, scaleFactor);
			}

			i += 3;
			j ++;
		}
	}
}

function initControls() {
	controls = new THREE.OrbitControls(camera, renderer.domElement);
	controls.enableKeys = false;
	controls.enablePan = true;
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


/**
 *  Divides an fft array into octaves with each
 *  divided by three, or by a specified "slicesPerOctave".
 *  
 *  There are 10 octaves in the range 20 - 20,000 Hz,
 *  so this will result in 10 * slicesPerOctave + 1
 *
 *  @method splitOctaves
 *  @param {Array} spectrum Array of fft.analyze() values
 *  @param {Number} [slicesPerOctave] defaults to thirds
 *  @return {Array} scaledSpectrum array of the spectrum reorganized by division
 *                                 of octaves
 */
function splitOctaves(spectrum, slicesPerOctave) {
  var scaledSpectrum = [];
  var len = spectrum.length;

  // default to thirds
  var n = slicesPerOctave || 3;
  var nthRootOfTwo = Math.pow(2, 1 / n);

  // the last N bins get their own 
  var lowestBin = slicesPerOctave;

  var binIndex = len - 1;
  var i = binIndex;

  while (i > lowestBin) {
    var nextBinIndex = Math.round(binIndex / nthRootOfTwo);
    if (nextBinIndex === 1) return;
    var total = 0;
    var numBins = 0;
    // add up all of the values for the frequencies
    for (i = binIndex; i > nextBinIndex; i--) {
      total += spectrum[i];
      numBins++;
    }
    // divide total sum by number of bins
    var energy = total / numBins;
    scaledSpectrum.push(energy);
    // keep the loop going
    binIndex = nextBinIndex;
  }

  // add the lowest bins at the end
  for (var j = i; j > 0; j--) {
    scaledSpectrum.push(spectrum[j]);
  }

  // reverse so that array has same order as original array (low to high frequencies)
  scaledSpectrum.reverse();

  return scaledSpectrum;
}


// average a point in an array with its neighbors
function smoothPoint(spectrum, index, numberOfNeighbors) {

  // default to 2 neighbors on either side
  var neighbors = numberOfNeighbors || 2;
  var len = spectrum.length;

  var val = 0;

  // start below the index
  var indexMinusNeighbors = index - neighbors;
  var smoothedPoints = 0;

  for (var i = indexMinusNeighbors; i < (index + neighbors) && i < len; i++) {
    // if there is a point at spectrum[i], tally it
    if (typeof (spectrum[i]) !== 'undefined') {
      val += spectrum[i];
      smoothedPoints++;
    }
  }

  val = val / smoothedPoints;

  return val;
}
