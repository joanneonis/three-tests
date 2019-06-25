
import * as THREE from 'three';
// import 'three/examples/js/vr/HelioWebXRPolyfill';
// import * as WEBVR from 'three/examples/js/vr/WebVR';
import 'three/examples/js/objects/Lensflare';
import 'three/examples/js/objects/Reflector';

var camera, scene, renderer;

var reflector;

init();
animate();

function init() {

	var background = new THREE.CubeTextureLoader()
		.setPath('resources/cube/MilkyWay/')
		.load(['dark-s_px.jpg', 'dark-s_nx.jpg', 'dark-s_py.jpg', 'dark-s_ny.jpg', 'dark-s_pz.jpg', 'dark-s_nz.jpg']);
	background.format = THREE.RGBFormat;

	scene = new THREE.Scene();
	scene.background = background;

	camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 10);

	var geometry = new THREE.TorusKnotBufferGeometry(0.4, 0.15, 150, 20);
	var material = new THREE.MeshStandardMaterial({
		roughness: 0.01,
		metalness: 0.2,
		envMap: background
	});
	var mesh = new THREE.Mesh(geometry, material);
	mesh.position.y = 0.75;
	mesh.position.z = -2;
	mesh.castShadow = true;
	mesh.receiveShadow = true;
	scene.add(mesh);

	var geometry = new THREE.BoxBufferGeometry(1.5, 0.1, 1.5);
	var material = new THREE.MeshPhongMaterial();
	var mesh = new THREE.Mesh(geometry, material);
	mesh.position.y = -0.2;
	mesh.position.z = -2;
	mesh.castShadow = true;
	mesh.receiveShadow = true;
	scene.add(mesh);

	var light = new THREE.DirectionalLight(0x8800ff);
	light.position.set(-1, 1.5, -1.5);
	light.castShadow = true;
	light.shadow.camera.zoom = 4;
	scene.add(light);
	light.target.position.set(0, 0, -2);
	scene.add(light.target);

	// var helper = new THREE.CameraHelper( light.shadow.camera );
	// scene.add( helper );

	var light = new THREE.DirectionalLight(0xff0000);
	light.position.set(1, 1.5, -2.5);
	light.castShadow = true;
	light.shadow.camera.zoom = 4;
	scene.add(light);
	light.target.position.set(0, 0, -2);
	scene.add(light.target);

	// var helper = new THREE.CameraHelper( light.shadow.camera );
	// scene.add( helper );

	// lensflare
	// var loader = new THREE.TextureLoader();
	// var texture0 = loader.load("textures/lensflare/lensflare0.png");
	// var texture3 = loader.load("textures/lensflare/lensflare3.png");

	// var lensflare = new THREE.Lensflare();
	// lensflare.position.set(0, 5, -5);
	// lensflare.addElement(new THREE.LensflareElement(texture0, 700, 0));
	// lensflare.addElement(new THREE.LensflareElement(texture3, 60, 0.6));
	// lensflare.addElement(new THREE.LensflareElement(texture3, 70, 0.7));
	// lensflare.addElement(new THREE.LensflareElement(texture3, 120, 0.9));
	// lensflare.addElement(new THREE.LensflareElement(texture3, 70, 1));
	// scene.add(lensflare);

	//

	var geometry = new THREE.PlaneBufferGeometry(1.4, 1.4);
	reflector = new THREE.Reflector(geometry, {
		textureWidth: window.innerWidth * window.devicePixelRatio,
		textureHeight: window.innerHeight * window.devicePixelRatio
	});
	reflector.position.x = 1;
	reflector.position.y = 0.5;
	reflector.position.z = -3;
	reflector.rotation.y = -Math.PI / 4;
	scene.add(reflector);

	var geometry = new THREE.BoxBufferGeometry(1.5, 1.5, 0.1);
	var material = new THREE.MeshPhongMaterial();
	var mesh = new THREE.Mesh(geometry, material);
	mesh.position.z = -0.07;
	mesh.castShadow = true;
	mesh.receiveShadow = true;
	reflector.add(mesh);

	//

	renderer = new THREE.WebGLRenderer({
		antialias: true
	});
	renderer.autoClear = false;
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.shadowMap.enabled = true;
	renderer.vr.enabled = true;
	document.body.appendChild(renderer.domElement);

	document.body.appendChild(WEBVR.createButton(renderer));
	// console.log(WEBVR);

	//

	window.addEventListener('resize', onWindowResize, false);

}

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize(window.innerWidth, window.innerHeight);

}

function animate() {

	renderer.setAnimationLoop(render);

}

function render() {

	var time = performance.now() * 0.0002;
	var mesh = scene.children[0];
	mesh.rotation.x = time * 2;
	mesh.rotation.y = time * 5;

	renderer.render(scene, camera);

}