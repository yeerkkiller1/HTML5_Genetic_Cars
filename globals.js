// Global Vars
var ghost;

var doDraw = true;
var cw_paused = false;

var box2dfps = 60;
var screenfps = 60;

var debugbox = document.getElementById("debug");

var generationSize = ko.observable(20);
var curGenerationSize = ko.observable(generationSize());
var carsAlive = ko.observable(curGenerationSize());

var cw_carArray = ko.observableArray();
var cw_topScores = new Array();
var cw_graphTop = new Array();
var cw_graphElite = new Array();
var cw_graphAverage = new Array();

var num_champions = ko.observable(1).extend({numeric: 10, persist: 'num_champions'});
var gen_parentality = 0.2;
var gen_mutation = ko.observable(0.05).extend({numeric: 10, persist: 'gen_mutation'});
var mutation_range = ko.observable(1).extend({numeric: 10, persist: 'mutation_range'});
var gen_counter = ko.observable(0);
var nAttributes = 15;

var gravity = new b2Vec2(0.0, -9.81);
var doSleep = true;

var world;

var zoom = 70;

var chassisMaxAxis = 1.1;
var chassisMinAxis = 0.1;
var chassisMinDensity = 30;
var chassisMaxDensity = 300;

var wheelMaxRadius = 0.5;
var wheelMinRadius = 0.2;
var wheelMaxDensity = 100;
var wheelMinDensity = 40;

var swapPoint1 = 0;
var swapPoint2 = 0;

var distanceMeter = document.getElementById("distancemeter");

var leaderPosition = new Object();
leaderPosition.x = 0;
leaderPosition.y = 0;

var model = {
  gen_counter: gen_counter,
  seedString: ko.observable("").extend({persist: 'seedString'}),
  gen_mutation: gen_mutation,
  cars: cw_carArray
};
ko.applyBindings(model);
