
/* eslint-disable no-unused-vars */
import * as dat from 'dat.gui';
import * as THREE from 'three';
import 'three/examples/js/controls/OrbitControls';
import 'three/examples/js/loaders/GLTFLoader';

import firebase from '@firebase/app';
import '@firebase/firestore'
// import { detectPoseInRealTime } from 'camera-test';

var container, stats, gui, mixer, actions, activeAction, previousAction;
var camera, scene, renderer, model, face;
var skeletonHelper;

var api = { state: 'Walking' };

// Initialize Cloud Firestore through Firebase
firebase.initializeApp({
  apiKey: 'AIzaSyB4qy-QwbFsMFdFpvPznQC9O5xsC-r-O9I',
  authDomain: 'https://threejs-experiments.firebaseapp.com',
  projectId: 'threejs-experiments',
});

const db = firebase.firestore();

// first tests
let rotateHead;

var clock = new THREE.Clock();
var time = 0;
var delta = 0;
var speed = 2000; // units a second - 2 seconds

var oldPos = 0;
var currentPos = 0;
var targetPos = 0;

var targetHistory = [0];

let testToRotate;

init();
animate();

function init() {
	container = document.createElement( 'div' );
	document.body.appendChild( container );
	camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.25, 100 );
	camera.position.set( - 5, 3, 10 );
	camera.lookAt( new THREE.Vector3( 0, 2, 0 ) );
	scene = new THREE.Scene();
	scene.background = new THREE.Color( 0xe0e0e0 );
	scene.fog = new THREE.Fog( 0xe0e0e0, 20, 100 );
	clock = new THREE.Clock();
	// lights
	var light = new THREE.HemisphereLight( 0xffffff, 0x444444 );
	light.position.set( 0, 20, 0 );
	scene.add( light );
	light = new THREE.DirectionalLight( 0xffffff );
	light.position.set( 0, 20, 10 );
	scene.add( light );
	// ground
	var mesh = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2000, 2000 ), new THREE.MeshPhongMaterial( { color: 0x999999, depthWrite: false } ) );
	mesh.rotation.x = - Math.PI / 2;
	scene.add( mesh );
	var grid = new THREE.GridHelper( 200, 40, 0x000000, 0x000000 );
	grid.material.opacity = 0.2;
	grid.material.transparent = true;
	scene.add( grid );

	// model
	var loader = new THREE.GLTFLoader();
	loader.load( '../assets/models/pre-rigged-1.glb', function( gltf ) {
		model = gltf.scene;
		scene.add( model );
		createGUI( model );

		skeletonHelper = new THREE.SkeletonHelper( model );
		skeletonHelper.material.linewidth = 2;
		scene.add( skeletonHelper );

		setupDatGui();

		model.traverse( function( node ) {

			if ( node instanceof THREE.Bone ) {
	
					// console.log(node);
	
			}
	
	} );

		// console.log(model)

	}, undefined, function( e ) {
		console.error( e );
	} );

	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.gammaOutput = true;
	renderer.gammaFactor = 2.2;
	container.appendChild( renderer.domElement );
	window.addEventListener( 'resize', onWindowResize, false );
	// stats
	stats = new Stats();
	container.appendChild( stats.dom );
}

function setupDatGui() {

	var folder = gui.addFolder( "General Options" );

	// folder.add( state, "animateBones" );
	// folder.__controllers[ 0 ].name( "Animate Bones" );

	// folder.add( model, "pose" );
	// folder.__controllers[ 1 ].name( ".pose()" );

	var bones = model.children[1].skeleton.bones;

	for ( var i = 0; i < bones.length; i ++ ) {

		var bone = bones[ i ];

		folder = gui.addFolder( `Bone - ${i} ${bones[ i ].name}` );

		folder.add( bone.position, 'x', - 10 + bone.position.x, 10 + bone.position.x );
		folder.add( bone.position, 'y', - 10 + bone.position.y, 10 + bone.position.y );
		folder.add( bone.position, 'z', - 10 + bone.position.z, 10 + bone.position.z );

		folder.add( bone.rotation, 'x', - Math.PI * 0.5, Math.PI * 0.5 );
		folder.add( bone.rotation, 'y', - Math.PI * 0.5, Math.PI * 0.5 );
		folder.add( bone.rotation, 'z', - Math.PI * 0.5, Math.PI * 0.5 );

		folder.add( bone.scale, 'x', 0, 2 );
		folder.add( bone.scale, 'y', 0, 2 );
		folder.add( bone.scale, 'z', 0, 2 );

		folder.__controllers[ 0 ].name( "position.x" );
		folder.__controllers[ 1 ].name( "position.y" );
		folder.__controllers[ 2 ].name( "position.z" );

		folder.__controllers[ 3 ].name( "rotation.x" );
		folder.__controllers[ 4 ].name( "rotation.y" );
		folder.__controllers[ 5 ].name( "rotation.z" );

		folder.__controllers[ 6 ].name( "scale.x" );
		folder.__controllers[ 7 ].name( "scale.y" );
		folder.__controllers[ 8 ].name( "scale.z" );
	}
}

function createGUI( model, animations ) {
	gui = new dat.GUI();
	mixer = new THREE.AnimationMixer( model );
	actions = {};
	
	// var foreArm = model.getObjectByName( 'forearm.R' );
	// console.log(foreArm);
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
}
//
function animate() {
	// var dt = clock.getDelta();
	// if ( mixer ) mixer.update( dt );
	delta = clock.getDelta();
	time += delta;

	// if (time % 1 >= 0 && time % 1 <= .01 ) { console.log('new'); }

	// currentPos = testToRotate;
	if (model) {
		model.children[1].skeleton.bones[5].rotation.z = targetPos; 
		// console.log(oldPos - targetPos);
	}
	
	// TODO import as es6 mod
	// poseDetectionFrame();

	requestAnimationFrame( animate );
	renderer.render( scene, camera );
	stats.update();
}

function firebaseListen() {
	// db.collection("posenet").doc("test1")
  //   .onSnapshot(function(doc) {
	// 			// console.log("Current data: ", doc.data());
	// 			var keypoints = doc.data().keypoints;
	// 			rotateHeadTest(keypoints);
	// });
	
	// window.setInterval(() => {
	// 	db.collection("posenet").doc("test1").get()
  //   .then(function(doc) {
	// 			var keypoints = doc.data().keypoints;
	// 			rotateHeadTest(keypoints);				
	// 	}).catch(function(error) {
	// 			console.log("Error getting document:", error);
	// 	});
	// }, 100);
}

firebaseListen();

function rotateHeadTest(keypoints) {
	// console.log('x', keypoints[1].position.x); // lefteye
	// console.log('x', keypoints[2].position.x); // righteye

	// oldPos = targetPos;
	oldPos = targetPos;
	rotateHead = keypoints[3].position.y - keypoints[4].position.y;
	targetPos = THREE.Math.mapLinear(rotateHead, -80, 80, -2, 2);

	// console.log(rotateHead);

	// console.log(model.children[1]);
}

// 235.19653266628495 - 303.90577183746814 = 68.7092391712 (voor)
// 186.24792794820195 - 208.38771891434635 = 22.1397909661 (links)