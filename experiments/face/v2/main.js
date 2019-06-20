import Clam from './clmtracker';
import * as dat from 'dat.gui';
import * as THREE from 'three';

import 'three/examples/js/controls/OrbitControls';
import 'three/examples/js/loaders/GLTFLoader';
import 'three/examples/js/AnimationClipCreator';

import { setlightType, buildGui, changeLightType } from '../../../helpers/functions/lights';


// console.log(Clam.init());
Clam.init();

var overlay = document.getElementById('overlay');
var overlayCC = overlay.getContext('2d');
var videoInfo;
var emotionData;
var ctrack;
var ec;

var currentFacePositions;

// d3
var svg;

var emotionStates;

//?--------------------------------------------------------------------
//?		Three
//?--------------------------------------------------------------------
var suzanne;
var suzanneInitRot;

var renderer,
		scene,
		camera,
		theCanvas = document.getElementById('gl-canvas');

var gui;

var cameraSettings = {
	cameraPos: {x: 6, y: 6, z: 6},
	followTractor: false,
	lookAt: true,
	all: 30,
};

var controls;

var goal;
var temp = new THREE.Vector3;

var model;

initGui();
init();
// render();
loadModelThingies();

//?--------------------------------------------------------------------
//?		Webcam
//?--------------------------------------------------------------------
document.getElementById('startbutton').addEventListener('click', function () {
	Clam.startVideo();
	emotionData = Clam.getEmotionData();
	videoInfo = Clam.getVidProportions();
	ctrack = window.ctrack;
	ec = window.ec;
	drawLoop();
	d3Vis();
});

function drawLoop() {
	requestAnimationFrame(drawLoop);
	renderer.render(scene, camera);

	overlayCC.clearRect(0, 0, videoInfo.videoWidth, videoInfo.videoHeight);
	//psrElement.innerHTML = "score :" + ctrack.getScore().toFixed(4);
	if (ctrack.getCurrentPosition()) {
		ctrack.draw(overlay);
		currentFacePositions = ctrack.getCurrentPosition();

		getRotation();
		getDistance();
	}
	var cp = ctrack.getCurrentParameters();
	emotionStates = ec.meanPredict(cp);

	if (emotionStates) {
		updateData(emotionStates);
		updateFacialExpression(emotionStates);
		for (var i = 0; i < emotionStates.length; i++) {
			if (emotionStates[i].value > 0.4) {
				document.getElementById('icon' + (i + 1)).style.visibility = 'visible';
			} else {
				document.getElementById('icon' + (i + 1)).style.visibility = 'hidden';
			}
		}
	}
}



//?--------------------------------------------------------------------
//?		D3
//?--------------------------------------------------------------------
var margin = {
		top: 20,
		right: 20,
		bottom: 10,
		left: 40
	},
	width = 400 - margin.left - margin.right,
	height = 100 - margin.top - margin.bottom;

var barWidth = 30;
var formatPercent = d3.format(".0%");

function d3Vis() {
	var x = d3.scale.linear()
		.domain([0, Clam.getEmotions().length]).range([margin.left, width + margin.left]);
	var y = d3.scale.linear()
		.domain([0, 1]).range([0, height]);
	svg = d3.select("#emotion_chart").append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
	svg.selectAll("rect").
	data(emotionData).
	enter().
	append("svg:rect").
	attr("x", function (datum, index) {
		return x(index);
	}).
	attr("y", function (datum) {
		return height - y(datum.value);
	}).
	attr("height", function (datum) {
		return y(datum.value);
	}).
	attr("width", barWidth).
	attr("fill", "#2d578b");
	svg.selectAll("text.labels").
	data(emotionData).
	enter().
	append("svg:text").
	attr("x", function (datum, index) {
		return x(index) + barWidth;
	}).
	attr("y", function (datum) {
		return height - y(datum.value);
	}).
	attr("dx", -barWidth / 2).
	attr("dy", "1.2em").
	attr("text-anchor", "middle").
	text(function (datum) {
		return datum.value;
	}).
	attr("fill", "white").
	attr("class", "labels");
	svg.selectAll("text.yAxis").
	data(emotionData).
	enter().append("svg:text").
	attr("x", function (datum, index) {
		return x(index) + barWidth;
	}).
	attr("y", height).
	attr("dx", -barWidth / 2).
	attr("text-anchor", "middle").
	attr("style", "font-size: 12").
	text(function (datum) {
		return datum.emotion;
	}).
	attr("transform", "translate(0, 18)").
	attr("class", "yAxis");
}

function updateData(data) {
		var y = d3.scale.linear()
		.domain([0, 1]).range([0, height]);

	// update
	var rects = svg.selectAll("rect")
		.data(data)
		.attr("y", function (datum) {
			return height - y(datum.value);
		})
		.attr("height", function (datum) {
			return y(datum.value);
		});
	var texts = svg.selectAll("text.labels")
		.data(data)
		.attr("y", function (datum) {
			return height - y(datum.value);
		})
		.text(function (datum) {
			return datum.value.toFixed(1);
		});
	// enter
	rects.enter().append("svg:rect");
	texts.enter().append("svg:text");
	// exit
	rects.exit().remove();
	texts.exit().remove();
} 


//?--------------------------------------------------------------------
//?		Three
//?--------------------------------------------------------------------

