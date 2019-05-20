function randomBlobs() {
	var minLightness = 0;
	var maxLightness = 0.1;
	scene.traverse( disposeMaterial );
	
	scene.children.length = 0;
	var geometry = new THREE.IcosahedronBufferGeometry( 1, 4 );
	for ( var i = 0; i < 5; i ++ ) {
		var color = new THREE.Color();
		color.setHSL( Math.random(), 0.7, Math.random() * 0.2 + 0.05 );
		var material = new THREE.MeshBasicMaterial( { color: color } );
		var box = new THREE.Mesh( geometry, material );
		box.position.x = Math.random() * 10 - 5;
		box.position.y = Math.random() * 10 - 5;
		box.position.z = Math.random() * 10 - 5;
		box.position.normalize().multiplyScalar( Math.random() * 4.0 + 2.0 );
		box.scale.setScalar( Math.random() * Math.random() + 0.5 );
		scene.add( box );
		if ( Math.random() < 0.25 ) box.layers.enable( BLOOM_SCENE );
	}
	// render();
}