
function _shape(vertices) {
    var shape = new Array();
    shape.vertices = vertices;
    return shape;
}

function square() { return _shape ( [
       1.0, 1.0, 0.0,  0.0, 0.0, 1.0,  1.0, 1.0,
      -1.0, 1.0, 0.0,  0.0, 0.0, 1.0,  0.0, 1.0,
       1.0,-1.0, 0.0,  0.0, 0.0, 1.0,  1.0, 0.0,
      -1.0,-1.0, 0.0,  0.0, 0.0, 1.0,  0.0, 0.0,
]);}

    var vs_header = "\
    attribute vec3 aVertexPosition;\
    attribute vec3 aVertexNormal;\
    attribute vec2 aVertexUV;\
    attribute float aVertexId;\
    uniform vec2 uViewportSize;\
    uniform mat4 uPerspective;\
    uniform mat4 uMatrix;\
    uniform mat4 uNormat;\
    uniform vec2 uMouseLocation;\
    uniform float uMousePressed;\
    uniform float uTime;\
    varying vec3 vPosition;\
    varying vec3 vNormal;\
    varying vec2 vUV;\
    ";

    var fs_header = "\
    precision mediump float;\
    uniform vec2 uViewportSize;\
    uniform mat4 uPerspective;\
    uniform mat4 uMatrix;\
    uniform vec2 uMouseLocation;\
    uniform float uMousePressed;\
    uniform float uTime;\
    varying vec3 vPosition;\
    varying vec3 vNormal;\
    varying vec2 vUV;\
    ";

    var vertex_shader, materialNames, fragment_shaders, setup, animate;
    var gl, perspectiveMatrix, matrix, normat;
    var mouseX, mouseY, isMousePressed, time, startTime;

// CONVERT A SCRIPT IN THE DOCUMENT INTO A STRING

    function scriptToString(id, defaultString) {
       var element = document.getElementById(id);
       if (element == null)
          return defaultString;
       var str = "";
       for (var k = element.firstChild ; k ; k = k.nextSibling)
           if (k.nodeType == 3)
               str += k.textContent;
       return str;
    }