function init() {

	initRenderer();

	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
	camera.position.set(cameraSettings.cameraPos.x, cameraSettings.cameraPos.y, cameraSettings.cameraPos.z);
	
	initControls();

	
	// scene.add(new THREE.AxesHelper(10));

	let bgColor = new THREE.Color('#41454F');

	// let ambient = new THREE.AmbientLight();
	// ambient.castShadow = true;
	// scene.add(ambient);

	// let point = new THREE.PointLight();
	// ambient.castShadow = true;
	// scene.add(point);

	scene.background = bgColor;

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

	renderer.setSize(window.innerWidth / 2, window.innerHeight / 2);
}

// function render() {
// 	// controls.update();

// 	requestAnimationFrame(render);
	
// 	renderer.render(scene, camera);

// }

function initGui() {
	gui = new dat.GUI();

	initCameraGui();
}

// initGui();
// init();
// // render();
// loadModelThingies();

function initRenderer() {
	renderer = new THREE.WebGLRenderer({
		canvas: theCanvas, 
		antialias: true
	});
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth / 2, window.innerHeight / 2);
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap;
}

function initControls() {
	controls = new THREE.OrbitControls(camera, renderer.domElement);
	controls.minDistance = 0;
	controls.maxDistance = 700;
	controls.enableKeys = false;
}

function loadModelThingies() {
	var loader = new THREE.GLTFLoader();

	loader.load('../assets/suzanne2/test.glb', function (gltf) {
		model = gltf.scene; 
		
		suzanne = model.children[0].children[1];

		suzanne.scale.set(3, 3, 3);

		buildPosGui();

		var expressions = Object.keys( suzanne.morphTargetDictionary );
		var expressionFolder = gui.addFolder('Blob');
		for ( var i = 0; i < expressions.length; i++ ) {
			expressionFolder.add( suzanne.morphTargetInfluences, i, 0, 1, 0.01 ).name( expressions[ i ] );
		}


		rotateObject(suzanne, -35, 42, 25);
		suzanneInitRot = suzanne.rotation.y;

		// model.castShadow = true;
		// setupDatGui();

		
		scene.add( suzanne );
	});
}

function rotateObject(object, degreeX = 0, degreeY = 0, degreeZ = 0) {
  object.rotateX(THREE.Math.degToRad(degreeX));
  object.rotateY(THREE.Math.degToRad(degreeY));
  object.rotateZ(THREE.Math.degToRad(degreeZ));
} 

function updateFacialExpression(expression) {
	// console.log(expression);
	// suzanne.morphTargetInfluences[2] = THREE.Math.mapLinear(expression[0].value, 0, 1, );
	suzanne.morphTargetInfluences[2] = (expression[0].value * 2);
	suzanne.morphTargetInfluences[3] = (expression[2].value * 1);
	suzanne.morphTargetInfluences[4] = (expression[3].value * 1);
}

function initCameraGui() {
	var cameraFolder = gui.addFolder('Camera');
	cameraFolder.add(cameraSettings, 'followTractor');
	cameraFolder.add(cameraSettings, 'lookAt');
	cameraFolder.add(cameraSettings.cameraPos, 'x', -100, 100).onChange((val) => { camera.position.x = val });
	cameraFolder.add(cameraSettings.cameraPos, 'y', -100, 100).onChange((val) => { camera.position.y = val });
	cameraFolder.add(cameraSettings.cameraPos, 'z', -100, 100).onChange((val) => { camera.position.z = val });
	cameraFolder.add(cameraSettings, 'all', -100, 100, 0.1).onChange((val) => {
		camera.position.set(val, val, val);

		if (cameraSettings.followTractor) {
			goal.position.set(val, val, val);
		}
	});
}

function getRotation() {
	var factor = 60;
	var newRot = (suzanneInitRot / 2) -( (currentFacePositions[23][1] - currentFacePositions[28][1]) / factor);

	suzanne.rotation.z = newRot;
}

function getDistance() {
	var eyeDis = currentFacePositions[23][0] - currentFacePositions[28][0];
	var factor = 2;
	// console.log(eyeDis);
	// suzanne.position.x = -(eyeDis / 10);
	// suzanne.position.z = -(eyeDis / 10);

	if (eyeDis < -20 && eyeDis > -80) {
		var mappedDis = THREE.Math.mapLinear(eyeDis, -20, -80, -10, 2);
		suzanne.position.x = mappedDis / factor;
		suzanne.position.z = mappedDis / factor;

		suzanne.position.y = (mappedDis / factor);
	}
}

function difference(a, b) { return Math.abs(a - b); }

function buildPosGui() {
	var posFolder = gui.addFolder('Position Suzanne');
	posFolder.add(suzanne.position, 'x', -10, 10, 0.1).onChange((val) => { suzanne.position.x = val });
	posFolder.add(suzanne.position, 'y', -10, 10, 0.1).onChange((val) => { suzanne.position.y = val });
	posFolder.add(suzanne.position, 'z', -10, 10, 0.1).onChange((val) => { suzanne.position.z = val });
	// posFolder.add(suzanne, 'all', -100, 100, 0.1).onChange((val) => {
	// 	camera.position.set(val, val, val);

	// 	if (cameraSettings.followTractor) {
	// 		goal.position.set(val, val, val);
	// 	}
	// });
}