/* eslint-disable no-unused-vars */
import * as dat from 'dat.gui';
import * as THREE from 'three';
import 'three/examples/js/controls/OrbitControls';
import {
	SpotLight, 
	PointLight,
	HemisphereLight,
	DirectionalLight,
	AmbientLight
} from './classes/lights';

import {
	createObjects
} from './js/basicObjects';
 
// helpers
import 'three/src/helpers/SpotLightHelper';
import 'three/src/helpers/DirectionalLightHelper';
import 'three/src/helpers/PointLightHelper';
import 'three/src/helpers/HemisphereLightHelper';


//?--------------------------------------------------------------------
//?		Base
//?--------------------------------------------------------------------

var renderer,
		scene,
		camera,
		theCanvas = document.getElementById('gl-canvas');

var activeLight, activeLightSettings, activeLightHelper, activeShadowCameraHelper;

var gui;
var lightsGui;
var activeLightType = { type: 'SpotLight'};

var controls;

function init() {

	initRenderer();
	
	scene = new THREE.Scene();
	
	camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 1, 1000);
	camera.position.set(0, 0, -300);
	
	initControls();

	var ambient = new THREE.AmbientLight(0xffffff, 0.1);
	scene.add(ambient);
	
	scene.add(new THREE.AxesHelper(10));

	var meshes = createObjects();
	for(let i = 0; i < meshes.length; i++) {
		scene.add(meshes[i]);
	}

	// mesh.castShadow = true;
	controls.target.copy(meshes[0].position);
	controls.update();

	window.addEventListener('resize', onResize, false);

	setlightType('SpotLight');
}

function onResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize(window.innerWidth, window.innerHeight);
}

function buildGui() {
	if (lightsGui) { gui.removeFolder(lightsGui) }
	lightsGui = gui.addFolder('Light');

	var settings = activeLightSettings.params;

	// build settings of params
	Object.keys(settings).forEach((key) => {
		if (key === 'color' || key === 'groundColor') {
			lightsGui.addColor(settings, key).onChange((val) => {
				activeLight[key].setHex(val);
				render();
			});
		} else if(key === 'position') {
			createGuiSetting(settings[key], 'x', key);
			createGuiSetting(settings[key], 'y', key);
			createGuiSetting(settings[key], 'z', key);
		} else {
			createGuiSetting(settings[key], key, key);
		}
	});

	lightsGui.open();
}

function createGuiSetting(setting, name, key) {
	lightsGui
	.add(setting, name, setting.min, setting.max)
	.onChange(
		(val) => {
			if (name === 'x' || name === 'y' || name === 'z') {
				activeLight[key][name] = val;
			} else {
				activeLight[key] = val;
			}
			render();
		}
	);
}

function setLight() {
	Object.keys(activeLightSettings).forEach((key) => {
		if (key === 'position') {
			activeLight.position.x = activeLightSettings[key].x;
			activeLight.position.y = activeLightSettings[key].y;
			activeLight.position.z = activeLightSettings[key].z;
		} else {
			activeLight[key] = activeLightSettings[key];
		}
	});

	scene.add(activeLight);

	if (activeLightHelper) { scene.add(activeLightHelper); }

	if (activeLight.shadow) {
		activeShadowCameraHelper = new THREE.CameraHelper(activeLight.shadow.camera);
		scene.add(activeShadowCameraHelper);
	}
} 

function render() {
	if (activeLightHelper) { 
		activeLightHelper.update(); 
		activeShadowCameraHelper.update();
	} 
	
	renderer.render(scene, camera);
}

function initGui() {
	gui = new dat.GUI();
	gui.add(
		activeLightType,
		'type',
		['SpotLight', 'PointLight', 'HemisphereLight', 'DirectionalLight', 'AmbientLight'] 
	)
	.onChange((val) => {
		setlightType(val); 
		render();
	}
	);
}

initGui();
init();
buildGui();
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
	controls.addEventListener('change', render);
	controls.minDistance = 0;
	controls.maxDistance = 700;
	controls.enablePan = true;
}

function setlightType(type) {
	scene.remove(activeLight);
	scene.remove(activeLightHelper);
	scene.remove(activeShadowCameraHelper);

	switch(type) {
		case 'SpotLight':
			activeLight = new THREE.SpotLight(0xffffff, 1);
			activeLightHelper = new THREE.SpotLightHelper(activeLight);
			activeLightSettings = new SpotLight;
			break;
		case 'PointLight':
			activeLight = new THREE.PointLight(0xffffff, 2.0, 600);
			activeLightHelper = new THREE.PointLightHelper(activeLight);
			activeLightSettings = new PointLight;
			break;
		case 'HemisphereLight':
			activeLight = new THREE.HemisphereLight(0xffffbb, 0x0808dd, 1);
			activeLightHelper = new THREE.HemisphereLightHelper(activeLight);
			activeLightSettings = new HemisphereLight;
			activeLightSettings.params.groundColor = activeLight.color.getHex();
			break;
		case 'DirectionalLight':
			activeLight = new THREE.DirectionalLight(0xffffff, 2.0, 1000);
			activeLightHelper = new THREE.DirectionalLightHelper(activeLight);
			activeLightSettings = new DirectionalLight;
			break;
		case 'AmbientLight':
			activeLight = new THREE.AmbientLight(0xffffff, 0.5);
			activeLightHelper = null;
			activeLightSettings = new AmbientLight;
			break;
	}

	activeLightSettings.params.color = activeLight.color.getHex();
	buildGui();
	setLight();
	render();
}
