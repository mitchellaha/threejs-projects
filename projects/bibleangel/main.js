import * as THREE from 'three';
import Stats  from 'stats.js';
import foil from './foil.jpg'
import eye from './eye.jpg'
import eye2 from './eye2.jpg'
import voices from './voices.mp3'

const start = Date.now();
const isMobile = window.innerWidth < 600;

const stats = new Stats();
stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild( stats.dom );

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
const listener = new THREE.AudioListener();
const sound = new THREE.Audio( listener );
const analyser = new THREE.AudioAnalyser( sound, 32 );
const renderer = new THREE.WebGLRenderer();



const eyeTexture = new THREE.TextureLoader().load(eye ); 
const eyeTexture2 = new THREE.TextureLoader().load(eye2 );
const torusGoldTexture = new THREE.TextureLoader().load(foil );
const torusEyeMaterial = new THREE.MeshBasicMaterial( { map: eyeTexture2 } );
const cubeEyeMaterial = new THREE.MeshBasicMaterial( { map: eyeTexture } );
const greenMaterial = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );

let freqData = null;

camera.position.set( 0, 0, 100 );
camera.position.z = 8;
if (isMobile) {
    camera.position.z = 15;
}
camera.lookAt( 0, 0, 0 );
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );


function startClicked() {
    startButton.removeEventListener( 'click', startClicked );
    startButton.style.display = 'none';
    playAudio();
    // document.addEventListener('click', togglePlayback);
}

const startAudio = () => {
    // const audioLoader = new THREE.AudioLoader();
    // audioLoader.load( voices, function( buffer ) {
    //     sound.autoplay = false;
    //     sound.setBuffer( buffer );
    //     sound.setLoop( true );
    //     sound.setVolume( 0.5 );
    //     sound.play();
    //     init();
    // });
    sound.play();
    init();
}
const audioLoader = new THREE.AudioLoader();
audioLoader.load( voices, function( buffer ) {
    sound.autoplay = false;
    sound.setBuffer( buffer );
    sound.setLoop( true );
    sound.setVolume( 0.5 );
    // sound.play();
    // init();
});

const playAudio = () => {
    startAudio();
}

const startButton = document.getElementById( 'startButton' );
startButton.addEventListener( 'click', startClicked );

const togglePlayback = () => {
    if (!sound.isPlaying) {
        sound.play();
    } else {
        sound.pause();
    }
}

