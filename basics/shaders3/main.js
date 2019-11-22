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
	initRenderer();
	
	scene = new THREE.Scene();
	
	// camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000);
	// camera.position.z = 50;

	camera = new THREE.PerspectiveCamera(
		70,
		window.innerWidth < 700 ? window.innerWidth / window.innerWidth : 600 / 600,
		0.001,
		1000
	);


	camera.position.set(0, 0, cameraSettings.clip ? 10 : 25);

	camera.aspect = width / height;
    
	material = materialGeomitry();

	planeTest();

	const dist  = camera.position.z;
	const height = 1;
	camera.fov = 2*(180/Math.PI)*Math.atan(height/(2*dist));
	
	// initControls();
	
	var light = new THREE.DirectionalLight(0xffffff, 1);
	light.position.set(5,3,5);
	scene.add(light);

	
	// scene.background = new THREE.Color( params.bgColor.bgColor);
	window.addEventListener('resize', onResize, false);
}

function SphereExample() {
	// init sphere with materialoptions
  const mesh = new THREE.Mesh(
		new THREE.IcosahedronGeometry(5, 5),
		// new THREE.PlaneBufferGeometry( 5, 20, 32 ),
    material,
	);

	scene.add(mesh);
	mesh.position.set(30, 0, 0);
	rotateObject(mesh, -10, 160, 10);
}

function onResize() {
	// width = container.offsetWidth;
	// height = container.offsetHeight;
	// renderer.setSize(width, height);

	// camera.aspect = width / height;
	// camera.updateProjectionMatrix();
}

function planeTest() {
	var geometry = new THREE.PlaneBufferGeometry( 20, 20, 120, 120 );
	plane = new THREE.Mesh( geometry, material );

	scene.add( plane );
}


function render() {
	// controls.update();
	material.uniforms.time.value = params.speed.speed * (Date.now() - start);

	requestAnimationFrame(render);
	renderer.render(scene, camera);
}

function initGui() {
	gui = new dat.GUI();

	// gui.add(
	// 	presets,
	// 	'type',
	// 	['shade'] 
	// )
	// .onChange((val) => {
	// 	updatePresets(val); 
	// });

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
	// camera.position.set(0, 0, 10);
}


init();
render();
initGui();


function initRenderer() {

	renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
	renderer.setPixelRatio(window.devicePixelRatio);
	container = document.querySelector(".canvascontainer");
	let width = container.offsetWidth;
	let height = container.offsetHeight;
	container.appendChild(renderer.domElement);
	renderer.setSize(width, height);
	
	
	// renderer = new THREE.WebGLRenderer({
	// 	canvas: theCanvas, 
	// 	antialias: true
	// });
	renderer.setPixelRatio(window.devicePixelRatio);
	container.appendChild(renderer.domElement);
	// renderer.setSize(window.innerWidth, window.innerHeight);
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




const instance1 = basicScroll.create({
	elem: document.querySelector('.canvascontainer'),
	from: 'top-bottom',
	to: 'bottom-top',
	direct: true,
	inside: (instance, percentage, props) => {
		console.log(instance, percentage, props);
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

instance1.start();