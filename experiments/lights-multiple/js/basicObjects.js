
var materials = new Array(3);
var geometries = new Array(3);
var meshes = new Array(3);


import * as THREE from 'three';

export function createObjects() {
	var cubeSize = 30;

	//MATERIAL
	materials[0] = new THREE.MeshLambertMaterial();
	materials[1] = new THREE.MeshPhongMaterial();
	materials[2] = new THREE.MeshStandardMaterial();

	//GEOMETRY
	geometries[0] = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize, 10, 10, 10);
	geometries[1] = new THREE.SphereGeometry(cubeSize, 20, 20);
	geometries[2] = new THREE.PlaneGeometry(10000, 10000, 100, 100);

	for(let i = 0; i < meshes.length; i++) {
		meshes[i] = new THREE.Mesh(geometries[i], materials[i]);
	}

	meshes[0].position.x = -50;
	meshes[0].castShadow = true;
	// scene.add(meshes[0]);


	meshes[1].position.x = 50;
	meshes[1].castShadow = true;
	// scene.add(meshes[1]);


	meshes[2].rotation.x = -90 * (Math.PI / 180);
	meshes[2].position.y = - cubeSize * 2;
	meshes[2].receiveShadow = true;
	// scene.add(meshes[2]);

	return meshes;
}

