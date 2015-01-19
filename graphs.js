(function () {

var cw_topScores;
var cw_graphTop;
var cw_graphElite;
var cw_graphAverage;

resetGraph();

var graphcanvas = document.getElementById("graphcanvas");
var graphctx = graphcanvas.getContext("2d");
function cw_storeGraphScores() {
  if(model.cars().length === 0) return;
  cw_graphAverage.push(cw_average(model.cars()));
  cw_graphElite.push(cw_eliteaverage(model.cars()));
  cw_graphTop.push(model.cars()[0].score());
}

function cw_eliteaverage(cars) {
    return avgArr(cars
                    .filter(function (x) { return x.is_elite; })
                    .map(function (x) { return x.score(); })
            );
}
function cw_average(cars) {
    return avgArr(cars.map(function (x) { return x.score(); }));
}

window.resetGraph = resetGraph;
function resetGraph() {
    cw_topScores = [];
    cw_graphTop = [];
    cw_graphElite = [];
    cw_graphAverage = [];
}
function maxArr(arr) {
    return arr.reduce(function(x, y){return Math.max(x, y);}, 0);
}
function avgArr(arr) {
    if (arr.length === 0) return 0;
    return arr.reduce(function (x, y) { return x + y; }, 0) / arr.length;
}
function getMaxScore() {
    return Math.max(
        maxArr(cw_topScores),
        maxArr(cw_graphTop),
        maxArr(cw_graphElite),
        maxArr(cw_graphAverage)
    );
}

function plotLineData(sX, sY, data, xScale, yScale, color) {
    graphctx.strokeStyle = color;
    graphctx.beginPath();
    graphctx.moveTo(sX * xScale, sY * yScale);
    data.forEach(function (datum) {
        graphctx.lineTo(datum.x * xScale, datum.y * yScale);
    });
    graphctx.stroke();
}

    //"#f00"
    //"#0f0"
    //"#00f"

window.plot_graphs = plot_graphs;
function plot_graphs() {
    cw_storeGraphScores();
    cw_clearGraphics();
    cw_listTopScores();

    var maxY = getMaxScore();
    var yScale = graphcanvas.height / maxY;
    var xScale = 20;

    plotLineData(0, maxY, cw_graphTop.map(function (x, index) { return { x: index + 1, y: maxY - x }; }), xScale, yScale, "green");
    plotLineData(0, maxY, cw_graphElite.map(function (x, index) { return { x: index + 1, y: maxY - x }; }), xScale, yScale, "blue");
    plotLineData(0, maxY, cw_graphAverage.map(function (x, index) { return { x: index + 1, y: maxY - x }; }), xScale, yScale, "red");

    graphctx.font = "10px Verdana";
    graphctx.fillStyle = "green";
    var txt = "Top Car";
    graphctx.fillText(txt, graphcanvas.width - graphctx.measureText(txt).width - 20, graphcanvas.height - 30);

    graphctx.fillStyle = "blue";
    var txt = "Elite Average";
    graphctx.fillText(txt, graphcanvas.width - graphctx.measureText(txt).width - 20, graphcanvas.height - 20);

    graphctx.fillStyle = "red";
    var txt = "All Average";
    graphctx.fillText(txt, graphcanvas.width - graphctx.measureText(txt).width - 20, graphcanvas.height - 10);

    var lineStops = [];
    var lineSpace = 30;
    var lineCount = 7; //Math.max(3, Math.min(10, graphHeight / lineSpace));
    for (var ix = 0; ix <= lineCount - 1; ix++) {
        lineStops.push(ix / (lineCount - 1));
    }
    lineStops.forEach(function (lineStop) {
        var stopValue = lineStop * maxY;
        var yPos = maxY - stopValue;
        yPos *= yScale;

        graphctx.lineWidth = 1;
        graphctx.strokeStyle = "#888";
        graphctx.beginPath();
        graphctx.moveTo(0, yPos);
        graphctx.lineTo(graphcanvas.width, yPos);
        graphctx.stroke();

        yPos -= 2;
        if (lineStop === 1) {
            yPos += 12;
        }
        graphctx.font = "10px Verdana";
        graphctx.fillStyle = "black";
        var txt = stopValue.toFixed(0);
        graphctx.fillText(txt, graphcanvas.width - graphctx.measureText(txt).width - 2, yPos);
    });
}
function cw_clearGraphics() {
    graphcanvas.width = graphcanvas.width;
}
function cw_listTopScores() {
  var ts = document.getElementById("topscores");
  ts.innerHTML = "Top Scores:<br />";
  cw_topScores.sort(function(a,b) {if(a.v > b.v) {return -1} else {return 1}});
  for(var k = 0; k < Math.min(10,cw_topScores.length); k++) {
    document.getElementById("topscores").innerHTML += "#"+(k+1)+": "+Math.round(cw_topScores[k].v*100)/100+" d:"+Math.round(cw_topScores[k].x*100)/100+" h:"+Math.round(cw_topScores[k].y2*100)/100+"/"+Math.round(cw_topScores[k].y*100)/100+"m (gen "+cw_topScores[k].i+")<br />";
  }
}
})();
