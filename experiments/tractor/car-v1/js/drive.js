
export function updatePosition(obj, scene, activeKey, friction){
	//update velocity
	if (scene.userData.ambulanceMesh.userData.direction === 'forwards') {
		obj.userData.vx += obj.userData.ax;
		obj.userData.vy += obj.userData.ay;
	} else if (scene.userData.ambulanceMesh.userData.direction === 'backwards'){
		obj.userData.vx -= Math.abs(obj.userData.ax);
		obj.userData.vy -= Math.abs(obj.userData.ay);
	}
	
	applyFriction(obj, friction);

	if (scene.userData.ambulanceMesh.userData.direction === 'forwards') {
		obj.userData.x += obj.userData.vx;
		obj.position.z += obj.userData.vx;
	} else if (scene.userData.ambulanceMesh.userData.direction === 'backwards'){
		obj.userData.x -= Math.abs(obj.userData.vx);
		obj.position.z -= Math.abs(obj.userData.vx);
	}
}

export function applyFriction(obj, friction){
	obj.userData.vx *= friction;
	obj.userData.vy *= friction;
}

export function drive(scene, activeKey, friction) {
	if(activeKey === 'ArrowUp'){
		scene.userData.ambulanceMesh.userData.direction = 'forwards';
		scene.userData.ambulanceMesh.userData.ax = Math.cos(0) * 0.05;
		scene.userData.ambulanceMesh.userData.ay = Math.sin(0) * 0.05;
	} 
	if(activeKey === 'ArrowDown'){
		scene.userData.ambulanceMesh.userData.direction = 'backwards';
		scene.userData.ambulanceMesh.userData.ax = Math.cos(0) * 0.05;
		scene.userData.ambulanceMesh.userData.ay = Math.sin(0) * 0.05;
	} 
	if (activeKey === null) {
		scene.userData.ambulanceMesh.userData.ax = 0;
		scene.userData.ambulanceMesh.userData.ay = 0;
	}

	updatePosition(scene.userData.ambulanceMesh, scene, activeKey, friction);
}