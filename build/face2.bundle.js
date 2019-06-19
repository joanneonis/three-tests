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

/***/ "./experiments/face/v2/clmtracker.js":
/*!*******************************************!*\
  !*** ./experiments/face/v2/clmtracker.js ***!
  \*******************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return Clam; });
/* harmony import */ var _babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/classCallCheck */ "./node_modules/@babel/runtime/helpers/classCallCheck.js");
/* harmony import */ var _babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/createClass */ "./node_modules/@babel/runtime/helpers/createClass.js");
/* harmony import */ var _babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1__);


var vid = document.getElementById('videoel');
var vid_width = vid.width;
var vid_height = vid.height;
var overlay = document.getElementById('overlay');
var trackingStarted;
var ctrack;
var emotionData;
var ec;
var proportion;
var ctx; // d3 Only

var svg;
var margin = {
  top: 20,
  right: 20,
  bottom: 10,
  left: 40
};
var width = 400 - margin.left - margin.right;
var height = 100 - margin.top - margin.bottom;

var Clam =
/*#__PURE__*/
function () {
  function Clam() {
    _babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0___default()(this, Clam);
  }

  _babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1___default()(Clam, null, [{
    key: "init",
    value: function init() {
      ctx = this;
      this.mediaCheck();
      this.reguliseEyebrows();
      delete emotionModel['disgusted'];
      delete emotionModel['fear'];
      ec = new emotionClassifier();
      ec.init(emotionModel);
      window.ec = ec;
      emotionData = ec.getBlank(); // this.d3Vis();
    }
  }, {
    key: "getClamTracker",
    value: function getClamTracker() {
      return ctrack;
    }
  }, {
    key: "getEc",
    value: function getEc() {
      return ec;
    }
  }, {
    key: "getEmotions",
    value: function getEmotions() {
      return ec.getEmotions();
    }
  }, {
    key: "getEmotionData",
    value: function getEmotionData() {
      return emotionData;
    }
    /********** check and set up video/webcam **********/

  }, {
    key: "enablestart",
    value: function enablestart() {
      var startbutton = document.getElementById('startbutton');
      startbutton.value = "start";
      startbutton.disabled = null;
    }
  }, {
    key: "adjustVideoProportions",
    value: function adjustVideoProportions() {
      // resize overlay and video if proportions are different
      // keep same height, just change width
      proportion = vid.videoWidth / vid.videoHeight;
      vid_width = Math.round(vid_height * proportion);
      vid.width = vid_width;
      overlay.width = vid_width;
    }
  }, {
    key: "getVidProportions",
    value: function getVidProportions() {
      return {
        videoWidth: vid_width,
        videoHeight: vid_height,
        proportions: proportion
      };
    }
  }, {
    key: "gumSuccess",
    value: function gumSuccess(stream) {
      // add camera stream if getUserMedia succeeded
      if ("srcObject" in vid) {
        vid.srcObject = stream;
      } else {
        vid.src = window.URL && window.URL.createObjectURL(stream);
      }

      vid.onloadedmetadata = function () {
        ctx.adjustVideoProportions();
        vid.play();
      };

      vid.onresize = function () {
        ctx.adjustVideoProportions();

        if (trackingStarted) {
          ctrack.stop();
          ctrack.reset();
          ctrack.start(vid);
        }
      };
    }
  }, {
    key: "gumFail",
    value: function gumFail() {
      alert("There was some problem trying to fetch video from your webcam. If you have a webcam, please make sure to accept when the browser asks for access to your webcam.");
    }
  }, {
    key: "mediaCheck",
    value: function mediaCheck() {
      navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
      window.URL = window.URL || window.webkitURL || window.msURL || window.mozURL; // check for camerasupport

      if (navigator.mediaDevices) {
        navigator.mediaDevices.getUserMedia({
          video: true
        }).then(this.gumSuccess)["catch"](this.gumFail);
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

  }, {
    key: "reguliseEyebrows",
    value: function reguliseEyebrows() {
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
  }, {
    key: "startVideo",
    value: function startVideo() {
      // start video
      vid.play(); // start tracking

      ctrack.start(vid);
      trackingStarted = true; // start loop to draw face
      // this.drawLoop();
    } // static d3Vis() {
    // 	var barWidth = 30;
    // 	var formatPercent = d3.format(".0%");
    // 	var x = d3.scale.linear()
    // 		.domain([0, Clam.getEmotions().length]).range([margin.left, width + margin.left]);
    // 	var y = d3.scale.linear()
    // 		.domain([0, 1]).range([0, height]);
    // 	svg = d3.select("#emotion_chart").append("svg")
    // 		.attr("width", width + margin.left + margin.right)
    // 		.attr("height", height + margin.top + margin.bottom)
    // 	svg.selectAll("rect").
    // 	data(emotionData).
    // 	enter().
    // 	append("svg:rect").
    // 	attr("x", function (datum, index) {
    // 		return x(index);
    // 	}).
    // 	attr("y", function (datum) {
    // 		return height - y(datum.value);
    // 	}).
    // 	attr("height", function (datum) {
    // 		return y(datum.value);
    // 	}).
    // 	attr("width", barWidth).
    // 	attr("fill", "#2d578b");
    // 	svg.selectAll("text.labels").
    // 	data(emotionData).
    // 	enter().
    // 	append("svg:text").
    // 	attr("x", function (datum, index) {
    // 		return x(index) + barWidth;
    // 	}).
    // 	attr("y", function (datum) {
    // 		return height - y(datum.value);
    // 	}).
    // 	attr("dx", -barWidth / 2).
    // 	attr("dy", "1.2em").
    // 	attr("text-anchor", "middle").
    // 	text(function (datum) {
    // 		return datum.value;
    // 	}).
    // 	attr("fill", "white").
    // 	attr("class", "labels");
    // 	svg.selectAll("text.yAxis").
    // 	data(emotionData).
    // 	enter().append("svg:text").
    // 	attr("x", function (datum, index) {
    // 		return x(index) + barWidth;
    // 	}).
    // 	attr("y", height).
    // 	attr("dx", -barWidth / 2).
    // 	attr("text-anchor", "middle").
    // 	attr("style", "font-size: 12").
    // 	text(function (datum) {
    // 		return datum.emotion;
    // 	}).
    // 	attr("transform", "translate(0, 18)").
    // 	attr("class", "yAxis");
    // }
    // static updateData(data) {
    // 	var y = d3.scale.linear()
    // 		.domain([0, 1]).range([0, height]);
    // 	// update
    // 	if (!svg) { return; }
    // 	var rects = svg.selectAll("rect")
    // 		.data(data)
    // 		.attr("y", function (datum) {
    // 			return height - y(datum.value);
    // 		})
    // 		.attr("height", function (datum) {
    // 			return y(datum.value);
    // 		});
    // 	var texts = svg.selectAll("text.labels")
    // 		.data(data)
    // 		.attr("y", function (datum) {
    // 			return height - y(datum.value);
    // 		})
    // 		.text(function (datum) {
    // 			return datum.value.toFixed(1);
    // 		});
    // 	// enter
    // 	rects.enter().append("svg:rect");
    // 	texts.enter().append("svg:text");
    // 	// exit
    // 	rects.exit().remove();
    // 	texts.exit().remove();
    // }

  }]);

  return Clam;
}();



/***/ }),

/***/ "./experiments/face/v2/main.js":
/*!*************************************!*\
  !*** ./experiments/face/v2/main.js ***!
  \*************************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _clmtracker__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./clmtracker */ "./experiments/face/v2/clmtracker.js");
 // console.log(Clam.init());

