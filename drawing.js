(function () {
var cameraspeed = 0.05;
window.camera_x = 0;
window.camera_y = 0;
window.camera_target = -1; // which car should we follow? -1 = leader
var minimapcamera = document.getElementById("minimapcamera").style;
minimapcamera.width = 12*minimapscale+"px";
minimapcamera.height = 6*minimapscale+"px";

window.cw_drawScreen = cw_drawScreen;
function cw_drawScreen() {
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.save();
  cw_setCameraPosition();
  ctx.translate(200-(camera_x*zoom), 200+(camera_y*zoom));
  ctx.scale(zoom, -zoom);
  cw_drawFloor();
  ghost_draw_frame(ctx, ghost);
  cw_drawCars();
  ctx.restore();
}

function cw_minimapCamera(x, y) {
  minimapcamera.left = Math.round((2+camera_x) * minimapscale) + "px";
  minimapcamera.top = Math.round((31-camera_y) * minimapscale) + "px";
}

window.cw_setCameraTarget = cw_setCameraTarget;
function cw_setCameraTarget(k) {
  camera_target = k;
}

function cw_setCameraPosition() {
  if(camera_target >= 0) {
    var cameraTargetPosition = cw_carArray()[camera_target].getPosition();
  } else {
    var cameraTargetPosition = leaderPosition;
  }
  var diff_y = camera_y - cameraTargetPosition.y;
  var diff_x = camera_x - cameraTargetPosition.x;
  camera_y -= cameraspeed * diff_y;
  camera_x -= cameraspeed * diff_x;
  cw_minimapCamera(camera_x, camera_y);
}

window.cw_drawCars = cw_drawCars;
function cw_drawCars() {
  for(var k = (cw_carArray().length-1); k >= 0; k--) {
    myCar = cw_carArray()[k];
    if(!myCar.alive) {
      continue;
    }
    myCarPos = myCar.getPosition();

    if(myCarPos.x < (camera_x - 5)) {
      // too far behind, don't draw
      continue;
    }

    ctx.strokeStyle = "#444";
    ctx.lineWidth = 1/zoom;

    for (var i = 0; i < myCar.wheels.length; i++){
      b = myCar.wheels[i];
      for (f = b.GetFixtureList(); f; f = f.m_next) {
        var s = f.GetShape();
        var color = Math.round(255 - (255 * (f.m_density - wheelMinDensity)) / wheelMaxDensity).toString();
        var rgbcolor = "rgb("+color+","+color+","+color+")";
        cw_drawCircle(b, s.m_p, s.m_radius, b.m_sweep.a, rgbcolor);
      }
    }
    
    var densitycolor = Math.round(100 - (70 * ((myCar.car_def.chassis_density - chassisMinDensity) / chassisMaxDensity))).toString() + "%";
    if(myCar.is_elite) {
      ctx.strokeStyle = "#44c";
      //ctx.fillStyle = "#ddf";
      ctx.fillStyle = "hsl(240,50%,"+densitycolor+")";
    } else {
      ctx.strokeStyle = "#c44";
      //ctx.fillStyle = "#fdd";
      ctx.fillStyle = "hsl(0,50%,"+densitycolor+")";
    }
    ctx.beginPath();
    var b = myCar.chassis;
    for (f = b.GetFixtureList(); f; f = f.m_next) {
      var s = f.GetShape();
      cw_drawVirtualPoly(b, s.m_vertices, s.m_vertexCount);
    }
    ctx.fill();
    ctx.stroke();
  }
}
window.toggleDisplay = toggleDisplay;
function toggleDisplay() {
  if(cw_paused) {
    return;
  }
  canvas.width = canvas.width;
  if(doDraw) {
    doDraw = false;
    cw_stopSimulation();
    cw_runningInterval = setInterval(function() {
      var time = performance.now() + (1000 / screenfps);
      while (time > performance.now()) {
        simulationStep();
      }
    }, 1);
  } else {
    doDraw = true;
    clearInterval(cw_runningInterval);
    cw_startSimulation();
  }
}
window.cw_drawVirtualPoly = cw_drawVirtualPoly;
function cw_drawVirtualPoly(body, vtx, n_vtx) {
  // set strokestyle and fillstyle before call
  // call beginPath before call

  var p0 = body.GetWorldPoint(vtx[0]);
  ctx.moveTo(p0.x, p0.y);
  for (var i = 1; i < n_vtx; i++) {
    p = body.GetWorldPoint(vtx[i]);
    ctx.lineTo(p.x, p.y);
  }
  ctx.lineTo(p0.x, p0.y);
}

function cw_drawPoly(body, vtx, n_vtx) {
  // set strokestyle and fillstyle before call
  ctx.beginPath();

  var p0 = body.GetWorldPoint(vtx[0]);
  ctx.moveTo(p0.x, p0.y);
  for (var i = 1; i < n_vtx; i++) {
    p = body.GetWorldPoint(vtx[i]);
    ctx.lineTo(p.x, p.y);
  }
  ctx.lineTo(p0.x, p0.y);

  ctx.fill();
  ctx.stroke();
}

function cw_drawCircle(body, center, radius, angle, color) {
  var p = body.GetWorldPoint(center);
  ctx.fillStyle = color;

  ctx.beginPath();
  ctx.arc(p.x, p.y, radius, 0, 2*Math.PI, true);

  ctx.moveTo(p.x, p.y);
  ctx.lineTo(p.x + radius*Math.cos(angle), p.y + radius*Math.sin(angle));

  ctx.fill();
  ctx.stroke();
}
})();
