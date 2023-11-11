import * as THREE from 'three';
import Stats  from 'stats.js';
import voices from './aftermath.mp3'
// using Meyda for audio analysis
import Meyda from 'meyda';

const start = Date.now();

const stats = new Stats();
stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild( stats.dom );

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
const listener = new THREE.AudioListener();
const sound = new THREE.Audio( listener );
const analyser = new THREE.AudioAnalyser( sound, 32 );
const renderer = new THREE.WebGLRenderer();

let meydaAnalyzer = null

const redMaterial = new THREE.MeshBasicMaterial( { color: 0xff0000 } );
const greenMaterial = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
const blackMaterial = new THREE.MeshBasicMaterial( { color: 0x000000 } );

let freqData = null;

camera.position.set( 0, 0, 100 );
camera.position.z = 6;
camera.lookAt( 0, 0, 0 );
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );


const startButton = document.getElementById( 'startButton' );
startButton.addEventListener( 'click', startClicked );

function startClicked() {
    startButton.removeEventListener( 'click', startClicked );
    startButton.style.display = 'none';
    startAudio();
}

const startAudio = () => {
    const audioLoader = new THREE.AudioLoader();
    audioLoader.load( voices, function( buffer ) {
        sound.autoplay = false;
        sound.setBuffer( buffer );
        sound.setLoop( true );
        sound.setVolume( 0.5 );
        sound.play();
        init();
    });
    
    meydaAnalyzer = Meyda.createMeydaAnalyzer({
        audioContext: sound.context,
        source: sound.getOutput(),
        bufferSize: 512,
        featureExtractors: ["rms", "energy", "spectralFlatness", "spectralCentroid", "spectralRolloff", "spectralSkewness", "spectralKurtosis", "zcr", "loudness"],
        callback: features => {
            // console.log(features);
        }
    });
    meydaAnalyzer.start();
}

const togglePlayback = () => {
    if (sound.isPlaying) {
        sound.pause();
    } else {
        sound.play();
    }
}

const init = () => {
    document.addEventListener('click', togglePlayback);


    const cubeGeometry = new THREE.BoxGeometry( 1, 1, 1 );
    const cube = new THREE.Mesh( cubeGeometry, blackMaterial );
    const runCube = () => {
        scene.add( cube );
    }

    const points = [
        new THREE.Vector3( - 3, 0, 0 ),
        new THREE.Vector3( 0, 3, 0 ),
        new THREE.Vector3( 3, 0, 0 ),
        new THREE.Vector3( 0, - 3, 0 ),
        new THREE.Vector3( - 3, 0, 0 )
    ];

    const getNoisedlinesGeometry = () => {
        const noisedPoints = [];
        for (let i = 0; i < points.length; i++) {
            const point = points[i];
            const noisedPoint = new THREE.Vector3();
            noisedPoint.copy(point);
            noisedPoint.x += Math.random() * 0.1;
            noisedPoint.y += Math.random() * 0.1;
            noisedPoint.z += Math.random() * 0.1;
            noisedPoints.push(noisedPoint);
        }
        return new THREE.BufferGeometry().setFromPoints( noisedPoints );
    }

    const extraLines = [];
    const addMoreLines = () => {
        const randomColor = 0xffffff;
        const randomMaterial = new THREE.MeshBasicMaterial( { color: randomColor } );
        const line = new THREE.Line( getNoisedlinesGeometry(), randomMaterial );
        if (extraLines.length > 256) {
            scene.remove(extraLines.shift());
        }
        extraLines.push(line);
        scene.add( line );
    }


    const animateLines = () => {
        const energy = meydaAnalyzer.get("amplitudeSpectrum") || [];
        const power = meydaAnalyzer.get("powerSpectrum");
        for (let i = 0; i < extraLines.length; i++) {
            const scale = energy[i];
            const line = extraLines[i];
            line.scale.x = scale;
            line.scale.y = scale;
            line.scale.z = scale;
        }
    }


    const getRotationSpeedFromFrequency = () => {
        const averageFrequency = analyser.getAverageFrequency();
        return averageFrequency / 4000;
    }

    const createBackgroundStars = () => {
        const starGeometry = new THREE.SphereGeometry( 0.1, 32, 32 );
        const starMaterial = new THREE.MeshBasicMaterial( { color: 0xffffff } );
        const star = new THREE.Mesh( starGeometry, starMaterial );
        const starMultiply = 1000;
        for (let i = 0; i < starMultiply; i++) {
            const starClone = star.clone();
            const x = Math.random() * 100 - 50;
            const y = Math.random() * 100 - 50;
            const z = Math.random() * 100 - 50;
            starClone.position.set(x, y, z);
            const starSize = Math.random() * 0.5;
            starClone.scale.set(starSize, starSize, starSize);
            scene.add( starClone );
        }
    }
    createBackgroundStars();

    function animate() {
        stats.begin(); // Begin stats.js
        requestAnimationFrame( animate )

        // ? Basic 3d Cube
        runCube();
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;

        // ? Extra Lines
        addMoreLines();
        const linesRotationSpeed = getRotationSpeedFromFrequency();
        for (let i = 0; i < extraLines.length; i++) {
            extraLines[i].rotation.x += linesRotationSpeed;
            extraLines[i].rotation.y += linesRotationSpeed;
        }
        animateLines();

        // // ? rotate camera around 0,0,0
        // let currentLocation = new THREE.Vector3();
        // currentLocation.copy(camera.position);
        // const rotationSpeed = 0.005;
        // const cameraX = currentLocation.x * Math.cos(rotationSpeed) - currentLocation.z * Math.sin(rotationSpeed);
        // const cameraZ = currentLocation.x * Math.sin(rotationSpeed) + currentLocation.z * Math.cos(rotationSpeed);
        // camera.position.x = cameraX;
        // camera.position.z = cameraZ;
        // camera.lookAt( 0, 0, 0 );

        freqData = analyser.getFrequencyData();
        if (sound.isPlaying) {
            // const power = meydaAnalyzer.get("amplitudeSpectrum");
            // console.log(power);
        }



        renderer.render( scene, camera );
        stats.end(); // End stats.js
    }
    animate();
}