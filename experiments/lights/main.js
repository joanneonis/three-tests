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

var gui;
var controls;

function init() {

	initRenderer();
	
	scene = new THREE.Scene();
	
	camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 1, 1000);
	camera.position.set(0, 0, -300);
	
	initControls();

	var ambient = new THREE.AmbientLight(0xffffff, 0.1);
	scene.add(ambient);

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

function render() {
	lightHelper.update();
	shadowCameraHelper.update();
	renderer.render(scene, camera);
}

function buildGui() {
	gui = new dat.GUI();

	Object.keys(spotLightSettings.params).forEach((key) => {
		if (key === 'color') {
			gui.addColor(spotLightSettings.params, key).onChange((val) => {
				spotLight[key].setHex(val);
				render();
			});
		} else if(key === 'position') {
			gui
				.add(spotLightSettings.params[key][key], 'x', spotLightSettings.params[key].min, spotLightSettings.params[key].max)
				.onChange( (val) => { spotLight[key]['x'] = val; render(); });
			gui
				.add(spotLightSettings.params[key][key], 'y', spotLightSettings.params[key].min, spotLightSettings.params[key].max)
				.onChange( (val) => { spotLight[key]['y'] = val; render(); });
			gui
				.add(spotLightSettings.params[key][key], 'z', spotLightSettings.params[key].min, spotLightSettings.params[key].max)
				.onChange( (val) => { spotLight[key]['z'] = val; render(); });
		} else {
			createGuiSetting(spotLightSettings.params[key], key);
		}
	});

	gui.open();
}

function createGuiSetting(setting, key) {
	gui
	.add(setting, key, setting.min, setting.max)
	.onChange(
		(val) => {
			spotLight[key] = val;
			render();
		}
	);
}

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
	controls.enablePan = false;
}