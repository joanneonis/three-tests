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

var gui;

let material;

let presets = {
	type: 'dots',
	bgColor: "rgb(220,250,255)",
	shapeColor: "rgb(255,255,255)",
	fogColor: "rgb(220,250,255)",
	dots: {
		bgColor: "rgb(220,250,255)",
		dotColor: "rgb(255,255,255)",
		speed: 0.00001,
		dotAmount: 80,
		fogIntencity: 150,
		dotSize: 0,
		shapeColor: "rgb(65,65,65)",
		transformIntencity: 10,
		transformScale: 10.0,
		fogColor: "rgb(220,250,255)",
	},
	shade: {
		bgColor: "rgb(220,250,255)",
		dotColor: "rgb(53,133,190)",
		speed: 0.000086,
		dotAmount: 115,
		fogIntencity: 150,
		dotSize: 0.18,
		shapeColor: "rgb(53,133,190)",
		transformIntencity: 20,
		transformScale: 0,
		fogColor: "rgb(148,0,255)",
	}
}

let params = {
	bgColor: {
		bgColor: presets.bgColor,
		type: 'color',
		update: function(e) {
			scene.background = new THREE.Color(e)
		},
	},
	dotColor: {
		dotColor: "rgb(255,255,255)",
		type: 'color',
		uniform: true,
		update: function(e) {
			material.uniforms.dotColor.value = new THREE.Color(e);
		},
	},
	speed: {
		speed: 0.000237,
		min: 0.000001,
		max: 0.001,
		uniform: true,
	},
	dotAmount: {
		dotAmount: 80,
		min: 0,
		max: 150,
		uniform: true,
		update: function(e) {
			material.uniforms.amount.value = e;
		}
	},
	fogIntencity: {
		fogIntencity: 150,
		min: 10,
		max: 150,
		update: function(e) {
			scene.fog.far = e;
		}
	},
	dotSize: {
		dotSize: 0.2,
		min: 0.02,
		max: 0.5,
		uniform: true,
		update: function(e) {
			material.uniforms.radius1.value = e;
			material.uniforms.radius2.value = e;
		}
	},
	shapeColor: {
		shapeColor: presets.shapeColor,
		type: 'color',
		uniform: true,
		update: function(e) {
			material.uniforms.shapeColor.value = new THREE.Color(e);
		},
	},
	transformIntencity: {
		transformIntencity: 10,
		min: 0,
		max: 50,
		uniform: true,
		update: function(e) {
			material.uniforms.transformIntencity.value = e;
		}
	},
	transformScale: {
		transformScale: 10.0,
		min: -1000,
		max: 1000,
		uniform: true,
		update: function(e) {
			material.uniforms.transformScale.value = e;
		} 
	},
	fogColor: {
		fogColor: presets.fogColor,
		type: 'color',
		update: function(e) {
			scene.fog.color = new THREE.Color(e);
		} 
	},
};




const start = Date.now();

function init() {
	initRenderer();
	
	scene = new THREE.Scene();
	
	camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000);
	camera.position.z = 50;
	
	initControls();
	
	var light = new THREE.DirectionalLight(0xffffff, 1);
	light.position.set(5,3,5);
	scene.add(light);

	// fog
	const fogColor = params.fogColor.fogColor;
  scene.fog = new THREE.Fog(fogColor, 0, params.fogIntencity.fogIntencity);

	material = materialGeomitry();

	// init sphere with materialoptions
  const mesh = new THREE.Mesh(
    new THREE.IcosahedronGeometry(20, 4),
    material,
  );
	
	scene.add(mesh);
	mesh.position.set(0, 0, 0);
	rotateObject(mesh, -10, 160, 10);
	
	scene.background = new THREE.Color( params.bgColor.bgColor);
	window.addEventListener('resize', onResize, false);
}

function onResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize(window.innerWidth, window.innerHeight);
}


function render() {
	controls.update();
	material.uniforms.time.value = params.speed.speed * (Date.now() - start);

	requestAnimationFrame(render);
	renderer.render(scene, camera);
}

function initGui() {
	gui = new dat.GUI();

	gui.add(
		presets,
		'type',
		['dots', 'shade'] 
	)
	.onChange((val) => {
		updatePresets(val); 
	});

	Object.keys(params).forEach((key) => {		
		if (params[key].type === 'color') {
			gui.addColor(params[key], key).onChange((e) => {
				params[key].update(e);
			}); 
		} else if(key === 'speed') {
			gui.add(params[key], key, params[key].min, params[key].max);
		} else {
			gui.add(params[key], key, params[key].min, params[key].max).onChange((e) => {
				params[key].update(e);
			});
		}
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
}


function initControls() {
	controls = new THREE.OrbitControls(camera, renderer.domElement); //? NO trackball for gui issues
	// controls.addEventListener('change', render); //? needed if theres no loop going on
	controls.minDistance = 0;
	controls.maxDistance = 700;
	// controls.enablePan = true;
}

function materialGeomitry() {
	const material = new THREE.ShaderMaterial({
    uniforms: {
      transformScale: {
        type: 'f',
        value: params.transformScale.transformScale,
      },
      transformIntencity: {
        type: 'f',
        value: params.transformIntencity.transformIntencity,
      },
      opacity: {
        type: 'f',
        value: 1,
      },
      radius1: {
        type: 'f',
        value: params.dotSize.dotSize,
      },
      radius2: {
        type: 'f',
        value: params.dotSize.dotSize,
      },
      amount: {
        type: 'f',
        value: params.dotAmount.dotAmount,
      },
      time: {
        type: 'f',
        value: 0.0,
      },
      fogColor: {
        type: 'c',
        value: scene.fog.color,
      },
      fogNear: {
        type: 'f',
        value: scene.fog.near,
      },
      fogFar: {
        type: 'f',
        value: scene.fog.far,
      },
      dotColor: {
        type: 'c',
        value: new THREE.Color(params.dotColor.dotColor),
      },
      shapeColor: {
        type: 'c',
        value: new THREE.Color(params.shapeColor.shapeColor),
      },
    },
    vertexShader: document.getElementById('vertexShader').textContent,
    fragmentShader: document.getElementById('fragmentShader').textContent,
    fog: true,
	});
	
	const speedFactor = 0.00001;
  material.uniforms.time.value = speedFactor * (Date.now() - start);

  // enable transparency in the material
	material.transparent = true;
	material.needsUpdate = true;

	return material;
}

function rotateObject(object, degreeX = 0, degreeY = 0, degreeZ = 0) {
  object.rotateX(THREE.Math.degToRad(degreeX));
  object.rotateY(THREE.Math.degToRad(degreeY));
  object.rotateZ(THREE.Math.degToRad(degreeZ));
}

function updatePresets(e) {
	Object.keys(presets[e]).forEach((key) => {	
		if(key === 'speed') {
			params.speed.speed = presets[e][key]; 
		} else {
			params[key][key] = presets[e][key];
			params[key].update(presets[e][key]);
			gui.updateDisplay();
		}
	});
}