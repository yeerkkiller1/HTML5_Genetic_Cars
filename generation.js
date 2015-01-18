/* ========================================================================= */
/* ==== Generation ========================================================= */

function cw_generationZero() {
  cw_nextGeneration();
}

function cw_nextGeneration() {
  var cars = model.cars();
  cars.sort(function(a,b) {return b.score() - a.score();});
  plot_graphs();

  for(var ix = cars.length - 1; ix >= 0; ix--) {
    if(cars[ix].bad()) {
      cars.splice(ix, 1);
    }
  }

  curGenerationSize(generationSize());
  
  var nextCarsDefs = [];
  nextCarsDefs.push.apply(
    nextCarsDefs, 
    cars
      .slice(0, num_champions())
      .map(function(x){
        x.car_def.is_elite = true;
        return x.car_def;
      })
  );

  if(cars.length < 2) {
    while(nextCarsDefs.length < curGenerationSize()) {
      nextCarsDefs.push(cw_createRandomCar());
    }
  } else {
    while(nextCarsDefs.length < curGenerationSize()) {
      var parent1 = cw_getParents(cars.length);
      var parent2 = parent1;
      while(parent2 == parent1) {
        parent2 = cw_getParents(cars.length);
      }
      var newborn = cw_makeChild(cars[parent1].car_def, cars[parent2].car_def);
      newborn = cw_mutate(newborn);
      newborn.is_elite = false;
      nextCarsDefs.push(newborn);
    }
  }

  gen_counter(gen_counter() + 1);
  cw_materializeGeneration(nextCarsDefs);
  cw_deadCars = 0;
  leaderPosition = new Object();
  leaderPosition.x = 0;
  leaderPosition.y = 0;
}

function cw_materializeGeneration(cw_carGeneration) {
  cw_carArray([]);
  for(var k = 0; k < curGenerationSize(); k++) {
    cw_carArray.push(new cw_Car(cw_carGeneration[k]));
  }
}

function cw_getParents(genSize) {
    var r = Math.random();
    if (r == 0)
        return 0;
    return Math.floor(-Math.log(r) * genSize) % genSize;
}

function cw_makeChild(car_def1, car_def2) {
  var newCarDef = new Object();
  swapPoint1 = Math.round(Math.random()*(nAttributes-1));
  swapPoint2 = swapPoint1;
  while(swapPoint2 == swapPoint1) {
    swapPoint2 = Math.round(Math.random()*(nAttributes-1));
  }
  var parents = [car_def1, car_def2];
  var curparent = 0;
  var wheelParent = 0;
  
  var variateWheelParents = parents[0].wheelCount == parents[1].wheelCount;
  
  if (!variateWheelParents){
    wheelParent = Math.floor(Math.random() * 2);
  }
  
  newCarDef.wheelCount = parents[wheelParent].wheelCount;
  
  newCarDef.wheel_radius = [];
  for (var i = 0; i < newCarDef.wheelCount; i++){
    if (variateWheelParents){
      curparent = cw_chooseParent(curparent,i);
    } else {
      curparent = wheelParent;
    }
    newCarDef.wheel_radius[i] = parents[curparent].wheel_radius[i];  
  }

  newCarDef.wheel_vertex = [];
  for (var i = 0; i < newCarDef.wheelCount; i++){
    if (variateWheelParents){
      curparent = cw_chooseParent(curparent, i + 2);
    } else {
      curparent = wheelParent;
    }
    newCarDef.wheel_vertex[i] = parents[curparent].wheel_vertex[i];
  }
  
  newCarDef.wheel_density = [];
  for (var i = 0; i < newCarDef.wheelCount; i++){
    if (variateWheelParents){
      curparent = cw_chooseParent(curparent,i + 12);
    } else {
      curparent = wheelParent;
    }
    newCarDef.wheel_density[i] = parents[curparent].wheel_density[i];  
  }

  newCarDef.vertex_list = new Array();
  curparent = cw_chooseParent(curparent,4);
  newCarDef.vertex_list[0] = parents[curparent].vertex_list[0];
  curparent = cw_chooseParent(curparent,5);
  newCarDef.vertex_list[1] = parents[curparent].vertex_list[1];
  curparent = cw_chooseParent(curparent,6);
  newCarDef.vertex_list[2] = parents[curparent].vertex_list[2];
  curparent = cw_chooseParent(curparent,7);
  newCarDef.vertex_list[3] = parents[curparent].vertex_list[3];
  curparent = cw_chooseParent(curparent,8);
  newCarDef.vertex_list[4] = parents[curparent].vertex_list[4];
  curparent = cw_chooseParent(curparent,9);
  newCarDef.vertex_list[5] = parents[curparent].vertex_list[5];
  curparent = cw_chooseParent(curparent,10);
  newCarDef.vertex_list[6] = parents[curparent].vertex_list[6];
  curparent = cw_chooseParent(curparent,11);
  newCarDef.vertex_list[7] = parents[curparent].vertex_list[7];

  curparent = cw_chooseParent(curparent,14);
  newCarDef.chassis_density = parents[curparent].chassis_density;
  return newCarDef;
}


