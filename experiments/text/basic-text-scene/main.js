/* eslint-disable no-unused-vars */
import * as dat from 'dat.gui';
import * as THREE from 'three';
import 'three/examples/js/controls/OrbitControls';
// import 'three/examples/fonts/droi';

var textLoader = new THREE.FontLoader();
let renderer,
		scene,
		camera,
		gui,
		controls,
		theCanvas = document.getElementById('gl-canvas');

textLoader.load( './fonts/helvetiker_regular.typeface.json', function ( font ) {
	var textMaterial = new THREE.MeshBasicMaterial({color: 0x00ff00});

	var textGeometry = new THREE.TextBufferGeometry( 'Hello three.js!', {
		font: font,
		size: 80,
		height: 5,
		curveSegments: 12,
		bevelEnabled: false,
		bevelThickness: 0,
		bevelSize: 8,
		bevelOffset: 0,
		bevelSegments: 5
	} );

	var textMesh = new THREE.Mesh(textGeometry, textMaterial);
	scene.add(textMesh);
});


function init() {
	initRenderer();
	
	scene = new THREE.Scene();
	
	camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000);
	camera.position.z = 500;
	
	initControls();
	
	var light = new THREE.DirectionalLight(0xffffff, 1);
	light.position.set(5,3,5);
	scene.add(light);
	
	// scene.background = new THREE.Color( params.bgColor.bgColor);
	window.addEventListener('resize', onResize, false);
}

function onResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize(window.innerWidth, window.innerHeight);
}


function render() {
	controls.update();

	requestAnimationFrame(render);
	renderer.render(scene, camera);
}

function initGui() {
	gui = new dat.GUI();

	// gui.add(
	// 	presets,
	// 	'type',
	// 	['dots', 'shade'] 
	// )
	// .onChange((val) => {
	// 	updatePresets(val); 
	// });
}


init();
render();
initGui();


function initRenderer() {
	renderer = new THREE.WebGLRenderer({
		canvas: theCanvas, 
		antialias: true
	});
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
}


function initControls() {
	controls = new THREE.OrbitControls(camera, renderer.domElement); //? NO trackball for gui issues
	// controls.addEventListener('change', render); //? needed if theres no loop going on
	controls.minDistance = 0;
	controls.maxDistance = 700;
	// controls.enablePan = true;
} 