/* eslint-disable no-unused-vars */
import * as dat from 'dat.gui';
import * as THREE from 'three';
import 'three/examples/js/controls/OrbitControls';

//?--------------------------------------------------------------------
//?		Base
//? 	Original source (for grid): https://github.com/mrdoob/three.js/blob/master/examples/webgl_multiple_elements.html
//?--------------------------------------------------------------------

var canvas;

var scenes = [], renderer;

var textGeom;
var loader = new THREE.FontLoader();
var heartShape;

loader.load( '/helvetiker_bold.typeface.json', function ( font ) {
	textGeom = {
		font: font,
		size: .8,
		height: .2,
		curveSegments: 12,
	} 

	init();
	animate();
} );

function createLatte() {
	var points = [];
	for ( var i = 0; i < 10; i ++ ) {
		points.push( new THREE.Vector2( (Math.sin( i * 0.2 ) * .1 + .5), ( i - .5 ) * .2 ) );
	}
	return points;
}

function createHeart() {
	var x = 0, y = 0;

	heartShape = new THREE.Shape();
	heartShape.moveTo( x + .5, y + .5 );
	heartShape.bezierCurveTo( x + .5, y + .5, x + .4, y, x, y );
	heartShape.bezierCurveTo( x - .6, y, x - .6, y + .7,x - .6, y + .7 );
	heartShape.bezierCurveTo( x - .6, y + 1.1, x - .3, y + 1.54, x + .5, y + 1.9 );
	heartShape.bezierCurveTo( x + 1.2, y + 1.54, x + 1.6, y + 1.1, x + 1.6, y + .7 );
	heartShape.bezierCurveTo( x + 1.6, y + .7, x + 1.6, y, x + 1.0, y );
	heartShape.bezierCurveTo( x + .7, y, x + .5, y + .5, x + .5, y + .5 );
}


function init() {
	createHeart();
	canvas = document.getElementById( "c" );

	var extrudeSettings = {
		steps: 1,
		depth: .2,
		bevelEnabled: true,
		bevelThickness: .2,
		bevelSize: .2,
	};

	var geometries = [
		new THREE.BoxBufferGeometry( .6, .6, .6 ),
		new THREE.CircleGeometry( .6, 15 ),
		new THREE.ConeGeometry( .6, 1, 32 ),
		new THREE.CylinderGeometry( .6, .6, 1, 32 ),
		// new THREE.DodecahedronBufferGeometry(.6, 10),
		//ExtrudeBufferGeometry
		//IcosahedronGeometry
		//OctahedronGeometry
		new THREE.LatheBufferGeometry(createLatte()),
		// new THREE.ParametricGeometry( THREE.ParametricGeometries.klein, 1, 1 )
		new THREE.PlaneGeometry( 1, 1, 32 ),
		new THREE.RingBufferGeometry( .3, 1, 10 ),
		new THREE.ShapeGeometry(heartShape),
		new THREE.SphereBufferGeometry( .6, 32, 32 ),
		//TetrahedronGeometry,
		new THREE.TextGeometry( 'Hoi', textGeom),
		new THREE.TorusBufferGeometry( .6, .2, 16, 100 ), 
		new THREE.TorusKnotGeometry( .6, .2, 100, 16 ),
		new THREE.ExtrudeBufferGeometry( heartShape, extrudeSettings )
		// tube
		// wireframe
	];

	var template = document.getElementById( "template" ).text;
	var content = document.getElementById( "content" );


	geometries.forEach(geometry => {
		THREE.GeometryUtils.center( geometry );

		var scene = new THREE.Scene();

		// make a list item
		var element = document.createElement( "div" );
		element.className = "list-item";
		// element.innerHTML = template.replace( '$', i + 1 );
		element.innerHTML = template.replace( '$', geometry.type );

		// Look up the element that represents the area
		// we want to render the scene
		scene.userData.element = element.querySelector( ".scene" );
		content.appendChild( element );

		var camera = new THREE.PerspectiveCamera( 50, 1, 1, 10 );
		camera.position.set(2, 2, 2);
		scene.userData.camera = camera;

		var controls = new THREE.OrbitControls( scene.userData.camera, scene.userData.element );
		controls.minDistance = 2;
		controls.maxDistance = 5;
		controls.enablePan = false;
		controls.enableZoom = false;
		scene.userData.controls = controls;

		var material = new THREE.MeshStandardMaterial( {

			color: new THREE.Color().setHSL( Math.random(), 1, 0.75 ),
			roughness: 0.5,
			metalness: 0,
			flatShading: true,
			side: THREE.DoubleSide

		} );

		var mesh = new THREE.Mesh( geometry, material );

		if (geometry.type === 'ShapeGeometry' || geometry.type === 'ExtrudeBufferGeometry') { mesh.rotateZ( THREE.Math.degToRad(180) ); }
		
		scene.add( mesh );

		scene.add( new THREE.HemisphereLight( 0xaaaaaa, 0x444444 ) );

		var light = new THREE.DirectionalLight( 0xffffff, 0.5 );
		light.position.set( 1, 1, 1 );
		scene.add( light );

		scenes.push( scene );
	});


	renderer = new THREE.WebGLRenderer( { canvas: canvas, antialias: true } );
	renderer.setClearColor( 0xffffff, 1 );
	renderer.setPixelRatio( window.devicePixelRatio );

}

function updateSize() {

	var width = canvas.clientWidth;
	var height = canvas.clientHeight;

	if ( canvas.width !== width || canvas.height !== height ) {

		renderer.setSize( width, height, false );

	}

}

function animate() {

	render();
	requestAnimationFrame( animate );

}

function render() {

	updateSize();

	canvas.style.transform = `translateY(${window.scrollY}px)`;

	renderer.setClearColor( 0xffffff );
	renderer.setScissorTest( false );
	renderer.clear();

	renderer.setClearColor( 0xe0e0e0 );
	renderer.setScissorTest( true );

	scenes.forEach( function ( scene ) {

		// so something moves
		scene.children[ 0 ].rotation.y = Date.now() * 0.001;

		// get the element that is a place holder for where we want to
		// draw the scene
		var element = scene.userData.element;

		// get its position relative to the page's viewport
		var rect = element.getBoundingClientRect();

		// check if it's offscreen. If so skip it
		if ( rect.bottom < 0 || rect.top > renderer.domElement.clientHeight ||
			 rect.right < 0 || rect.left > renderer.domElement.clientWidth ) {

			return; // it's off screen

		}

		// set the viewport
		var width = rect.right - rect.left;
		var height = rect.bottom - rect.top;
		var left = rect.left;
		var bottom = renderer.domElement.clientHeight - rect.bottom;

		renderer.setViewport( left, bottom, width, height );
		renderer.setScissor( left, bottom, width, height );

		var camera = scene.userData.camera;

		//camera.aspect = width / height; // not changing in this example
		//camera.updateProjectionMatrix();

		//scene.userData.controls.update();

		renderer.render( scene, camera );

	} );

}
