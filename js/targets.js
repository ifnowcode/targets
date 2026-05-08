// http://repo01.src.web/js/libs/three/r124/docs/#examples/en/controls/FirstPersonControls
// http://repo01/personal/dev/src/web/js/libs/three/r165/docs/?q=FlyControls#examples/en/controls/FlyControls

// Scripts "build/three.js" and "build/three.min.js" are deprecated with r150+, and will be removed with r160. Please use ES Modules or alternatives: https://threejs.org/docs/index.html#manual/en/introduction/Installation

// game objects
let targets = [];
let buildings = [];
let trees = [];
let bushes = [];
let boulders = [];

let verbose = false;

let lightHelperOn = true;
let cameraHelperOn = true;
let gridHelperOn = true;
var gridHelper = null;

let targetsOn = true;
let buildingsOn = true;
let treesOn = true;
let bushesOn = true;
let bouldersOn = true;

let roundOver = false;

let bulletsFired = 0;
let particles = [];
let triangles = [];

let mute = false;
let refresh = true;

let info = document.getElementById('info');
let statusbar = document.getElementById('status');
let muted = document.getElementById('mute');

var menu = document.getElementById('menu');
var instructions = document.getElementById('instructions');
var playButton = document.getElementById('playButton');

// StopWatch
const stopwatch = { elapsedTime: 0, time: "00:00:00:00" };

function startStopwatch() {
  console.log("Stopwatch started");
  //reset start time
  stopwatch.startTime = Date.now();
  //run `setInterval()` and save id
  stopwatch.intervalId = setInterval(() => {
    //calculate elapsed time
    const elapsedTime = Date.now() - stopwatch.startTime + stopwatch.elapsedTime;
    //calculate different time measurements based on elapsed time
    const milliseconds = parseInt((elapsedTime%1000)/10);
    const seconds = parseInt((elapsedTime/1000)%60);
    const minutes = parseInt((elapsedTime/(1000*60))%60);
    const hour = parseInt((elapsedTime/(1000*60*60))%24);
    //display time
    displayTime(hour, minutes, seconds, milliseconds);
  }, 100);
}

function stopStopwatch() {
  stopwatch.elapsedTime += Date.now() - stopwatch.startTime;
  clearInterval(stopwatch.intervalId);
  console.log("Stopwatch stopped");
}

function clearStopwatch() {
  stopwatch.elapsedTime = 0;
  stopwatch.startTime = Date.now();
  displayTime(0, 0, 0, 0);
  clearInterval(stopwatch.intervalId);
  console.log("Stopwatch cleared");
}

function displayTime(hour, minutes, seconds, milliseconds) {
  const leadZeroTime = [hour, minutes, seconds, milliseconds].map(time => time < 10 ? `0${time}` : time);
  stopwatch.time = leadZeroTime.join(':');
}

//
// Diagnostics
//

// stats
const stats = Stats();
document.body.appendChild(stats.dom);

// gui [https://github.com/dataarts/dat.gui]
const gui = new dat.GUI();
//gui.close();
const optionsFolder = gui.addFolder('Options');
const options = {
  run: true,
  update: true,
  render: true,
};
optionsFolder.add(options, "run");
optionsFolder.add(options, "update");
optionsFolder.add(options, "render");
//optionsFolder.open();

const spec = {
    map_size: 20,
    num_targets: 11,
    num_buildings: 20,
    num_trees: 10,
    num_bushes: 10,
    num_boulders: 10,
};
const specFolder = gui.addFolder('Specification');
specFolder.add(spec, "map_size", 10, 128, 1).name("Map Size");
specFolder.add(spec, "num_targets", 0, 200, 1).name("# Targets");
specFolder.add(spec, "num_buildings", 0, 200, 1).name("# Buildings");
specFolder.add(spec, "num_trees", 0, 200, 1).name("# Trees");
specFolder.add(spec, "num_bushes", 0, 200, 1).name("# Bushes");
specFolder.add(spec, "num_boulders", 0, 200, 1);
specFolder.open();

