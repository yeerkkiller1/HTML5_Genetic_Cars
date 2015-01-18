/* ========================================================================= */
/* ==== Floor ============================================================== */
(function () {
var floorPieceWidth = 1.5;
var floorPieceHeight = 0.15;
window.mutable_floor = false; // TODO: Make this not global maybe
var maxFloorTiles = 200;

var cw_floorTiles = new Array();
var last_drawn_tile = 0;

window.cw_createFloor = cw_createFloor;
function cw_createFloor() {
  var last_tile = null;
  var tile_position = new b2Vec2(-5,0);
  cw_floorTiles = new Array();
  Math.seedrandom(floorseed);
  for(var k = 0; k < maxFloorTiles; k++) {
    if (!mutable_floor) {
      // keep old impossible tracks if not using mutable floors
      last_tile = cw_createFloorTile(tile_position, (Math.random()*3 - 1.5) * 1.5*k/maxFloorTiles);
    } else {
      // if path is mutable over races, create smoother tracks
      last_tile = cw_createFloorTile(tile_position, (Math.random()*3 - 1.5) * 1.2*k/maxFloorTiles);
    }
    cw_floorTiles.push(last_tile);
    last_fixture = last_tile.GetFixtureList();
    last_world_coords = last_tile.GetWorldPoint(last_fixture.GetShape().m_vertices[3]);
    tile_position = last_world_coords;
  }
}

window.cw_createFloorTile = cw_createFloorTile;
function cw_createFloorTile(position, angle) {
  body_def = new b2BodyDef();

  body_def.position.Set(position.x, position.y);
  var body = world.CreateBody(body_def);
  fix_def = new b2FixtureDef();
  fix_def.shape = new b2PolygonShape();
  fix_def.friction = 0.5;

  var coords = new Array();
  coords.push(new b2Vec2(0,0));
  coords.push(new b2Vec2(0,-floorPieceHeight));
  coords.push(new b2Vec2(floorPieceWidth,-floorPieceHeight));
  coords.push(new b2Vec2(floorPieceWidth,0));

  var center = new b2Vec2(0,0);

  var newcoords = cw_rotateFloorTile(coords, center, angle);

  fix_def.shape.SetAsArray(newcoords);

  body.CreateFixture(fix_def);
  return body;
}

window.cw_rotateFloorTile = cw_rotateFloorTile;
function cw_rotateFloorTile(coords, center, angle) {
  var newcoords = new Array();
  for(var k = 0; k < coords.length; k++) {
    nc = new Object();
    nc.x = Math.cos(angle)*(coords[k].x - center.x) - Math.sin(angle)*(coords[k].y - center.y) + center.x;
    nc.y = Math.sin(angle)*(coords[k].x - center.x) + Math.cos(angle)*(coords[k].y - center.y) + center.y;
    newcoords.push(nc);
  }
  return newcoords;
}

/* ==== END Floor ========================================================== */
/* ========================================================================= */
window.cw_drawFloor = cw_drawFloor;
function cw_drawFloor() {
  ctx.strokeStyle = "#000";
  ctx.fillStyle = "#666";
  ctx.lineWidth = 1/zoom;
  ctx.beginPath();

  outer_loop:
  for(var k = Math.max(0,last_drawn_tile-20); k < cw_floorTiles.length; k++) {
    var b = cw_floorTiles[k];
    for (f = b.GetFixtureList(); f; f = f.m_next) {
      var s = f.GetShape();
      var shapePosition = b.GetWorldPoint(s.m_vertices[0]).x;
      if((shapePosition > (camera_x - 5)) && (shapePosition < (camera_x + 10))) {
        cw_drawVirtualPoly(b, s.m_vertices, s.m_vertexCount);
      }
      if(shapePosition > camera_x + 10) {
        last_drawn_tile = k;
        break outer_loop;
      }
    }
  }
  ctx.fill();
  ctx.stroke();
}

window.cw_drawMiniMap = cw_drawMiniMap;
function cw_drawMiniMap() {
  var last_tile = null;
  var tile_position = new b2Vec2(-5,0);
  fogdistance = 0;
  mipmapfogdistance.width = "800px";
  minimapcanvas.width = minimapcanvas.width;
  minimapctx.strokeStyle = "#000";
  minimapctx.beginPath();
  minimapctx.moveTo(0,35 * minimapscale);
  for(var k = 0; k < cw_floorTiles.length; k++) {
    last_tile = cw_floorTiles[k];
    last_fixture = last_tile.GetFixtureList();
    last_world_coords = last_tile.GetWorldPoint(last_fixture.GetShape().m_vertices[3]);
    tile_position = last_world_coords;
    minimapctx.lineTo((tile_position.x + 5) * minimapscale, (-tile_position.y + 35) * minimapscale);
  }
  minimapctx.stroke();
}
})();
