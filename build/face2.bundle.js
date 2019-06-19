/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./experiments/face/v2/main.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./experiments/face/v2/main.js":
/*!*************************************!*\
  !*** ./experiments/face/v2/main.js ***!
  \*************************************/
/*! no static exports found */
/***/ (function(module, exports) {

var vid = document.getElementById('videoel');
var vid_width = vid.width;
var vid_height = vid.height;
var overlay = document.getElementById('overlay');
var overlayCC = overlay.getContext('2d');
/********** check and set up video/webcam **********/

function enablestart() {
  var startbutton = document.getElementById('startbutton');
  startbutton.value = "start";
  startbutton.disabled = null;
}

function adjustVideoProportions() {
  // resize overlay and video if proportions are different
  // keep same height, just change width
  var proportion = vid.videoWidth / vid.videoHeight;
  vid_width = Math.round(vid_height * proportion);
  vid.width = vid_width;
  overlay.width = vid_width;
}

function gumSuccess(stream) {
  // add camera stream if getUserMedia succeeded
  if ("srcObject" in vid) {
    vid.srcObject = stream;
  } else {
    vid.src = window.URL && window.URL.createObjectURL(stream);
  }

  vid.onloadedmetadata = function () {
    adjustVideoProportions();
    vid.play();
  };

  vid.onresize = function () {
    adjustVideoProportions();

    if (trackingStarted) {
      ctrack.stop();
      ctrack.reset();
      ctrack.start(vid);
    }
  };
}

function gumFail() {
  alert("There was some problem trying to fetch video from your webcam. If you have a webcam, please make sure to accept when the browser asks for access to your webcam.");
}

navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
window.URL = window.URL || window.webkitURL || window.msURL || window.mozURL; // check for camerasupport

if (navigator.mediaDevices) {
  navigator.mediaDevices.getUserMedia({
    video: true
  }).then(gumSuccess)["catch"](gumFail);
} else if (navigator.getUserMedia) {
  navigator.getUserMedia({
    video: true
  }, gumSuccess, gumFail);
} else {
  alert("This demo depends on getUserMedia, which your browser does not seem to support. :(");
}

vid.addEventListener('canplay', enablestart, false);
/*********** setup of emotion detection *************/
// set eigenvector 9 and 11 to not be regularized. This is to better detect motion of the eyebrows

pModel.shapeModel.nonRegularizedVectors.push(9);
pModel.shapeModel.nonRegularizedVectors.push(11);
var ctrack = new clm.tracker({
  useWebGL: true
});
ctrack.init(pModel);
var trackingStarted = false;
document.getElementById('startbutton').addEventListener('click', function () {
  startVideo();
});

function startVideo() {
  // start video
  vid.play(); // start tracking

  ctrack.start(vid);
  trackingStarted = true; // start loop to draw face

  drawLoop();
}

function drawLoop() {
  requestAnimFrame(drawLoop);
  overlayCC.clearRect(0, 0, vid_width, vid_height); //psrElement.innerHTML = "score :" + ctrack.getScore().toFixed(4);

  if (ctrack.getCurrentPosition()) {
    ctrack.draw(overlay);
  }

  var cp = ctrack.getCurrentParameters();
  var er = ec.meanPredict(cp);

  if (er) {
    updateData(er);

    for (var i = 0; i < er.length; i++) {
      if (er[i].value > 0.4) {
        document.getElementById('icon' + (i + 1)).style.visibility = 'visible';
      } else {
        document.getElementById('icon' + (i + 1)).style.visibility = 'hidden';
      }
    }
  }
}

delete emotionModel['disgusted'];
delete emotionModel['fear'];
var ec = new emotionClassifier();
ec.init(emotionModel);
var emotionData = ec.getBlank();
/************ d3 code for barchart *****************/

var margin = {
  top: 20,
  right: 20,
  bottom: 10,
  left: 40
},
    width = 400 - margin.left - margin.right,
    height = 100 - margin.top - margin.bottom;
var barWidth = 30;
var formatPercent = d3.format(".0%");
var x = d3.scale.linear().domain([0, ec.getEmotions().length]).range([margin.left, width + margin.left]);
var y = d3.scale.linear().domain([0, 1]).range([0, height]);
var svg = d3.select("#emotion_chart").append("svg").attr("width", width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom);
svg.selectAll("rect").data(emotionData).enter().append("svg:rect").attr("x", function (datum, index) {
  return x(index);
}).attr("y", function (datum) {
  return height - y(datum.value);
}).attr("height", function (datum) {
  return y(datum.value);
}).attr("width", barWidth).attr("fill", "#2d578b");
svg.selectAll("text.labels").data(emotionData).enter().append("svg:text").attr("x", function (datum, index) {
  return x(index) + barWidth;
}).attr("y", function (datum) {
  return height - y(datum.value);
}).attr("dx", -barWidth / 2).attr("dy", "1.2em").attr("text-anchor", "middle").text(function (datum) {
  return datum.value;
}).attr("fill", "white").attr("class", "labels");
svg.selectAll("text.yAxis").data(emotionData).enter().append("svg:text").attr("x", function (datum, index) {
  return x(index) + barWidth;
}).attr("y", height).attr("dx", -barWidth / 2).attr("text-anchor", "middle").attr("style", "font-size: 12").text(function (datum) {
  return datum.emotion;
}).attr("transform", "translate(0, 18)").attr("class", "yAxis");

function updateData(data) {
  // update
  var rects = svg.selectAll("rect").data(data).attr("y", function (datum) {
    return height - y(datum.value);
  }).attr("height", function (datum) {
    return y(datum.value);
  });
  var texts = svg.selectAll("text.labels").data(data).attr("y", function (datum) {
    return height - y(datum.value);
  }).text(function (datum) {
    return datum.value.toFixed(1);
  }); // enter

  rects.enter().append("svg:rect");
  texts.enter().append("svg:text"); // exit

  rects.exit().remove();
  texts.exit().remove();
}
/******** stats ********/


stats = new Stats();
stats.domElement.style.position = 'absolute';
stats.domElement.style.top = '0px';
document.getElementById('container').appendChild(stats.domElement); // update stats on every iteration

document.addEventListener('clmtrackrIteration', function (event) {
  stats.update();
}, false);

/***/ })

/******/ });
//# sourceMappingURL=face2.bundle.js.map