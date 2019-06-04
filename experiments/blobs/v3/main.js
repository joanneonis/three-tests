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

var cameraPos = {x: -26314, y: 28830, z: -32931};

var gui;

function init() {

	camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 1000000 );
	camera.position.set(cameraPos.x, cameraPos.y, cameraPos.z);

	scene = new THREE.Scene();

	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, (window.innerHeight) );

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
	document.querySelector('.container').appendChild( renderer.domElement );
	window.addEventListener( 'resize', onWindowResize, false );
}

function initGui() {
	gui = new dat.GUI();
	initCameraGui();
}

function initControls() {
	console.log(renderer.domElement);
	controls = new THREE.OrbitControls(camera, renderer.domElement);
	controls.enableKeys = false;
	controls.enablePan = true;
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight);
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
initGui();
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
			let income = incomeData[iy] ? THREE.Math.mapLinear(incomeData[iy][currentYear], 1, 182668, 0, (AMOUNTY * SEPARATION)) : 0;
			let population = THREE.Math.mapLinear(populationData[iy][currentYear], 50, 1376048943, 200, 3000);
		
			positions[ i ] = ix * SEPARATION - ( ( AMOUNTX * SEPARATION ) / 2 ) + (SEPARATION * AMOUNTX / 2); // x (but actually z)
			positions[ i + 1 ] = life; // y
			// positions[ i + 2 ] = iy * SEPARATION - ( ( AMOUNTY * SEPARATION ) / 2 ); // z (but actually x)
			positions[ i + 2 ] = income;
			
			scales[ j ] = population;

			i += 3; // skip to nex pos
			j ++;
		}
	}

}
var yearbox = document.querySelector('.current-year');
yearbox.innerHTML = currentYear;

yearSlider.addEventListener('input', function () {
	currentYear = yearSlider.value;
	yearbox.innerHTML = currentYear;
	initParticles();
}, false);


function initCameraGui() {
	var cameraFolder = gui.addFolder('Camera');
	cameraFolder.add(cameraPos, 'x', -100000, 100000).onChange((val) => { camera.position.x = val });
	cameraFolder.add(cameraPos, 'y', -100000, 100000).onChange((val) => { camera.position.y = val });
	cameraFolder.add(cameraPos, 'z', -100000, 100000).onChange((val) => { camera.position.z = val });
}
