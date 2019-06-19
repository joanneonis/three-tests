import Clam from './clmtracker';
import * as dat from 'dat.gui';
import * as THREE from 'three';

import 'three/examples/js/controls/OrbitControls';
import 'three/examples/js/loaders/GLTFLoader';
import 'three/examples/js/AnimationClipCreator';

import { setlightType, buildGui, changeLightType } from '../../../helpers/functions/lights';


// console.log(Clam.init());
Clam.init();

var overlay = document.getElementById('overlay');
var overlayCC = overlay.getContext('2d');
var videoInfo;
var emotionData;
var ctrack;
var ec;

// d3
var svg;

var emotionStates;

document.getElementById('startbutton').addEventListener('click', function () {
	Clam.startVideo();
	emotionData = Clam.getEmotionData();
	videoInfo = Clam.getVidProportions();
	ctrack = window.ctrack;
	ec = window.ec;
	drawLoop();
	d3Vis();
});

function drawLoop() {
	requestAnimationFrame(drawLoop);


	overlayCC.clearRect(0, 0, videoInfo.videoWidth, videoInfo.videoHeight);
	//psrElement.innerHTML = "score :" + ctrack.getScore().toFixed(4);
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

function updateData(data) {
		var y = d3.scale.linear()
		.domain([0, 1]).range([0, height]);

	// update
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
