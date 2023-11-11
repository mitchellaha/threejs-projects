import * as THREE from 'three';
import { MeshLine, MeshLineMaterial, MeshLineRaycast } from 'three.meshline';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

camera.position.set( 0, 0, 500 );
camera.lookAt( 0, 0, 0 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );


const whiteMaterial = new THREE.MeshBasicMaterial( { color: 0xffffff } );

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
const meshRectangleCount = 1000;
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

console.log(initalRotations)

const minCameraZ = 100;
const maxCameraZ = 1000;
let currentZoomDirection = 'in';
function animate() {
	requestAnimationFrame( animate );
    runMeshtangles();


    // ? Rotate the meshtangles
    for (let i = 0; i < meshTangles.length; i++) {
        if (meshTangles[i].rotation.z > initalRotations[i]) {
            console.log(initalRotations[i])
            meshTangles[i].rotation.z += initalRotations[i] - initalRotations[i+1];
        } else {
            meshTangles[i].rotation.z -= initalRotations[i] - initalRotations[i-1];
        }
    }

    // ? spin the camera counter clockwise
    camera.rotation.z -= 0.1;

    // ? Move the camera back and forth between min and max
    if (camera.position.z >= maxCameraZ) {
        currentZoomDirection = 'out';
    } else if (camera.position.z <= minCameraZ) {
        currentZoomDirection = 'in';
    }
    if (currentZoomDirection === 'in') {
        camera.position.z += 0.2;
    } else {
        camera.position.z -= 0.5;
    }

    renderer.render( scene, camera );
}
animate();