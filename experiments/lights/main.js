/* eslint-disable no-unused-vars */
import * as dat from 'dat.gui';
import * as THREE from 'three';
import 'three/examples/js/controls/OrbitControls';
import { PointLight } from './classes/lights';

// helpers
import 'three/src/helpers/SpotLightHelper';
import 'three/src/helpers/DirectionalLightHelper';
import 'three/src/helpers/PointLightHelper';
import 'three/src/helpers/HemisphereLightHelper';



// ShadowMapViewer
// UnpackDepthRGBAShader
//?--------------------------------------------------------------------
//?		Base
//?--------------------------------------------------------------------

var renderer,
		scene,
		camera,
		theCanvas = document.getElementById('gl-canvas');


var materials = new Array(3);
var geometries = new Array(3);
var meshes = new Array(3);


//RENDERER
renderer = new THREE.WebGLRenderer({
	canvas: theCanvas, 
	antialias: true
});
renderer.setClearColor(0x333333);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

//SCENE
scene = new THREE.Scene();

let prevLightType = 'SpotLight';
var options = {
  uh: 0,
  lights: {
		activeLightEl: null,
		activeHelperEl: null,
		intensity: 0,
		position: { x: 0, y: 1, z: 0 },
		type: 'SpotLight',
	},
	pointLightSettings: new PointLight,
  reset: function() {
    // could do somethings
  },
};

const gui = new dat.GUI();
let lightsGui = gui.addFolder('Lights');
lightsGui.add(options.lights, 'type',['SpotLight', 'HemisphereLight', 'DirectionalLight', 'PointLight', 'AmbientLight']).onChange(updateLights);
// lightsGui.add(options.lights, 'intensity', 0, 10).onChange(updateLights);
lightsGui.add(options.lights.position, 'x', -1000, 1000).onChange(updateLights);
lightsGui.add(options.lights.position, 'y', -1000, 1000).onChange(updateLights);
lightsGui.add(options.lights.position, 'z', -1000, 1000).onChange(updateLights);
lightsGui.open();

Object.keys(options.pointLightSettings).forEach((key,index) => {
	lightsGui.add(options.pointLightSettings, key, options.pointLightSettings[key], options.pointLightSettings[key]+100).onChange(updateLights);
});

// to play: ?angle, color, position.x
function updateLights() {
	if (options.lights.type != prevLightType) { changeLight(options.lights.type); }
	options.lights.activeLightEl.intensity = options.lights.intensity;
	options.lights.activeLightEl.position.x = options.lights.position.x;
	options.lights.activeLightEl.position.y = options.lights.position.y;
	options.lights.activeLightEl.position.z = options.lights.position.z;

	Object.keys(options.pointLightSettings).forEach((key,index) => {
		options.lights.activeLightEl[key] = options.pointLightSettings[key];
	});
}

setObjects();


//?--------------------------------------------------------------------
//?		Lights
//?--------------------------------------------------------------------

setLight(options.lights.type);

//shadows
// renderer.shadowMap.enabled = true;
// renderer.shadowMap.type = THREE.PCFShadowMap;
//
// var light = new THREE.SpotLight(0xffffff, 4.0, 3000);
// light.position.y = 100;
// light.target = mesh;
//
// light.castShadow = true;
// light.shadow = new THREE.LightShadow( new THREE.PerspectiveCamera( 100, 1, 500, 1000 ) );
// light.shadow.bias = 0.0001;    
// light.shadow.mapSize.width = 2048 * 2;
// light.shadow.mapSize.height = 2048 * 2;
// scene.add(light);
//
// mesh.castShadow = true;
// mesh3.receiveShadow = true;
//
//
// var shadowMapViewer = new THREE.ShadowMapViewer( light );  
// shadowMapViewer.position.x = 10;
// shadowMapViewer.position.y = 10;
// shadowMapViewer.size.width = 2048 / 4;
// shadowMapViewer.size.height = 1024 / 4;
// shadowMapViewer.update();



