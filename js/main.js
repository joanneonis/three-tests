/* eslint-disable no-unused-vars */
import * as THREE from 'three';
import 'three/examples/js/controls/OrbitControls';
import 'three/examples/js/exporters/OBJExporter';
import 'three/examples/js/controls/TrackballControls.js';

let objFile;

// init renderer
var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// init scene and camera
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 3000);
camera.position.z = 5;
var controls = new THREE.OrbitControls(camera)
 






// our code
var box = new THREE.BoxGeometry(1, 1, 1);
var sphere = new THREE.SphereGeometry(.65, 32, 32);

var singleGeometry = new THREE.Geometry();

var boxMesh = new THREE.Mesh(box);
var sphereMesh = new THREE.Mesh(sphere);

boxMesh.updateMatrix(); // as needed
singleGeometry.merge(boxMesh.geometry, boxMesh.matrix);

sphereMesh.updateMatrix(); // as needed
singleGeometry.merge(sphereMesh.geometry, sphereMesh.matrix);

var material = new THREE.MeshPhongMaterial({color: 0xFF0000});
var mesh = new THREE.Mesh(singleGeometry, material);
scene.add(mesh);










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
	generateObj(mesh);
	download('test.obj', objFile);
});