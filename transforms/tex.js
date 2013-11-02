function getPoint (u, v) { return [u*2-1, v*2-1, 0]; }
function getNormal(u, v) { return [0,0,1]; }

function getSpherePoint(u, v) {
  var x, y, z, r;
  y = Math.sin(u * Math.PI * 2);
  r = Math.cos(u * Math.PI * 2);
  x = r * Math.cos(v * Math.PI);
  z = r * Math.sin(v * Math.PI);
  return [x, y, z];
}
function getShereNormal(u, v) {
  return getSpherePoint(u, v);
}


canvas1.setup = function() {
  this.addObject(createParametric(16, 8, getSpherePoint, getShereNormal), 'fs_wood');
  this.objects[0].textureSrc = "img/tex-dry-rock.jpg";
}

canvas1.update = function() {

    var M0 = mat4_identity().scale(.5,.5,.5).rotateX(Math.sin(time / 3) * 3).rotateZ(Math.cos(time / 4) * 3).translate(0,0,-1);
    var obj0 = this.objects[0];
    obj0.matrix = M0.arr();
    obj0.setUniform('p', [.1,.0,0, .9,.0,0, 1,1,1,20]);
    obj0.setUniform('lDir', [.57,.57,.57]);

    if (this.mousePressed)
        console.log("canvas1 drag " + this.mouseX + " " + this.mouseY);
}
