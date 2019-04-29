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
} from '../../helpers/classes/lights';

import {
	createObjects
} from '../../helpers/functions/basic-objects';

// helpers
import 'three/src/helpers/SpotLightHelper';
import 'three/src/helpers/DirectionalLightHelper';
import 'three/src/helpers/PointLightHelper';
import 'three/src/helpers/HemisphereLightHelper';
 
import { loadModel } from '../../helpers/functions/load-model';

//?--------------------------------------------------------------------
//?		Base
//?--------------------------------------------------------------------

var renderer,
		scene,
		camera,
		theCanvas = document.getElementById('gl-canvas');
 
let activeLightSettings = {
	light: null,
	type: 'Spotlight',
	GuiSettings: null,
	Helper: null,
	ShadowCameraHelper: null,
};

var gui;
var lightsGui;
// var activeLightType = { type: 'SpotLight'};

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
	for(let i = 2; i < meshes.length; i++) {
		scene.add(meshes[i]);
	}

	// loadModel('robot/robot.mtl', 'robot/robot-lg.obj', scene);
	loadModel('Ambulance', scene);

	// mesh.castShadow = true;
	// controls.target.copy(meshes[0].position);
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

	var settings = activeLightSettings.GuiSettings.params;

	// build settings of params
	Object.keys(settings).forEach((key) => {
		if (key === 'color' || key === 'groundColor') {
			lightsGui.addColor(settings, key).onChange((val) => {
				activeLightSettings.light[key].setHex(val);
				render();
			});
		} else if(key === 'position') {
			createGuiSetting(lightsGui, settings[key], 'x', key);
			createGuiSetting(lightsGui, settings[key], 'y', key);
			createGuiSetting(lightsGui, settings[key], 'z', key);
		} else {
			createGuiSetting(lightsGui, settings[key], key, key);
		}
	});

	// lightsGui.open();
}

function createGuiSetting(folder, setting, name, key) {
	folder
	.add(setting, name, setting.min, setting.max)
	.onChange(
		(val) => {
			if (name === 'x' || name === 'y' || name === 'z') {
				activeLightSettings.light[key][name] = val;
			} else {
				activeLightSettings.light[key] = val;
			}
			render();
		}
	);
}

function setLight() {
	Object.keys(activeLightSettings.GuiSettings).forEach((key) => {
		if (key === 'position') {
			activeLightSettings.light.position.x = activeLightSettings.GuiSettings[key].x;
			activeLightSettings.light.position.y = activeLightSettings.GuiSettings[key].y;
			activeLightSettings.light.position.z = activeLightSettings.GuiSettings[key].z;
		} else {
			activeLightSettings.light[key] = activeLightSettings.GuiSettings[key];
		}
	});

	scene.add(activeLightSettings.light);

	if (activeLightSettings.Helper) { scene.add(activeLightSettings.Helper); }

	if (activeLightSettings.light.shadow) {
		activeLightSettings.ShadowCameraHelper = new THREE.CameraHelper(activeLightSettings.light.shadow.camera);
		scene.add(activeLightSettings.ShadowCameraHelper);
	}
} 

function render() {
	if (activeLightSettings.Helper) { 
		activeLightSettings.Helper.update(); 
		activeLightSettings.ShadowCameraHelper.update();
	} 
	
	renderer.render(scene, camera);
}

function initGui() {
	gui = new dat.GUI();
	gui.add(
		activeLightSettings,
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
	scene.remove(activeLightSettings.light);
	scene.remove(activeLightSettings.Helper);
	scene.remove(activeLightSettings.ShadowCameraHelper);

	switch(type) {
		case 'SpotLight':
			activeLightSettings.light = new THREE.SpotLight(0xffffff, 1);
			activeLightSettings.Helper = new THREE.SpotLightHelper(activeLightSettings.light);
			activeLightSettings.GuiSettings = new SpotLight;
			break;
		case 'PointLight':
			activeLightSettings.light = new THREE.PointLight(0xffffff, 2.0, 600);
			activeLightSettings.Helper = new THREE.PointLightHelper(activeLightSettings.light);
			activeLightSettings.GuiSettings = new PointLight;
			break;
		case 'HemisphereLight':
			activeLightSettings.light = new THREE.HemisphereLight(0xffffbb, 0x0808dd, 1);
			activeLightSettings.Helper = new THREE.HemisphereLightHelper(activeLightSettings.light);
			activeLightSettings.GuiSettings = new HemisphereLight;
			activeLightSettings.GuiSettings.params.groundColor = activeLightSettings.light.color.getHex();
			break;
		case 'DirectionalLight':
			activeLightSettings.light = new THREE.DirectionalLight(0xffffff, 2.0, 1000);
			activeLightSettings.Helper = new THREE.DirectionalLightHelper(activeLightSettings.light);
			activeLightSettings.GuiSettings = new DirectionalLight;
			break;
		case 'AmbientLight':
			activeLightSettings.light = new THREE.AmbientLight(0xffffff, 0.5);
			activeLightSettings.Helper = null;
			activeLightSettings.GuiSettings = new AmbientLight;
			break;
	}

	activeLightSettings.GuiSettings.params.color = activeLightSettings.light.color.getHex();
	buildGui();
	setLight();
	render();
}