function cw_mutate1(old, min, range) {
    var span = range * mutation_range();
    var base = old - 0.5 * span;
    if (base < min)
        base = min;
    if (base > min + (range - span))
        base = min + (range - span);
    return base + span * Math.random();
}

function cw_mutatev(car_def, n, xfact, yfact) {
    if (Math.random() >= gen_mutation())
        return;

    var v = car_def.vertex_list[n];
    var x = 0;
    var y = 0;
    if (xfact != 0)
        x = xfact * cw_mutate1(xfact * v.x, chassisMinAxis, chassisMaxAxis);
    if (yfact != 0)
        y = yfact * cw_mutate1(yfact * v.y, chassisMinAxis, chassisMaxAxis);
    car_def.vertex_list.splice(n, 1, new b2Vec2(x, y));
}


function cw_mutate(car_def) {
  for (var i = 0; i < car_def.wheelCount; i++){
    if(Math.random() < gen_mutation()){
      car_def.wheel_radius[i] = cw_mutate1(car_def.wheel_radius[i], wheelMinRadius, wheelMaxRadius);
    }
  }
  
  var wheel_m_rate = mutation_range() < gen_mutation() ? mutation_range() : gen_mutation();
  
  for (var i = 0; i < car_def.wheelCount; i++){
    if(Math.random() < wheel_m_rate){
      car_def.wheel_vertex[i] = Math.floor(Math.random()*8)%8;
    }
  }
  
  for (var i = 0; i < car_def.wheelCount; i++){
    if(Math.random() < gen_mutation()){
      car_def.wheel_density[i] = cw_mutate1(car_def.wheel_density[i], wheelMinDensity, wheelMaxDensity);
    }
  }
  
  if(Math.random() < gen_mutation()){
    car_def.chassis_density = cw_mutate1(car_def.chassis_density, chassisMinDensity, chassisMaxDensity);
  }

  cw_mutatev(car_def, 0, 1, 0);
  cw_mutatev(car_def, 1, 1, 1);
  cw_mutatev(car_def, 2, 0, 1);
  cw_mutatev(car_def, 3, -1, 1);
  cw_mutatev(car_def, 4, -1, 0);
  cw_mutatev(car_def, 5, -1, -1);
  cw_mutatev(car_def, 6, 0, -1);
  cw_mutatev(car_def, 7, 1, -1);

  return car_def;
}

function cw_chooseParent(curparent, attributeIndex) {
  var ret;
  if((swapPoint1 == attributeIndex) || (swapPoint2 == attributeIndex)) {
    if(curparent == 1) {
      ret = 0;
    } else {
      ret = 1;
    }
  } else {
    ret = curparent;
  }
  return ret;
}

function cw_setMutableFloor(choice) {
  mutable_floor = (choice==1);
}

function cw_setGravity(choice) {
  gravity = new b2Vec2(0.0, -parseFloat(choice));
  // CHECK GRAVITY CHANGES
  if (world.GetGravity().y != gravity.y) {
    world.SetGravity(gravity);
  }
}

/* ==== END Genration ====================================================== */
/* ========================================================================= */