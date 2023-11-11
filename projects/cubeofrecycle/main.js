import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

camera.position.set( 0, 0, 100 );
camera.lookAt( 0, 0, 0 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );


const geometry = new THREE.BoxGeometry( 1, 1, 1 );
const greenMaterial = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
const cube = new THREE.Mesh( geometry, greenMaterial );
const runCube = () => {
    scene.add( cube );
}

camera.position.z = 5;


const points = [];
points.push( new THREE.Vector3( - 3, 0, 0 ) );
points.push( new THREE.Vector3( 0, 3, 0 ) );
points.push( new THREE.Vector3( 3, 0, 0 ) );
points.push( new THREE.Vector3( 0, - 3, 0 ) );
points.push( new THREE.Vector3( - 3, 0, 0 ) );

const linesGeometry = new THREE.BufferGeometry().setFromPoints( points );
const basicLine = new THREE.Line( linesGeometry, greenMaterial );

const runLines = () => {
    scene.add( basicLine );
}

const extraLines = [];
const addMoreLines = () => {
    const randomColor = 0xffffff * Math.random();
    const randomMaterial = new THREE.MeshBasicMaterial( { color: randomColor } );
    const line = new THREE.Line( linesGeometry, randomMaterial );
    if (extraLines.length > 620) {
        scene.remove(extraLines.shift());
    }
    extraLines.push(line);
    scene.add( line );
}



function animate() {
	requestAnimationFrame( animate );

    // ? Basic 3d Cube
    runCube();
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;

    // ? Basic 2d Lines around 0,0,0
    // runLines();
    // line.rotation.x += 0.01;
    // line.rotation.y += 0.01;

    // ? Extra Lines
    addMoreLines();
    const linesRotationSpeed = 0.01;
    for (let i = 0; i < extraLines.length; i++) {
        extraLines[i].rotation.x += linesRotationSpeed;
        extraLines[i].rotation.y += linesRotationSpeed;
    }


    // ? rotate camera around 0,0,0
    // let currentLocation = new THREE.Vector3();
    // currentLocation.copy(camera.position);
    // const rotationSpeed = 0.01;
    // const x = currentLocation.x * Math.cos(rotationSpeed) - currentLocation.z * Math.sin(rotationSpeed);
    // const z = currentLocation.x * Math.sin(rotationSpeed) + currentLocation.z * Math.cos(rotationSpeed);
    // camera.position.x = x;
    // camera.position.z = z;
    // camera.lookAt( 0, 0, 0 );


    renderer.render( scene, camera );
}
animate();