var scene = new THREE.Scene();

const directional = new THREE.DirectionalLight(0xffffff, 10);
directional.position.set(10, 10, 10);

directional.target.position.set(0, 0, 0);
directional.castShadow = true;

    directional.shadow.camera.near = 0.5; // default
    directional.shadow.camera.far = 500; // default

directional.shadowDarkness = 0.5;
directional.shadowCameraVisible = true; // only for debugging
directional.shadowCameraNear = 2;
directional.shadowCameraFar = 5;
directional.shadowCameraLeft = -0.5;
directional.shadowCameraRight = 0.5;
directional.shadowCameraTop = 0.5;
directional.shadowCameraBottom = -0.5;
scene.add(directional);
const lightHelper = new THREE.DirectionalLightHelper(directional);
if (lightHelper) scene.add(lightHelper);

const light = new THREE.HemisphereLight( 0xffffbb, 0x080820, 1 );
scene.add( light );

var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const cameraHelper = new THREE.CameraHelper(camera);
if (cameraHelperOn) scene.add(cameraHelper);

var renderer = new THREE.WebGLRenderer({ alpha: true, depth: true, antialias: false });

renderer.setPixelRatio( window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ReinhardToneMapping;
renderer.setClearColor(0x000000, 1); // Set background color to black
renderer.domElement.style.position = 'fixed';
renderer.domElement.id = 'renderer';
renderer.domElement.style.zIndex = '-1';
renderer.domElement.style.left = '0';
renderer.domElement.style.top = '0';
document.body.appendChild(renderer.domElement);

var raycaster = new THREE.Raycaster();
const directionVector = new THREE.Vector3(); 
const collisionDistance = 1; // Adjust based on your needs
var mouse = new THREE.Vector2();


var gravity = new THREE.Vector3(0, -0.01, 0); // Adjust the gravity strength as needed
var maxGravityDistance = 2; // Adjust the maximum distance affected by gravity as needed

var controls = new THREE.PointerLockControls(camera, document.body);

var planeGeometry = new THREE.PlaneGeometry(spec.map_size, spec.map_size);

const blueMaterial = new THREE.MeshStandardMaterial({
    color: 0x003300,
    side: THREE.DoubleSide
});
const planeMesh = new THREE.Mesh(planeGeometry, blueMaterial);
planeMesh.rotation.x = Math.PI / 2;
scene.add(planeMesh);

function isObjectInScene(scene, object) {
  let current_object = object;
  while(current_object.parent !== null) {
    current_object = current_object.parent;
    if(current_object === scene) {
      return true;
    }
  }
  return false;
}

function createRandomSphere(color) {
  let r = randomFloat(0.1, 0.6, 2), ws = randomInt(3, 32), hs = randomInt(3, 32);
  let geometry = new THREE.SphereGeometry(r, ws, hs);
  let material = new THREE.MeshPhongMaterial({ color: color });
  let o = new THREE.Mesh(geometry, material);
  o.name = "Sphere";
  return o;
}

function addRandomSphere(color) {
  let o = createRandomSphere(color);
  let x = randomFloat(o.geometry.parameters.radius/2, 2, 2);
  o.position.set(0, x, 0); // Set target position 0.5 units above the grid
  moveObjectRandomly(o);
  return o;
}

function createRandomCube(color) {
  let w = randomFloat(0.1, 1, 1), h = randomFloat(0.1, 1, 1), d = randomFloat(0.1, 1, 1);
  let geometry = new THREE.BoxGeometry(w, h, d, 2, 2, 2);
  let material = new THREE.MeshPhongMaterial({ color: color });
  let o = new THREE.Mesh(geometry, material);
  o.name = "Cube";
  return o;
}

function addRandomCube(color) {
  let o = createRandomCube(color);
  let x = randomFloat(o.geometry.parameters.height/4, 2, 2);
  o.position.set(0, x, 0); // Set target position 0.5 units above the grid
  return o;
}

function restart() {
    console.log("Restart");

    if (controls.isLocked) {
        unlock();
        controls.unlock();
    }

    for (let i = 0; i < targets.length; i++) {
        scene.remove(targets[i]);
    }
    targets.splice(0, targets.length);
    for (let i = 0; i < buildings.length; i++) {
        scene.remove(buildings[i]);
    }
    buildings.splice(0, buildings.length);
    for (let i = 0; i < trees.length; i++) {
        scene.remove(trees[i]);
    }
    trees.splice(0, trees.length);
    for (let i = 0; i < bushes.length; i++) {
        scene.remove(bushes[i]);
    }
    bushes.splice(0, bushes.length);
    for (let i = 0; i < boulders.length; i++) {
        scene.remove(boulders[i]);
    }
    boulders.splice(0, boulders.length)

    initialize();
    //if (!mute) playMusic();
}

function initialize() {
    console.log("Initializing size:", spec.map_size);
    clearStopwatch();
    pauseMusic();

    camera.lookAt(0, 0, 0);
    camera.position.set(0, 0.3, 3);

    roundOver = false;
    bulletsFired = 0;

    for (let i = 0; i < spec.num_targets; i++) {
        let o;
        if (randomInt(0,1) == 0) {
          o = addRandomCube(randomColorHex());
        } else {
          o = addRandomSphere(randomColorHex());
        }
        moveObjectRandomly(o);
        targets.push(o);
        if (targetsOn) scene.add(o);
    }
    
    console.log("Added", targets.length, "Targets")

    directional.shadow.mapSize.width = spec.map_size; // default
    directional.shadow.mapSize.height = spec.map_size; // default

    var newGeometry = new THREE.PlaneGeometry(spec.map_size, spec.map_size);
    planeMesh.geometry.dispose();
    planeMesh.geometry = newGeometry;

    if (gridHelper!= null) gridHelper.dispose();
    gridHelper = new THREE.GridHelper(spec.map_size, spec.map_size);
    gridHelper.material.color.set(0xffffff);
    if (gridHelperOn) scene.add(gridHelper);

    for (let i = 0; i < spec.num_buildings; i++) {
    let w = randomInt(1,3), h = randomInt(1,6), d = randomInt(1,3);
    let geometry = new THREE.BoxGeometry(w, h, d);
    let material = new THREE.MeshPhongMaterial({ color: 0x000066 });
    let o = new THREE.Mesh(geometry, material);
    o.name = "Building";
    o.position.set(0, 0.5, 0); // Set target position 0.5 units above the grid
    buildings.push(o);
    moveObjectRandomly(o);
    if (buildingsOn) scene.add(o);
    }

    for (let i = 0; i < spec.num_trees; i++) {
    let r = randomFloat(0.1, 0.7, 1), h = randomFloat(0.5, 2, 1), rs = randomInt(4, 8);
    let geometry = new THREE.ConeGeometry( r, h, 32 );
    let material = new THREE.MeshPhongMaterial( {color: 0x008800} );
    let o = new THREE.Mesh(geometry, material );
    o.name = "Tree";
    o.position.set(0, h / 2, 0); // Set target position 0.5 units above the grid
    trees.push(o);
    moveObjectRandomly(o);
    if (treesOn) scene.add(o);
    }

 for (let i = 0; i < spec.num_bushes; i++) {
    let rt = randomFloat(0.01, 0.2, 1), rb = randomFloat(0.05, 0.4, 1), h = randomFloat(0.2, 0.4, 1), rs = randomInt(4, 8);
    let geometry = new THREE.CylinderGeometry( rt, rb, h, rs );
    let material = new THREE.MeshPhongMaterial( {color: 0x004400} );
    let o = new THREE.Mesh(geometry, material );
    o.name = "Bush";
    o.position.set(0, h / 2, 0); // Set target position 0.5 units above the grid
    bushes.push(o);
    moveObjectRandomly(o);
    if (bushesOn) scene.add(o);
    }

    for (let i = 0; i < spec.num_boulders; i++) {
    let r = randomFloat(0.1, 0.7, 1), d = randomInt(1, 5);
    let geometry = new THREE.TetrahedronGeometry( r, d );  // 0.2, 1, 32
    let material = new THREE.MeshPhongMaterial( {color: 0x333333} );
    let o = new THREE.Mesh(geometry, material );
    o.name = "Boulder";
    o.position.set(0, r/2, 0); // Set target position 0.5 units above the grid
    boulders.push(o);
    moveObjectRandomly(o);
    if (bouldersOn) scene.add(o);
    }
}

initialize();

scene.add(controls.getObject());

addEventListener("pointerlockchange", (event) => {
  if (document.pointerLockElement)
    console.log("The pointer is locked to: ", document.pointerLockElement);
  else {
    console.log("The pointer is not locked");
  }
});

playButton.addEventListener('click', function () {
    controls.lock();
});

controls.addEventListener('lock', function () {
    lock();
});

function lock() {
    console.log("Lock");
    instructions.style.display = 'none';
    menu.style.display = 'none';
    document.getElementById('crosshair').style.display = 'block'; // Show the crosshair when screen is locked
    if (targets.length) startStopwatch();
    console.log("Mute", mute, "Round Over", roundOver);
    if (!mute && !roundOver) playMusic();
}

controls.addEventListener('unlock', function () {
    unlock();
});

function unlock() {
    console.log("Unlock");
    menu.style.display = 'block';
    instructions.style.display = '';
    document.getElementById('crosshair').style.display = 'none'; // Hide the crosshair when screen is unlocked
    if (targets.length) {
        stopStopwatch();
    }
    console.log("Mute", mute, "Round", roundOver);
    pauseMusic();
}

var moveForward = false;
var moveBackward = false;
var moveLeft = false;
var moveRight = false;
var moveFast = false;

var onKeyDown = function (event) {
    switch (event.keyCode) {
        case 38: // up arrow
        case 87: // W key
            moveForward = true;
            break;
        case 37: // left arrow
        case 65: // A key
            moveLeft = true;
            break;
        case 40: // down arrow
        case 83: // S key
            moveBackward = true;
            break;
        case 39: // right arrow
        case 68: // D key
            moveRight = true;
            break;
        case 16: // shift key
            moveFast = true;
            break;
    }
};

var onKeyUp = function (event) {
    switch (event.keyCode) {
        case 38: // up arrow
        case 87: // W key
            moveForward = false;
            break;
        case 37: // left arrow
        case 65: // A key
            moveLeft = false;
            break;
        case 40: // down arrow
        case 83: // S key
            moveBackward = false;
            break;
        case 39: // right arrow
        case 68: // D key
            moveRight = false;
            break;
        case 16: // shift key
            moveFast = false;
            break;
    }
};

document.addEventListener('keydown', onKeyDown);
document.addEventListener('keyup', onKeyUp);

function checkObjectCollsions() {
    camera.getWorldDirection(directionVector);

    raycaster.set(camera.position, directionVector);

    const intersects = raycaster.intersectObjects(objects);

    if (intersects.length > 0 && intersects[0].distance < collisionDistance) {
        console.log('Collision detected');
    }

    renderer.render(scene, camera);
}

function checkCollision(position) {
    var gridSize = spec.map_size;
    var halfGridSize = gridSize / 2;
    var margin = 0.1;

    // check map bounds
    if (
        position.x < -halfGridSize + margin ||
        position.x > halfGridSize - margin ||
        position.z < -halfGridSize + margin ||
        position.z > halfGridSize - margin
    ) 
    {
        return true; // Collision detected
    }

    return false; // No collision
}

function update() {

    updateParticles();

    checkParticleCollision();

    if (controls.isLocked) {
        let delta = 0.03;
        let speed = delta;
        if (moveFast) {
            speed = delta * 4;
        }

        if (moveForward) {
            controls.moveForward(speed);
            if (checkCollision(controls.getObject().position)) {
                controls.moveForward(-speed); // Move back to the previous position
            }
        }

        if (moveBackward) {
            controls.moveForward(-speed);
            if (checkCollision(controls.getObject().position)) {
                controls.moveForward(speed); // Move back to the previous position
            }
        }

        if (moveLeft) {
            controls.moveRight(-speed);
            if (checkCollision(controls.getObject().position)) {
                controls.moveRight(speed); // Move back to the previous position
            }
        }

        if (moveRight) {
            controls.moveRight(speed);
            if (checkCollision(controls.getObject().position)) {
                controls.moveRight(-speed); // Move back to the previous position
            }
        }
    }

    updateTriangles()

    if (!roundOver&& !targets.length) {
      stopStopwatch();
      pauseMusic();
      console.log("Round Over");
      roundOver = true;
    }
}

function render() {
  renderer.render(scene, camera);
  drawText();
}

function drawText() {
  let targetText = targets.length + "/" + spec.num_targets + " Targets";
  let bulletText = bulletsFired + " Bullets";
  let timerText =  "Timer [" + stopwatch.time +"]";
  info.innerHTML = targetText + "&nbsp;&nbsp;&nbsp;&nbsp;" + bulletText + "&nbsp;&nbsp;&nbsp;&nbsp;" + timerText;
  let targetsText = targetsOn ? 'Targets On' : 'Targets Off';
  let buildingText = buildingsOn ? 'Buildings On' : 'Buildings Off';
  let treesText = treesOn ? 'Trees On' : 'Trees Off';
  let bushesText = bushesOn ? 'Bushes On' : 'Bushes Off';
  let bouldersText = bouldersOn ? 'Boulders On' : 'Boulders Off';
  let lightText = lightHelperOn ? 'Light Helper On' : 'Light Helper Off';
  let cameraText = cameraHelperOn ? 'Camera Helper On' : 'Camera Helper Off';
  let gridText = gridHelperOn ? 'Grid Helper On' : 'Grid Helper Off';
  let space = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
  statusbar.innerHTML = targetsText + space + buildingText + space + treesText + space + bushesText + space + bouldersText + space + lightText + space + cameraText + space + gridText;
  muted.innerHTML = mute ? '[muted]' : '';
}


function gameloop() {
  requestAnimationFrame(gameloop);
  if (options.run) {
    if (options.update) {
      update();
    }
    if (options.render) {
      render();
    }
  }
  stats.update();
}

gameloop();
console.log("Number of Triangles :", renderer.info.render.triangles);

function fireBullet() {
    createBullet(0.02, 16, 16, 0xD80000); // original values: 0.05, 16, 16, 0xADD8E6
    if (!roundOver) bulletsFired++;
}

function createBullet(radius, widthSegments, heightSegments, color) {
    // https://threejs.org/docs/#api/en/geometries/SphereGeometry
    var geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);
    var material = new THREE.MeshBasicMaterial({ color: color });
    var particle = new THREE.Mesh(geometry, material);
    particle.position.copy(camera.position);
    particle.initialDirection = camera.getWorldDirection(new THREE.Vector3());
    particle.velocity = particle.initialDirection.clone().multiplyScalar(0.25);
    scene.add(particle);
    particles.push(particle);
}

