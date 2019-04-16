export class SpotLight { 
	constructor(config={}){
		this.position = {x:15, y:40, z:35};
		this.angle = Math.PI / 4;
		this.penumbra = 0.05;
		this.decay = 2;
		this.distance = 200;
		this.castShadow = true;
		this.params = {
			color: null,
			intensity: {
				intensity: 0,
				min: 0,
				max: 2
			},
			distance: {
				distance: this.distance,
				min: 50,
				max: 200
			},
			angle: {
				angle: 0,
				min: 0,
				max: this.angle
			},
			penumbra: {
				penumbra: this.penumbra,
				min: 0,
				max: 1
			},
			decay: {
				decay: this.decay,
				min: 1,
				max: 2
			},
			position: {
				position: this.position,
				min: -300,
				max: 300,
			}
		};
		Object.assign(this,config);
	}
}

	// spotLight.shadow.mapSize.width = 1024;
	// spotLight.shadow.mapSize.height = 1024;
	// spotLight.shadow.camera.near = 10;
	// spotLight.shadow.camera.far = 200;
