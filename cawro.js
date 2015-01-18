function debug(str, clear) {
  if(clear) {
    debugbox.innerHTML = "";
  }
  debugbox.innerHTML += str+"<br />";
}

/* ========================================================================= */
/* === Car ================================================================= */
var cw_Car = function() {
  this.__constructor.apply(this, arguments);
}

cw_Car.prototype.maxHealth = box2dfps * 10;
cw_Car.prototype.chassis = null;

cw_Car.prototype.wheels = [];

cw_Car.prototype.__constructor = function(car_def) {
  this.health = ko.observable(this.maxHealth);
  this.maxPosition = 0;
  this.maxPositiony = 0;
  this.minPositiony = 0;
  this.frames = 0;
  this.car_def = car_def
  this.alive = true;
  this.is_elite = car_def.is_elite;
  this.bad = ko.observable(false);

  this.position = ko.observable(0);

  this.chassis = cw_createChassis(car_def.vertex_list, car_def.chassis_density);
  
  this.wheels = [];
  for (var i = 0; i < car_def.wheelCount; i++){
    this.wheels[i] = cw_createWheel(car_def.wheel_radius[i], car_def.wheel_density[i]);
  }
  
  var carmass = this.chassis.GetMass();
  for (var i = 0; i < car_def.wheelCount; i++){
    carmass += this.wheels[i].GetMass();
  }
  var torque = [];
  for (var i = 0; i < car_def.wheelCount; i++){
    torque[i] = carmass * -gravity.y / car_def.wheel_radius[i];
  }
  
  var joint_def = new b2RevoluteJointDef();

  for (var i = 0; i < car_def.wheelCount; i++){
    var randvertex = this.chassis.vertex_list[car_def.wheel_vertex[i]];
    joint_def.localAnchorA.Set(randvertex.x, randvertex.y);
    joint_def.localAnchorB.Set(0, 0);
    joint_def.maxMotorTorque = torque[i];
    joint_def.motorSpeed = -20;
    joint_def.enableMotor = true;
    joint_def.bodyA = this.chassis;
    joint_def.bodyB = this.wheels[i];
    var joint = world.CreateJoint(joint_def);
  }
  
  this.replay = ghost_create_replay();
  ghost_add_replay_frame(this.replay, this);
}

cw_Car.prototype.toggleBad = function() {
  this.bad(!this.bad());
}

cw_Car.prototype.getPosition = function() {
  return this.chassis.GetPosition();
}
cw_Car.prototype.update = function() {
  this.position(this.getPosition());
}

cw_Car.prototype.draw = function() {
  drawObject(this.chassis);
  
  for (var i = 0; i < this.wheels.length; i++){
    drawObject(this.wheels[i]);
  }
}

cw_Car.prototype.kill = function() {
  var avgspeed = (this.maxPosition / this.frames) * box2dfps;
  var position = this.maxPosition;
  var score = position + avgspeed;
  ghost_compare_to_replay(this.replay, ghost, score);
  cw_carScores.push({ car_def:this.car_def, v:score, s: avgspeed, x:position, y:this.maxPositiony, y2:this.minPositiony });
  world.DestroyBody(this.chassis);
  
  for (var i = 0; i < this.wheels.length; i++){
    world.DestroyBody(this.wheels[i]);
  }
  this.alive = false;
  
  // refocus camera to leader on death
  if (camera_target == this.car_def.index){
    cw_setCameraTarget(-1);
  }
}

cw_Car.prototype.checkDeath = function() {
  // check health
  var position = this.getPosition();
  if(position.y > this.maxPositiony) {
    this.maxPositiony = position.y;
  }
  if(position .y < this.minPositiony) {
    this.minPositiony = position.y;
  }
  if(position.x > this.maxPosition + 0.02) {
    this.health(this.maxHealth);
    this.maxPosition = position.x;
  } else {
    if(position.x > this.maxPosition) {
      this.maxPosition = position.x;
    }
    if(Math.abs(this.chassis.GetLinearVelocity().x) < 0.001) {
      this.health(this.health() - 5);
    }
    this.health(this.health() - 1);
    if(this.health() <= 0) {
      return true;
    }
  }
}