_clmtracker__WEBPACK_IMPORTED_MODULE_0__["default"].init();
var overlay = document.getElementById('overlay');
var overlayCC = overlay.getContext('2d');
var videoInfo;
var emotionData;
var ctrack;
var ec; // d3

var svg;
var emotionStates;
document.getElementById('startbutton').addEventListener('click', function () {
  _clmtracker__WEBPACK_IMPORTED_MODULE_0__["default"].startVideo();
  emotionData = _clmtracker__WEBPACK_IMPORTED_MODULE_0__["default"].getEmotionData();
  videoInfo = _clmtracker__WEBPACK_IMPORTED_MODULE_0__["default"].getVidProportions();
  ctrack = window.ctrack;
  ec = window.ec;
  drawLoop();
  d3Vis();
});

function drawLoop() {
  requestAnimationFrame(drawLoop);
  overlayCC.clearRect(0, 0, videoInfo.videoWidth, videoInfo.videoHeight); //psrElement.innerHTML = "score :" + ctrack.getScore().toFixed(4);

  if (ctrack.getCurrentPosition()) {
    ctrack.draw(overlay);
  }

  var cp = ctrack.getCurrentParameters();
  emotionStates = ec.meanPredict(cp);

  if (emotionStates) {
    updateData(emotionStates);

    for (var i = 0; i < emotionStates.length; i++) {
      if (emotionStates[i].value > 0.4) {
        document.getElementById('icon' + (i + 1)).style.visibility = 'visible';
      } else {
        document.getElementById('icon' + (i + 1)).style.visibility = 'hidden';
      }
    }
  }
}

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

function d3Vis() {
  var x = d3.scale.linear().domain([0, _clmtracker__WEBPACK_IMPORTED_MODULE_0__["default"].getEmotions().length]).range([margin.left, width + margin.left]);
  var y = d3.scale.linear().domain([0, 1]).range([0, height]);
  svg = d3.select("#emotion_chart").append("svg").attr("width", width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom);
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
}

function updateData(data) {
  var y = d3.scale.linear().domain([0, 1]).range([0, height]); // update

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

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/classCallCheck.js":
/*!***************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/classCallCheck.js ***!
  \***************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

module.exports = _classCallCheck;

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/createClass.js":
/*!************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/createClass.js ***!
  \************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

module.exports = _createClass;

/***/ })

/******/ });
//# sourceMappingURL=face2.bundle.js.map