const helpersFolder = gui.addFolder('Helpers');
const helper = {
    light: function() {
        if (lightHelperOn) {
          scene.remove(lightHelper);
        } else {
          scene.add(lightHelper);
        }
        lightHelperOn = !lightHelperOn;
        console.log("Light Helper", lightHelperOn);
    },
    camera: function() {
        if (cameraHelperOn) {
          scene.remove(cameraHelper);
        } else {
          scene.add(cameraHelper);
        }
        cameraHelperOn = !cameraHelperOn;
        console.log("Camera Helper", cameraHelperOn);
    },
    grid: function() {
        if (gridHelperOn) {
          scene.remove(gridHelper);
        } else {
          scene.add(gridHelper);
        }
        gridHelperOn = !gridHelperOn;
        console.log("Grid Helper", gridHelperOn);
    },
};
helpersFolder.add(helper, "light");
helpersFolder.add(helper, "camera");
helpersFolder.add(helper, "grid");
helpersFolder.open();

const objectsFolder = gui.addFolder('Objects');
console.log("targetsOn", targetsOn);
const objects = {
  targets: function() {
    if (targetsOn) {
      for (let i = 0; i < targets.length; i++) {
        scene.remove(targets[i]);
      }
    } else {
      for (let i = 0; i < targets.length; i++) {
        scene.add(targets[i]);
      }
    }
    targetsOn = !targetsOn;
    console.log("Targets", onoff[targetsOn]);
  },
  buildings: function() {
    if (buildingsOn) {
      for (let i = 0; i < buildings.length; i++) {
        scene.remove(buildings[i]);
      }
    } else {
      for (let i = 0; i < buildings.length; i++) {
        scene.add(buildings[i]);
      }
    }
    buildingsOn = !buildingsOn;
    console.log("Buildings", onoff[buildingsOn]);
  },
  trees: function() {
    if (treesOn) {
      for (let i = 0; i < trees.length; i++) {
        scene.remove(trees[i]);
      }
    } else {
      for (let i = 0; i < trees.length; i++) {
        scene.add(trees[i]);
      }
    }    treesOn = !treesOn;
    console.log("Trees", onoff[treesOn]);
  },
  bushes: function() {
    if (bushesOn) {
      for (let i = 0; i < bushes.length; i++) {
        scene.remove(bushes[i]);
      }
    } else {
      for (let i = 0; i < bushes.length; i++) {
        scene.add(bushes[i]);
      }
    }
    bushesOn = !bushesOn;
    console.log("Bushes", onoff[bushesOn]);
  },
  boulders: function() {
    if (bouldersOn) {
      for (let i = 0; i < boulders.length; i++) {
        scene.remove(boulders[i]);
      }
    } else {
      for (let i = 0; i < boulders.length; i++) {
        scene.add(boulders[i]);
      }
    }
    bouldersOn = !bouldersOn
    console.log("Boulders", onoff[bouldersOn]);
  },
};
objectsFolder.add(objects, "targets");
objectsFolder.add(objects, "buildings");
objectsFolder.add(objects, "trees");
objectsFolder.add(objects, "bushes");
objectsFolder.add(objects, "boulders");
objectsFolder.open();

const timerFolder = gui.addFolder('Timer');
const watch = {
    start: function() {
        startStopwatch();
    },
    stop: function() {
        stopStopwatch();
    },
    clear: function() {
        clearStopwatch();
    },
};
timerFolder.add(watch, "start");
timerFolder.add(watch, "stop");
timerFolder.add(watch, "clear");
//timerFolder.open();

const commandFolder = gui.addFolder('Commands');
const commands = {
    lock: function() {
        lock();
    },
    unlock: function() {
        unlock();
    },
    control_lock: function() {
        controls.lock();
    },
};
commandFolder.add(commands, "lock");
commandFolder.add(commands, "unlock");
commandFolder.add(commands, "control_lock").name("lock controls");
//commandFolder.open();

//
// Lights, Camera, Action
//

// https://threejs.org/docs/#manual/en/introduction/Creating-a-scene
// https://discoverthreejs.com/book/first-steps/first-scene/

// Scene
var scene = new THREE.Scene();

// Light
// https://stackoverflow.com/questions/10742149/how-to-create-directional-light-shadow-in-three-js
const directional = new THREE.DirectionalLight(0xffffff, 10);
directional.position.set(10, 10, 10);
//directional.position.set(0, 2, 2);
directional.target.position.set(0, 0, 0);
directional.castShadow = true;
//Set up shadow properties for the light

directional.shadow.camera.near = 0.5; // default
directional.shadow.camera.far = 500; // default

