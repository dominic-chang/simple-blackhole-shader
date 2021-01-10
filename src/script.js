import * as THREE from '../node_modules/three/build/three.module.js';

const vertexShader = () => {
  return `
  varying vec2 vUv;

    void main(){
      vUv = uv;
      vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
      gl_Position = projectionMatrix * modelViewPosition;

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
      return pow(temp*temp + temp1*temp1, .5) - temp; 
    }

    float rsBeloborodov(float varphi, float b, float theta){
      float costheta = cos(theta);
      float tanvarphi = tan(varphi);
      float psi = acos(-((sin(theta)*tan(varphi)) / 
            (pow(costheta*costheta + tanvarphi*tanvarphi, .5))));
      return rsB(psi, b);
    }

    float rt(float b){
      float p = -b*b, q = 2.*b*b;
      float C = pow(-q/2. + pow(q*q/4. + p*p*p/27., 0.5), 1./3.);
      return C-p/(3.*C);
    }

    float psit(float b){return acos(-2. / (rt(b) - 2.));}

    float rsB1(float psi, float b){
      if(b*b >= 32.){
        float temp = psit(b);
        if(psi > 2.*temp){
          return 1000.;
        } else {
          return rsB(temp - abs(temp - psi), b);
        }
      } else {
        return rsB(psi, b);
      }
    }

    float rsBetterborodov(float varphi, float b, float theta, float n){
      float costheta = cos(theta);
      float tanvarphi = tan(varphi);
      float psi = acos(-((sin(theta)*tan(varphi)) / 
            (pow(costheta*costheta + tanvarphi*tanvarphi, .5))));
      return rsB1(M_PI*n + psi, b);
    }

    float psit2(float b){
      return 2.62761 - log(0.096394*(-24. + b * b));
    }

    float rsB2(float psi, float b){
      float tempb = b*b;

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

    float rsBetterborodovV2(float varphi, float b, float theta, float n){
      float costheta = cos(theta);
      float tanvarphi = tan(varphi);
      float psi = acos(-((sin(theta)*tan(varphi)) / 
            (pow(costheta*costheta + tanvarphi*tanvarphi, .5))));
      return rsB2(M_PI*n + psi, b);
    }

    float lambda(float alpha, float theta) {
        float ans = -sin(theta) * alpha;
        return ans;
    }

    float eta(float alpha, float beta, float theta){
      float ans = pow(beta, 2.0) + pow(alpha*cos(theta), 2.0);
      return ans;
    }

    vec3 colorFunc(float rs, float scale){
      float ans = 0.0;
      float rs_new = rs/scale;
      if (rs < 2.0 || rs > 10.0){
        ans = 0.;
      } else {
        ans = rs_new;
      }
      return vec3(ans);
    }

    void main() {
      vec2 uv = 30.0 * (gl_FragCoord.xy - 0.5*uResolution.xy) / uResolution.y; 
      float u = uv.x;
      float v = uv.y;
      float rs = rsBetterborodovV2(asin(v/distance(uv,vec2(0.0))), distance(uv,vec2(0.0)), theta, 0.);
      float rs2 = rsBetterborodovV2(asin(v/distance(uv,vec2(0.0))), distance(uv,vec2(0.0)), theta, 1.);
      vec3 color = colorFunc(rs, 30.);
      vec3 colorprime = colorFunc(rs2, 30.);
      float phi = atan(uv.y/(uv.x*cos(theta)));

      if(u < 0.){
        if(v < 0.){
          phi -= M_PI;
        } else {
          phi += M_PI;
        }
      }

      
      vec2 uv2 = (color.x)*vec2(cos(phi),sin(phi))  + vec2(0.25*uResolution.x, 0.5*uResolution.y) / uResolution.y;
      vec2 uv2prime = (colorprime.x)*vec2(cos(phi),sin(phi))  + vec2(0.25*uResolution.x, 0.5*uResolution.y) / uResolution.y;

      vec4 color1 = texture2D(texture1, uv2);
      vec4 colorprime1 = texture2D(texture1, uv2prime);
      gl_FragColor = colorprime1 + 2.*color1;//vec4(color, 1.0);
    }
  `
};

var renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById('canvas'),
  antialias: true,
});
renderer.setClearColor(0x000000);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

//CAMERA
var camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1, 
  1000
);

//SCENE
var scene = new THREE.Scene();

//SCREEN
var geometry = new THREE.PlaneGeometry(2, 2, 1);

var texture = new THREE.TextureLoader().load('../static/space.png')
var uniforms = {
  theta : {value: 0},
  texture1: {value:texture},
  uResolution: {
    value: new THREE.Vector2(window.innerWidth, window.innerHeight),
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

//RENDERER
var theta = 0;
function animate(){
  theta += 0.1;
  mesh.material.uniforms.theta.value = 3.14 * (Math.abs(Math.sin(theta)))/2.;
  renderer.render(scene, camera)
  requestAnimationFrame(animate);
}
animate();