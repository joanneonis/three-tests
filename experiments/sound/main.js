/* eslint-disable no-unused-vars */
import '../../assets/base.scss';
import Prism from 'prismjs';

import * as dat from 'dat.gui';
import * as THREE from 'three';

import 'three/examples/js/controls/OrbitControls';
import { setlightType, buildGui, changeLightType } from '../../helpers/functions/lights';

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

var renderer,
		scene,
		camera,
		theCanvas = document.getElementById('gl-canvas');

var gui;
var cameraPos = {x: 58, y: 36, z: 36};

var controls;

// Audio dingen
const URL = './sound/bohfoitoch.mp3';
	
const context = new AudioContext();
const playButton = document.querySelector('#play');
	
let soundBuffer;
// eind

let analyser;
let dataArray;
let bufferLength;

let plane;

function init() {

	initRenderer();

	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
	camera.position.set(cameraPos.x, cameraPos.y, cameraPos.z);
	
	initControls();

	
	scene.add(new THREE.AxesHelper(10));

	let bgColor = new THREE.Color('#a3e1fe');

	let ambient = new THREE.AmbientLight();
	// ambient.castShadow = true;
	scene.add(ambient);

	scene.background = bgColor;

	drawPlane();

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
	if (analyser) { 
		analyser.getByteTimeDomainData(dataArray); 
		
		let avgChange = avg(dataArray) / 100;

		console.log(avgChange);
		plane.scale.set(avgChange, avgChange, avgChange);
	}

	requestAnimationFrame(render);
	renderer.render(scene, camera);
}

function drawPlane() {
	var geometry = new THREE.PlaneGeometry( 5, 20, 32 );
	var material = new THREE.MeshBasicMaterial( {color: 0xffff00, side: THREE.DoubleSide} );
	plane = new THREE.Mesh( geometry, material );
	scene.add( plane ); 
}

function initGui() {
	gui = new dat.GUI();
	initCameraGui();
}

initGui();
init();
render();

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

function initCameraGui() {
	var cameraFolder = gui.addFolder('Camera');
	cameraFolder.add(cameraPos, 'x', -100, 100).onChange((val) => { camera.position.x = val });
	cameraFolder.add(cameraPos, 'y', -100, 100).onChange((val) => { camera.position.y = val });
	cameraFolder.add(cameraPos, 'z', -100, 100).onChange((val) => { camera.position.z = val });
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
	analyser.fftSize = 2048;
	bufferLength = analyser.frequencyBinCount;
	dataArray = new Uint8Array(bufferLength);
	analyser.getByteTimeDomainData(dataArray);

	console.log('bufferleng', bufferLength);

	source.connect(analyser);
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