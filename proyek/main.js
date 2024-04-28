
var GL;

  class MyObject{
    canvas = null;
    vertex = [];
    faces = [];


    SHADER_PROGRAM = null;
    _color = null;
    _position = null;


    _MMatrix = LIBS.get_I4();
    _PMatrix = LIBS.get_I4();
    _VMatrix = LIBS.get_I4();
    _greyScality = 0;


    TRIANGLE_VERTEX = null;
    TRIANGLE_FACES = null;


    MODEL_MATRIX = LIBS.get_I4();
    child = [];

    constructor(vertex, faces, source_shader_vertex, source_shader_fragment){
      this.vertex = vertex;
      this.faces = faces;


      var compile_shader = function(source, type, typeString) {
        var shader = GL.createShader(type);
        GL.shaderSource(shader, source);
        GL.compileShader(shader);
        if (!GL.getShaderParameter(shader, GL.COMPILE_STATUS)) {
          alert("ERROR IN " + typeString + " SHADER: " + GL.getShaderInfoLog(shader));
          return false;
        }
        return shader;
       };
   
    var shader_vertex = compile_shader(source_shader_vertex, GL.VERTEX_SHADER, "VERTEX");
   
    var shader_fragment = compile_shader(source_shader_fragment, GL.FRAGMENT_SHADER, "FRAGMENT");
   
    this.SHADER_PROGRAM = GL.createProgram();
    GL.attachShader(this.SHADER_PROGRAM, shader_vertex);
    GL.attachShader(this.SHADER_PROGRAM, shader_fragment);
   
    GL.linkProgram(this.SHADER_PROGRAM);


    //vao
    this._color = GL.getAttribLocation(this.SHADER_PROGRAM, "color");
    this._position = GL.getAttribLocation(this.SHADER_PROGRAM, "position");


    //uniform
    this._PMatrix = GL.getUniformLocation(this.SHADER_PROGRAM,"PMatrix"); //projection
    this._VMatrix = GL.getUniformLocation(this.SHADER_PROGRAM,"VMatrix"); //View
    this._MMatrix = GL.getUniformLocation(this.SHADER_PROGRAM,"MMatrix"); //Model
    this._greyScality = GL.getUniformLocation(this.SHADER_PROGRAM, "greyScality");//GreyScality


    GL.enableVertexAttribArray(this._color);
    GL.enableVertexAttribArray(this._position);
    GL.useProgram(this.SHADER_PROGRAM);




    this.TRIANGLE_VERTEX = GL.createBuffer();
    this.TRIANGLE_FACES = GL.createBuffer();
    }


    setup(){
      GL.bindBuffer(GL.ARRAY_BUFFER, this.TRIANGLE_VERTEX);
      GL.bufferData(GL.ARRAY_BUFFER,
      new Float32Array(this.vertex),
      GL.STATIC_DRAW);


      GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, this.TRIANGLE_FACES);
      GL.bufferData(GL.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(this.faces),
      GL.STATIC_DRAW);
      this.child.forEach(obj => {
        obj.setup;
      });
    }


    render(VIEW_MATRIX, PROJECTION_MATRIX){
          GL.useProgram(this.SHADER_PROGRAM);  
          GL.bindBuffer(GL.ARRAY_BUFFER, this.TRIANGLE_VERTEX);
          GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, this.TRIANGLE_FACES);
          GL.vertexAttribPointer(this._position, 3, GL.FLOAT, false, 4*(3+3), 0);
          GL.vertexAttribPointer(this._color, 3, GL.FLOAT, false, 4*(3+3), 3*4);


          GL.uniformMatrix4fv(this._PMatrix,false,PROJECTION_MATRIX);
          GL.uniformMatrix4fv(this._VMatrix,false,VIEW_MATRIX);
          GL.uniformMatrix4fv(this._MMatrix,false,this.MODEL_MATRIX);
          GL.uniform1f(this._greyScality, 1);
          GL.drawElements(GL.TRIANGLES, this.faces.length, GL.UNSIGNED_SHORT, 0);


          GL.flush();
          this.child.forEach(obj => {
            obj.render(VIEW_MATRIX, PROJECTION_MATRIX);
          });
    }
  }
 
 
  function main(){
      var CANVAS = document.getElementById("myCanvas");
 
 
      CANVAS.width = window.innerWidth;
      CANVAS.height = window.innerHeight;
      var drag = false;
      var dX = 0;
      var dY = 0;
      var pos_x = 0;
      var pos_y = 0;
      var pos_z = 0;
  
  
      var X_prev = 0;
      var Y_prev = 0;
  
      var THETA = 0;
      var ALPHA = 0;
  
      var WorldTHETA = 0;
      var WorldALPHA = 0;
      var WorldZ = 0;
  
      var FRICTION = 0.95;


      var mouseDown = function(e){
        drag = true;
        X_prev = e.pageX;
        Y_prev = e.pageY;
      }


      var mouseUp = function(e){
        drag = false;
      }


      var mouseMove = function(e){
        if(!drag){return false;}
        dX = e.pageX - X_prev;
        dY = e.pageY- Y_prev;
        X_prev = e.pageX;
        Y_prev = e.pageY;


        THETA += dX * 2*Math.PI / CANVAS.width;
        ALPHA += dY * 2*Math.PI / CANVAS.height;
      }


      var keyDown = function(e){
        e.preventDefault();
        console.log(e);
      }


      CANVAS.addEventListener("mousedown", mouseDown, false);
      CANVAS.addEventListener("mouseup", mouseUp, false);
      CANVAS.addEventListener("mouseout", mouseUp,false);
      CANVAS.addEventListener("mousemove", mouseMove, false);
      CANVAS.addEventListener("keydown", keyDown);
 
 
     
      try{
          GL = CANVAS.getContext("webgl", {antialias: true});
      }catch(e){
          alert("WebGL context cannot be initialized");
          return false;
      }
      //shaders
      var shader_vertex_source=`
      attribute vec3 position;
      attribute vec3 color;


      uniform mat4 PMatrix;
      uniform mat4 VMatrix;
      uniform mat4 MMatrix;
     
      varying vec3 vColor;
      void main(void) {
      gl_Position = PMatrix*VMatrix*MMatrix*vec4(position, 1.);
      vColor = color;


      gl_PointSize=20.0;
      }`;
      var shader_fragment_source =`
      precision mediump float;
      varying vec3 vColor;
      // uniform vec3 color;


      uniform float greyScality;


      void main(void) {
      float greyScaleValue = (vColor.r + vColor.g + vColor.b)/3.;
      vec3 greyScaleColor = vec3(greyScaleValue, greyScaleValue, greyScaleValue);
      vec3 color = mix(greyScaleColor, vColor, greyScality);
      gl_FragColor = vec4(color, 1.);
      }`;
    

       
      var badan = LIBS.Sphere(0,0,0,1,100)
      for (var i = 0; i < badan.vertices.length; i+=6) {
        badan.vertices[i + 3] = 255/255; // Red component
        badan.vertices[i + 4] = 209/255; // Green component
        badan.vertices[i + 5] = 216/255; // Blue component
      };

      var acc1 = LIBS.Sphere(0,0,0,0.2,100)
      for (var i = 0; i < acc1.vertices.length; i+=6) {
        acc1.vertices[i + 3] = 255/255; // Red component
        acc1.vertices[i + 4] = 182/255; // Green component
        acc1.vertices[i + 5] = 193/255; // Blue component
      };
      var leg = LIBS.EllipsoidY(0,0,0,0.2,100)
      for (var i = 0; i < leg.vertices.length; i+=6) {
        leg.vertices[i + 3] = 255/255; // Red component
        leg.vertices[i + 4] = 182/255; // Green component
        leg.vertices[i + 5] = 193/255; // Blue component
      };
      var arm = LIBS.EllipsoidX(0,0,0,0.15,100)
      for (var i = 0; i < arm.vertices.length; i+=6) {
        arm.vertices[i + 3] = 255/255; // Red component
        arm.vertices[i + 4] = 182/255; // Green component
        arm.vertices[i + 5] = 193/255; // Blue component
      };
      var rightPupil = LIBS.generateCircle(0.35, 1.1, 0.1, 100);
      for (var i = 0; i < rightPupil.vertex.length; i+=6) {
        rightPupil.vertex[i + 3] = 0; // Red component
        rightPupil.vertex[i + 4] = 0; // Green component
        rightPupil.vertex[i + 5] = 0; // Blue component
      }

      var leftPupil = LIBS.generateCircle(-0.35, 1.1, 0.1, 100);
      for (var i = 0; i < leftPupil.vertex.length; i+=6) {
        leftPupil.vertex[i + 3] = 0; // Red component
        leftPupil.vertex[i + 4] = 0; // Green component
        leftPupil.vertex[i + 5] = 0; // Blue component
      }

      var rightEye = LIBS.generateCircle(0.36, 1, 0.2, 100);
      for (var i = 0; i < rightEye.vertex.length; i+=6) {
        rightEye.vertex[i + 3] = 224/255; // Red component
        rightEye.vertex[i + 4] = 17/255; // Green component
        rightEye.vertex[i + 5] = 95/255; // Blue component
      }

      var leftEye = LIBS.generateCircle(-0.36, 1, 0.2, 100);
      for (var i = 0; i < leftEye.vertex.length; i+=6) {
        leftEye.vertex[i + 3] = 224/255; // Red component
        leftEye.vertex[i + 4] = 17/255; // Green component
        leftEye.vertex[i + 5] = 95/255; // Blue component
      }
    

      var PROJECTION_MATRIX = LIBS.get_projection(40, CANVAS.width/CANVAS.height, 1,100);
      var VIEW_MATRIX = LIBS.get_I4();
      var MODEL_MATRIX = LIBS.get_I4();
      var ACC1_MATRIX = LIBS.get_I4();
      var ACC2_MATRIX = LIBS.get_I4();
      var ACC3_MATRIX = LIBS.get_I4();
      var LegLeft_MATRIX = LIBS.get_I4();
      var LegRight_MATRIX = LIBS.get_I4();
      var ArmRight_MATRIX = LIBS.get_I4();
      var ArmLeft_MATRIX = LIBS.get_I4();
      var PUPIL_MATRIX = LIBS.get_I4();
      var BADAN_MATRIX = LIBS.get_I4();


      LIBS.translateZ(VIEW_MATRIX,-10);


      var Badan = new MyObject(badan.vertices, badan.faces, shader_vertex_source, shader_fragment_source); Badan.setup();
      var Acc1 = new MyObject(acc1.vertices, acc1.faces, shader_vertex_source, shader_fragment_source); Acc1.setup();
      var Acc2 = new MyObject(acc1.vertices, acc1.faces, shader_vertex_source, shader_fragment_source); Acc2.setup();
      var Acc3 = new MyObject(acc1.vertices, acc1.faces, shader_vertex_source, shader_fragment_source); Acc3.setup();
      var LegLeft = new MyObject(leg.vertices, leg.faces, shader_vertex_source, shader_fragment_source); LegLeft.setup();
      var LegRight = new MyObject(leg.vertices, leg.faces, shader_vertex_source, shader_fragment_source); LegRight.setup();
      var ArmRight = new MyObject(arm.vertices, arm.faces, shader_vertex_source, shader_fragment_source); ArmRight.setup();
      var ArmLeft = new MyObject(arm.vertices, arm.faces, shader_vertex_source, shader_fragment_source); ArmLeft.setup();
      var RightPupil = new MyObject(rightPupil.vertex, rightPupil.faces, shader_vertex_source, shader_fragment_source); RightPupil.setup();
      var LeftPupil = new MyObject(leftPupil.vertex, leftPupil.faces, shader_vertex_source, shader_fragment_source); LeftPupil.setup();
      // var Curve = new MyObject(curve.vertex, curve.faces, shader_vertex_source, shader_fragment_source); Curve.setup();
      /*========================= DRAWING ========================= */
      GL.clearColor(0.0, 0.0, 0.0, 0.0);


      GL.enable(GL.DEPTH_TEST);
      GL.depthFunc(GL.LEQUAL);


      var Igglybuff_position = [0,0,0];
      var goBack = false;

      var time_prev = 0;
      var animate = function(time) {
        GL.viewport(0, 0, CANVAS.width, CANVAS.height);
        GL.clear(GL.COLOR_BUFFER_BIT | GL.D_BUFFER_BIT);
        var dt = time-time_prev;
        time_prev=time;

        
        dX*=FRICTION;
        dY*=FRICTION;

        THETA += dX *2*Math.PI/CANVAS.width;
        ALPHA += dY * 2*Math.PI/CANVAS.height;
        

        WorldTHETA += pos_x *2*Math.PI/CANVAS.width;
        WorldALPHA += pos_y * 2*Math.PI/CANVAS.height;
        WorldZ += pos_z * 2*Math.PI/CANVAS.height;

        
        LIBS.translateX(VIEW_MATRIX, pos_x); LIBS.translateY(VIEW_MATRIX, pos_y); LIBS.translateZ(VIEW_MATRIX, pos_z);
        
        LIBS.setPosition(VIEW_MATRIX,0,0,0)
        LIBS.rotateX(VIEW_MATRIX, dY*0.01); LIBS.rotateY(VIEW_MATRIX, dX*0.01);
        LIBS.translateX(VIEW_MATRIX, 0); LIBS.translateY(VIEW_MATRIX,0); LIBS.translateZ(VIEW_MATRIX,-10);

        if (goBack == false) {
          Igglybuff_position[2] += 0.01;
          if (Igglybuff_position[2] >= 10) {
            goBack = true;
          } 
        }else {
          Igglybuff_position[2] -= 0.01;
          if (Igglybuff_position[2] <= -10) {
            goBack = false;
          }
        }

          BADAN_MATRIX = LIBS.get_I4();
          LIBS.translateY(BADAN_MATRIX, 1); LIBS.translateZ(BADAN_MATRIX, Igglybuff_position[2]);


          ACC1_MATRIX = LIBS.get_I4();  
          LIBS.translateZ(ACC1_MATRIX, 0.5+Igglybuff_position[2]); LIBS.translateY(ACC1_MATRIX, 1.95);

          ACC2_MATRIX = LIBS.get_I4();
          LIBS.translateZ(ACC2_MATRIX, 0.5+Igglybuff_position[2]); LIBS.translateY(ACC2_MATRIX, 1.8); LIBS.translateX(ACC2_MATRIX, 0.15);

          ACC3_MATRIX = LIBS.get_I4();
          LIBS.translateZ(ACC3_MATRIX, 0.5+Igglybuff_position[2]);  LIBS.translateY(ACC3_MATRIX, 1.8); LIBS.translateX(ACC3_MATRIX, -0.15);

          LegLeft_MATRIX = LIBS.get_I4();
          LIBS.translateY(LegLeft_MATRIX, -0.1); LIBS.translateX(LegLeft_MATRIX, 0.4); LIBS.translateZ(LegLeft_MATRIX, Igglybuff_position[2])
          LIBS.rotateZ(LegLeft_MATRIX, Math.PI/5); LIBS.rotateX(LegLeft_MATRIX, Math.PI/10);

          LegRight_MATRIX = LIBS.get_I4();
          LIBS.translateY(LegRight_MATRIX, -0.1); LIBS.translateX(LegRight_MATRIX, -0.4); LIBS.translateZ(LegRight_MATRIX, Igglybuff_position[2])
          LIBS.rotateZ(LegRight_MATRIX, -Math.PI/5); LIBS.rotateX(LegRight_MATRIX, Math.PI/10);

          ArmRight_MATRIX = LIBS.get_I4();
          LIBS.translateY(ArmRight_MATRIX, 1); LIBS.translateX(ArmRight_MATRIX, 1.03); LIBS.translateZ(ArmRight_MATRIX, Igglybuff_position[2])
          LIBS.rotateZ(ArmRight_MATRIX, Math.PI/3); LIBS.rotateX(ArmRight_MATRIX, Math.PI);

          ArmLeft_MATRIX = LIBS.get_I4();
          LIBS.translateY(ArmLeft_MATRIX, 1); LIBS.translateX(ArmLeft_MATRIX, -1); LIBS.translateZ(ArmLeft_MATRIX, Igglybuff_position[2])
          LIBS.rotateZ(ArmLeft_MATRIX, -Math.PI/3); LIBS.rotateX(ArmLeft_MATRIX, Math.PI);

          PUPIL_MATRIX = LIBS.get_I4();
          LIBS.translateZ(PUPIL_MATRIX,0.988+Igglybuff_position[2] )
          LIBS.translateY(PUPIL_MATRIX, -0.2);

          MODEL_MATRIX10 = LIBS.get_I4();



          Badan.MODEL_MATRIX=BADAN_MATRIX; Badan.render(VIEW_MATRIX, PROJECTION_MATRIX);
          Acc1.MODEL_MATRIX=ACC1_MATRIX; Acc1.render(VIEW_MATRIX, PROJECTION_MATRIX);
          Acc2.MODEL_MATRIX=ACC2_MATRIX; Acc2.render(VIEW_MATRIX, PROJECTION_MATRIX);
          Acc3.MODEL_MATRIX=ACC3_MATRIX; Acc3.render(VIEW_MATRIX, PROJECTION_MATRIX);
          LegLeft.MODEL_MATRIX=LegLeft_MATRIX; LegLeft.render(VIEW_MATRIX, PROJECTION_MATRIX);
          LegRight.MODEL_MATRIX=LegRight_MATRIX; LegRight.render(VIEW_MATRIX, PROJECTION_MATRIX);
          ArmRight.MODEL_MATRIX=ArmRight_MATRIX; ArmRight.render(VIEW_MATRIX, PROJECTION_MATRIX);
          ArmLeft.MODEL_MATRIX=ArmLeft_MATRIX; ArmLeft.render(VIEW_MATRIX, PROJECTION_MATRIX);
          RightPupil.MODEL_MATRIX=PUPIL_MATRIX; RightPupil.render(VIEW_MATRIX, PROJECTION_MATRIX);
          LeftPupil.MODEL_MATRIX=PUPIL_MATRIX; LeftPupil.render(VIEW_MATRIX, PROJECTION_MATRIX);
          // Curve.MODEL_MATRIX=MODEL_MATRIX10; Curve.render(VIEW_MATRIX, PROJECTION_MATRIX);

         
        

          window.requestAnimationFrame(animate);
      };
 
 
      animate(0);
  }
  window.addEventListener('load',main);
 
 