function updateParticles() {
    var distanceThreshold = spec.map_size;

    for (var i = particles.length - 1; i >= 0; i--) {
        var particle = particles[i];
        particle.position.add(particle.velocity);

        var distance = particle.position.distanceTo(camera.position);
        if (distance > distanceThreshold) {
            removeParticle(particle);
        }
    }
}

function removeParticle(particle) {
    scene.remove(particle);
    particles.splice(particles.indexOf(particle), 1);
}

function onMouseDown(event) {
    event.preventDefault();

    if (controls.isLocked) {
        // Particle creation is allowed only when controls are locked
        if (event.button === 0) {
            fireBullet();
            playBulletSound();
        }
    }
}

function onMouseMove(event) {
    event.preventDefault();

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
}

document.addEventListener('mousedown', onMouseDown);
document.addEventListener('mousemove', onMouseMove, false);

var collidedParticles = 0;

var hasCubeMoved = false; // Flag to track if the target has already been moved

function checkParticleCollision() {
    for (var j = 0; j < targets.length; j++) {
        var target = targets[j];
        var isColliding = false;

        if (target.visible) {
            for (var i = 0; i < particles.length; i++) {
                var particle = particles[i];
                var particlePosition = particle.position;
                var particleEdge = particlePosition
                    .clone()
                    .add(particle.velocity.clone().normalize().multiplyScalar(0.1));

                raycaster.set(particlePosition, particleEdge.sub(particlePosition).normalize());
                var intersects = raycaster.intersectObject(target);

                if (intersects.length === 1) {
                    isColliding = true;
                    break;
                }
            }
        }

        if (isColliding) {
            explosion(target);
            removeTarget(target);
            hasCubeMoved = false; // Reset the flag when the target is hidden
        } else {
            if (collidedParticles === particles.length && !hasCubeMoved) {
                collidedParticles = 0; // Reset the collided particles counter
                hasCubeMoved = true; // Set the flag to indicate that the target has been moved
            }
        }
    }
}

