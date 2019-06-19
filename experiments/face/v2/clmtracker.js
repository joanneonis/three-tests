var vid = document.getElementById('videoel');
var vid_width = vid.width;
var vid_height = vid.height;
var overlay = document.getElementById('overlay');
var overlayCC = overlay.getContext('2d');
var trackingStarted;
var ctrack;
var emotionData;
var ec;

var ctx;

// d3 Only
var svg;
var margin = {
	top: 20,
	right: 20,
	bottom: 10,
	left: 40
};
var width = 400 - margin.left - margin.right;
var height = 100 - margin.top - margin.bottom;

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
		emotionData = ec.getBlank();

		this.d3Vis();
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
		var proportion = vid.videoWidth / vid.videoHeight;
		vid_width = Math.round(vid_height * proportion);
		vid.width = vid_width;
		overlay.width = vid_width;
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
	}


	static drawLoop() {
		requestAnimationFrame(ctx.drawLoop);
		overlayCC.clearRect(0, 0, vid_width, vid_height);
		//psrElement.innerHTML = "score :" + ctrack.getScore().toFixed(4);
		if (ctrack.getCurrentPosition()) {
			ctrack.draw(overlay);
		}
		var cp = ctrack.getCurrentParameters();
		var er = ec.meanPredict(cp);
	
		if (er) {
			console.log(er);
			ctx.updateData(er);
			for (var i = 0; i < er.length; i++) {
				if (er[i].value > 0.4) {
					document.getElementById('icon' + (i + 1)).style.visibility = 'visible';
				} else {
					document.getElementById('icon' + (i + 1)).style.visibility = 'hidden';
				}
			}
		}
	}

	static startVideo() {
		// start video
		vid.play();
		// start tracking
		ctrack.start(vid);
		trackingStarted = true;

		// start loop to draw face
		this.drawLoop();
	}

	static d3Vis() {
		var barWidth = 30;
		var formatPercent = d3.format(".0%");
		var x = d3.scale.linear()
			.domain([0, Clam.getEmotions().length]).range([margin.left, width + margin.left]);
		var y = d3.scale.linear()
			.domain([0, 1]).range([0, height]);
		svg = d3.select("#emotion_chart").append("svg")
			.attr("width", width + margin.left + margin.right)
			.attr("height", height + margin.top + margin.bottom)
		svg.selectAll("rect").
		data(emotionData).
		enter().
		append("svg:rect").
		attr("x", function (datum, index) {
			return x(index);
		}).
		attr("y", function (datum) {
			return height - y(datum.value);
		}).
		attr("height", function (datum) {
			return y(datum.value);
		}).
		attr("width", barWidth).
		attr("fill", "#2d578b");
		svg.selectAll("text.labels").
		data(emotionData).
		enter().
		append("svg:text").
		attr("x", function (datum, index) {
			return x(index) + barWidth;
		}).
		attr("y", function (datum) {
			return height - y(datum.value);
		}).
		attr("dx", -barWidth / 2).
		attr("dy", "1.2em").
		attr("text-anchor", "middle").
		text(function (datum) {
			return datum.value;
		}).
		attr("fill", "white").
		attr("class", "labels");
		svg.selectAll("text.yAxis").
		data(emotionData).
		enter().append("svg:text").
		attr("x", function (datum, index) {
			return x(index) + barWidth;
		}).
		attr("y", height).
		attr("dx", -barWidth / 2).
		attr("text-anchor", "middle").
		attr("style", "font-size: 12").
		text(function (datum) {
			return datum.emotion;
		}).
		attr("transform", "translate(0, 18)").
		attr("class", "yAxis");

	}

	static updateData(data) {
		var y = d3.scale.linear()
			.domain([0, 1]).range([0, height]);

		// update
		if (!svg) { return; }
		var rects = svg.selectAll("rect")
			.data(data)
			.attr("y", function (datum) {
				return height - y(datum.value);
			})
			.attr("height", function (datum) {
				return y(datum.value);
			});
		var texts = svg.selectAll("text.labels")
			.data(data)
			.attr("y", function (datum) {
				return height - y(datum.value);
			})
			.text(function (datum) {
				return datum.value.toFixed(1);
			});
		// enter
		rects.enter().append("svg:rect");
		texts.enter().append("svg:text");
		// exit
		rects.exit().remove();
		texts.exit().remove();
	}
}