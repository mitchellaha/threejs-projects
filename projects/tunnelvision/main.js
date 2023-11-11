import * as THREE from 'three';
import { MeshLine, MeshLineMaterial, MeshLineRaycast } from 'three.meshline';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

camera.position.set( 0, 0, 100 );
camera.lookAt( 0, 0, 0 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );


const whiteMaterial = new THREE.MeshBasicMaterial( { color: 0xffffff } );


const rectangles = [];

const createRectangle = (x, y, z) => {
    const whiteLineMaterial = new THREE.LineBasicMaterial({
        color: 0xffffff,
        linewidth: 1
    } );
    const rectanglePoints = [];
    rectanglePoints.push( new THREE.Vector3( x, y, z ) );
    rectanglePoints.push( new THREE.Vector3( x, -y, z ) );
    rectanglePoints.push( new THREE.Vector3( -x, -y, z ) );
    rectanglePoints.push( new THREE.Vector3( -x, y, z ) );
    rectanglePoints.push( new THREE.Vector3( x, y, z ) );
    const linesGeometry = new THREE.BufferGeometry().setFromPoints( rectanglePoints );
    const basicLine = new THREE.Line( linesGeometry, whiteLineMaterial );
    rectangles.push(basicLine);
}
// createRectangle( 50, 50, 0 );
// createRectangle( 40, 40, 0 );
// createRectangle( 30, 30, 0 );
// createRectangle( 20, 20, 0 );
// createRectangle( 10, 10, 0 );

const runRectangles = () => {
    rectangles.forEach(rectangle => {
        scene.add( rectangle );
    });
}


// ? MESHLINE

// const points = [];
// for (let i = -200; i < 200; i++) {
//     const randomX = Math.random() * 100;
//     const randomY = Math.random() * 100;
//     const isInverted = Math.random() > 0.5;
//     points.push( new THREE.Vector3( i, isInverted ? randomY : -randomY, 0 ) );
// }
// const geometry = new THREE.BufferGeometry().setFromPoints(points);
// const line = new MeshLine();
// line.setGeometry(geometry);


// const material = new MeshLineMaterial({
//     color: 0xffffff,
// });
// const mesh = new THREE.Mesh(line, material);
// scene.add(mesh);

const meshTangles = [];
const initalRotations = [];
const createMeshRectangle = (x, y, z, rotation) => {
    const points = [];
    points.push( new THREE.Vector3( x, y, z ) );
    points.push( new THREE.Vector3( x, -y, z ) );
    points.push( new THREE.Vector3( -x, -y, z ) );
    points.push( new THREE.Vector3( -x, y, z ) );
    points.push( new THREE.Vector3( x, y, z ) );
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const line = new MeshLine();
    line.setGeometry(geometry);
    const material = new MeshLineMaterial({
        color: 0xffffff,
        resolution: new THREE.Vector2(window.innerWidth, window.innerHeight),
        lineWidth: 0.75,
    });
    const mesh = new THREE.Mesh(line, material);
    mesh.rotation.z = rotation;
    mesh.raycast = MeshLineRaycast;
    initalRotations.push(rotation);
    // mesh.raycast = MeshLineRaycast;
    meshTangles.push(mesh);
}
const meshRectangleCount = 250;
var currentRotation = 0
const startGap = 2;
for (let i = 0; i < meshRectangleCount; i++) {
    createMeshRectangle( i+startGap, i+startGap, 0, currentRotation);
    currentRotation += (i * 0.0002);
}

const runMeshtangles = () => {
    meshTangles.forEach(mesh => {
        scene.add( mesh );
    });
}

const breatheRotations = () => {
    // each meshtangle should rotate back to 0 and then back to its original rotation
    for (let i = 0; i < meshTangles.length; i++) {
        const rotationSpeed = 1;
        if (meshTangles[i].rotation.z > initalRotations[i]) {
            meshTangles[i].rotation.z -= rotationSpeed;
        } else {
            meshTangles[i].rotation.z += rotationSpeed;
        }
    }
}

console.log(initalRotations)

function animate() {
	requestAnimationFrame( animate );

    runRectangles();
    runMeshtangles();
    // breatheRotations();

    // const rotationSpeed = 0.01;
    // for (let i = 0; i < meshTangles.length; i++) {
    //     // meshTangles[i].rotation.z += rotationSpeed;
    //     meshTangles[i].rotation.z += rotationSpeed;
    // }

    const rotationSpeed = 0.001;
    const previousRotation = 0;
    for (let i = 0; i < meshTangles.length; i++) {
        // each meshtangle should wait a bit before the next one starts
        if (meshTangles[i].rotation.z > initalRotations[i]) {
            console.log(initalRotations[i])
            meshTangles[i].rotation.z += initalRotations[i];
        } else {
            meshTangles[i].rotation.z -= initalRotations[i] - initalRotations[i-1];
        }
    }

    renderer.render( scene, camera );
}
animate();