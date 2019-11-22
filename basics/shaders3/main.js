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
		camera;

var gui;

let material;

let presets = {
	shade: {
		speed: 0.00041,
		transformIntencity: 3,
		transformScale: 0.3,
	}
}

let width;
let plane;
let height;
var container;

let params = {
	speed: {
		speed: presets.shade.speed,
		min: 0.000001,
		max: 0.001,
		uniform: true,
	},
	transformIntencity: {
		transformIntencity: presets.shade.transformIntencity,
		min: 0,
		max: 10,
		uniform: true,
		update: function(e) {
			material.uniforms.transformIntencity.value = e;
		}
	},
	transformScale: {
		transformScale: presets.shade.transformScale,
		min: 0,
		max: 10,
		uniform: true,
		update: function(e) {
			material.uniforms.transformScale.value = e;
		} 
	},
};

var cameraSettings = { clip : false };

const start = Date.now();

function init() {
	scene = new THREE.Scene();
	material = materialGeomitry();

	initRenderer();
	initCamera();
	addPlane();
}


function addPlane() {
	var geometry = new THREE.PlaneBufferGeometry( 20, 20, 120, 120 );
	plane = new THREE.Mesh( geometry, material );

	scene.add( plane );
}

function initCamera() {
	camera = new THREE.PerspectiveCamera(
		70,
		window.innerWidth < 700 ? window.innerWidth / window.innerWidth : 600 / 600,
		0.001,
		1000
	);

	camera.position.set(0, 0, cameraSettings.clip ? 10 : 25);
	camera.aspect = width / height;

	const dist  = camera.position.z;
	const height = 1;
	camera.fov = 2*(180/Math.PI)*Math.atan(height/(2*dist));
}


function render() {
	material.uniforms.time.value = params.speed.speed * (Date.now() - start);

	requestAnimationFrame(render);
	renderer.render(scene, camera);
}

function initGui() {
	gui = new dat.GUI();

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

	gui.add(cameraSettings, "clip").onChange(function(e) { 
		camera.position.set(0, 0, e ? 10 : 25);
	});
}


init();
render();
initGui();


function initRenderer() {

	renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
	renderer.setPixelRatio(window.devicePixelRatio);
	container = document.querySelector(".canvascontainer");

	renderer.setSize(container.offsetWidth, container.offsetHeight);
	
	renderer.setPixelRatio(window.devicePixelRatio);
	container.appendChild(renderer.domElement);
}

function materialGeomitry() {
	const material = new THREE.ShaderMaterial({
    uniforms: {
			texture: { 
				type: "t", 
				value: THREE.ImageUtils.loadTexture( "turtle.jpg" )
			},
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
      time: {
        type: 'f',
        value: 0.0,
      },
    },
    vertexShader: document.getElementById('vertexShader').textContent,
    fragmentShader: document.getElementById('fragmentShader').textContent,
	});
	
	const speedFactor = 0.00001;

  material.uniforms.time.value = speedFactor * (Date.now() - start);
	material.needsUpdate = true;

	return material;
}

function paralaxstuff() {
	// eslint-disable-next-line no-undef
	const instance = basicScroll.create({
		elem: document.querySelector('.canvascontainer'),
		from: 'top-bottom',
		to: 'bottom-top',
		direct: true,
		inside: (instance, percentage, props) => {
			let val = parseFloat(props.speed); 
	
			if (val >= 0) {
				val = 0;
			}
	
			params.transformIntencity.transformIntencity = val;
			params.transformIntencity.update(val);
		},
		props: {
			'--translate-y': {
				from: '80px',
				to: '-80px'
			},
			'--scale': {
				from: 1.3,
				to: 2 // 1.5
			},
			'speed': {
				from: -6.4,
				to: 6.4,
			},
		}
	});
	
	instance.start();
}

paralaxstuff();