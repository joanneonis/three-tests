var vid = document.getElementById('videoel');
var vid_width = vid.width;
var vid_height = vid.height;
var overlay = document.getElementById('overlay');
var trackingStarted;
var ctrack;
var emotionData;
var ec;
var proportion;

var ctx;

export default class Clam {
	constructor() {
		
	}

	static init() {
		ctx = this;
		this.mediaCheck();
		this.reguliseEyebrows();

		delete emotionModel['disgusted'];
		delete emotionModel['fear'];

		ec = new emotionClassifier();
		ec.init(emotionModel);
		window.ec = ec;
		emotionData = ec.getBlank();

		// this.d3Vis();
	}

	static getClamTracker() {
		return ctrack;
	}

	static getEc() {
		return ec;
	}

	static getEmotions() {
		return ec.getEmotions();
	}

	static getEmotionData() {
		return emotionData;
	}

	/********** check and set up video/webcam **********/
	static enablestart() {
		var startbutton = document.getElementById('startbutton');
		startbutton.value = "start";
		startbutton.disabled = null;
	}

	static adjustVideoProportions() {
		// resize overlay and video if proportions are different
		// keep same height, just change width
		proportion = vid.videoWidth / vid.videoHeight;
		vid_width = Math.round(vid_height * proportion);
		vid.width = vid_width;
		overlay.width = vid_width;
	}

	static getVidProportions() {
		return {
			videoWidth: vid_width,
			videoHeight: vid_height,
			proportions: proportion,
		};
	}

	static gumSuccess(stream) {
		// add camera stream if getUserMedia succeeded
		if ("srcObject" in vid) {
			vid.srcObject = stream;
		} else {
			vid.src = (window.URL && window.URL.createObjectURL(stream));
		}
		vid.onloadedmetadata = function () {
			ctx.adjustVideoProportions();
			vid.play();
		}
		vid.onresize = function () {
			ctx.adjustVideoProportions();
			if (trackingStarted) {
				ctrack.stop();
				ctrack.reset();
				ctrack.start(vid);
			}
		}
	}

	static gumFail() {
		alert("There was some problem trying to fetch video from your webcam. If you have a webcam, please make sure to accept when the browser asks for access to your webcam.");
	}
	
	static mediaCheck() {
		navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
		window.URL = window.URL || window.webkitURL || window.msURL || window.mozURL;
		
		// check for camerasupport
		if (navigator.mediaDevices) {
			navigator.mediaDevices.getUserMedia({
				video: true
			}).then(this.gumSuccess).catch(this.gumFail);
		} else if (navigator.getUserMedia) {
			navigator.getUserMedia({
				video: true
			}, this.gumSuccess, this.gumFail);
		} else {
			alert("This demo depends on getUserMedia, which your browser does not seem to support. :(");
		}
		
		vid.addEventListener('canplay', this.enablestart, false);
	}

	/*********** setup of emotion detection *************/
	static reguliseEyebrows() {
		// set eigenvector 9 and 11 to not be regularized. This is to better detect motion of the eyebrows
		pModel.shapeModel.nonRegularizedVectors.push(9);
		pModel.shapeModel.nonRegularizedVectors.push(11);
		ctrack = new clm.tracker({
			useWebGL: true
		});
		ctrack.init(pModel);
		trackingStarted = false;

		window.ctrack = ctrack;
	}

	static startVideo() {
		// start video
		vid.play();
		// start tracking
		ctrack.start(vid);
		trackingStarted = true;

		// start loop to draw face
		// this.drawLoop();
	}
}