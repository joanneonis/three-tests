/* eslint-disable no-unused-vars */
import * as dat from 'dat.gui';
import * as THREE from 'three';
import 'three/examples/js/controls/OrbitControls';

//?--------------------------------------------------------------------
//?		Base
//? 	Earth source: http://blog.mastermaps.com/2013/09/creating-webgl-earth-with-threejs.html
//?--------------------------------------------------------------------

let renderer,
		scene,
		camera,
		controls,
		theCanvas = document.getElementById('gl-canvas');

let radius   = 0.5,
		segments = 32,
		rotation = 6;  

let sphere,
		clouds,
		stars;

let worldTexture,
		elevationTexture,
		waterTexture,
		starsTexture,
		cloudTexture;

var gui;

let materialSettings = {
	rotationSpeed: 0,
	world: {
		bumpScale:   0.005,
		specular:    new THREE.Color('grey'),
		shininess: 	 3,
		needsUpdate: true,
	},
	stars: {
		side: THREE.BackSide,
		needsUpdate: true,
	},
	clouds: {
		transparent: true,
		needsUpdate: true,
	}
}


function init() {
	loadTextures();

	initRenderer();
	
	scene = new THREE.Scene();
	
	camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 1000);
	camera.position.z = 1.5;
	
	initControls();
	
	var light = new THREE.DirectionalLight(0xffffff, 1);
	light.position.set(5,3,5);
	scene.add(light);
	
	sphere = createSphere(radius, segments);
	sphere.rotation.y = rotation; 
	scene.add(sphere)

	clouds = createClouds(radius, segments);
	clouds.rotation.y = rotation;
	scene.add(clouds)

	stars = createStars(90, 64);
	scene.add(stars);

	// if (sphere) { controls.target.copy(sphere); }
	// controls.update();

	window.addEventListener('resize', onResize, false);
}

function onResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize(window.innerWidth, window.innerHeight);
}


function render() {
	controls.update();
	sphere.rotation.y += materialSettings.rotationSpeed;
	clouds.rotation.y += materialSettings.rotationSpeed;		
	requestAnimationFrame(render);
	renderer.render(scene, camera);
}

function initGui() {
	gui = new dat.GUI();

	gui.add(materialSettings, 'rotationSpeed', 0, 0.01);

	gui.addFolder('World');
	gui.add(
		materialSettings.world, 'bumpScale', 0, 0.1
	).onChange((val) => {
		sphere.material.bumpScale = val;
		materialSettings.world.bumpScale = val;
	});

	gui.add(
		materialSettings.world, 'shininess', 0, 50
	).onChange((val) => { 
		sphere.material.shininess = val;
		materialSettings.world.shininess = val;
	});
	gui.addColor(
		materialSettings.world, 'specular',
	).onChange((val) => { 
		console.log(`rgb(${val.r},${val.g}, ${val.b})`);
		sphere.material.specular = new THREE.Color(`rgb(${Math.round(val.r)},${Math.round(val.g)}, ${Math.round(val.b)})`);
		// materialSettings.world.specular = val;
		// console.log(materialSettings.world);
	});
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
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap;
}

function createSphere(radius, segments) {
	return new THREE.Mesh(
		new THREE.SphereGeometry(radius, segments, segments),
		new THREE.MeshPhongMaterial(materialSettings.world)
	);
}

function removeSphere() {
	scene.remove(sphere); // TODO material visible false?
}

function createClouds(radius, segments) {
	return new THREE.Mesh(
		new THREE.SphereGeometry(radius + 0.003, segments, segments),			
		new THREE.MeshPhongMaterial(materialSettings.clouds)
	);		
}

function removeClouds() {
	scene.remove(clouds);
}

function createStars(radius, segments) {
	return new THREE.Mesh(
		new THREE.SphereGeometry(radius, segments, segments), 
		new THREE.MeshBasicMaterial(materialSettings.stars)
	);
} 

function removeStars() {
	scene.remove(stars);
}

function loadTextures() {
	worldTexture = new THREE.TextureLoader().load('img/2_no_clouds_4k.jpg'); // keep in memory
	materialSettings.world.map = worldTexture;

	elevationTexture = new THREE.TextureLoader().load('img/elev_bump_4k.jpg');
	materialSettings.world.bumpMap = elevationTexture;

	waterTexture = new THREE.TextureLoader().load('img/water_4k.png');
	materialSettings.world.specularMap = waterTexture;

	starsTexture = new THREE.TextureLoader().load('img/galaxy_starfield.png');
	materialSettings.stars.map = starsTexture;

	cloudTexture = new THREE.TextureLoader().load('img/fair_clouds_4k.png');
	materialSettings.clouds.map = cloudTexture;
}

function initControls() {
	controls = new THREE.OrbitControls(camera, renderer.domElement); //? NO trackball for gui issues
	// controls.addEventListener('change', render); //? needed if theres no loop going on
	controls.minDistance = 0;
	controls.maxDistance = 700;
	// controls.enablePan = true;
}