/* eslint-disable no-unused-vars */
import * as dat from 'dat.gui';
import * as THREE from 'three';
import 'three/examples/js/controls/OrbitControls';

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


var options = {
  uh: 0,
  lights: {
		activeLightEl: null,
		activeHelperEl: null,
    type: 'SpotLight',
  },
  reset: function() {
    // could do somethings
  },
};

const gui = new dat.GUI();
let lightsGui = gui.addFolder('Lights');
lightsGui.add(options.lights, 'type',['SpotLight', 'HemisphereLight', 'DirectionalLight', 'PointLight', 'AmbientLight']).onChange(test);

function test() {
	console.log('updated');
	changeLight(options.lights.type);
}

//MATERIAL
var material = new THREE.MeshLambertMaterial();
var material2 = new THREE.MeshPhongMaterial();
var material3 = new THREE.MeshStandardMaterial();


//GEOMETRY
var geometry = new THREE.BoxGeometry(100, 100, 100, 10, 10, 10);
var geometry2 = new THREE.SphereGeometry(50, 20, 20);
var geometry3 = new THREE.PlaneGeometry(10000, 10000, 100, 100);

var mesh = new THREE.Mesh(geometry, material);
mesh.position.z = 0;
mesh.position.x = -100;
mesh.position.y = -50;
scene.add(mesh);


var mesh2 = new THREE.Mesh(geometry2, material2);
mesh2.position.z = 0;
mesh2.position.x = 100;
mesh2.position.y = -50;
scene.add(mesh2);


var mesh3 = new THREE.Mesh(geometry3, material3);
mesh3.rotation.x = -90 * (Math.PI / 180);
mesh3.position.y = -100;
scene.add(mesh3);


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
	var light;
	var helper;

	switch(type) {
		case 'SpotLight':
			light = new THREE.SpotLight(0xffffff, 2.0, 1000);
			light.target = mesh;
			helper = new THREE.SpotLightHelper(light);
			break;
		case 'HemisphereLight':
			light = new THREE.HemisphereLight(0xffffbb, 0x0808dd, 1);
			helper = new THREE.HemisphereLightHelper(light, 100);
			break;
		case 'DirectionalLight':
			light = new THREE.DirectionalLight(0xffffff, 2.0, 1000);
			light.target = mesh;
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
}