function removeTarget(o) {
    scene.remove(o);
    targets.splice(targets.indexOf(o), 1);
    console.log("Remove", o.name, targets.length, o.material.color.getHex(), "pos", o.position, "scale", o.scale, o);
}

function repurposeTarget(o) {
    moveObjectRandomly(target);
    o.material.color.set(randomColorHex());
    o.scale.set(randomFloat(0.1, 2, 1), randomFloat(0.1, 2, 1), randomFloat(0.1, 2, 1));
}

function moveObjectRandomly(o) {
    var gridSize = spec.map_size; // Adjust the grid size as desired
    var randomX = Math.floor(Math.random() * gridSize) - gridSize / 2;
    var randomZ = Math.floor(Math.random() * gridSize) - gridSize / 2;
    o.position.x = randomX;
    o.position.z = randomZ;
    if (verbose) console.log(o.name, targets.length - 1, "0x" + o.material.color.getHex(), "pos", o.position, "scale", o.scale, o);
}

function explosion(target) {

    playExplosionSound();

    var explosionCount = 50;

    for (var i = 0; i < explosionCount; i++) {
        var triangle = createTriangle(target);
        scene.add(triangle);
        triangles.push(triangle); // Add the triangle to the triangles array

        triangle.userData = {
            direction: new THREE.Vector3(
                Math.random() * 2 - 1,
                Math.random() * 2 - 1,
                Math.random() * 2 - 1
            ).normalize(),
            speed: Math.random() * 0.05 + 0.01, // Random speed
            rotationAxis: new THREE.Vector3(
                Math.random(),
                Math.random(),
                Math.random()
            ).normalize(),
            rotationSpeed: Math.random() * 0.1 + 0.005, // Random rotation speed
            distance: 0, // Distance traveled by the triangle
            remove: false, // Flag to mark if the triangle should be removed
            parentTarget: target, // Reference to the collided target
        };
    }
}