directional.shadowDarkness = 0.5;
directional.shadowCameraVisible = true; // only for debugging
// these six values define the boundaries of the yellow box seen above
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
//const ambient = new THREE.AmbientLight( 0x404040 ); // soft white
scene.add( light );

// Camera
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
//camera.position.set(0, 0.3, 3); // Set camera position 0.1 units above the grid
const cameraHelper = new THREE.CameraHelper(camera);
if (cameraHelperOn) scene.add(cameraHelper);

// Create the renderer
// https://get.webgl.org/webgl2/enable.html
// https://www.geeksforgeeks.org/how-to-enable-webgl-on-chrome/#
var renderer = new THREE.WebGLRenderer({ alpha: true, depth: true, antialias: false });
// Configure renderer settings
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
var mouse = new THREE.Vector2();

// Gravity effect variables (not used yet)
var gravity = new THREE.Vector3(0, -0.01, 0); // Adjust the gravity strength as needed
var maxGravityDistance = 2; // Adjust the maximum distance affected by gravity as needed

// Add PointerLockControls (menu lock/unlock)
// https://github.com/mrdoob/three.js/blob/master/examples/jsm/controls/PointerLockControls.js
// https://developer.mozilla.org/en-US/docs/Web/API/Document/pointerlockchange_event
// http://repo01/personal/dev/src/web/js/libs/three/r165/docs/?q=PointerLockControls#examples/en/controls/PointerLockControls.moveForward
var controls = new THREE.PointerLockControls(camera, document.body);

//
// Terrain
//

// Create a plane geometry with the same size as the grid
var planeGeometry = new THREE.PlaneGeometry(spec.map_size, spec.map_size);

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

//
// Objects
//

// https://stackoverflow.com/questions/33776630/how-to-check-whether-an-object-is-present-in-the-scene-or-not-in-three-js
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
    // restart
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

    // reset timer
    clearStopwatch();
    //startStopwatch();

    pauseMusic();

    //camera.lookAt(targets[0].position);
    camera.lookAt(0, 0, 0);
    camera.position.set(0, 0.3, 3);

    // reset variables
    roundOver = false;
    bulletsFired = 0;

    // Create targets
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

    // Create a grid helper
    if (gridHelper!= null) gridHelper.dispose();
    gridHelper = new THREE.GridHelper(spec.map_size, spec.map_size);
    // Set the color of the grid lines to white
    gridHelper.material.color.set(0xffffff);
    if (gridHelperOn) scene.add(gridHelper);

    // Create Buildings
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

    // Create Trees
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

    // Create Bushes
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

    // Create Boulders
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

// so we an restart the game all variables that need resetting go in initialize
initialize();

scene.add(controls.getObject());

addEventListener("pointerlockchange", (event) => {
  if (document.pointerLockElement)
    console.log("The pointer is locked to: ", document.pointerLockElement);
  else {
    console.log("The pointer is not locked");
  }
});

// Set up pointer lock controls
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

// Keyboard controls
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

const raycasterForward = new THREE.Raycaster();
const raycasterBackward = new THREE.Raycaster();
const raycasterLeft = new THREE.Raycaster();
const raycasterRight = new THREE.Raycaster();
const collisionDistance = 0.2; // Adjust based on your needs

function checkObjectCollsions() {
    const directionForward = new THREE.Vector3();
    const directionBackward = directionForward.clone().negate();
    const directionLeft = directionForward.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2);
    const directionRight = directionForward.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), -Math.PI / 2);
    
    // Update directionForward to match camera's forward direction
    camera.getWorldDirection(directionForward);

    // Set the raycaster to start at the camera's position
    raycasterForward.set(camera.position, directionForward);
    raycasterBackward.set(camera.position, directionBackward);
    raycasterLeft.set(camera.position, directionLeft);
    raycasterRight.set(camera.position, directionRight);

    // Perform the raycast
    const intersectsForward = raycasterForward.intersectObjects(buildings);
    const intersectsBackward = raycasterBackward.intersectObjects(buildings);
    const intersectsLeft = raycasterLeft.intersectObjects(buildings);
    const intersectsRight = raycasterRight.intersectObjects(buildings);

    if (moveForward && (intersectsForward.length === 0 || intersectsForward[0].distance > collisionDistance)) {
        controls.getObject().position.addScaledVector(directionForward, 0.1);
    }

    if (moveBackward && (intersectsBackward.length === 0 || intersectsBackward[0].distance > collisionDistance)) {
        controls.getObject().position.addScaledVector(directionBackward, 0.1);
    }

    if (moveLeft && (intersectsLeft.length === 0 || intersectsLeft[0].distance > collisionDistance)) {
        controls.getObject().position.addScaledVector(directionLeft, 0.1);
    }

    if (moveRight && (intersectsRight.length === 0 || intersectsRight[0].distance > collisionDistance)) {
        controls.getObject().position.addScaledVector(directionRight, 0.1);
    }

    // Check for collisions
    //if (intersectsForward.length > 0 && intersectsForward[0].distance < collisionDistance) {
    //    console.log('Collision detected');
    //    return true;
        // Handle collision (e.g., stop movement, bounce back, etc.)
    //}
    //return false;
}