// HEADER INFO TO PUT AT THE START OF ANY FRAGMENT SHADER

    function initGL(canvas) {
        try {
            gl = canvas.getContext("experimental-webgl");
            gl.viewportWidth = canvas.width;
            gl.viewportHeight = canvas.height;
        } catch (e) { }
        if (!gl) { alert("Could not initialise WebGL, sorry :-("); }
    }

    function getShader(gl, type, str) {
        var shader = gl.createShader(type);
        gl.shaderSource(shader, str);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
            alert(gl.getShaderInfoLog(shader));
        return shader;
    }

    function createShaderProgram(fragment_shader) {
        var vertexShader   = getShader(gl, gl.VERTEX_SHADER  , vs_header + vertex_shader);
        var fragmentShader = getShader(gl, gl.FRAGMENT_SHADER, fs_header + fragment_shader);

        var shaderProgram = gl.createProgram();
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        gl.linkProgram(shaderProgram);

	if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS))
	    alert("Could not initialise shaders");

        return shaderProgram;
    }

    function replaceAll(find, replace, str) {
       while( str.indexOf(find) >= 0 )
          str = str.replace(find, replace);
       return str;
    }

    function changeCode() {
       for (var i = 0 ; i < materialNames.length ; i++) {
          var name = materialNames[i];
	  fragment_shaders[name] = document.getElementById(name + "-text-area").value;
       }
       eval(setup);
    }

    function drawShape(shape) {
        time = (new Date()).getTime() / 1000.0 - startTime;

	// IF FRAGMENT SHADER TEXT HAS CHANGED, CREATE A NEW SHADER PROGRAM

        if (shape.fragmentShader != fragment_shaders[shape.material]) {
           shape.fragmentShader = fragment_shaders[shape.material];
           shape.shaderProgram = createShaderProgram(shape.fragmentShader);
        }

	var shaderProgram = shape.shaderProgram;
        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS))
            alert("Could not initialise shaders");
        gl.useProgram(shaderProgram);

        shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
        gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

        shaderProgram.vertexNormalAttribute = gl.getAttribLocation(shaderProgram, "aVertexNormal");
        gl.enableVertexAttribArray(shaderProgram.vertexNormalAttribute);

        shaderProgram.vertexUVAttribute = gl.getAttribLocation(shaderProgram, "aVertexUV");
        gl.enableVertexAttribArray(shaderProgram.vertexUVAttribute);

        shaderProgram.ViewportSizeUniform =gl.getUniformLocation(shaderProgram,"uViewportSize");
        shaderProgram.PerspectiveUniform  =gl.getUniformLocation(shaderProgram,"uPerspective");
        shaderProgram.MatrixUniform       =gl.getUniformLocation(shaderProgram,"uMatrix");
        shaderProgram.NormatUniform       =gl.getUniformLocation(shaderProgram,"uNormat");
        shaderProgram.MouseLocationUniform=gl.getUniformLocation(shaderProgram,"uMouseLocation");
        shaderProgram.MousePressedUniform =gl.getUniformLocation(shaderProgram,"uMousePressed");
        shaderProgram.TimeUniform         =gl.getUniformLocation(shaderProgram,"uTime");

        gl.uniformMatrix4fv(shaderProgram.PerspectiveUniform, false, perspectiveMatrix);
        gl.uniformMatrix4fv(shaderProgram.MatrixUniform, false, matrix);
        gl.uniformMatrix4fv(shaderProgram.NormatUniform, false, normat);
        gl.uniform2f(shaderProgram.ViewportSizeUniform, gl.viewportWidth, gl.viewportHeight);
        gl.uniform2f(shaderProgram.MouseLocationUniform, mouseX, mouseY);
        gl.uniform1f(shaderProgram.MousePressedUniform, isMousePressed ? 1.0 : 0.0);
        gl.uniform1f(shaderProgram.TimeUniform, time); 

        //XXX

        var sphereLocs = 
        //  x     y     z    radius
        [  0.0,  0.0,  0.0,   0.2,
           0.3,  0.1, -0.1,   0.3,
          -0.15, 0.3,  0.1,   0.05 ];

        var sphereCols = 
        //  r    g    b
        [  0.5, 0.5, 0.5,
           0.9, 0.1, 0.1,
           0.1, 0.2, 0.9  ];

        var sphereColProperties = 
        // shiny   metallic   transparency
        [   5.0,      0.4,       0.0,
           15.0,      0.7,       0.7,
            7.0,      0.8,       0.2 ];

        shaderProgram.sphereLocsUniform = gl.getUniformLocation(shaderProgram, "sphereLocs");
        gl.uniform4fv(shaderProgram.sphereLocsUniform, sphereLocs);

        shaderProgram.sphereColsUniform = gl.getUniformLocation(shaderProgram, "sphereCols");
        gl.uniform3fv(shaderProgram.sphereColsUniform, sphereCols);

        shaderProgram.sphereColPropertiesUniform = gl.getUniformLocation(shaderProgram, "sphereColProperties");
        gl.uniform3fv(shaderProgram.sphereColPropertiesUniform, sphereColProperties);

        var AMBIENT_REFLECTANCE = 0.05;
        gl.uniform1f(gl.getUniformLocation(shaderProgram, "AMBIENT_REFLECTANCE"), AMBIENT_REFLECTANCE);

        var infiniteLights = 
