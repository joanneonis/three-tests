import * as dat from 'dat.gui';
import * as THREE from 'three';

import 'three/examples/js/controls/OrbitControls';
import 'three/examples/js/loaders/GLTFLoader';
import 'three/examples/js/AnimationClipCreator';
import 'three/examples/js/loaders/OBJLoader';
import 'three/examples/js/exporters/OBJExporter';
import 'three/examples/js/exporters/GLTFExporter';

let options;

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
			console.log( output );
			saveString( output, 'scene.gltf' );

		}

	}, options );

}

document.getElementById( 'export_scene' ).addEventListener( 'click', function () {

	exportGLTF( scene1 );

} );

document.getElementById( 'export_scenes' ).addEventListener( 'click', function () {

	exportGLTF( [ scene1, scene2 ] );

} );

document.getElementById( 'export_object' ).addEventListener( 'click', function () {

	exportGLTF( sphere );

} );

document.getElementById( 'export_obj' ).addEventListener( 'click', function () {

	exportGLTF( waltHead );

} );

document.getElementById( 'export_objects' ).addEventListener( 'click', function () {

	exportGLTF( [ sphere, gridHelper ] );

} );

document.getElementById( 'export_scene_object' ).addEventListener( 'click', function () {

	exportGLTF( [ scene1, gridHelper ] );

} );


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

// if ( WEBGL.isWebGLAvailable() === false ) {

// 	document.body.appendChild( WEBGL.getWebGLErrorMessage() );

// }

var container;

var camera, scene1, scene2, renderer;
var gridHelper, sphere, waltHead;

init();
animate();

function init() {

	container = document.createElement( 'div' );
	document.body.appendChild( container );

	

	container.appendChild( renderer.domElement );

	//

	window.addEventListener( 'resize', onWindowResize, false );

}

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );

}

//

function animate() {

	requestAnimationFrame( animate );

	render();

}

function render() {

	var timer = Date.now() * 0.0001;

	camera.position.x = Math.cos( timer ) * 800;
	camera.position.z = Math.sin( timer ) * 800;

	camera.lookAt( scene1.position );
	renderer.render( scene1, camera );

}