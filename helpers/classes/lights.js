
export class BaseLight {
	constructor(config={}) {
		this.position = {x:15, y:40, z:35};
		this.intensity = 1.37;
		this.params = {
			color: null,
			intensity: {
				intensity: this.intensity,
				min: 0,
				max: 2
			},
			position: {
				x: this.position.x,
				y: this.position.y,
				z: this.position.z,
				min: -300,
				max: 300,
			}
		};
		Object.assign(this,config);
	}
}

export class SpotLight extends BaseLight { 
	constructor(config={}){
		super(config);
		this.angle = Math.PI / 4;
		this.penumbra = 0.05;
		this.decay = 2;
		this.distance = 200;
		this.castShadow = true;
		this.params.distance = {
			distance: this.distance,
			min: 50,
			max: 200
		},
		this.params.angle = {
			angle: 0,
			min: 0,
			max: this.angle
		},
		this.params.penumbra = {
			penumbra: this.penumbra,
			min: 0,
			max: 1
		},
		this.params.decay = {
			decay: this.decay,
			min: 1,
			max: 2
		},
		Object.assign(this,config);
	}
}

export class PointLight extends BaseLight { 
	constructor(config={}){
		super(config);
		this.decay = 2;
		this.distance = 200;
		this.castShadow = true;
		this.params.distance = {
			distance: this.distance,
			min: 50,
			max: 200
		},
		this.params.decay = {
			decay: this.decay,
			min: 1,
			max: 2
		},
		Object.assign(this,config);
	}
}
 
export class HemisphereLight extends BaseLight {
	constructor(config={}){
		super(config);
		this.params.groundColor = {
			groundColor: null,
		},
		Object.assign(this,config);
	}
}

export class DirectionalLight extends BaseLight {
	constructor(config={}){
		super();
		Object.assign(this,config);
	}
}

export class AmbientLight extends BaseLight {
	constructor(config={}){
		super();
		Object.assign(this,config);
	}
}