// Check collision with the grid
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
    
    //checkObjectCollsions()
    
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

// Mouse click event listener
document.addEventListener('mousedown', onMouseDown);
document.addEventListener('mousemove', onMouseMove, false);

// Declare a variable to count collided particles
var collidedParticles = 0;

var hasCubeMoved = false; // Flag to track if the target has already been moved

// Check collision between particles and targets
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
                    // Particle collided with the target
                    isColliding = true;
                    break;
                }
            }
        }

        // Set target color and visibility based on collision status
        if (isColliding) {
            // Cube is red during collision
            //target.material.color.set(0xff0000);
            explosion(target);
            //repurposeTarget(target);
            removeTarget(target);
            //let o = addRandomCube();
            //console.log("Add Cube", targets.length, o.material.color.getHex(), "pos", o.position, "scale", o.scale, o);
            //console.log("Cubes", targets)
            hasCubeMoved = false; // Reset the flag when the target is hidden
        } else {
            // Cube is green when there is no collision
            //target.material.color.set(0x00ff00);

            // Check if all particles have been removed and the target has not moved
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
    //o.material.color.setHex(randomInt(0, 0xffff));
    o.material.color.set(randomColorHex());
    o.scale.set(randomFloat(0.1, 2, 1), randomFloat(0.1, 2, 1), randomFloat(0.1, 2, 1));
}

// Move the target to a random location on the grid
function moveObjectRandomly(o) {
    var gridSize = spec.map_size; // Adjust the grid size as desired
    var randomX = Math.floor(Math.random() * gridSize) - gridSize / 2;
    var randomZ = Math.floor(Math.random() * gridSize) - gridSize / 2;
    o.position.x = randomX;
    o.position.z = randomZ;
    if (verbose) console.log(o.name, targets.length - 1, "0x" + o.material.color.getHex(), "pos", o.position, "scale", o.scale, o);
}

// Create an explosion of small triangles
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


// Create a small triangle
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

    // Set initial position at the center of the collided target
    triangle.position.copy(target.position);

    // Set the rotation to face the camera
    triangle.lookAt(camera.position);

    // Set random scale
    var scale = Math.random() * 1 + 0.5; // Adjust the scale range as desired
    triangle.scale.set(scale, scale, scale);

    return triangle;
}


