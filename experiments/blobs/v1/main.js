import * as dat from 'dat.gui';
import * as THREE from 'three';
import * as OIMO from 'oimo';
import 'three/examples/js/controls/OrbitControls';


// three var
var camera, scene, light, renderer, canvas, controls;
var views = [];
var material;
var boxGeometry;

//oimo var
var world = null;
var models = [];

var testRotation = 0;
var view;

init();
loop();

function init() {
	initThree();
	initOimo();

	createGround();
	createBlocks();

	window.addEventListener('resize', onWindowResize, false);
}

function initThree() {
	canvas = document.getElementById("canvas");

	camera = new THREE.PerspectiveCamera(60, canvas.width / canvas.height, 1, 5000);
	camera.position.set(400, 200, 100);

	renderer = new THREE.WebGLRenderer({
		canvas: canvas,
		precision: "mediump",
		antialias: true
	});
	onWindowResize();
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFShadowMap;

	controls = new THREE.OrbitControls(camera, canvas);
	controls.target.set(0, 0, 0);

	scene = new THREE.Scene();

	// light
	scene.add(new THREE.AmbientLight(0x666666));
	light = new THREE.DirectionalLight(0xffffff, 1.5);
	light.position.set(100, 200, 300);
	light.target.position.set(0, 0, 0);
	light.castShadow = true;
	light.shadowMapWidth = 1024;
	light.shadowMapHeight = 1024;
	scene.add(light);

	boxGeometry = new THREE.BufferGeometry();
	boxGeometry.fromGeometry(new THREE.BoxGeometry(1, 1, 1));

	material = new THREE.MeshPhongMaterial({
		color: 0x888888
	});
}

function initOimo() {
	world = new OIMO.World(1 / 60, 2, 8);
}

function createGround() {
	var config = [1, 0.4, 0.2, 1, 0xffffffff];
	world.add({
		size: [400, 40, 400],
		pos: [0, -20, 0],
		config: config
	});

	view = new THREE.Mesh(boxGeometry, material);
	view.scale.set(400, 40, 400);
	view.position.set(0, -20, 0);
	view.castShadow = true;
	view.receiveShadow = true;
	scene.add(view);
}

function createBlocks() {
	var config = [1, 0.4, 0.2, 1 << 1, 0xffffffff];

	var view, model;
	var pos, name;
	var w = 30;
	var N = 30; //30;
	for (var i = 0; i < N; i++) {
		name = 'block' + i;

		pos = generateBlockPosition();
		model = world.add({
			type: 'box',
			size: [w, w, w],
			pos: pos,
			move: true,
			config: config,
			name: name
		});
		models.push(model);

		view = new THREE.Mesh(boxGeometry, material);
		view.name = name;
		view.scale.set(w, w, w);
		view.castShadow = true;
		view.receiveShadow = true;

		views.push(view);
		scene.add(view);
	}
}

function onWindowResize() {
	var w = window.innerWidth - 20;
	var h = window.innerHeight - 20;
	camera.aspect = w / h;
	camera.updateProjectionMatrix();
	renderer.setSize(w, h);
}

function generateBlockPosition() {
	var x = (Math.random() * 2 - 1) * 20;
	var z = (Math.random() * 2 - 1) * 20;
	var y = 100 + Math.random() * 1000;
	return [x, y, z];
}

function loop() {
	update();
	renderer.render(scene, camera);
	requestAnimationFrame(loop);
}

function update() {
	world.step();

	var pos, view, model;
	var i;

	for (i = 0; i < models.length; i++) {
		model = models[i];

		if (model.getPosition().y < -100) {
			pos = generateBlockPosition();
			model.resetPosition(pos[0], pos[1], pos[2]);
		}
	}

	for (i = 0; i < models.length; i++) {
		model = models[i];
		view = views[i];

		view.position.copy(model.getPosition());
		view.quaternion.copy(model.getQuaternion());

		// if (model.sleeping) {
		// 	view.material = sleepMaterial;
		// } else {
		// 	view.material = material;
		// }
	}
}

window.onkeyup = function(e) {
    var key = e.keyCode ? e.keyCode : e.which;
    
    if (key == 38) {
			testRotation += .1;
    }else if (key == 40) {
			testRotation -= .1;
		}
		
		view.rotation.x = testRotation;
}