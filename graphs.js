(function () {
var graphcanvas = document.getElementById("graphcanvas");
var graphctx = graphcanvas.getContext("2d");
var graphheight = 250;
var graphwidth = 400;
window.cw_storeGraphScores = cw_storeGraphScores;
function cw_storeGraphScores() {
  cw_graphAverage.push(cw_average(cw_carScores));
  cw_graphElite.push(cw_eliteaverage(cw_carScores));
  cw_graphTop.push(cw_carScores[0].v);
}
window.cw_plotTop = cw_plotTop;
function cw_plotTop() {
  var graphsize = cw_graphTop.length;
  graphctx.strokeStyle = "#f00";
  graphctx.beginPath();
  graphctx.moveTo(0,0);
  for(var k = 0; k < graphsize; k++) {
    graphctx.lineTo(400*(k+1)/graphsize,cw_graphTop[k]);
  }
  graphctx.stroke();
}
window.cw_plotElite = cw_plotElite;
function cw_plotElite() {
  var graphsize = cw_graphElite.length;
  graphctx.strokeStyle = "#0f0";
  graphctx.beginPath();
  graphctx.moveTo(0,0);
  for(var k = 0; k < graphsize; k++) {
    graphctx.lineTo(400*(k+1)/graphsize,cw_graphElite[k]);
  }
  graphctx.stroke();
}
window.cw_plotAverage = cw_plotAverage;
function cw_plotAverage() {
  var graphsize = cw_graphAverage.length;
  graphctx.strokeStyle = "#00f";
  graphctx.beginPath();
  graphctx.moveTo(0,0);
  for(var k = 0; k < graphsize; k++) {
    graphctx.lineTo(400*(k+1)/graphsize,cw_graphAverage[k]);
  }
  graphctx.stroke();
}
window.plot_graphs = plot_graphs;
function plot_graphs() {
  cw_storeGraphScores();
  cw_clearGraphics();
  cw_plotAverage();
  cw_plotElite();
  cw_plotTop();
  cw_listTopScores();
}
window.cw_eliteaverage = cw_eliteaverage;
function cw_eliteaverage(scores) {
  var sum = 0;
  for(var k = 0; k < Math.floor(generationSize/2); k++) {
    sum += scores[k].v;
  }
  return sum/Math.floor(generationSize/2);
}
window.cw_average = cw_average;
function cw_average(scores) {
  var sum = 0;
  for(var k = 0; k < generationSize; k++) {
    sum += scores[k].v;
  }
  return sum/generationSize;
}
window.cw_clearGraphics = cw_clearGraphics;
function cw_clearGraphics() {
  graphcanvas.width = graphcanvas.width;
  graphctx.translate(0,graphheight);
  graphctx.scale(1,-1);
  graphctx.lineWidth = 1;
  graphctx.strokeStyle="#888";
  graphctx.beginPath();
  graphctx.moveTo(0,graphheight/2);
  graphctx.lineTo(graphwidth, graphheight/2);
  graphctx.moveTo(0,graphheight/4);
  graphctx.lineTo(graphwidth, graphheight/4);
  graphctx.moveTo(0,graphheight*3/4);
  graphctx.lineTo(graphwidth, graphheight*3/4);
  graphctx.stroke();
}
window.cw_listTopScores = cw_listTopScores;
function cw_listTopScores() {
  var ts = document.getElementById("topscores");
  ts.innerHTML = "Top Scores:<br />";
  cw_topScores.sort(function(a,b) {if(a.v > b.v) {return -1} else {return 1}});
  for(var k = 0; k < Math.min(10,cw_topScores.length); k++) {
    document.getElementById("topscores").innerHTML += "#"+(k+1)+": "+Math.round(cw_topScores[k].v*100)/100+" d:"+Math.round(cw_topScores[k].x*100)/100+" h:"+Math.round(cw_topScores[k].y2*100)/100+"/"+Math.round(cw_topScores[k].y*100)/100+"m (gen "+cw_topScores[k].i+")<br />";
  }
}
})();