const init = () => {
    // document.addEventListener('click', togglePlayback);

    const cubeGeometry = new THREE.BoxGeometry( 1, 1, 1 );
    const cube = new THREE.Mesh( cubeGeometry, cubeEyeMaterial );
    const runCube = () => {
        scene.add( cube );
    }

    const points = [
        new THREE.Vector3( - 1, 0, 0 ),
        new THREE.Vector3( 0, 1, 0 ),
        new THREE.Vector3( 1, 0, 0 ),
        new THREE.Vector3( 0, - 1, 0 ),
        new THREE.Vector3( - 1, 0, 0 )
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
        const randomColor = 0xffffff * Math.random();
        const randomMaterial = new THREE.MeshBasicMaterial( { color: randomColor } );
        const line = new THREE.Line( getNoisedlinesGeometry(), randomMaterial );
        if (extraLines.length > 620) {
            scene.remove(extraLines.shift());
        }
        extraLines.push(line);
        scene.add( line );
    }

    const getRotationSpeedFromFrequency = () => {
        const averageFrequency = analyser.getAverageFrequency();
        return averageFrequency / 3300;
    }

    const getInverseRotationSpeedFromFrequency = () => {
        const averageFrequency = analyser.getAverageFrequency();
        return averageFrequency / 4000;
    }

    const expandLinesOnFreqData = () => {
        const freqData = analyser.getFrequencyData();
        for (let i = 0; i < extraLines.length; i++) {
            // get random frequency data
            const rFreq = freqData[Math.floor(Math.random() * freqData.length)];
            const line = extraLines[i];
            const lineScale = 1 + (rFreq / 200);
            line.scale.set(lineScale, lineScale, lineScale);
        }
    }

    const getRandomRotationOnAxis = () => {
        const randomAxis = new THREE.Vector3();
        randomAxis.x = Math.random();
        randomAxis.y = Math.random();
        randomAxis.z = Math.random();
        return randomAxis;
    }

    const toruses = [];
    const torusEyes = [];
    const createTorus = () => {
        const torusGeometry = new THREE.TorusGeometry( 3.5, 0.2, 12, 48 );
        torusGoldTexture.wrapS = THREE.RepeatWrapping
        torusGoldTexture.repeat.set( 5, 1 );
        const torusMaterial = new THREE.MeshBasicMaterial( { map: torusGoldTexture } );
        const torus = new THREE.Mesh( torusGeometry, torusMaterial );
        const torusMultiply = 4;
        // each torus should be slightly smaller than the previous one
        let currentScale = 1;
        for (let i = 0; i < torusMultiply; i++) {
            const torusClone = torus.clone();
            torusClone.scale.set(currentScale, currentScale, currentScale);
            currentScale -= 0.1;
            torusClone.rotation.x = Math.random() * 2 * Math.PI;
            torusClone.rotation.y = Math.random() * 2 * Math.PI;
            torusClone.rotation.z = Math.random() * 2 * Math.PI;
            // Eye Multiply should be based on the radius of the torus
            // eyes should be placed on the torus in a event circular pattern
            const eyeMultiply = Math.floor(torusClone.geometry.parameters.radius * 10);
            for (let j = 0; j < eyeMultiply; j++) {
                const eyeGeometry = new THREE.SphereGeometry( 0.1, 32, 32 );
                const eye = new THREE.Mesh( eyeGeometry, torusEyeMaterial );
                const angle = (Math.PI * 2) / eyeMultiply;
                const x = Math.cos(angle * j) * torusClone.geometry.parameters.radius * 1.035;
                const y = Math.sin(angle * j) * torusClone.geometry.parameters.radius * 1.035;
                eye.position.set(x, y, 0);
                const eyeSize = 1.3
                eye.scale.set(eyeSize, eyeSize, eyeSize);
                torusClone.add(eye);
                torusEyes.push(eye);
            }
            scene.add( torusClone );
            toruses.push(torusClone);
        }
    }
    createTorus();

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
        const linesRotationSpeed = getInverseRotationSpeedFromFrequency();
        for (let i = 0; i < extraLines.length; i++) {
            extraLines[i].rotation.x += linesRotationSpeed;
            extraLines[i].rotation.y += linesRotationSpeed;
        }
        expandLinesOnFreqData();

        // ? Torus Eyes Rotating Randonmly
        const eyeRotationSpeed = 0.1
        for (let i = 0; i < torusEyes.length; i++) {
            const eye = torusEyes[i];
            const randomAxis = getRandomRotationOnAxis();
            eye.rotation.x += eyeRotationSpeed * randomAxis.x;
            eye.rotation.y += eyeRotationSpeed * randomAxis.y;
            eye.rotation.z += eyeRotationSpeed * randomAxis.z;
        }

        // ? Torus rotate individually in random direction
        const torusRotationSpeed = getRotationSpeedFromFrequency();
        for (let i = 0; i < toruses.length; i++) {
            const torus = toruses[i];
            const randomAxis = getRandomRotationOnAxis();
            torus.rotation.x += torusRotationSpeed * randomAxis.x;
            torus.rotation.y += torusRotationSpeed * randomAxis.y;
            torus.rotation.z += torusRotationSpeed * randomAxis.z;
        }

        // ? rotate camera around 0,0,0
        let currentLocation = new THREE.Vector3();
        currentLocation.copy(camera.position);
        const rotationSpeed = 0.005;
        const cameraX = currentLocation.x * Math.cos(rotationSpeed) - currentLocation.z * Math.sin(rotationSpeed);
        const cameraZ = currentLocation.x * Math.sin(rotationSpeed) + currentLocation.z * Math.cos(rotationSpeed);
        camera.position.x = cameraX;
        camera.position.z = cameraZ;
        camera.lookAt( 0, 0, 0 );

        freqData = analyser.getFrequencyData();
        if (sound.isPlaying) {
            console.log(freqData);
        }

        renderer.render( scene, camera );
        stats.end(); // End stats.js
    }
    animate();
}
// init();