//cameras


//perspective camera
camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 300, 10000 );
camera.position.z = 2000;
// var controls = new THREE.OrbitControls(camera)

//orthographic camera
// camera = new THREE.OrthographicCamera(-300, 300, 200, -200, 0.1, 10000);


//camera helper
// newCamera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 300, 1000 );

// newCamera = new THREE.OrthographicCamera(-300, 300, 200, -200, 0.1, 1000);

// var cameraHelper = new THREE.CameraHelper(newCamera);
// scene.add(cameraHelper);


//RENDER LOOP
render();


var delta = 0;
function render() {


	delta += 0.01;

	// spotLightHelper.update();
	// directionalLightHelper.update();

	renderer.render(scene, camera);
	// shadowMapViewer.render(renderer);

	requestAnimationFrame(render);
}

function changeLight(type) {
	scene.remove(options.lights.activeLightEl);
	if (options.lights.activeHelperEl !== null) { scene.remove(options.lights.activeHelperEl); }
	setLight(type);
}

function setLight(type) {
	prevLightType = type;
	var light;
	var helper;

	switch(type) {
		case 'SpotLight':
			light = new THREE.SpotLight(0xffffff, 2.0, 1000);
			light.target = meshes[0];
			helper = new THREE.SpotLightHelper(light);
			break;
		case 'HemisphereLight':
			light = new THREE.HemisphereLight(0xffffbb, 0x0808dd, 1);
			helper = new THREE.HemisphereLightHelper(light, 100);
			break;
		case 'DirectionalLight':
			light = new THREE.DirectionalLight(0xffffff, 2.0, 1000);
			light.target = meshes[0];
			helper = new THREE.DirectionalLightHelper(light, 100);
			break;
		case 'PointLight':
			light = new THREE.PointLight(0xffffff, 2.0, 600);
			helper = new THREE.PointLightHelper(light);
			break;
		case 'AmbientLight':
			light = new THREE.AmbientLight(0xffffff, 0.5);
			break;
	}

	scene.add(light);
	scene.add(helper);
	options.lights.activeLightEl = light;
	options.lights.activeHelperEl = helper;
	// options.lights.intensity = light.intensity;

	// console.log(light);
}

document.addEventListener('keyup', function (event) {
	if (event.defaultPrevented) {
		return;
	}

	let key = event.key || event.keyCode;

	switch (key) {
		case 'ArrowUp':
			// code block
			options.lights.activeLightEl.intensity += 1;

			break;
		case 'ArrowDown':
			// code block
			options.lights.activeLightEl.intensity -= 1;
			break;
		case 'ArrowLeft':
			// code block
			break;
		case 'ArrowRight':
			// code block
			break;
		case 'Enter':
			// nextLight();
			break;
	}
});
	
function setObjects() {
	//MATERIAL
	materials[0] = new THREE.MeshLambertMaterial();
	materials[1] = new THREE.MeshPhongMaterial();
	materials[2] = new THREE.MeshStandardMaterial();

	//GEOMETRY
	geometries[0] = new THREE.BoxGeometry(100, 100, 100, 10, 10, 10);
	geometries[1] = new THREE.SphereGeometry(50, 20, 20);
	geometries[2] = new THREE.PlaneGeometry(10000, 10000, 100, 100);

	for(let i = 0; i < meshes.length; i++) {
		meshes[i] = new THREE.Mesh(geometries[i], materials[i]);
	}

	meshes[0].position.z = 0;
	meshes[0].position.x = -100;
	meshes[0].position.y = -50;
	scene.add(meshes[0]);


	meshes[1].position.z = 0;
	meshes[1].position.x = 100;
	meshes[1].position.y = -50;
	scene.add(meshes[1]);


	meshes[2].rotation.x = -90 * (Math.PI / 180);
	meshes[2].position.y = -100;
	scene.add(meshes[2]);
}


var test = new PointLight;
test.color = 'rgb';
console.log(test);