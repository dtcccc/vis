var slider = new Slider();

function Slider() {
    var svgSlider = d3.select(".sliderCanvas");
    var width = innerWidth * 0.9;
    var height = 100;
    var x = innerWidth * 0.05;
    var y = innerHeight - 120;

    var minTime = 1462238086;
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

        sliderScale = d3.scale.linear()
            .domain([minTime, maxTime])
            .range([20, width - 20]);

        this.Redraw();
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
        .on("dragend", function () { v1.fresh(startTime, endTime); });
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
        .on("dragend", function () { v1.fresh(startTime, endTime); });
    sliderMain = svgSlider.selectAll(".sliderMain");
    sliderMain.call(smDragListener);


}