function createTriangle(target) {
    var geometry = new THREE.BufferGeometry();
    var vertices = new Float32Array([
        -0.1, 0, 0,
        0.1, 0, 0,
        0, 0.1, 0
    ]);
    var indices = new Uint16Array([0, 1, 2]);

    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geometry.setIndex(new THREE.BufferAttribute(indices, 1));

    var material = new THREE.MeshBasicMaterial({ color: 0xffff00, side: THREE.DoubleSide });

    var triangle = new THREE.Mesh(geometry, material);

    triangle.position.copy(target.position);

    triangle.lookAt(camera.position);

    var scale = Math.random() * 1 + 0.5; // Adjust the scale range as desired
    triangle.scale.set(scale, scale, scale);

    return triangle;
}

function updateTriangles() {
    for (var i = 0; i < triangles.length; i++) {
        var triangle = triangles[i];
        var userData = triangle.userData;

        var speed = userData.speed;
        triangle.position.add(userData.direction.clone().multiplyScalar(speed));

        var rotationSpeed = userData.rotationSpeed;
        triangle.rotateOnWorldAxis(userData.rotationAxis, rotationSpeed);

        userData.distance += speed;

        if (userData.distance >= 2) {
            userData.remove = true;
        }
    }

    for (var i = triangles.length - 1; i >= 0; i--) {
        if (triangles[i].userData.remove) {
            scene.remove(triangles[i]);
            triangles.splice(i, 1);
        }
    }

    window.addEventListener('resize', function () {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}