// Update the triangles' positions, rotations, and remove them if necessary
function updateTriangles() {
    for (var i = 0; i < triangles.length; i++) {
        var triangle = triangles[i];
        var userData = triangle.userData;

        // Move the triangle in its direction at a random speed
        var speed = userData.speed;
        triangle.position.add(userData.direction.clone().multiplyScalar(speed));

        // Rotate the triangle around its rotation axis at a random speed
        var rotationSpeed = userData.rotationSpeed;
        triangle.rotateOnWorldAxis(userData.rotationAxis, rotationSpeed);

        // Update the distance traveled by the triangle
        userData.distance += speed;

        // If the triangle has traveled a certain distance, mark it for removal
        if (userData.distance >= 2) {
            userData.remove = true;
        }
    }

    // Remove triangles that are marked for removal
    for (var i = triangles.length - 1; i >= 0; i--) {
        if (triangles[i].userData.remove) {
            scene.remove(triangles[i]);
            triangles.splice(i, 1);
        }
    }

    // Resize renderer when window size changes
    window.addEventListener('resize', function () {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

// Create an AudioContext
var audioContext = null;
var musicBuffer = null;
var laserSoundBuffer = null;
var explosionSoundBuffer = null;
var isMusicPlaying = false;
var musicSource = null;

// Function to load audio files
function loadAudioFile(url, callback) {
    // BUG: beause this is async pause/play can break
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.responseType = 'arraybuffer';

    request.onload = function () {
        audioContext.decodeAudioData(request.response, function (buffer) {
            callback(buffer);
        });
    };

    request.send();
}

// Function to play the music
function playMusic() {
    console.log("enter playMusic", isMusicPlaying);
    console.log("Context", audioContext);
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    console.log("musicBuffer", musicBuffer);
    if (!musicBuffer) {
        console.log("Loading audio file");
        loadAudioFile('./assets/audio/first-person-shooter-music.wav', function (buffer) {
            console.log("loaded audio file");
            isMusicPlaying = true;
            musicBuffer = buffer;
            playLoopedSound(buffer, .35);
        });
    } else {
        if (!isMusicPlaying) {
            resumeMusic();
        } else {
            //pauseMusic();
        }
    }
    console.log("exit playMusic");
}

// Function to play a sound in a loop with a specific volume
function playLoopedSound(buffer, volume) {
    musicSource = audioContext.createBufferSource();
    musicSource.buffer = buffer;
    musicSource.loop = true; // Enable looping
    var gainNode = audioContext.createGain();
    gainNode.gain.setValueAtTime(0, audioContext.currentTime); // Set initial volume to 0
    gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 2); // Gradually increase volume to desired level (adjust time as needed)
    musicSource.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Delay the start of the audio source
    musicSource.start(audioContext.currentTime + 0.1); // Adjust the delay as needed

    // Note: You can adjust the delay time and volume ramping to find the appropriate values that work best for your audio files.
}

// Function to pause the music
function pauseMusic() {
    console.log("pause sound", isMusicPlaying, "source", musicSource);
    if (musicSource) {
        musicSource.stop();
        musicSource.disconnect();
        musicSource = null;
    }
    isMusicPlaying = false;
    console.log("pausing music", isMusicPlaying);
}

// Function to resume the music
function resumeMusic() {
    console.log("resume sound", isMusicPlaying, "buffer", musicBuffer);
    if (musicBuffer) {
        playLoopedSound(musicBuffer, .35);
    }
    console.log("resuming music", isMusicPlaying);
    isMusicPlaying = true;
}

// Function to play the laser sound
function playBulletSound() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    if (!laserSoundBuffer) {
        loadAudioFile('./assets/audio/laser.wav', function (buffer) {
            laserSoundBuffer = buffer;
            playSound(buffer, 1);
        });
    } else {
        playSound(laserSoundBuffer, 1);
    }
}

// Function to play the explosion sound
function playExplosionSound() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    if (!explosionSoundBuffer) {
        loadAudioFile('./assets/audio/explosion.wav', function (buffer) {
            explosionSoundBuffer = buffer;
            playSound(buffer, 0.25); // Adjust the volume here (0.5 = 50% volume)
        });
    } else {
        playSound(explosionSoundBuffer, 0.25); // Adjust the volume here (0.5 = 50% volume)
    }
}

// Function to play a sound with a specific volume
function playSound(buffer, volume) {
    var source = audioContext.createBufferSource();
    var gainNode = audioContext.createGain();
    gainNode.gain.value = volume;

    source.buffer = buffer;
    source.connect(gainNode);
    gainNode.connect(audioContext.destination);
    source.start(0);
}

// Event listener for key press
document.addEventListener('keydown', function (event) {
    if (event.code === 'KeyM') {
        mute = !mute;
        console.log("Mute", mute);
        if (mute && isMusicPlaying) {
          pauseMusic();
        } else {
          if (!isMusicPlaying) {
            resumeMusic();
          }
        }
    }
    if (event.code === 'KeyR') {
      restart();
    }
    if (event.code === 'KeyK') {
        for (var j = 0; j < targets.length; j++) {
            var target = targets[j];
            explosion(target);
            removeTarget(target);
        }
    }
    if (event.code === 'KeyB') {
        if (controls.isLocked) {
            event.preventDefault(); // Prevent default action of spacebar
            fireBullet();
            playBulletSound();
        }
    }
    if (event.code === 'Space') {
    } 
    
    if (event.code === 'KeyC') {
        playExplosionSound();
    }
    if (event.key === 'v' || event.key === 'V') {
        playBulletSound();
    }
});
