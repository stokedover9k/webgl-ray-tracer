var NORTH = 1, EAST = 2, SOUTH = 3, WEST = 4;
var LEFT = WEST, RIGHT = EAST;

function makeMetallic(color) {
  var r = color[0], g = color[1], b = color[2];
  var d = 1, p = 10;
  return [r,g,b, r*d,g*d,b*d, r*p,g*p,b*p,  20];
}

function setUniforms(obj, colors) {
  colors = colors || [.1,.0,0, .9,.0,0, 1,1,1,20];
  obj.setUniform('p', colors);
  obj.setUniform('lDir', [.57,.57,.57]);
}

// a marker for the world's origin
function rootOfAllEvil (context, scale) {
  scale = scale || 1
  return new Segment(
    context.addObject(createSphere(8,4), 'fs_phong'),
    function () {
      this.modelT = MSScale(.5,.5,.5);
      this.worldT = MSScale(scale,scale,scale).then(MSTranslate(0,0,0)).then(MSRotateY(time));
      setUniforms(this.obj, makeMetallic([.2,.2,.2]));
    });
}

function squint(LeftRight) {
  var motion = new MotionProcess();
  motion.param_t = 0;
  var dir = (LeftRight == LEFT) ? 1 : -1;
  motion.modelT = function () {
    var t = motion.param_t;
    return MSScale(1 + t/6, 1 - t/3, 1);
  }
  motion.worldT = function () {
    var t = motion.param_t;
    return MSTranslate(t * .2 * dir, 0, 0);
  }
  return motion;
}

var leftSquint = squint(LEFT);
var rightSquint = squint(RIGHT);

var headMotion = function () {
  var motion = new MotionProcess();

  // the parameters for figure-8 path of the head
  motion.p_path = 0;
  motion.p_path_vol = 1;

  motion.p_turn = 0;
  motion.p_turn_vol = 0;

  motion.worldT = function () {
    return MSTranslate(
        this.p_path_vol * Math.cos(this.p_path * 2 * Math.PI),
        this.p_path_vol * Math.sin(this.p_path * 4 * Math.PI),
        0)
      .then(MSRotateY(this.p_turn_vol * (Math.cos(this.p_turn * 2 * Math.PI)/2+.5)))
      .then(MSRotateX(this.p_turn_vol * Math.sin(this.p_turn * 2 * Math.PI)/3))
      ;
  }
  return motion;
}();

function createFace(context, root) {
  root = root || new Segment([], function() { this.anchorT = MSTranslate(0,-.5,1); });

  function createMouth () {
    var square = createSquareSheet(10, 10);
    var obj = context.addObject(square, 'fs_tex');
    obj.textureSrc = "tex/smile.jpg";
    return obj;
  }

  function createEye (tex) {
    var square = createSquareSheet(5,5);
    var obj = context.addObject(square, 'fs_tex');
    obj.textureSrc = "tex/" + tex;
    return obj;
  }

  function addEye (LeftRight) {
    var LR = (LeftRight == LEFT) ? -1 : 1;
    var TEX = (LeftRight == LEFT) ? "eye-left.jpg" : "eye-right.jpg";
    var sq = (LeftRight == LEFT) ? leftSquint : rightSquint;
    var eye = new Segment(    createEye(TEX),
      function () {
        this.worldT = MSTranslate(1 * LR,1,0);
        this.modelT = MSScale(.8,.8,.8);
        setUniforms(this.obj, makeMetallic([.2,.1,.1]));
      });
    eye.addMotion(sq);
    root.addChild(eye);
  }

  function addPrey () {
    var prey = new Segment(
      context.addObject(createSphere(8,4), 'fs_phong'),
      function () {
        var d = 3 + Math.sin(time * 19 / 8) * 2;
        this.modelT = MSScale(.1,.1,.1);
        this.worldT = MSTranslate(0,0,d);
        setUniforms(this.obj, makeMetallic([.1,0,0]));
      });
    root.addChild(prey);
  }

  // ADD MOUTH
  root.addChild(new Segment(    createMouth(),
    function () {
      this.worldT = MSTranslate(0,-1,0);
      this.modelT = MSScale(1,.7 + .3 * Math.sin(time * 2), 1);
      setUniforms(this.obj, makeMetallic([.2,.1,.1]));
    }));

  // ADD EYES
  addEye(LEFT);
  addEye(RIGHT);

  // ADD FOCAL POINT
  addPrey();

  root.addMotion(headMotion);

  return root;
}

staging.setup = function () {
  this.root = rootOfAllEvil(this, .2);
  this.root.addChild(createFace(this));
}

staging.update = function () {
//  leftSquint.param_t = Math.sin(time * 4);
//  rightSquint.param_t = Math.cos(time * 3);

  headMotion.p_path = time / 2 % 1;
  headMotion.p_path_vol = Math.sin(time)/2 + .5;

  headMotion.p_turn = time % 1;
  headMotion.p_turn_vol = Math.cos(time)/2 + .5;

  this.root.animateAll();
}
