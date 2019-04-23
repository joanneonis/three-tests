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

const settings = {
	bgColor: "rgb(65,65,65)",
	canvasHeight: "window",
	canvasWidth: "window",
	container: "js-webgl-container-1",
	customBoundingBox: null,
	dotAmount: 80,
	dotColor: "rgb(0,0,0)",
	dotSize: 0.2,
	fogIntencity: 350,
	opacity: 1,
	position: {
		x: 0,
		y: 0,
		z: 0,
	},
	shapeColor: "rgb(65,65,65)",
	speed: 0.00001,
	transformIntencity: 10,
	transformScale: 0,
	variant: 0,
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
	const fogColor = 'rgb(65,65,65)';
  scene.fog = new THREE.Fog(fogColor, 0, settings.fogIntencity);
	scene.userData.fog = scene.fog;

	const material = materialGeomitry(scene);

	// init sphere with materialoptions
  const mesh = new THREE.Mesh(
    new THREE.IcosahedronGeometry(20, 4),
    material,
  );

  scene.userData.material = material;
	scene.userData.material.userData = { speedSettings: settings.speed };
	
	scene.add(mesh);
	mesh.position.set(settings.position.x, settings.position.y, settings.position.z);
	rotateObject(mesh, -10, 160, 10);
	
	window.addEventListener('resize', onResize, false);
}

function onResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize(window.innerWidth, window.innerHeight);
}


function render() {
	controls.update();
	scene.userData.material.uniforms.time.value = scene.userData.material.userData.speedSettings * (Date.now() - start);
	requestAnimationFrame(render);
	renderer.render(scene, camera);
}

function initGui() {
	gui = new dat.GUI();
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

function materialGeomitry(scene) {
	const material = new THREE.ShaderMaterial({
    uniforms: {
      transformScale: {
        type: 'f',
        value: settings.transformScale,
      },
      transformIntencity: {
        type: 'f',
        value: settings.transformIntencity,
      },
      opacity: {
        type: 'f',
        value: settings.opacity,
      },
      radius1: {
        type: 'f',
        value: settings.dotSize,
      },
      radius2: {
        type: 'f',
        value: settings.dotSize,
      },
      amount: {
        type: 'f',
        value: settings.dotAmount,
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
        value: new THREE.Color(settings.dotColor),
      },
      shapeColor: {
        type: 'c',
        value: new THREE.Color(settings.shapeColor),
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

	return material;
}

function rotateObject(object, degreeX = 0, degreeY = 0, degreeZ = 0) {
  object.rotateX(THREE.Math.degToRad(degreeX));
  object.rotateY(THREE.Math.degToRad(degreeY));
  object.rotateZ(THREE.Math.degToRad(degreeZ));
}