canvas1.setup = function() {
  var rootSeg = new Segment(
    this.addObject(createCube(), 'fs_phong'),   // object
    function ()                                 // animation function
    {
      this.modelT = MSTranslate(0, -1, 0).then(MSScale(0.1, 0.5, 0.2));
      this.worldT = MSRotateZ(Math.sin(time * 2)).then(MSTranslate(0,1,0));

      this.obj.setUniform('p', [.1,.0,0, .9,.0,0, 1,1,1,20]);
      this.obj.setUniform('lDir', [.57,.57,.57]);
    });

  rootSeg.addChild(new Segment(
    this.addObject(createCube(), 'fs_phong'),   // object
    function () {                               // animation function
      this.modelT  = MSTranslate(0,-1,0).then(MSScale(0.08,.3,0.08));
      this.worldT  = MSRotateZ(1 + 1 * Math.cos(Math.PI + time * 2)).then(MSTranslate(0,-1,0));

      this.obj.setUniform('p', [.1,.0,0, .9,.0,0, 1,1,1,20]);
      this.obj.setUniform('lDir', [.57,.57,.57]);
    }));

  rootSeg.addChild(new Segment(
    this.addObject(createCube(), 'fs_phong'),   // object
    function () {                               // animation function
      this.modelT  = MSTranslate(0,-1,0).then(MSScale(0.08,.3,0.08));
      this.worldT  = MSRotateZ(0 + 1 * Math.cos(Math.PI + time * 2)).then(MSTranslate(0,-1,0));

      this.obj.setUniform('p', [.1,.0,0, .9,.0,0, 1,1,1,20]);
      this.obj.setUniform('lDir', [.57,.57,.57]);
    }));

  this.rootSeg = rootSeg;
}

var debug = true;
canvas1.update = function() {

  this.rootSeg.animateAll();

}
