var slider = new Slider();
var currentStartTime = 0;
var currentEndTime = 0;

function onSliderChange(start, end) {
    start = Math.floor(start);
    end = Math.floor(end);

    currentStartTime = start;
    currentEndTime = end;

    var alltrue = [];
    var allfalse = [];
    for (var i = 0; i < v1.selected.length; ++i) alltrue[i] = true;
    for (var i = 0; i < v1.selected.length; ++i) allfalse[i] = false;

    v1.fresh(start, end, allfalse);
    v2.select(start, end, alltrue);
    v3.fresh(start - 1, end, alltrue);
}

function Slider() {
    var svgSlider = d3.select(".sliderCanvas");
    var width = innerWidth * 0.9 - 150;
    var height = 100;
    var x = innerWidth * 0.05 + 150;
    var y = innerHeight - 120;

    var minTime = 0;
    var maxTime = minTime;
    var startTime = minTime;
    var endTime = minTime + 50;
    var sliderScale = d3.scale.linear()
        .domain([minTime, maxTime])
        .range([20, width - 20]);
    this.SetTime = function (min, max, start, end) {
        minTime = min;
        maxTime = max;
        startTime = start;
        endTime = end;
        currentStartTime = start;
        currentEndTime = end;

        sliderScale = d3.scale.linear()
            .domain([minTime, maxTime])
            .range([20, width - 20]);

        this.Redraw();
    }

    function changeTime(start, end) {
        startTime = start < minTime ? minTime : start;
        endTime = end > maxTime ? maxTime : end;
        redraw();
        onSliderChange(startTime, endTime);
    }
    this.change = changeTime;

    var controls = d3.select("#controls");
    var play = controls.select(".Play");
    play.style("position", "absolute")
        .style("left", x - 150 + "px")
        .style("top", y + 40 + "px");
    play.on("click", playTime);
    var stop = controls.select(".Stop");
    stop.style("position", "absolute")
        .style("left", x - 100 + "px")
        .style("top", y + 40 + "px");
    stop.on("click", stopTime);
    var interval;
    function playTime() {
        stopTime();
        interval = setInterval(function () { timeShiftRight(); redraw(); }, 1200);
    }
    function stopTime() {
        clearInterval(interval);
        interval = 0;
    }
    function timeShiftRight() {
        var timeInterval = endTime - startTime;
        endTime += timeInterval / 10;
        startTime += timeInterval / 10;
        if (endTime > maxTime) {
            endTime = maxTime;
            startTime = endTime - timeInterval;
            stopTime();
        }
        changeTime(startTime, endTime);
    }


    svgSlider.attr("width", width)
        .attr("height", height)
        .style("position", "absolute")
        .style("left", x + "px")
        .style("top", y + "px");
    d3.select(".slider").attr("width", width - 40)
        .attr("height", height - 40)
        .attr("x", 20)
        .attr("y", 20);


    function redraw() {
        svgSlider.selectAll(".sliderMain")
            .data([1]) //.transition()
            .attr("x", sliderScale(startTime))
            .attr("width", sliderScale(endTime) - sliderScale(startTime))
            .select("title")
            .text(function () {
                return "From " + timestampToString(startTime * 1000) + " to " + timestampToString(endTime * 1000);
            });
        svgSlider.selectAll(".sliderLine")
            .data([[startTime, 0], [endTime, 1]]) //.transition()
            .attr("x1", function (d, i) { return sliderScale(d[0]); })
            .attr("x2", function (d, i) { return sliderScale(d[0]); })
            .select("title")
            .text(function (d) {
                timestampToString(d[0] * 1000);
            });

        svgSlider.selectAll(".sliderHandler")
            .data([[startTime, 0], [endTime, 1]]) //.transition()
            .attr("x", function (d, i) { return sliderScale(d[0]) - 10; })
            .select("title")
            .text(function (d) {
                return timestampToString(d[0] * 1000);
            });
        d3.select(".timeLabel")
            .text("From " + timestampToString(startTime * 1000) + " to " + timestampToString(endTime * 1000));
    }

    this.Redraw = redraw;

    var sliderLine = svgSlider.selectAll(".sliderLine")
        .data([[startTime, 0], [endTime, 1]])
        .enter()
        .append("line")
        .attr("class", "sliderLine")
        .attr("x1", function (d, i) { return sliderScale(d[0]); })
        .attr("y1", 20)
        .attr("x2", function (d, i) { return sliderScale(d[0]); })
        .attr("y2", 80)
        .style("stroke", "black")
        .append("title")
        .text(function (d) {
            timestampToString(d[0] * 1000);
        });


    var sliderMain = svgSlider.selectAll(".sliderMain")
        .data([1])
        .enter()
        .append("rect")
        .attr("class", "sliderMain")
        .attr("x", sliderScale(startTime))
        .attr("y", 20)
        .attr("width", sliderScale(endTime) - sliderScale(startTime))
        .attr("height", 60)
        .style("stroke", "black")
        .style("fill", "steelblue")
        .style("cursor", "pointer")
        .append("title")
        .text(function () {
            return "From " + timestampToString(startTime * 1000) + " to " + timestampToString(endTime * 1000);
        });
    var sliderHandler = svgSlider.selectAll(".sliderHandler")
        .data([[startTime, 0], [endTime, 1]])
        .enter()
        .append("rect")
        .attr("class", "sliderHandler")
        .attr("x", function (d, i) { return sliderScale(d[0]) - 10; })
        .attr("y", 30)
        .attr("width", 20)
        .attr("height", 40)
        .style("stroke", "black")
        .style("fill", "white")
        .style("cursor", "pointer")
        .append("title")
        .text(function (d) {
            return timestampToString(d[0] * 1000);
        });

    var shDragListener = d3.behavior.drag()
        .on("dragstart",
        function (d) {
            d3.event.sourceEvent.stopPropagation();
        })
        .on("drag",
        function (d) {
            if (d[1] === 0) {
                startTime = sliderScale.invert(d3.event.x);
                if (startTime < minTime) startTime = minTime;
                if (startTime > endTime) startTime = endTime;
            }
            if (d[1] === 1) {
                endTime = sliderScale.invert(d3.event.x);
                if (endTime > maxTime) endTime = maxTime;
                if (endTime < startTime) endTime = startTime;
            }

            redraw();

        })
        .on("dragend", function () { onSliderChange(startTime, endTime); });
    sliderHandler = svgSlider.selectAll(".sliderHandler");
    sliderHandler.call(shDragListener);


    var smDragListener = d3.behavior.drag()
        .on("dragstart",
        function (d) {
            d3.event.sourceEvent.stopPropagation();
        })
        .on("drag",
        function (d) {
            var timeDifference = endTime - startTime;
            var startX = sliderScale(startTime);
            var endX = sliderScale(endTime);

            startTime = sliderScale.invert(startX + d3.event.dx);
            endTime = sliderScale.invert(endX + d3.event.dx);

            if (startTime < minTime) {
                startTime = minTime;
                endTime = startTime + timeDifference;
            }
            if (endTime > maxTime) {
                endTime = maxTime;
                startTime = endTime - timeDifference;
            }
            redraw();

        })
        .on("dragend", function () { onSliderChange(startTime, endTime); });
    sliderMain = svgSlider.selectAll(".sliderMain");
    sliderMain.call(smDragListener);


}