//          x     y     z  brightness
        [ -1.2,  1.0, -0.1, 0.5,
           0.5,  2.0,  2.0, 0.5 ];
        gl.uniform4fv(gl.getUniformLocation(shaderProgram, "infiniteLights"), infiniteLights);


        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(shape.vertices), gl.STATIC_DRAW);

        if (shape.vertexBuffer == null) {
           shape.vertexBuffer = gl.createBuffer();
           gl.bindBuffer(gl.ARRAY_BUFFER, shape.vertexBuffer);
           var bpe = Float32Array.BYTES_PER_ELEMENT;
           shape.vertexBuffer.stride               = 8*bpe;
           shape.vertexBuffer.numItems             = shape.vertices.length / 8;
           shape.vertexBuffer.positionOffset       = 0*bpe;
           shape.vertexBuffer.positionElementCount = 3;
           shape.vertexBuffer.normalOffset         = 3*bpe;
           shape.vertexBuffer.normalElementCount   = 3;
           shape.vertexBuffer.uvOffset             = 6*bpe;
           shape.vertexBuffer.uvElementCount       = 2;

           gl.enable(gl.BLEND);
           gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        }

        var vertexBuffer = shape.vertexBuffer;

        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute,
                               vertexBuffer.positionElementCount, 
                               gl.FLOAT, 
                               false, 
                               vertexBuffer.stride, 
                               vertexBuffer.positionOffset
                               );
        gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, 
                               vertexBuffer.normalElementCount, 
                               gl.FLOAT, 
                               false, 
                               vertexBuffer.stride, 
                               vertexBuffer.normalOffset 
                               );
        gl.vertexAttribPointer(shaderProgram.vertexUVAttribute, 
                               vertexBuffer.uvElementCount, 
                               gl.FLOAT, 
                               false, 
                               vertexBuffer.stride, 
                               vertexBuffer.uvOffset 
                               );

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, vertexBuffer.numItems);
    }

    // http://paulirish.com/2011/requestanimationframe-for-smart-animating/
    // http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
    // requestAnimationFrame polyfill by Erik MÃ¶ller. fixes from Paul Irish and Tino Zijdel
    // MIT license
    (function () {
      var lastTime = 0;
      var vendors = ['ms', 'moz', 'webkit', 'o'];
      for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
      }
      if(!window.requestAnimationFrame)
        window.requestAnimationFrame = function (callback, element) {
          var currTime = new Date().getTime();
          var timeToCall = Math.max(0, 16 - (currTime - lastTime));
          var id = window.setTimeout(function () {
            callback(currTime + timeToCall);
          },
          timeToCall);
          lastTime = currTime + timeToCall;
          return id;
      };
      if(!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function (id) {
          clearTimeout(id);
      };
    }());

    var defaultSetup = "canvas = square();\ncanvas.material = 'shader';";
    var defaultAnimate = "drawShape(canvas);";
    var defaultVertexShader ="\
    void main(void) {\n\
        gl_Position = uPerspective * uMatrix * vec4(aVertexPosition, 1.0);\n\
        vPosition = aVertexPosition;\n\
        vNormal = normalize((uNormat * vec4(aVertexNormal, 1.0)).xyz);\n\
	vNormal.z = -vNormal.z;\n\
        vUV = aVertexUV;\n\
    }\n";

    function webGLStart() {
        vertex_shader = scriptToString("vertex-shader", defaultVertexShader);

        materialNames = new Array();
        fragment_shaders = new Array();
        scripts = document.getElementsByTagName("script");
        for(var i = 0 ; i < scripts.length ; i++)
           if (scripts[i].type == "x-shader/x-fragment") {
	      materialNames[materialNames.length] = scripts[i].id;
              fragment_shaders[scripts[i].id] = scriptToString(scripts[i].id);
           }

        setup = scriptToString("setup", defaultSetup);
        animate = scriptToString("animate", defaultAnimate);

        perspectiveMatrix = [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1];
        matrix = [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1];
        normat = [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1];

        mouseX = 250;
	mouseY = 250;
        isMousePressed = false;

        var canvas = document.getElementById("webgl-canvas");
        initGL(canvas);
        initEventHandlers(canvas);

        gl.clearColor(0, 0, 0, 1);
        gl.enable(gl.DEPTH_TEST);

        startTime = (new Date()).getTime() / 1000.0;

        eval(setup);

        var tick = function() {

            gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

            eval(animate);

            requestAnimationFrame(tick, canvas);
        };
        tick();
    }

    function countLines(s) {
       if (s.length == 0)
          return 0;
       var n = 1;
       for (var i = 0 ; (i = s.indexOf("\n", i)) >= 0 ; i++)
          n++;
       return n;
    }

    function adjustTextArea(elementId, value, maxLines) {
        var textArea = document.getElementById(elementId);
        textArea.style.backgroundColor = '#1b1b1b';
        textArea.style.fontFamily = "Monaco";
        textArea.style.fontSize = '10pt';
        textArea.style.color = '#c8c8c8';
        textArea.style.borderColor = '#3b3b3b';
        textArea.style.outlineColor = '#f0f0f0';
        textArea.value = value;
        textArea.rows = Math.max(1, Math.min(maxLines, countLines(value) + 1));
    }

    function adjustAppearance() {
        document.body.style.background = '#1b1b1b';

	var title = scriptToString("title");
	var description = scriptToString("description");
	var nLines = countLines(description);

        var titleCanvas = document.getElementById('title-canvas');
	titleCanvas.height = 45 + (nLines == 0 ? 0 : 15 * (1 + nLines));

        var g = titleCanvas.getContext('2d');
        g.strokeStyle = '#1b1b1b';
        g.fillStyle = '#f0f0f0';

        g.font = '24pt Times';
        g.strokeText(title, 0, 35);
        g.fillText  (title, 0, 35);

        if (nLines > 0) {
           g.font = 'italic 12pt Times';
	   var str = description, i = 0, j = 0;
	   if (str.substring(str.length-1, str.length) != "\n")
	      str += "\n";
           for(var n = 0 ; (j = str.indexOf("\n", i)) >= 0 ; n++) {
	      var s = str.substring(i, j);
              g.strokeText(s, 18, 60 + 20 * n);
              g.fillText  (s, 18, 60 + 20 * n);
	      i = j + 1;
	   }
        }

        for (var i = 0 ; i < materialNames.length ; i++)
	   adjustTextArea(materialNames[i] + '-text-area', fragment_shaders[materialNames[i]], 30);

        var runButton = document.getElementById('run-button');
        runButton.style.backgroundColor ='#000000';
        runButton.style.color ='#c8c8c8';
        runButton.style.borderColor = '#707070';
        runButton.style.fontFamily = "Arial";
        runButton.style.fontSize = "10pt";
    }

    function initEventHandlers(canvas) {
        isMousePressed = false;

        canvas.onmousedown = function(ev) { // Mouse is pressed
            var x = ev.clientX;
            var y = ev.clientY;
            var rect = ev.target.getBoundingClientRect();
            if ( rect.left <= x && x <= rect.right &&
                 rect.top <= y && y <= rect.bottom) {
                mouseX = x - rect.left;
                mouseY = canvas.height - y + rect.top;
                isMousePressed = true;
            }
        };

        canvas.onmouseup = function(ev){ // Mouse is released
            isMousePressed = false;
        }

        canvas.onmousemove = function(ev) { // Mouse is moved
            var x = ev.clientX;
            var y = ev.clientY;
            var rect = ev.target.getBoundingClientRect();
            mouseX = x - rect.left;
            mouseY = canvas.height - y + rect.top;
      }
    }

function start() {
document.write('\
  <table><tr>\
  <td valign=top>\
     <canvas id="title-canvas" style="border: none;" width="550" height="35"></canvas>\
');

   var scripts = document.getElementsByTagName("script");
   for (var i = 0; i < scripts.length; i++)
      if (scripts[i].type == "x-shader/x-fragment") {
         var name = scripts[i].id;
         document.write('<br><font color=#c8c8c8><small><i>' + name + ':</i></small></font>');
	 document.write('<br><textarea id="' + name + '-text-area" cols=72></textarea>');
      }

document.write('\
     <br><button id="run-button" onclick="changeCode();">run with changes</button>\
     <p><font color=#f0f0f0><a href=http://mew.cx/glsl_quickref.pdf target=1><font color=#f0a0a0>Here</font></a> is a quick guide to fragment shader built-in functions.</font>\
  </td>\
  <td><canvas id="webgl-canvas" style="border: none;" width="780" height="780"></canvas></td>\
  </tr></table>\
');

   webGLStart();
   adjustAppearance();
}
