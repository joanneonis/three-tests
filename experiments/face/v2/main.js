import Clam from './clmtracker';

// console.log(Clam.init());
Clam.init();

document.getElementById('startbutton').addEventListener('click', function () {
	Clam.startVideo();
});


// /************ d3 code for barchart *****************/
// var emotionData = Clam.getEmotionData();

// var margin = {
// 		top: 20,
// 		right: 20,
// 		bottom: 10,
// 		left: 40
// 	},
// 	width = 400 - margin.left - margin.right,
// 	height = 100 - margin.top - margin.bottom;
// var barWidth = 30;
// var formatPercent = d3.format(".0%");
// var x = d3.scale.linear()
// 	.domain([0, Clam.getEmotions().length]).range([margin.left, width + margin.left]);
// var y = d3.scale.linear()
// 	.domain([0, 1]).range([0, height]);
// var svg = d3.select("#emotion_chart").append("svg")
// 	.attr("width", width + margin.left + margin.right)
// 	.attr("height", height + margin.top + margin.bottom)
// svg.selectAll("rect").
// data(emotionData).
// enter().
// append("svg:rect").
// attr("x", function (datum, index) {
// 	return x(index);
// }).
// attr("y", function (datum) {
// 	return height - y(datum.value);
// }).
// attr("height", function (datum) {
// 	return y(datum.value);
// }).
// attr("width", barWidth).
// attr("fill", "#2d578b");
// svg.selectAll("text.labels").
// data(emotionData).
// enter().
// append("svg:text").
// attr("x", function (datum, index) {
// 	return x(index) + barWidth;
// }).
// attr("y", function (datum) {
// 	return height - y(datum.value);
// }).
// attr("dx", -barWidth / 2).
// attr("dy", "1.2em").
// attr("text-anchor", "middle").
// text(function (datum) {
// 	return datum.value;
// }).
// attr("fill", "white").
// attr("class", "labels");
// svg.selectAll("text.yAxis").
// data(emotionData).
// enter().append("svg:text").
// attr("x", function (datum, index) {
// 	return x(index) + barWidth;
// }).
// attr("y", height).
// attr("dx", -barWidth / 2).
// attr("text-anchor", "middle").
// attr("style", "font-size: 12").
// text(function (datum) {
// 	return datum.emotion;
// }).
// attr("transform", "translate(0, 18)").
// attr("class", "yAxis");

// function updateData(data) {
// 	// update
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