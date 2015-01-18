function simulationStep() {
  world.Step(1/box2dfps, 20, 20)
  ghost_move_frame(ghost);
  for(var k = 0; k < curGenerationSize(); k++) {
    if(!cw_carArray()[k].alive) {
      continue;
    }
    ghost_add_replay_frame(cw_carArray()[k].replay, cw_carArray()[k]);
    cw_carArray()[k].frames++;
    position = cw_carArray()[k].getPosition();
    cw_carArray()[k].update();
    if(cw_carArray()[k].checkDeath()) {
      cw_carArray()[k].kill();
      cw_deadCars++;
      carsAlive(curGenerationSize()-cw_deadCars);
      if(cw_deadCars >= curGenerationSize()) {
        cw_newRound();
      }
      if(leaderPosition.leader == k) {
        // leader is dead, find new leader
        cw_findLeader();
      }
      continue;
    }
    if(position.x > leaderPosition.x) {
      leaderPosition = position;
      leaderPosition.leader = k;
    }
  }
  showDistance(Math.round(leaderPosition.x*100)/100, Math.round(leaderPosition.y*100)/100);
}

function cw_findLeader() {
  var lead = 0;
  for(var k = 0; k < cw_carArray().length; k++) {
    if(!cw_carArray()[k].alive) {
      continue;
    }
    position = cw_carArray()[k].getPosition();
    if(position.x > lead) {
      leaderPosition = position;
      leaderPosition.leader = k;
    }
  }
}

function cw_newRound() {
  if (mutable_floor) {
    // GHOST DISABLED
    ghost = null;
    floorseed = Math.seedrandom();

    world = new b2World(gravity, doSleep);
    cw_createFloor();
    cw_drawMiniMap();
  } else {
    // RE-ENABLE GHOST
    ghost_reset_ghost(ghost);
  }

  cw_nextGeneration();
  camera_x = camera_y = 0;
  cw_setCameraTarget(-1);
}

function cw_startSimulation() {
  cw_runningInterval = setInterval(simulationStep, Math.round(1000/box2dfps));
  cw_drawInterval = setInterval(cw_drawScreen, Math.round(1000/screenfps));
}

function cw_stopSimulation() {
  clearInterval(cw_runningInterval);
  clearInterval(cw_drawInterval);
}

function cw_resetPopulation() {
  document.getElementById("generation").innerHTML = "";
  document.getElementById("topscores").innerHTML = "";
  cw_clearGraphics();
  cw_carArray([]);
  cw_topScores = new Array();
  cw_graphTop = new Array();
  cw_graphElite = new Array();
  cw_graphAverage = new Array();
  lastmax = 0;
  lastaverage = 0;
  lasteliteaverage = 0;
  swapPoint1 = 0;
  swapPoint2 = 0;
  cw_generationZero();
}

function cw_resetWorld() {
  doDraw = true;
  cw_stopSimulation();
  for (b = world.m_bodyList; b; b = b.m_next) {
    world.DestroyBody(b);
  }
  floorseed = model.seedString();
  Math.seedrandom(floorseed);
  cw_createFloor();
  cw_drawMiniMap();
  Math.seedrandom();
  cw_resetPopulation();
  cw_startSimulation();
}

function cw_confirmResetWorld() {
  if(confirm('Really reset world?')) {
    cw_resetWorld();
  } else {
    return false;
  }
}

// initial stuff, only called once (hopefully)
function cw_init() {
  curGenerationSize(generationSize());
  floorseed = model.seedString() || Math.seedrandom();
  world = new b2World(gravity, doSleep);
  cw_createFloor();
  cw_drawMiniMap();
  cw_generationZero();
  cw_runningInterval = setInterval(simulationStep, Math.round(1000/box2dfps));
  cw_drawInterval    = setInterval(cw_drawScreen,  Math.round(1000/screenfps));
}

function relMouseCoords(event){
    var totalOffsetX = 0;
    var totalOffsetY = 0;
    var canvasX = 0;
    var canvasY = 0;
    var currentElement = this;

    do{
        totalOffsetX += currentElement.offsetLeft - currentElement.scrollLeft;
        totalOffsetY += currentElement.offsetTop - currentElement.scrollTop;
    }
    while(currentElement = currentElement.offsetParent)

    canvasX = event.pageX - totalOffsetX;
    canvasY = event.pageY - totalOffsetY;

    return {x:canvasX, y:canvasY}
}
HTMLDivElement.prototype.relMouseCoords = relMouseCoords;
minimapholder.onclick = function(event){
  var coords = minimapholder.relMouseCoords(event);
  var closest = { 
    index: 0,
    dist: Math.abs(((cw_carArray()[0].getPosition().x + 6) * minimapscale) - coords.x),
    x: cw_carArray()[0].getPosition().x
  }
  
  var maxX = 0;
  for (var i = 0; i < cw_carArray().length; i++){
    if (!cw_carArray()[i].alive){
      continue;
    }
    var pos = cw_carArray()[i].getPosition();
    var dist = Math.abs(((pos.x + 6) * minimapscale) - coords.x);
    if (dist < closest.dist){
      closest.index = i;
      closest.dist = dist;
      closest.x = pos.x;
    }
    maxX = Math.max(pos.x, maxX);
  }
  
  if (closest.x == maxX){ // focus on leader again
    cw_setCameraTarget(-1);
  } else {
    cw_setCameraTarget(closest.index);
  }
}
