import * as THREE from './three.module.js';

const vertexShader = () => {
  return `
  varying vec2 vUv;
    void main(){
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
 ` 
};
const fragmentShader = () => {
  return `
    #define M_PI 3.1415926535897932384626433832795
    uniform sampler2D texture1;
    uniform vec2 uResolution;
    uniform float theta;
    varying vec2 vUv;

    float rsB(float psi, float b){
      float temp = (1. - cos(psi)) / (1. + cos(psi));
      float temp1 = b / sin(psi);
      return pow(pow(temp, 2.0) + pow(temp1, 2.0), .5) - temp; 
    }

    float rsBeloborodov(float sinvarphi, float cosvarphi, float b, float theta){
      float costheta = cos(theta);
      float tanvarphi = sinvarphi/abs(cosvarphi);
      float psi = acos(-((sin(theta)*tanvarphi) / 
            (pow(pow(costheta,2.0) + pow(tanvarphi,2.0), .5))));
      return rsB(psi, b);
    }

    float rt(float b){
      float p = -pow(b, 2.), q = 2.*b*b;
      float C = pow(-q/2. + pow(pow(q, 2.)/4. + pow(p, 3.)/27., 0.5), 1./3.);
      return C-p/(3.*C);
    }

    float psit(float b){return acos(-2. / (rt(b) - 2.));}

    float rsB1(float psi, float b){
      if(pow(b,2.) >= 32.){
        float temp = psit(b);
        return float(psi < 2.*temp)*rsB(temp - abs(temp - psi), b);
      } else {
        return rsB(psi, b);
      }
    }

    float rsBetterborodov(float sinvarphi, float cosvarphi, float b, float theta, float n){
      float costheta = cos(theta);
      float tanvarphi = sinvarphi/cosvarphi;
      float psi = acos(-((sin(theta)*tanvarphi) / 
            (pow(pow(costheta, 2.) + pow(tanvarphi,2.), .5))));
      return rsB1(M_PI*n + psi, b);
    }

    float psit2(float b){
      return 2.62761 - log(0.096394*(-24. + pow(b, 2.)));
    }

    float rsB2(float psi, float b){
      float tempb = pow(b, 2.);

      if(tempb > 32.){
        return rsB1(psi, b);
      } else if (tempb > 27.){
        float temppsit2 = psit2(b);
        if (psi < M_PI){
          return rsB(psi, b);
        } else if (psi < 2.*temppsit2 - M_PI){
          return tempb / 8.;
        } else {
          return rsB(psi + 2.*(M_PI- temppsit2), b);
        }
      } else {
        if (psi < M_PI) {
          return rsB(psi, b);
        } else {
          return tempb / 8.;
        }
      }
    }

    float rsBetterborodovV2(float sinvarphi, float cosvarphi, float b, float theta, float n){
      float costheta = cos(theta);
      float tanvarphi = sinvarphi/abs(cosvarphi);
      float psi = acos(-((sin(theta)*tanvarphi) / 
            (pow(pow(costheta,2.) + pow(tanvarphi, 2.), .5))));
      float rad = rsB2(M_PI*n + psi, b);
      if(rad <= 2.){return 0.;}
      return rad;
    }

    vec3 colorFunc(float rs, float scale){
      float ans = 0.0;
      float rs_new = 1.-(rs-2.)/scale;
      if (rs <= 2.0 || rs > scale){
        ans = 0.;
      } else {
        ans = rs_new;
      }
      return vec3(ans);
    }

    vec3 colorFunc2(float rs, float x, float scale){
      float rs_new = 1.-(rs-2.)/scale;
      if (rs < 2.0 || rs > scale){
        return vec3(0.0);
      } else {
        return vec3(cos(x), cos(x + 2.0*M_PI/3.0), cos(x - 2.0*M_PI/3.0));
      }
    }

    void main() {
      vec2 uv = 30.0 * ((gl_FragCoord.xy ) / uResolution.y - vec2(0.5 - 0.5*(1.0 - uResolution.x/uResolution.y),0.5)); 
      float u = uv.x;
      float v = uv.y;
      float mag = sqrt(u*u + v*v);
      float cosvarphi = u/mag;
      float costheta = cos(theta);
      float sinvarphi = sign(costheta)*v/mag;

      float scale = 25.0; // size of disk
      float scale2 = 0.4; //size of horizon

      float rs = rsBetterborodovV2(sinvarphi, cosvarphi, distance(uv,vec2(0.0))/scale2, theta, 0.);
      float rs2 = rsBetterborodovV2(sinvarphi, cosvarphi, distance(uv,vec2(0.0))/scale2, theta, 1.);

      float phi = M_PI/2.*(1.+sign(costheta)) + M_PI*(1.-sign(v)) + sign(v)*acos(costheta*cosvarphi/sqrt(1.0-pow(sin(theta)*cosvarphi, 2.0)));
     
      vec2 uv2 = rs*vec2(cos(phi),sin(phi))/(2.0*scale)  + vec2(0.5, 0.5) ;
      vec2 uv2prime = rs2*vec2(cos(phi + M_PI),sin(phi + M_PI))/(2.0*scale)  + vec2(0.5, 0.5);

      vec4 color1 = vec4(0.);
      vec4 colorprime1 = vec4(0.);
      if(rs > 2. && rs < scale){
        color1 = texture2D(texture1, uv2);
      }
      if(rs2 > 2. && rs2 < scale){
        colorprime1 = texture2D(texture1, uv2prime);
      }

      gl_FragColor = color1*2. + colorprime1;

    }
  `
};


		


var renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById('canvas'),
  antialias: true,
});

renderer.setClearColor(0x000000);
//renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(800, 800);

//onWindowResize();

//window.addEventListener( 'resize', onWindowResize );






//CAMERA
//var camera = new THREE.OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );

var camera = new THREE.PerspectiveCamera(
  45,
  800 / 800,
  0.1, 
  1000
);

//SCENE
var scene = new THREE.Scene();

//SCREEN
var geometry = new THREE.PlaneGeometry(2, 2);

//var texture = new THREE.TextureLoader().load('static/space.png')
//var texture = new THREE.TextureLoader().load('https://upload.wikimedia.org/wikipedia/commons/d/d3/Albert_Einstein_Head.jpg')//.load('space.png')
//var texture = new THREE.TextureLoader().load('https://images.theconversation.com/files/393213/original/file-20210401-13-1w9xb24.jpg?ixlib=rb-1.1.0&q=30&auto=format&w=600&h=400&fit=crop&dpr=2')//https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/The_Event_Horizon_Telescope_and_Global_mm-VLBI_Array_on_the_Earth.jpg/1920px-The_Event_Horizon_Telescope_and_Global_mm-VLBI_Array_on_the_Earth.jpg')//.load('space.png')
//var texture = new THREE.TextureLoader().load('https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/The_Event_Horizon_Telescope_and_Global_mm-VLBI_Array_on_the_Earth.jpg/1920px-The_Event_Horizon_Telescope_and_Global_mm-VLBI_Array_on_the_Earth.jpg')//.load('space.png')
var texture = new THREE.TextureLoader().load('https://cdn.vox-cdn.com/thumbor/nPHkBUDla9JcRJWRdswdAETz4MU=/0x0:1960x2000/1820x1213/filters:focal(686x574:998x886):format(webp)/cdn.vox-cdn.com/uploads/chorus_image/image/71122307/STScI_01G7PWWPY7XRR9PW95W9W8ZYZW.0.png')
//var texture = new THREE.TextureLoader().load('https://cdn-icons-png.flaticon.com/512/25/25435.png')


var uniforms = {
  theta : {value: 0},
  texture1: {value:texture},
  uResolution: {
    value: new THREE.Vector2(800, 800),
  },
}
var shader_material = new THREE.ShaderMaterial({
  uniforms: uniforms,
  vertexShader: vertexShader(),
  fragmentShader: fragmentShader(),
});
var reflective_material = new THREE.MeshBasicMaterial(0x00ff00);
var mesh = new THREE.Mesh(geometry, shader_material);

mesh.position.z = -1;
scene.add(mesh);
//function onWindowResize(e) {
//
//  renderer.setSize(800, 800);
//
//  
//  if(uniforms !=null) {
//    uniforms.uResolution.value = new THREE.Vector2(800, 800)
//  }
//
//}
//RENDERER
var theta = 80*Math.PI/180;
function animate(){
  theta += 0.03;
  theta %= 2*Math.PI
  if (Math.abs(theta - Math.PI/2.) < 0.02 || Math.abs(theta - 3.*Math.PI/2.) < 0.02){
    theta += 0.04
  }
  mesh.material.uniforms.theta.value = theta;//3.14 * (Math.abs(Math.sin(theta)))/2.;
  renderer.render(scene, camera)
  requestAnimationFrame(animate);
}
animate();
