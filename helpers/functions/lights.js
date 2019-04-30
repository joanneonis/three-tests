/* eslint-disable no-unused-vars */
import * as dat from 'dat.gui';
import * as THREE from 'three';
import {
	SpotLight, 
	PointLight,
	HemisphereLight,
	DirectionalLight,
	AmbientLight
} from '../../helpers/classes/lights';

// helpers
import 'three/src/helpers/SpotLightHelper';
import 'three/src/helpers/DirectionalLightHelper';
import 'three/src/helpers/PointLightHelper';
import 'three/src/helpers/HemisphereLightHelper';
 
export function changeLightType(type, scene) {
	scene.userData.gui.add(
		scene.userData.activeLightSettings,
		'type',
		['SpotLight', 'PointLight', 'HemisphereLight', 'DirectionalLight', 'AmbientLight'] 
	)
	.onChange((val) => {
		setlightType(val, scene); 
		// render(); //!idk
	}
	);
}

export function buildGui(scene) {
	if (scene.userData.lightsGui) { scene.userData.gui.removeFolder(scene.userData.lightsGui) }
	scene.userData.lightsGui = scene.userData.gui.addFolder('Light');

	if (scene.userData.activeLightSettings.GuiSettings) {
		var settings = scene.userData.activeLightSettings.GuiSettings.params;
	
		// build settings of params
		Object.keys(settings).forEach((key) => {
			if (key === 'color' || key === 'groundColor') {
				scene.userData.lightsGui.addColor(settings, key).onChange((val) => {
					scene.userData.activeLightSettings.light[key].setHex(val);
					// render(); //!idk
				});
			} else if(key === 'position') {
				createGuiSetting(scene, settings[key], 'x', key, scene.userData.activeLightSettings);
				createGuiSetting(scene, settings[key], 'y', key, scene.userData.activeLightSettings);
				createGuiSetting(scene, settings[key], 'z', key, scene.userData.activeLightSettings);
			} else {
				createGuiSetting(scene, settings[key], key, key, scene.userData.activeLightSettings);
			}
		});
	}

	// scene.userData.lightsGui.open();
}

export function createGuiSetting(scene, setting, name, key) {
	scene.userData.lightsGui
	.add(setting, name, setting.min, setting.max)
	.onChange(
		(val) => {
			if (name === 'x' || name === 'y' || name === 'z') {
				scene.userData.activeLightSettings.light[key][name] = val;
			} else {
				scene.userData.activeLightSettings.light[key] = val;
			}
			// render(); //!idk
		}
	);
}

export function setLight(scene) {
	Object.keys(scene.userData.activeLightSettings.GuiSettings).forEach((key) => {
		if (key === 'position') {
			scene.userData.activeLightSettings.light.position.x = scene.userData.activeLightSettings.GuiSettings[key].x;
			scene.userData.activeLightSettings.light.position.y = scene.userData.activeLightSettings.GuiSettings[key].y;
			scene.userData.activeLightSettings.light.position.z = scene.userData.activeLightSettings.GuiSettings[key].z;
		} else {
			scene.userData.activeLightSettings.light[key] = scene.userData.activeLightSettings.GuiSettings[key];
		}
	});

	scene.add(scene.userData.activeLightSettings.light);
	
	if (scene.userData.activeLightSettings.Helper) { scene.add(scene.userData.activeLightSettings.Helper); }
	
	if (scene.userData.activeLightSettings.light.shadow) {
		scene.userData.activeLightSettings.ShadowCameraHelper = new THREE.CameraHelper(scene.userData.activeLightSettings.light.shadow.camera);
		scene.add(scene.userData.activeLightSettings.ShadowCameraHelper);
	}

	// scene.userData.scene.userData.activeLightSettings = scene.userData.activeLightSettings;
} 


export function setlightType(type, scene) {
	scene.remove(scene.userData.activeLightSettings.light);
	scene.remove(scene.userData.activeLightSettings.Helper);
	scene.remove(scene.userData.activeLightSettings.ShadowCameraHelper);

	switch(type) {
		case 'SpotLight':
			scene.userData.activeLightSettings.light = new THREE.SpotLight(0xffffff, 1);
			scene.userData.activeLightSettings.Helper = new THREE.SpotLightHelper(scene.userData.activeLightSettings.light);
			scene.userData.activeLightSettings.GuiSettings = new SpotLight;
			break;
		case 'PointLight':
			scene.userData.activeLightSettings.light = new THREE.PointLight(0xffffff, 2.0, 600);
			scene.userData.activeLightSettings.Helper = new THREE.PointLightHelper(scene.userData.activeLightSettings.light);
			scene.userData.activeLightSettings.GuiSettings = new PointLight;
			break;
		case 'HemisphereLight':
			scene.userData.activeLightSettings.light = new THREE.HemisphereLight(new THREE.Color("rgb(255, 255, 255)"), new THREE.Color("rgb(0, 0, 0)"), 1);
			scene.userData.activeLightSettings.Helper = new THREE.HemisphereLightHelper(scene.userData.activeLightSettings.light);
			scene.userData.activeLightSettings.GuiSettings = new HemisphereLight;
			scene.userData.activeLightSettings.GuiSettings.params.groundColor = scene.userData.activeLightSettings.light.color.getHex();
			break;
		case 'DirectionalLight':
			scene.userData.activeLightSettings.light = new THREE.DirectionalLight(0xffffff, 2.0, 1000);
			scene.userData.activeLightSettings.Helper = new THREE.DirectionalLightHelper(scene.userData.activeLightSettings.light);
			scene.userData.activeLightSettings.GuiSettings = new DirectionalLight;
			break;
		case 'AmbientLight':
			scene.userData.activeLightSettings.light = new THREE.AmbientLight(0xffffff, 0.5);
			scene.userData.activeLightSettings.Helper = null;
			scene.userData.activeLightSettings.GuiSettings = new AmbientLight;
			break;
	}

	scene.userData.activeLightSettings.GuiSettings.params.color = scene.userData.activeLightSettings.light.color.getHex();
	buildGui(scene);
	setLight(scene);
	// render(); //!idk
}
