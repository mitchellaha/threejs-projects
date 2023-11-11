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