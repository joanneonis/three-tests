/* eslint-disable no-unused-vars */
import * as THREE from 'three';
import 'three/examples/js/controls/OrbitControls';
import 'three/examples/js/exporters/OBJExporter';
import 'three/examples/js/controls/TrackballControls.js';

// file to download later on
let objFile;

// init renderer
var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// init scene and camera
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000);
camera.position.z = -100;
var controls = new THREE.OrbitControls(camera)
 

//?--------------------------------------------------------------------
//?		Creating and merging geometries
//?--------------------------------------------------------------------

// Init array so it can be updated
let meshes = new Array(12);

// generates 12 cubes grid
function addCubes() {
	let count = 0;
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

			// save meshes instead of adding to scene (for merging later)
			meshes[count] = mesh;
			count++;
		}
	}
}

addCubes();

var singleGeometry = new THREE.Geometry();

meshes.forEach(element => {
	element.updateMatrix();
	singleGeometry.merge(element.geometry, element.matrix);
});

var material = new THREE.MeshPhongMaterial({color: 0xFF0000});
var mesh = new THREE.Mesh(singleGeometry, material);
scene.add(mesh);


//?--------------------------------------------------------------------
//?		Lights and rendering
//?--------------------------------------------------------------------

// a light
var light = new THREE.HemisphereLight(0xfffff0, 0x101020, 1.25);
light.position.set(0.75, 1, 0.25);
scene.add(light);

// render
requestAnimationFrame(function animate(){
	requestAnimationFrame(animate);
	renderer.render(scene, camera);		
})

//?--------------------------------------------------------------------
//?		Download part
//?--------------------------------------------------------------------
// create download file 
// inspiration from: (https://stackoverflow.com/questions/2897619/using-html5-javascript-to-generate-and-save-a-file)
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

// mesh to obj
function generateObj(mesh) {
	var exporter = new THREE.OBJExporter();
	objFile = exporter.parse(mesh);
}

// download attached to btn
document.querySelector('button').addEventListener('click', function () {
	generateObj(mesh);
	download('test.obj', objFile);
});