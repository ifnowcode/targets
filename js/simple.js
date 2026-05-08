// https://github.com/tmkelly28/three-experiments/blob/7ca82a37aae6860ef85483c818d700ce8176c247/worlds/app/index.js
// https://github.com/Limsanity/hello-threejs/blob/50a70d856aee58cd41a096c4cbe324835b25d283/src/example/create-scene.js
// Initialize scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Initialize PointerLockControls
const controls = new THREE.PointerLockControls(camera, document.body);

// Add camera object to the scene
scene.add(controls.getObject());

// Create a plane geometry with the same size as the grid
var planeGeometry = new THREE.PlaneGeometry(20, 20);

// Create a floor material
const blueMaterial = new THREE.MeshStandardMaterial({
    color: 0x003300,
    side: THREE.DoubleSide
});
// Create a plane mesh with the geometry and material
const planeMesh = new THREE.Mesh(planeGeometry, blueMaterial);
// Rotate the grid by 90 degrees
planeMesh.rotation.x = Math.PI / 2;
// Set the position of the plane to align with the grid
//planeMesh.position.copy(gridHelper.position);
scene.add(planeMesh);

gridHelper = new THREE.GridHelper(20, 20);
// Set the color of the grid lines to white
gridHelper.material.color.set(0xffffff);
scene.add(gridHelper);

// Sample geometry and material for a mesh
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// Add event listeners for pointer lock
document.addEventListener('click', () => {
    controls.lock();
}, false);

controls.addEventListener('lock', () => {
    console.log('Pointer locked');
    instructions.style.display = 'none';
    menu.style.display = 'none';
    document.getElementById('crosshair').style.display = 'block';
});

controls.addEventListener('unlock', () => {
    console.log('Pointer unlocked');
    menu.style.display = 'block';
    instructions.style.display = '';
    document.getElementById('crosshair').style.display = 'none'; // Hide the crosshair when screen is unlocked
});

const moveForward = (distance) => {
    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);
    controls.getObject().position.addScaledVector(direction, distance);
};

const onKeyDown = (event) => {
    switch (event.code) {
        case 'ArrowUp': // move forward
        case 'KeyW':
            moveForward(0.1);
            break;
        // Handle other key movements (backward, left, right) as needed
    }
};

document.addEventListener('keydown', onKeyDown, false);

function animate() {
    requestAnimationFrame(animate);

    // Update the scene
    renderer.render(scene, camera);
}

animate();
