import * as THREE from '../node_modules/three/build/three.module.js';
import Stats from '../node_modules/stats-js/src/Stats.js';

var renderer, uniforms, vShader, fShader, camera, scene, acc_disk, theta, stats;
var loader = new THREE.FileLoader();

init();

function init() {
    renderer = new THREE.WebGLRenderer({
    canvas: document.getElementById('canvas'),
    antialias: true,
    });
    renderer.setClearColor(0x000000);
    renderer.setSize(800, 800);

    camera = new THREE.PerspectiveCamera(
    40,
    800 / 800,
    0.1, 
    20000
    );

    scene = new THREE.Scene();

    var numFilesLeft = 2;

    function runMoreIfDone() {
        --numFilesLeft;
        if (numFilesLeft == 0) {
            more();
        }
    }

    loader.load('../src/fragment.glsl', function ( data ) {fShader =  data; runMoreIfDone(); },);
    loader.load('../src/vertex.glsl', function ( data ) {vShader =  data; runMoreIfDone(); },);

}

function more() {
    var geometry = new THREE.PlaneGeometry(2, 2);

    var texture2 = new THREE.TextureLoader().load('../public/images/eso0932a.png')//.load('space.png')
    var texture1 = new THREE.TextureLoader().load('../public/images/ConcentricCircles.png')

    uniforms = {
    theta :    {value: 0},
    texture1:  {value:texture1},
    textureft: {value:texture2},
    uResolution: {
        value: new THREE.Vector2(800, 800),
    },
    }
    var shader_material = new THREE.ShaderMaterial({
    uniforms:       uniforms,
    vertexShader:   vShader,
    fragmentShader: fShader,
    //blending:       THREE.AdditiveBlendMode,
    transparent:    true
    });
    var reflective_material = new THREE.MeshBasicMaterial(0xffffff);
    acc_disk = new THREE.Mesh(geometry, shader_material);

    acc_disk.position.z = -1;
    scene.add(acc_disk);


    
    theta = 85*Math.PI/180;
    stats = new Stats();
    stats.showPanel( 1 ); // 0: fps, 1: ms, 2: mb, 3+: custom
    document.body.appendChild( stats.dom );


    animate();
}

function animate(){
    stats.begin();
    var d = new Date();
    theta = d.getTime()/5000 % 2*Math.PI
    if (Math.abs(theta - Math.PI/2.) < 0.005 || Math.abs(theta - 3.*Math.PI/2.) < 0.005){
        theta += 0.01;
    }
    acc_disk.material.uniforms.theta.value = theta;//3.14 * (Math.abs(Math.sin(theta)))/2.;
    renderer.render(scene, camera)
    stats.end();
    requestAnimationFrame(animate);
}



