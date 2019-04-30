import * as THREE from 'three';
import 'three/examples/js/loaders/DDSLoader';
import 'three/examples/js/loaders/MTLLoader';
import 'three/examples/js/loaders/OBJLoader';

export function loadModel(path) {
	THREE.Loader.Handlers.add( /\.dds$/i, new THREE.DDSLoader() );

	// model source: https://poly.google.com/view/63bZ3bfzQcq
	return new Promise((resolve) => { new THREE.MTLLoader()
		.setResourcePath( `models/${path}/textures/` )
		.load( `models/${path}/${path}.mtl`, function ( materials ) {

			materials.preload();

			new THREE.OBJLoader()
				.setMaterials( materials )
				.setPath( './models/' )
				.load( `${path}/${path}.obj`, resolve, onProgress, onError );
		} );
	});
}

export function onProgress( xhr ) {
	if ( xhr.lengthComputable ) {
		var percentComplete = xhr.loaded / xhr.total * 100;
		console.log( Math.round( percentComplete, 2 ) + '% downloaded' );
	}
}

export function onError(e) {
	console.log('error loading', e);
}