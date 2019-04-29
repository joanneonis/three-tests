import * as THREE from 'three';
import 'three/examples/js/loaders/DDSLoader';
import 'three/examples/js/loaders/MTLLoader';
import 'three/examples/js/loaders/OBJLoader';

export function loadModel(path, scene) {

	var onProgress = function ( xhr ) {

		if ( xhr.lengthComputable ) {

			var percentComplete = xhr.loaded / xhr.total * 100;
			console.log( Math.round( percentComplete, 2 ) + '% downloaded' );

		}

	};

	var onError = function (e) {
		console.log(e);
	};

	THREE.Loader.Handlers.add( /\.dds$/i, new THREE.DDSLoader() );

	// model source: https://poly.google.com/view/63bZ3bfzQcq
	new THREE.MTLLoader()
		.setResourcePath( `models/${path}/textures/` )
		.load( `models/${path}/${path}.mtl`, function ( materials ) {

			materials.preload();

			console.log(materials);

			new THREE.OBJLoader()
				.setMaterials( materials )
				.setPath( './models/' )
				.load( `${path}/${path}.obj`, function ( object ) {

					object.position.y = 0;

					scene.add( object );

				}, onProgress, onError );

		} );
}

// let mtl_loader;

// export function loadModel(mtlPath, objPath, scene) {
// 	mtl_loader = new THREE.MTLLoader();
// 	mtl_loader.load(`models/${mtlPath}`,
// 			function(materials) {
// 					materials.preload()
// 							var obj_loader = new THREE.OBJLoader();
// 							obj_loader.setMaterials(materials)
// 							obj_loader.load(`models/${objPath}`,
// 							function(object) {
// 									let mesh = object.children[0]
// 									scene.add(mesh);
// 							}, null, function(error) {alert(error)}
// 					)
// 			}, null, function(error) {alert(error)}
// 	);
// }