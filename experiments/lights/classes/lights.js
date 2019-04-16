export class PointLight { 
	constructor(angle, decay, distance, intensity) { 
		this.angle = angle || 2; 
		// this.color = color || {b: 1, g: 1, r: 1}; 
		this.decay = decay || 1;
		this.distance = distance || 1000;
		this.intensity = intensity || 1;
	} 
}