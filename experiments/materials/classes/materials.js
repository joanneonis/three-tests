// export class BaseLight {
// 	constructor(config={}) {
// 		this.position = {x:15, y:40, z:35};
// 		this.intensity = 1.37;
// 		this.params = {
// 			color: null,
// 			intensity: {
// 				intensity: this.intensity,
// 				min: 0,
// 				max: 2
// 			},
// 		};
// 		Object.assign(this,config);
// 	}
// }
//export class SpotLight extends BaseLight { 

	export class PointLight { 
		constructor(config={}){
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
	