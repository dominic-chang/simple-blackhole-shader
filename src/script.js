import * as THREE from '../node_modules/three/build/three.module.js';

var renderer, uniforms, vShader, fShader, camera, scene, mesh, theta;
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
    45,
    800 / 800,
    0.1, 
    1000
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

    //var texture = new THREE.TextureLoader().load('static/space.png')
    //var texture = new THREE.TextureLoader().load('https://upload.wikimedia.org/wikipedia/commons/d/d3/Albert_Einstein_Head.jpg')//.load('space.png')
    //var texture = new THREE.TextureLoader().load('https://images.theconversation.com/files/393213/original/file-20210401-13-1w9xb24.jpg?ixlib=rb-1.1.0&q=30&auto=format&w=600&h=400&fit=crop&dpr=2')//https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/The_Event_Horizon_Telescope_and_Global_mm-VLBI_Array_on_the_Earth.jpg/1920px-The_Event_Horizon_Telescope_and_Global_mm-VLBI_Array_on_the_Earth.jpg')//.load('space.png')
    //var texture = new THREE.TextureLoader().load('https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/The_Event_Horizon_Telescope_and_Global_mm-VLBI_Array_on_the_Earth.jpg/1920px-The_Event_Horizon_Telescope_and_Global_mm-VLBI_Array_on_the_Earth.jpg')//.load('space.png')
    var texture = new THREE.TextureLoader().load('https://cdn.vox-cdn.com/thumbor/nPHkBUDla9JcRJWRdswdAETz4MU=/0x0:1960x2000/1820x1213/filters:focal(686x574:998x886):format(webp)/cdn.vox-cdn.com/uploads/chorus_image/image/71122307/STScI_01G7PWWPY7XRR9PW95W9W8ZYZW.0.png')
    //var texture = new THREE.TextureLoader().load('https://cdn-icons-png.flaticon.com/512/25/25435.png')


    uniforms = {
    theta : {value: 0},
    texture1: {value:texture},
    uResolution: {
        value: new THREE.Vector2(800, 800),
    },
    }
    var shader_material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: vShader,
    fragmentShader: fShader,
    });
    var reflective_material = new THREE.MeshBasicMaterial(0x00ff00);
    mesh = new THREE.Mesh(geometry, shader_material);

    mesh.position.z = -1;
    scene.add(mesh);

    theta = 80*Math.PI/180;

    animate();
}

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



