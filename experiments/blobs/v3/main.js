import * as dat from 'dat.gui';
import * as THREE from 'three';
import 'three/examples/js/controls/OrbitControls';

let yearSlider = document.querySelector('input');

let positions;
let scales;
var SEPARATION = 100;
var AMOUNTX = 262; // replaced with countries
var AMOUNTY = 215; // ?

var currentYear = 2010;

var camera, scene, renderer;
var controls;

var clock = new THREE.Clock();
let tp;

var particles, count = 0;

var incomeData;
var lifeData;
var populationData;

function init() {

	camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 1000000 );
	// camera = new THREE.OrthographicCamera( window.innerWidth / - 2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, 0, 10000 );
	camera.position.x = -5837.563823462691;
	camera.position.y = 300;
	camera.position.z = 600;

	scene = new THREE.Scene();

	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );

	initControls();

	var numParticles = AMOUNTX * AMOUNTY;

	positions = new Float32Array( numParticles * 3 ); //*  *3, because xyz per dot
	scales = new Float32Array( numParticles ); //* scale per dot

	// initParticles();

	var geometry = new THREE.BufferGeometry();
	geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
	geometry.addAttribute( 'scale', new THREE.BufferAttribute( scales, 1 ) );

	// got from example three dotwaves
	var material = new THREE.ShaderMaterial( {
		uniforms: {
			color: { value: new THREE.Color( '#7A57DA' ) },
		},
		vertexShader: document.getElementById( 'vertexshader' ).textContent,
		fragmentShader: document.getElementById( 'fragmentshader' ).textContent
	} );

	particles = new THREE.Points( geometry, material );
	scene.add( particles );

	scene.background = new THREE.Color('#FAFDFF');
	document.body.appendChild( renderer.domElement );
	window.addEventListener( 'resize', onWindowResize, false );
}

function initControls() {
	controls = new THREE.OrbitControls(camera, renderer.domElement);
	controls.enableKeys = false;
	controls.enablePan = true;
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );
}

function animate() {
	requestAnimationFrame( animate );
	render();
}

function render() {
	camera.lookAt( scene.position );
	
	particles.geometry.attributes.position.needsUpdate = true;
	particles.geometry.attributes.scale.needsUpdate = true;

	renderer.render( scene, camera );

	tp = clock.getDelta();

	count += 0.1;
}

init();
animate();


var getJSON = function(url) {
	return new Promise(function(resolve, reject) {
		var xhr = new XMLHttpRequest();
		xhr.open('get', url, true);
		xhr.responseType = 'json';
		xhr.onload = function() {
			var status = xhr.status;

			if (status == 200) {
				resolve(xhr.response);
			} else {
				reject(status);
			}
		};
		xhr.send();
	});
};

// var incomeData;
// var lifeData;
// var populationData;

var promise1 = getJSON('./data/income.json');
var promise2 = getJSON('./data/life.json');
var promise3 = getJSON('./data/population.json');

Promise.all([promise1, promise2, promise3]).then(function(data) {
	incomeData = data[0];
	lifeData = data[1];
	populationData = data[2];

	initParticles();
});

// getJSON('./data/income.json').then(function(data) {
// }, function(status) {
// 	console.log('Something went wrong.', status);
// });

// initParticles(data);

function initParticles() {
	var i = 0, j = 0;

	for ( var ix = 0; ix < AMOUNTX; ix ++ ) {
		for ( var iy = 0; iy < AMOUNTY; iy ++ ) {
			let life = lifeData[ix] ? THREE.Math.mapLinear(lifeData[ix][currentYear], 1, 85, 0, (AMOUNTX * SEPARATION)) : 0;
		
			positions[ i ] = ix * SEPARATION - ( ( AMOUNTX * SEPARATION ) / 2 ) + (SEPARATION * AMOUNTX / 2); // x (but actually z)
			positions[ i + 1 ] = life; // y
			positions[ i + 2 ] = iy * SEPARATION - ( ( AMOUNTY * SEPARATION ) / 2 ); // z (but actually x)
			
			scales[ j ] = THREE.Math.mapLinear(populationData[iy][currentYear], 50, 1376048943, 200, 3000);

			i += 3; // skip to nex pos
			j ++;
		}
	}

}

yearSlider.addEventListener('input', function () {
	currentYear = yearSlider.value;
	initParticles();
}, false);