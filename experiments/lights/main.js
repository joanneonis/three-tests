/* eslint-disable no-unused-vars */
import * as dat from 'dat.gui';
import * as THREE from 'three';
import 'three/examples/js/controls/OrbitControls';
import {
	SpotLight
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


var spotLight, lightHelper, shadowCameraHelper;

var spotLightSettings;

var activeLight;
var activeLightHelper;
var activeShadowCameraHelper;

var gui;
var lightsGui;

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
}

function onResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize(window.innerWidth, window.innerHeight);
}

function buildGui() {
	lightsGui = gui.addFolder('Light Options');

	var settings = spotLightSettings.params;

	// build settings of params
	Object.keys(settings).forEach((key) => {
		if (key === 'color') {
			lightsGui.addColor(settings, key).onChange((val) => {
				spotLight[key].setHex(val);
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
				spotLight[key][name] = val;
			} else {
				spotLight[key] = val;
			}
			render();
		}
	);
}

function setLight() {
	spotLight = new THREE.SpotLight(0xffffff, 1);
	spotLightSettings = new SpotLight;
	spotLightSettings.params.color = spotLight.color.getHex()

	Object.keys(spotLightSettings).forEach((key,index) => {
		if (key === 'position') {
			spotLight.position.x = spotLightSettings[key].x;
			spotLight.position.y = spotLightSettings[key].y;
			spotLight.position.z = spotLightSettings[key].z;
		} else {
			spotLight[key] = spotLightSettings[key];
		}
	});

	scene.add(spotLight);

	lightHelper = new THREE.SpotLightHelper(spotLight);
	scene.add(lightHelper);

	shadowCameraHelper = new THREE.CameraHelper(spotLight.shadow.camera);
	scene.add(shadowCameraHelper);
}

function render() {
	if (lightHelper) { 
		lightHelper.update(); 
		shadowCameraHelper.update();
	}
	
	renderer.render(scene, camera);
}

init();
setLight();

gui = new dat.GUI();
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
	controls.enablePan = false;
}

dat.GUI.prototype.removeFolder = function(name) {
  var folder = this.__folders[name];
  if (!folder) {
    return;
  }
  folder.close();
  this.__ul.removeChild(folder.domElement.parentNode);
  delete this.__folders[name];
  this.onResize();
}