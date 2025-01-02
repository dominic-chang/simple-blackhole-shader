import * as THREE from './three.module.js';
import Stats from './Stats.js';

var renderer, uniforms, vShader, fShader, camera, scene, acc_disk, theta, stats;
var loader = new THREE.FileLoader();

init();

function init() {
    renderer = new THREE.WebGLRenderer({
    canvas: document.getElementById('canvas'),
    antialias: false,
    });
    renderer.setClearColor(0x000000);
    renderer.setSize(window.innerWidth, window.innerHeight);

    let aspect = window.innerWidth / window.innerHeight;

    camera = new THREE.PerspectiveCamera(
    50,
    aspect,
    0.1, 
    200
    );
 
    scene = new THREE.Scene();

    var numFilesLeft = 2;

    function runMoreIfDone() {
        --numFilesLeft;
        if (numFilesLeft == 0) {
            more();
        }
    }

    loader.load('./static/glsl/fragment.glsl', function ( data ) {fShader =  data; runMoreIfDone(); },);
    loader.load('./static/glsl/vertex.glsl', function ( data ) {vShader =  data; runMoreIfDone(); },);

}

function more() {
    var geometry = new THREE.PlaneGeometry(2, 2);

    var texture2 = new THREE.TextureLoader().load('./static/public/images/eso0932a.png')//.load('space.png')
    var texture1 = new THREE.TextureLoader().load('./static/public/images/ConcentricCircles.png')

    uniforms = {
    theta :    {value: 0},
    texture1:  {value:texture1},
    textureft: {value:texture2},
    uResolution: {
        value: new THREE.Vector2(window.innerWidth, window.innerHeight),
    },
    }
    var shader_material = new THREE.ShaderMaterial({
    uniforms:       uniforms,
    vertexShader:   vShader,
    fragmentShader: fShader,
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
    theta = (-d.getTime()/10000) % (2*Math.PI);
    if (Math.abs(theta - Math.PI/2.) < 0.005 || Math.abs(theta - 3.*Math.PI/2.) < 0.005){
        theta += 0.01;
    }
    acc_disk.material.uniforms.theta.value = theta;// + 3.14 * (Math.abs(Math.sin(theta)))/2.;
    renderer.render(scene, camera)
    stats.end();
    requestAnimationFrame(animate);
}




