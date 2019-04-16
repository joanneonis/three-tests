/* eslint-disable no-unused-vars */
import * as THREE from 'three';
import 'three/examples/js/controls/OrbitControls';
import 'three/examples/js/exporters/OBJExporter';
import 'three/examples/js/controls/TrackballControls.js';

let objFile;

// do stuff here
var camera, scene, renderer, mesh, material, controls;
var singleGeometry = new THREE.Geometry();
let meshes = [];
let meshMerged;

init();
animate();
addCubes();
render();


function addCubes() {
	var xDistance = 50;
	var zDistance = 30;
	var geometry = new THREE.BoxGeometry(10, 10, 10);
	var material = new THREE.MeshBasicMaterial({
		color: 0x00ff44
	});

	//initial offset so does not start in middle.
	var xOffset = -80;

	for (var i = 0; i < 4; i++) {
		for (var j = 0; j < 3; j++) {
			var mesh = new THREE.Mesh(geometry, material);
			mesh.position.x = (xDistance * i) + xOffset;
			mesh.position.z = (zDistance * j);
			scene.add(mesh);
			meshes.push(mesh);
		}
	}
}

function init() {
	// Renderer.
	renderer = new THREE.WebGLRenderer();
	//renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	// Add renderer to page
	document.body.appendChild(renderer.domElement);

	// Create camera.
	camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000);
	camera.position.z = 100;

	// Add controls
	controls = new THREE.TrackballControls(camera);
	controls.addEventListener('change', render);

	// Create scene.
	scene = new THREE.Scene();

	// Create ambient light and add to scene.
	var light = new THREE.AmbientLight(0x404040); // soft white light
	scene.add(light);

	// Create directional light and add to scene.
	var directionalLight = new THREE.DirectionalLight(0xffffff);
	directionalLight.position.set(1, 1, 1).normalize();
	scene.add(directionalLight);

	// Add listener for window resize.
	window.addEventListener('resize', onWindowResize, false);
}

function animate() {
	requestAnimationFrame(animate);
	controls.update();

}

let testMultiple = [];
// let meshes = [];
function render() {
	renderer.render(scene, camera);
	console.log(scene.children);

	// scene.children.forEach(mesh => {
	// 	meshes.push(mesh);
	// }); 

	generateObj(meshes[0]);
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
	controls.handleResize();
}

// download file (https://stackoverflow.com/questions/2897619/using-html5-javascript-to-generate-and-save-a-file)
function download(filename, text) {
	var pom = document.createElement('a');
	pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
	pom.setAttribute('download', filename);

	if (document.createEvent) {
		var event = document.createEvent('MouseEvents');
		event.initEvent('click', true, true);
		pom.dispatchEvent(event);
	} else {
		pom.click();
	}
}

function generateObj(mesh) {
	var exporter = new THREE.OBJExporter();
	objFile = exporter.parse(mesh);
}

document.querySelector('button').addEventListener('click', function () {
	download('test.obj', objFile);
});