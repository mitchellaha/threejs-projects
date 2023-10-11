import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
const listener = new THREE.AudioListener();
const sound = new THREE.Audio( listener );
const analyser = new THREE.AudioAnalyser( sound, 32 );

camera.position.set( 0, 0, 100 );
camera.lookAt( 0, 0, 0 );

const renderer = new THREE.WebGLRenderer();
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
    audioLoader.load( './voices.mp3', function( buffer ) {
        sound.autoplay = false;
        sound.setBuffer( buffer );
        sound.setLoop( true );
        sound.setVolume( 0.5 );
        sound.play();
        init();
    });
}

const init = () => {
    const geometry = new THREE.BoxGeometry( 1, 1, 1 );
    const eyeTexture = new THREE.TextureLoader().load('./eye.jpg' ); 
    const eyeTexture2 = new THREE.TextureLoader().load('./eye2.jpg' );
    const material = new THREE.MeshBasicMaterial( { map: eyeTexture } );
    const greenMaterial = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
    const cube = new THREE.Mesh( geometry, material );
    const runCube = () => {
        scene.add( cube );
    }
    
    camera.position.z = 6;
    
    
    const points = [];
    points.push( new THREE.Vector3( - 3, 0, 0 ) );
    points.push( new THREE.Vector3( 0, 3, 0 ) );
    points.push( new THREE.Vector3( 3, 0, 0 ) );
    points.push( new THREE.Vector3( 0, - 3, 0 ) );
    points.push( new THREE.Vector3( - 3, 0, 0 ) );
    
    const linesGeometry = new THREE.BufferGeometry().setFromPoints( points );
    
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
        return averageFrequency / 4000;
    }

    const getRandomRotationOnAxis = () => {
        const randomAxis = new THREE.Vector3();
        randomAxis.x = Math.random();
        randomAxis.y = Math.random();
        randomAxis.z = Math.random();
        return randomAxis;
    }

    const ringItems = [];
    const create3dRing = () => {
        const ringRotation = getRandomRotationOnAxis();
        const ringGeometry = new THREE.RingGeometry( 3.4, 3.5, 32 ); 
        const ringMaterial = new THREE.MeshBasicMaterial( { color: 0xCCCC00, side: THREE.DoubleSide } );
        const ring = new THREE.Mesh( ringGeometry, ringMaterial );
        const ringMultiply = 20;
        for (let i = 0; i < ringMultiply; i++) {
            const ringClone = ring.clone();
            ringClone.rotation.x = ringRotation.x * i;
            ringClone.rotation.y = ringRotation.y * i;
            ringClone.rotation.z = ringRotation.z * i;
            scene.add( ringClone );
            ringItems.push(ringClone);
        }
        // ringItems.push(ring);
        // scene.add( ring );
    }
    // create3dRing();

    const eyeMaterial = new THREE.MeshBasicMaterial( { map: eyeTexture2 } );
    const toruses = [];
    const torusEyes = [];
    const createTorus = () => {
        const torusGeometry = new THREE.TorusGeometry( 3.5, 0.2, 12, 48 );
        // const torusMaterial = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
        const torusEyeTexture = new THREE.TextureLoader().load('./foil.jpg' );
        torusEyeTexture.wrapS = THREE.RepeatWrapping
        torusEyeTexture.repeat.set( 5, 1 );
        const torusMaterial = new THREE.MeshBasicMaterial( { map: torusEyeTexture } );
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
            // ? creates eyes on the 3d torus
            // const eyeMultiply = 20;
            // Eye Multiply should be based on the radius of the torus
            // eyes should be placed on the torus in a event circular pattern
            const eyeMultiply = Math.floor(torusClone.geometry.parameters.radius * 10);
            for (let j = 0; j < eyeMultiply; j++) {
                const eyeGeometry = new THREE.SphereGeometry( 0.1, 32, 32 );
                const eye = new THREE.Mesh( eyeGeometry, eyeMaterial );
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

    function animate() {
        requestAnimationFrame( animate );
    
        // ? Basic 3d Cube
        runCube();
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;

        
        // console.log(getRotationSpeedFromFrequency());
    
        // ? Basic 2d Lines around 0,0,0
        // runLines();
        // line.rotation.x += 0.01;
        // line.rotation.y += 0.01;
    
        // ? Extra Lines
        addMoreLines();
        const linesRotationSpeed = getRotationSpeedFromFrequency();
        for (let i = 0; i < extraLines.length; i++) {
            extraLines[i].rotation.x += linesRotationSpeed;
            extraLines[i].rotation.y += linesRotationSpeed;
        }

        // ? 3d Ring
        // const ringRotationSpeed = 0.01;
        // for (let i = 0; i < ringItems.length; i++) {
        //     ringItems[i].rotation.x += ringRotationSpeed;
        //     ringItems[i].rotation.y += ringRotationSpeed;
        // }

        // // ?? makes 3d rings breathe with perlin noise
        // for (let i = 0; i < ringItems.length; i++) {
        //     const ringItem = ringItems[i];
        //     const time = Date.now() * 0.001;
        //     const scale = 0.8 + Math.sin( time ) * 0.2;
        //     ringItem.scale.set( scale, scale, scale );
        // }


        // eyeMaterial.side = THREE.DoubleSide;
        // ? makes eyes rotate individually in random direction
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

            // ? makes torus breathe with perlin noise
            // const currentTorusScale = torus.scale.x;
            // const time = Date.now() * 0.001;
            // const newScale = currentTorusScale + Math.sin( time ) * 0.001;
            // torus.scale.set( newScale, newScale, newScale );
        }
    
    
        // ? rotate camera around 0,0,0
        let currentLocation = new THREE.Vector3();
        currentLocation.copy(camera.position);
        const rotationSpeed = 0.005;
        const x = currentLocation.x * Math.cos(rotationSpeed) - currentLocation.z * Math.sin(rotationSpeed);
        const z = currentLocation.x * Math.sin(rotationSpeed) + currentLocation.z * Math.cos(rotationSpeed);
        camera.position.x = x;
        camera.position.z = z;
        camera.lookAt( 0, 0, 0 );
    
    
        renderer.render( scene, camera );
    }
    animate();
}