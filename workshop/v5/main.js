import * as dat from 'dat.gui';
import * as THREE from 'three';

import 'three/examples/js/controls/OrbitControls';
import 'three/examples/js/loaders/GLTFLoader';
// import 'three/examples/js/AnimationClipCreator';
import 'three/examples/js/loaders/OBJLoader';
import 'three/examples/js/exporters/OBJExporter';
import 'three/examples/js/exporters/GLTFExporter';

import { setlightType, buildGui, changeLightType } from '../../helpers/functions/lights';

let options;

var gui;

var cameraSettings = {
	cameraPos: {x: 58, y: 36, z: 36},
	followTractor: false,
	lookAt: true,
	all: 30,
};

var controls;
var model;
let meshes = [];
let mesh;
let theData;
let GridSize = 15;
let group;
let theCanvas;

function exportGLTF( input ) {

	var gltfExporter = new THREE.GLTFExporter();

	options = {
		trs: document.getElementById( 'option_trs' ).checked,
		onlyVisible: document.getElementById( 'option_visible' ).checked,
		truncateDrawRange: document.getElementById( 'option_drawrange' ).checked,
		binary: document.getElementById( 'option_binary' ).checked,
		forceIndices: document.getElementById( 'option_forceindices' ).checked,
		forcePowerOfTwoTextures: document.getElementById( 'option_forcepot' ).checked
	};
	gltfExporter.parse( input, function ( result ) {

		if ( result instanceof ArrayBuffer ) {
			saveArrayBuffer( result, 'scene.glb' );
		} else {
			var output = JSON.stringify( result, null, 2 );
			saveString( output, 'scene.gltf' );
		}

	}, options );
}

document.getElementById( 'export_scene' ).addEventListener( 'click', function () {
	exportGLTF( group );
});


var link = document.createElement( 'a' );
link.style.display = 'none';
document.body.appendChild( link ); // Firefox workaround, see #6594

function save( blob, filename ) {

	link.href = URL.createObjectURL( blob );
	link.download = filename;
	link.click();

	// URL.revokeObjectURL( url ); breaks Firefox...

}

function saveString( text, filename ) {
	save( new Blob( [ text ], { type: 'text/plain' } ), filename );
}


function saveArrayBuffer( buffer, filename ) {
	save( new Blob( [ buffer ], { type: 'application/octet-stream' } ), filename );
}


var container;

var camera, scene, renderer;

function initGui() {
	gui = new dat.GUI();

	initCameraGui();
}

initGui();

init();
render();

loadJSON(function(response) {
// Parse JSON string into object
	theData = JSON.parse(response);

	loadModelThingies();
});

function loadJSON(callback) {   

	var xobj = new XMLHttpRequest();
			xobj.overrideMimeType("application/json");
	xobj.open('GET', './data/per-region.json', true); // Replace 'my_data' with the path to your file
	xobj.onreadystatechange = function () {
				if (xobj.readyState == 4 && xobj.status == "200") {
					// Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
					callback(xobj.responseText);
				}
	};
	xobj.send(null);  
}



function init() {

	container = document.createElement( 'div' );
	document.body.appendChild( container );

	
	initRenderer();

	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
	camera.position.set(cameraSettings.cameraPos.x, cameraSettings.cameraPos.y, cameraSettings.cameraPos.z);
	
	initControls();

	
	scene.add(new THREE.AxesHelper(100));

	let bgColor = new THREE.Color('#a3e1fe');

	let ambient = new THREE.AmbientLight();
	scene.add(ambient);

	let point = new THREE.PointLight();
	point.position.set(70, 100, 100);
	point.intensity = .3;
	scene.add(point);

	// let point = new THREE.PointLight();
	// scene.add(point);

	scene.background = bgColor;

	window.addEventListener('resize', onResize, false);

	scene.userData.activeLightSettings = { type: 'PointLight' };
	scene.userData.gui = gui;


	// setlightType('PointLight', scene);
	// changeLightType('PointLight', scene);
	// buildGui(scene);

	container.appendChild( renderer.domElement );

}


