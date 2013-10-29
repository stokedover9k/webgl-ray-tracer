function initLineAt(point) {
  context.beginPath();
  var w = canvas.width, h = canvas.height;
  p = depthPerspective(point.toArray());
  context.moveTo(w/2 + w/4 * p[0], h/2 - w/4 * p[1]);
}

function lineToPoint(point) {
  var w = canvas.width, h = canvas.height;
  p = depthPerspective(point.toArray());
  context.lineTo(w/2 + w/4 * p[0], h/2 - w/4 * p[1]);
}

function endLine() {
  context.stroke();
}

function drawPath(points) {
  var w = canvas.width, h = canvas.height;

  context.beginPath();
  var p = depthPerspective(points[0].toArray());
  context.moveTo(w/2 + w/4 * p[0], h/2 - w/4 * p[1]);
  for( var i = 1; i < points.length; i++ ) {
    p = depthPerspective(points[i].toArray());
    context.lineTo(w/2 + w/4 * p[0], h/2 - w/4 * p[1]);
  }
  context.stroke();
}

function Cube() {
  this.pts = [Vec3(-1,-1,-1),Vec3( 1,-1,-1),Vec3(-1, 1,-1),Vec3( 1, 1,-1),Vec3(-1,-1, 1),Vec3( 1,-1, 1),Vec3(-1, 1, 1),Vec3( 1, 1, 1)];
  this.edges = [[0,1],[2,3],[4,5],[6,7], [0,2],[1,3],[4,6],[5,7], [0,4],[1,5],[2,6],[3,7]];
}

Cube.prototype.draw = function(context, matrix) {
  for (var i = 0 ; i < this.edges.length ; i++) {
    var p000 = this.pts[this.edges[i][0]];
    var p111 = this.pts[this.edges[i][1]];

    var p0 = matrix.times_v(p000);
    var p1 = matrix.times_v(p111);

    drawPath([p0, p1]);
  }
};

function Wheel (spokes) { this.spokes = spokes; }

Wheel.prototype.draw = function(context, matrix) {

  var spokes = this.spokes + (this.spokes % 2 == 0 ? 0 : 1);
  var step = 2 * Math.PI / spokes;

  var origin1 = matrix.times_v(Vec3(0,0,1));
  var origin2 = matrix.times_v(Vec3(0,0,-1));

  initLineAt(origin1);
  for (var i = 0; i < spokes; i = i + 2) {
    var angle = i * step;
    var p1 = matrix.times_v(Vec3(Math.cos(angle), Math.sin(angle), 1));
    angle = (i+1) * step;
    var p2 = matrix.times_v(Vec3(Math.cos(angle), Math.sin(angle), 1));

    lineToPoint(p1);
    lineToPoint(p2);
    lineToPoint(origin1);
  };
  endLine();

  initLineAt(origin2);
  for (var i = 0; i < spokes; i = i + 2) {
    var angle = (i+1) * step;
    var p1 = matrix.times_v(Vec3(Math.cos(angle), Math.sin(angle), -1));
    angle = (i+2) * step;
    var p2 = matrix.times_v(Vec3(Math.cos(angle), Math.sin(angle), -1));

    lineToPoint(p1);
    lineToPoint(p2);
    lineToPoint(origin2);
  };
  endLine();

  initLineAt(matrix.times_v(Vec3(1, 0, -1)));
  for (var i = 0; i < spokes; i = i + 2) {
    var a1 = (i+1) * step;
    var a2 = (i+2) * step;

    var p1 = matrix.times_v(Vec3(Math.cos(a1), Math.sin(a1), -1));
    var p2 = matrix.times_v(Vec3(Math.cos(a1), Math.sin(a1),  1));
    var p3 = matrix.times_v(Vec3(Math.cos(a2), Math.sin(a2),  1));
    var p4 = matrix.times_v(Vec3(Math.cos(a2), Math.sin(a2), -1));

    lineToPoint(p1);
    lineToPoint(p2);
    lineToPoint(p3);
    lineToPoint(p4);
  };
  endLine();

};