function cw_createChassisPart(body, vertex1, vertex2, density) {
  var vertex_list = new Array();
  vertex_list.push(vertex1);
  vertex_list.push(vertex2);
  vertex_list.push(b2Vec2.Make(0,0));
  var fix_def = new b2FixtureDef();
  fix_def.shape = new b2PolygonShape();
  fix_def.density = density;
  fix_def.friction = 10;
  fix_def.restitution = 0.2;
  fix_def.filter.groupIndex = -1;
  fix_def.shape.SetAsArray(vertex_list,3);

  body.CreateFixture(fix_def);
}

function cw_createChassis(vertex_list, density) {
  var body_def = new b2BodyDef();
  body_def.type = b2Body.b2_dynamicBody;
  body_def.position.Set(0.0, 4.0);

  var body = world.CreateBody(body_def);

  cw_createChassisPart(body, vertex_list[0],vertex_list[1], density);
  cw_createChassisPart(body, vertex_list[1],vertex_list[2], density);
  cw_createChassisPart(body, vertex_list[2],vertex_list[3], density);
  cw_createChassisPart(body, vertex_list[3],vertex_list[4], density);
  cw_createChassisPart(body, vertex_list[4],vertex_list[5], density);
  cw_createChassisPart(body, vertex_list[5],vertex_list[6], density);
  cw_createChassisPart(body, vertex_list[6],vertex_list[7], density);
  cw_createChassisPart(body, vertex_list[7],vertex_list[0], density);

  body.vertex_list = vertex_list;

  return body;
}

function cw_createWheel(radius, density) {
  var body_def = new b2BodyDef();
  body_def.type = b2Body.b2_dynamicBody;
  body_def.position.Set(0, 0);

  var body = world.CreateBody(body_def);

  var fix_def = new b2FixtureDef();
  fix_def.shape = new b2CircleShape(radius);
  fix_def.density = density;
  fix_def.friction = 1;
  fix_def.restitution = 0.2;
  fix_def.filter.groupIndex = -1;

  body.CreateFixture(fix_def);
  return body;
}

function cw_createRandomCar() {
  var v = [];
  var car_def = new Object();
  
  car_def.wheelCount = 2; 
  
  car_def.wheel_radius = [];
  car_def.wheel_density = [];
  car_def.wheel_vertex = [];
  for (var i = 0; i < car_def.wheelCount; i++){
    car_def.wheel_radius[i] = Math.random()*wheelMaxRadius+wheelMinRadius;
    car_def.wheel_density[i] = Math.random()*wheelMaxDensity+wheelMinDensity;
  }
  
  car_def.chassis_density = Math.random()*chassisMaxDensity+chassisMinDensity

  car_def.vertex_list = new Array();
  car_def.vertex_list.push(new b2Vec2(Math.random()*chassisMaxAxis + chassisMinAxis,0));
  car_def.vertex_list.push(new b2Vec2(Math.random()*chassisMaxAxis + chassisMinAxis,Math.random()*chassisMaxAxis + chassisMinAxis));
  car_def.vertex_list.push(new b2Vec2(0,Math.random()*chassisMaxAxis + chassisMinAxis));
  car_def.vertex_list.push(new b2Vec2(-Math.random()*chassisMaxAxis - chassisMinAxis,Math.random()*chassisMaxAxis + chassisMinAxis));
  car_def.vertex_list.push(new b2Vec2(-Math.random()*chassisMaxAxis - chassisMinAxis,0));
  car_def.vertex_list.push(new b2Vec2(-Math.random()*chassisMaxAxis - chassisMinAxis,-Math.random()*chassisMaxAxis - chassisMinAxis));
  car_def.vertex_list.push(new b2Vec2(0,-Math.random()*chassisMaxAxis - chassisMinAxis));
  car_def.vertex_list.push(new b2Vec2(Math.random()*chassisMaxAxis + chassisMinAxis,-Math.random()*chassisMaxAxis - chassisMinAxis));

  var left = [];
  for (var i = 0; i < 8; i++){
    left.push(i);
  }
  for (var i = 0; i < car_def.wheelCount; i++){
    var indexOfNext = Math.floor(Math.random()*left.length);
    car_def.wheel_vertex[i] = left[indexOfNext];
    left.splice(indexOfNext, 1);
  }

  return car_def;
}

/* === END Car ============================================================= */
/* ========================================================================= */