function render() {
	requestAnimationFrame(render);
	renderer.render( scene, camera );
}


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
	controls.minDistance = 0;
	controls.maxDistance = 700;
	controls.enableKeys = false;
}

function loadModelThingies() {
	var loader = new THREE.GLTFLoader();

	loader.load('./models/piramidthing2.glb', function (gltf) {
		model = gltf.scene.children[2];
		console.log('orig', gltf);

		createGrid(GridSize, GridSize, model);
	});
}
function onResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize(window.innerWidth, window.innerHeight);
}

function initCameraGui() {
	var cameraFolder = gui.addFolder('Camera');
	cameraFolder.add(cameraSettings.cameraPos, 'x', -100, 100).onChange((val) => { camera.position.x = val });
	cameraFolder.add(cameraSettings.cameraPos, 'y', -100, 100).onChange((val) => { camera.position.y = val });
	cameraFolder.add(cameraSettings.cameraPos, 'z', -100, 100).onChange((val) => { camera.position.z = val });
	cameraFolder.add(cameraSettings, 'all', -100, 100, 0.1).onChange((val) => {
		camera.position.set(val, val, val);
	});
}


function createGrid(x, y, model) {
	group = new THREE.Group();

	let count = 0;
	var xDistance = 2.1;
	var zDistance = 2.1;

	//initial offset so does not start in middle.
	var xOffset = -GridSize;
	var yOffset = -GridSize;

	for (var i = 0; i < x; i++) {
		for (var j = 0; j < y; j++) {
			var newModel = model.clone();

			// todo (on download, to save speed in browser!)
			newModel.traverse((node) => {
				if (node.isMesh) {
					node.geometry = node.geometry.clone();
				}
			});

			newModel.position.x = (xDistance * i) + xOffset;
			newModel.position.z = (zDistance * j) + yOffset;

			newModel.morphTargetInfluences[6] = THREE.Math.mapLinear((theData[i][2015 - i]) / 1000000, 0, 4.4, -1, 3);
			newModel.morphTargetInfluences[0] = THREE.Math.mapLinear((theData[j][2015 - j]) / 1000000, 0, 4.4, 0, 1);

			newModel.morphTargetInfluences[1] = THREE.Math.mapLinear((theData[i][2015 - i]) / 1000000, 0, 4.4, -1, 1);
			newModel.morphTargetInfluences[4] = THREE.Math.mapLinear((theData[i][2015 - i]) / 1000000, 0, 4.4, -1, 1);

			// newModel.morphTargetInfluences[7] = THREE.Math.mapLinear((theData[i][2015 - i]) / 1000000, 0, 4.4, -1, 1);

			console.log(theData[i][2015]);

			count++;

			// setMorphGui(count, newModel);

			meshes[count] = newModel; 

			newModel.updateMatrix();
			newModel.matrixAutoUpdate = true;
			
			group.add(newModel);
		}
	}

	scene.add(group);
	// createSingle();
}

function createSingle() {
	var singleGeometry = new THREE.Geometry();

	meshes.forEach(element => {
		element.matrixWorldNeedsUpdate = true;
		element.updateMatrix();
		// element.updateMorphTargets();
		// console.log(element);
		// element.applyMatrix( element.matrix )
		// element.applyMatrix();
		var geom = new THREE.Geometry().fromBufferGeometry( element.geometry );
		singleGeometry.merge(geom, element.matrix);
	});
	
	var material = new THREE.MeshPhongMaterial({color: 'rgba(200, 200, 200)'});
	mesh = new THREE.Mesh(singleGeometry, material);
	scene.add(mesh);	
} 

function setMorphGui(numbr, newMesh) {
	var expressions = Object.keys( newMesh.morphTargetDictionary );
	var expressionFolder = gui.addFolder(`blob ${numbr}`);
	
	for ( var i = 0; i < expressions.length; i++ ) {
		expressionFolder.add( newMesh.morphTargetInfluences, i, -1, 2, 0.01 ).name( expressions[ i ] );
	}
}