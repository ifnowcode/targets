import {Game, StopWatch, randomInt, randomFloat, randomColorHex} from './game3d.js';

class Targets extends Game {
  constructor() {
    super();
    this.targetsOn = true;
    this.buildingsOn = true;
    this.treesOn = true;
    this.bushesOn = true;
    this.bouldersOn = true;
    
    // game objects
    this.particles = [];
    this.triangles = [];
    this.numTargets = 10;
    this.targets = [];
    this.numBuildings = 20;
    this.buildings = [];
    this.numTrees = 10;
    this.trees = [];
    this.numBushes = 10;
    this.bushes = [];
    this.numBoulders = 10;
    this.boulders = [];

    // options gui
    const objectsFolder = this.gui.addFolder('Objects');
    const objects = {
      targets: (function() {
        if (this.targetsOn) {
          for (let i = 0; i < this.targets.length; i++) {
            this.scene.remove(this.targets[i]);
          }
        } else {
          for (let i = 0; i < this.targets.length; i++) {
            this.scene.add(this.targets[i]);
          }
        }  
        this.targetsOn = !this.targetsOn;
        console.log("Targets", onoff[this.targetsOn]);
      }).bind(this),
      buildings: (function() {
        if (this.buildingsOn) {
          for (let i = 0; i < this.buildings.length; i++) {
            this.scene.remove(this.buildings[i]);
          }
        } else {
          for (let i = 0; i < this.buildings.length; i++) {
            this.scene.add(this.buildings[i]);
          }
        }
        this.buildingsOn = !this.buildingsOn;
        console.log("Buildings", onoff[this.buildingsOn]);
      }).bind(this),
      trees: (function() {
        if (this.treesOn) {
          for (let i = 0; i < this.trees.length; i++) {
            this.scene.remove(this.trees[i]);
          }
        } else {
          for (let i = 0; i < this.trees.length; i++) {
            this.scene.add(this.trees[i]);
          }
        }
        this.treesOn = !this.treesOn;
        console.log("Trees", onoff[this.treesOn]);
      }).bind(this),
      bushes: (function() {
        if (this.bushesOn) {
          for (let i = 0; i <this. bushes.length; i++) {
            this.scene.remove(this.bushes[i]);
          }
        } else {
          for (let i = 0; i < this.bushes.length; i++) {
            this.scene.add(this.bushes[i]);
          }
        }
        this.bushesOn = !this.bushesOn;
        console.log("Bushes", onoff[this.bushesOn]);
      }).bind(this),
      boulders: (function() {
        if (this.bouldersOn) {
          for (let i = 0; i < this.boulders.length; i++) {
            this.scene.remove(this.boulders[i]);
          }
        } else {
          for (let i = 0; i < this.boulders.length; i++) {
           this. scene.add(this.boulders[i]);
          }
        }
        this.bouldersOn = !this.bouldersOn;
        console.log("Boulders", onoff[this.bouldersOn]);
      }).bind(this),
    }
    objectsFolder.add(objects, "targets");
    objectsFolder.add(objects, "buildings");
    objectsFolder.add(objects, "trees");
    objectsFolder.add(objects, "bushes");
    objectsFolder.add(objects, "boulders");
    objectsFolder.open();

    this.stopwatch = new StopWatch();
    
    // Create an AudioContext
    this.audioContext = null;
    this.musicBuffer = null;
    this.laserSoundBuffer = null;
    this.explosionSoundBuffer = null;
    this.isMusicPlaying = false;
    this.musicSource = null;

    // Keyboard controls
    this.moveForward = false;
    this.moveBackward = false;
    this.moveLeft = false;
    this.moveRight = false;

    this.info = document.getElementById('info');
    this.statusbar = document.getElementById('status');
    this.muted = document.getElementById('mute');
    this.roundOver = false;
    this.bulletsFired = 0;
    this.mute = false;

    // Declare a variable to count collided particles
    this.collidedParticles = 0;
    this.hasCubeMoved = false; // Flag to track if the target has already been moved

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    
    // Gravity effect variables
    this.gravity = new THREE.Vector3(0, -0.01, 0); // Adjust the gravity strength as needed
    this.maxGravityDistance = 2; // Adjust the maximum distance affected by gravity as needed
    // Add PointerLockControls
    this.controls = new THREE.PointerLockControls(this.camera, document.body);
    // Create a grid
    this.gridHelper = new THREE.GridHelper(20, 20);
    // Set the color of the grid lines to white
    this.gridHelper.material.color.set(0xffffff);
    this.scene.add(this.gridHelper);
    // Create a plane geometry with the same size as the grid
    this.planeGeometry = new THREE.PlaneGeometry(20, 20);
    // Create a blue material
    this.blueMaterial = new THREE.MeshBasicMaterial({
        color: 0x0000ff,
        side: THREE.DoubleSide
    });
    // Create a plane mesh with the geometry and material
    this.planeMesh = new THREE.Mesh(this.planeGeometry, this.blueMaterial);
    // Rotate the grid by 90 degrees
    this.planeMesh.rotation.x = Math.PI / 2;
    // Set the position of the plane to align with the grid
    this.planeMesh.position.copy(this.gridHelper.position);
    this.scene.add(this.planeMesh);
    
    this.initialize();
    
    // Set up pointer lock controls
    this.menu = document.getElementById('menu');
    this.instructions = document.getElementById('instructions');
    this.playButton = document.getElementById('playButton');

    this.playButton.addEventListener('click', (function () {
        this.controls.lock();
    }).bind(this));

    this.controls.addEventListener('lock', (function () {
        this.instructions.style.display = 'none';
        this.menu.style.display = 'none';
        document.getElementById('crosshair').style.display = 'block'; // Show the crosshair when screen is locked
        console.log("Lock");
        if (this.targets.length) this.stopwatch.start();
        if (!this.mute && !this.roundOver) this.playMusic();
    }).bind(this));

    this.controls.addEventListener('unlock', (function () {
        this.menu.style.display = 'block';
        this.instructions.style.display = '';
        document.getElementById('crosshair').style.display = 'none'; // Hide the crosshair when screen is unlocked
        console.log("Unlock");
        if (this.targets.length) this.stopwatch.stop();
        if (this.isMusicPlaying) this.pauseMusic();
    }).bind(this));

    this.scene.add(this.controls.getObject());
  }


  initialize() {
    // Set camera to face target position
    //this.camera.lookAt(targets[0].position);
    this.camera.lookAt(0, 0, 0);
    
    this.roundOver = false;
    this.bulletsFired = 0;
    
    // Create targets
    for (let i = 0; i < this.numTargets; i++) {
      let o;
      if (randomInt(0,1) == 0) {
        o = this.addRandomCube(randomColorHex());
      } else {
        o = this.addRandomSphere(randomColorHex());
      }
      this.moveObjectRandomly(o);
      this.targets.push(o);
      if (this.targetsOn) this.scene.add(o);
    }

    // Create Buildings
    for (let i = 0; i < this.numBuildings; i++) {
      let w = randomInt(1,3), h = randomInt(1,6), d = randomInt(1,3);
      let geometry = new THREE.BoxGeometry(w, h, d);
      let material = new THREE.MeshBasicMaterial({ color: 0x000066 });
      let o = new THREE.Mesh(geometry, material);
      o.name = "Building";
      o.position.set(0, 0.5, 0); // Set target position 0.5 units above the grid
      this.buildings.push(o);
      this.moveObjectRandomly(o);
      if (this.buildingsOn) this.scene.add(o);
    }
    
    // Create Trees
    for (let i = 0; i < this.numTrees; i++) {
      let r = randomFloat(0.1, 0.7, 1), h = randomFloat(0.5, 2, 1), rs = randomInt(4, 8);
      let geometry = new THREE.ConeGeometry( r, h, 32 );
      let material = new THREE.MeshBasicMaterial( {color: 0x008800} );
      let o = new THREE.Mesh(geometry, material );
      o.name = "Tree";
      o.position.set(0, h / 2, 0); // Set target position 0.5 units above the grid
      this.trees.push(o);
      this.moveObjectRandomly(o);
      if (this.treesOn) this.scene.add(o);
    }

    // Create Bushes
    for (let i = 0; i < this.numBushes; i++) {
      let rt = randomFloat(0.01, 0.2, 1), rb = randomFloat(0.2, 0.4, 1), h = randomFloat(0.2, 0.4, 1), rs = randomInt(4, 8);
      let geometry = new THREE.CylinderGeometry( rt, rb, h, rs ); 
      let material = new THREE.MeshBasicMaterial( {color: 0x004400} );
      let o = new THREE.Mesh(geometry, material );
      o.name = "Bush";
      o.position.set(0, h / 2, 0); // Set target position 0.5 units above the grid
      this.bushes.push(o);
      this.moveObjectRandomly(o);
      if (this.bushesOn) this.scene.add(o);
    }

    // Create Boulders
    for (let i = 0; i < this.numBoulders; i++) {
      let r = randomFloat(0.1, 0.7, 1), d = randomInt(1, 5);
      let geometry = new THREE.TetrahedronGeometry( r, d );  // 0.2, 1, 32
      let material = new THREE.MeshBasicMaterial( {color: 0x333333} );
      let o = new THREE.Mesh(geometry, material );
      o.name = "Boulder";
      o.position.set(0, r/2, 0); // Set target position 0.5 units above the grid
      this.boulders.push(o);
      this.moveObjectRandomly(o);
      if (this.bouoldersOn) this.scene.add(o);
    }
  }
  
  isObjectInScene(scene, object) {
    let current_object = object;
    while(current_object.parent !== null) {
      current_object = current_object.parent;
      if(current_object === scene) {
        return true;
      }
    }
    return false;
  }

  createRandomSphere(color) {
    let r = randomFloat(0.1, 0.6, 2), ws = randomInt(3, 32), hs = randomInt(3, 32);
    let geometry = new THREE.SphereGeometry(r, ws, hs);
    let material = new THREE.MeshBasicMaterial({ color: color });
    let o = new THREE.Mesh(geometry, material);
    o.name = "Sphere";
    return o;
  }

  addRandomSphere(color) {
    console.log("Moues Down", event);
    let o = this.createRandomSphere(color);
    let x = randomFloat(o.geometry.parameters.radius/2, 2, 2);
    o.position.set(0, x, 0); // Set target position 0.5 units above the grid
    return o;
  }


  createRandomCube(color) {
    let w = randomFloat(0.1, 1, 1), h = randomFloat(0.1, 1, 1), d = randomFloat(0.1, 1, 1);
    let geometry = new THREE.BoxGeometry(w, h, d, 2, 2, 2);
    let material = new THREE.MeshBasicMaterial({ color: color });
    let o = new THREE.Mesh(geometry, material);
    o.name = "Cube";
    return o;
  }

  addRandomCube(color) {
    console.log("Moues Down", event);
    let o = this.createRandomCube(color);
    let x = randomFloat(o.geometry.parameters.height/4, 2, 2);
    o.position.set(0, x, 0); // Set target position 0.5 units above the grid
    return o;
  }

  // Check collision with the grid
  checkCollision(position) {
      var gridSize = 20;
      var halfGridSize = gridSize / 2;
      var margin = 0.1;

      if (
          position.x < -halfGridSize + margin ||
          position.x > halfGridSize - margin ||
          position.z < -halfGridSize + margin ||
          position.z > halfGridSize - margin
      ) {
          return true; // Collision detected
      }

      return false; // No collision
  }

  update() {
    
    this.updateParticles();
    
    this.checkParticleCollision();
    
    if (this.controls.isLocked) {
      var delta = 0.03;
      if (this.moveForward) {
        this.controls.moveForward(delta);
        if (this.checkCollision(this.controls.getObject().position)) {
            this.controls.moveForward(-delta); // Move back to the previous position
        }
      }
      if (this.moveBackward) {
        this.controls.moveForward(-delta);
        if (this.checkCollision(this.controls.getObject().position)) {
            this.controls.moveForward(delta); // Move back to the previous position
        }
      }
      if (this.moveLeft) {
        this.controls.moveRight(-delta);
        if (this.checkCollision(this.controls.getObject().position)) {
            this.controls.moveRight(delta); // Move back to the previous position
        }
      }
      if (this.moveRight) {
        this.controls.moveRight(delta);
        if (this.checkCollision(this.controls.getObject().position)) {
            this.controls.moveRight(-delta); // Move back to the previous position
        }
      }
    }

    this.updateTriangles()

    if (!this.roundOver&& !this.targets.length) {
      this.stopwatch.stop();
      this.pauseMusic();
      console.log("Round Over");
      this.roundOver = true;
    }
  }

  render() {
    this.renderer.render(this.scene, this.camera);
    this.drawText();
  }
  
  drawText() {
    let targetText = this.targets.length + "/" + this.numTargets + " Targets";
    let bulletText = this.bulletsFired + " Bullets";
    let timerText =  "Timer [" + this.stopwatch.get_time() +"]";
    info.innerHTML = targetText + "&nbsp;&nbsp;&nbsp;&nbsp;" + bulletText + "&nbsp;&nbsp;&nbsp;&nbsp;" + timerText;
    let targetsText = this.targetsOn ? 'Targets On' : 'Targets Off';
    let buildingText = this.buildingsOn ? 'Buildings On' : 'Buildings Off';
    let treesText = this.treesOn ? 'Trees On' : 'Trees Off';
    let bushesText = this.bushesOn ? 'Bushes On' : 'Bushes Off';
    let bouldersText = this.bouldersOn ? 'Boulders On' : 'Boulders Off';
    let space = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
    this.statusbar.innerHTML = targetsText + space + buildingText + space + treesText + space + bushesText + space + bouldersText;
    this.muted.innerHTML = this.mute ? '[muted]' : '';
  }

  fireBullet() {
    this.createBullet(0.02, 16, 16, 0xD80000); // original values: 0.05, 16, 16, 0xADD8E6
    if (!this.roundOver) this.bulletsFired++;
  }

  removeParticle(particle) {
      this.scene.remove(particle);
      this.particles.splice(this.particles.indexOf(particle), 1);
  }


  createBullet(radius, widthSegments, heightSegments, color) {
      // https://threejs.org/docs/#api/en/geometries/SphereGeometry
      var geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);
      var material = new THREE.MeshBasicMaterial({ color: color });
      var particle = new THREE.Mesh(geometry, material);
      particle.position.copy(this.camera.position);
      particle.initialDirection = this.camera.getWorldDirection(new THREE.Vector3());
      particle.velocity = particle.initialDirection.clone().multiplyScalar(0.25);
      this.scene.add(particle);
      this.particles.push(particle);
  }

  updateParticles() {
      var distanceThreshold = 20;

      for (var i = this.particles.length - 1; i >= 0; i--) {
          var particle = this.particles[i];
          particle.position.add(particle.velocity);

          var distance = particle.position.distanceTo(this.camera.position);
          if (distance > distanceThreshold) {
              this.removeParticle(particle);
          }
      }
  }

  // Check collision between particles and targets
  checkParticleCollision() {
    for (var j = 0; j < this.targets.length; j++) {
      var target = this.targets[j];
      var isColliding = false;

    if (target.visible) {
        for (var i = 0; i < this.particles.length; i++) {
          var particle = this.particles[i];
          var particlePosition = particle.position;
          var particleEdge = particlePosition
            .clone()
            .add(particle.velocity.clone().normalize().multiplyScalar(0.1));

          this.raycaster.set(particlePosition, particleEdge.sub(particlePosition).normalize());
          var intersects = this.raycaster.intersectObject(target);

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
        this.explosion(target);
        //repurposeTarget(target);
        this.removeTarget(target);
        //let o = addRandomCube();
        //console.log("Add Cube", targets.length, o.material.color.getHex(), "pos", o.position, "scale", o.scale, o);
        //console.log("Cubes", targets)
        this.hasCubeMoved = false; // Reset the flag when the target is hidden
      } else {
        // Cube is green when there is no collision
        //target.material.color.set(0x00ff00);

        // Check if all particles have been removed and the target has not moved
        if (this.collidedParticles === this.particles.length && !this.hasCubeMoved) {
          this.collidedParticles = 0; // Reset the collided particles counter
          this.hasCubeMoved = true; // Set the flag to indicate that the target has been moved
        }
      }
    }
  }

  removeTarget(o) {
      this.scene.remove(o);
      this.targets.splice(this.targets.indexOf(o), 1);
      console.log("Remove", o.name, this.targets.length, o.material.color.getHex(), "pos", o.position, "scale", o.scale, o);
  }

  repurposeTarget(o) {
      moveObjectRandomly(target);
      //o.material.color.setHex(randomInt(0, 0xffff));
      o.material.color.set(randomColorHex());
      o.scale.set(randomFloat(0.1, 2, 1), randomFloat(0.1, 2, 1), randomFloat(0.1, 2, 1));
  }

  // Move the target to a random location on the grid
  moveObjectRandomly(o) {
      var gridSize = 20; // Adjust the grid size as desired
      var randomX = Math.floor(Math.random() * gridSize) - gridSize / 2;
      var randomZ = Math.floor(Math.random() * gridSize) - gridSize / 2;
      o.position.x = randomX;
      o.position.z = randomZ;
      console.log(o.name, this.targets.length - 1, "0x" + o.material.color.getHex(), "pos", o.position, "scale", o.scale, o);
  }

  // Create an explosion of small triangles
  explosion(target) {

      this.playExplosionSound();

      var explosionCount = 50;

      for (var i = 0; i < explosionCount; i++) {
          var triangle = this.createTriangle(target);
          this.scene.add(triangle);
          this.triangles.push(triangle); // Add the triangle to the triangles array

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
  createTriangle(target) {
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
      triangle.lookAt(this.camera.position);

      // Set random scale
      var scale = Math.random() * 1 + 0.5; // Adjust the scale range as desired
      triangle.scale.set(scale, scale, scale);

      return triangle;
  }

  // Update the triangles' positions, rotations, and remove them if necessary
  updateTriangles() {
      for (var i = 0; i < this.triangles.length; i++) {
          var triangle = this.triangles[i];
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
      for (var i = this.triangles.length - 1; i >= 0; i--) {
          if (this.triangles[i].userData.remove) {
              this.scene.remove(this.triangles[i]);
              this.triangles.splice(i, 1);
          }
      }


      // Resize renderer when window size changes
      window.addEventListener('resize', (function () {
          this.camera.aspect = window.innerWidth / window.innerHeight;
          this.camera.updateProjectionMatrix();
          this.renderer.setSize(window.innerWidth, window.innerHeight);
      }).bind(this));
  }

  // Function to load audio files
  loadAudioFile(url, callback) {
      var request = new XMLHttpRequest();
      request.open('GET', url, true);
      request.responseType = 'arraybuffer';

      request.onload = (function () {
          //console.log("loadAudioFile", this.audioContext);
          this.audioContext.decodeAudioData(request.response, function (buffer) {
              callback(buffer);
          });
      }).bind(this);

      request.send();
  }

  // Function to play the music
  playMusic() {
      if (!this.audioContext) {
          this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      }
      
      //console.log("Audio Context", this.audioContext);

      if (!this.musicBuffer) {
          this.loadAudioFile('./assets/audio/first-person-shooter-music.wav', (function (buffer) {
              this.musicBuffer = buffer;
              this.playLoopedSound(buffer, .35);
              this.isMusicPlaying = true;
          }).bind(this));
      } else {
          if (this.isMusicPlaying) {
              this.pauseMusic();
          } else {
              this.resumeMusic();
          }
      }
  }

  // Function to play a sound in a loop with a specific volume
  playLoopedSound(buffer, volume) {
      this.musicSource = this.audioContext.createBufferSource();
      this.musicSource.buffer = buffer;
      this.musicSource.loop = true; // Enable looping
      var gainNode = this.audioContext.createGain();
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime); // Set initial volume to 0
      gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 2); // Gradually increase volume to desired level (adjust time as needed)
      this.musicSource.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      // Delay the start of the audio source
      this.musicSource.start(this.audioContext.currentTime + 0.1); // Adjust the delay as needed

      // Note: You can adjust the delay time and volume ramping to find the appropriate values that work best for your audio files.
  }

  // Function to pause the music
  pauseMusic() {
      if (this.musicSource) {
          this.musicSource.stop();
          this.musicSource.disconnect();
          this.musicSource = null;
      }
      this.isMusicPlaying = false;
  }

  // Function to resume the music
  resumeMusic() {
      if (this.musicBuffer) {
          this.playLoopedSound(this.musicBuffer, .35);
      }
      this.isMusicPlaying = true;
  }

  // Function to play the laser sound
  playBulletSound() {
      if (!this.audioContext) {
          this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      }
      //console.log("Audio Context", this.audioContext);

      if (!this.laserSoundBuffer) {
          this.loadAudioFile('./assets/audio/laser.wav', (function (buffer) {
              this.laserSoundBuffer = buffer;
              this.playSound(buffer, 1);
          }).bind(this));
      } else {
          this.playSound(this.laserSoundBuffer, 1);
      }
  }

  // Function to play the explosion sound
  playExplosionSound() {
      if (!this.audioContext) {
          this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      }
      
      //console.log("Audio Context", this.audioContext);

      if (!this.explosionSoundBuffer) {
          this.loadAudioFile('./assets/audio/explosion.wav', (function (buffer) {
              this.explosionSoundBuffer = buffer;
              this.playSound(buffer, 0.25); // Adjust the volume here (0.5 = 50% volume)
          }).bind(this));
      } else {
          this.playSound(this.explosionSoundBuffer, 0.25); // Adjust the volume here (0.5 = 50% volume)
      }
  }

  // Function to play a sound with a specific volume
  playSound(buffer, volume) {
      var source = this.audioContext.createBufferSource();
      var gainNode = this.audioContext.createGain();
      gainNode.gain.value = volume;

      source.buffer = buffer;
      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      source.start(0);
  }

  
  handleMouseDown(game, event) {
      //console.log("Moues Down", event);
      //event.preventDefault();
      if (game.controls.isLocked) {
          // Particle creation is allowed only when controls are locked
          if (event.button === 0) {
              game.fireBullet();
              game.playBulletSound();
          }
      }
  }

  handleMouseMove(game, event) {
      //console.log("Mouse Move", event);
      event.preventDefault();
      game.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      game.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      game.raycaster.setFromCamera(game.mouse, game.camera);
  }
  
  handleKeyUp(game, event) {  
      //console.log("Key Up", event);
      switch (event.keyCode) {
        case 38: // up arrow
        case 87: // W key
          game.moveForward = false;
          break;
        case 37: // left arrow
        case 65: // A key
          game.moveLeft = false;
          break;
        case 40: // down arrow
        case 83: // S key
          game.moveBackward = false;
          break;
        case 39: // right arrow
        case 68: // D key
          game.moveRight = false;
          break;
      }
  }
  
  // Event listener for key press
  handleKeyDown(game, event) {
    //console.log("Key Down", event);
    switch (event.keyCode) {
        case 38: // up arrow
        case 87: // W key
            game.moveForward = true;
            break;
        case 37: // left arrow
        case 65: // A key
            game.moveLeft = true;
            break;
        case 40: // down arrow
        case 83: // S key
            game.moveBackward = true;
            break;
        case 39: // right arrow
        case 68: // D key
            game.moveRight = true;
            break;
    }
    if (event.code === 'KeyM') {
        game.mute = !game.mute;
        console.log("Mute", game.mute);
        if (game.mute && game.isMusicPlaying) {
          game.pauseMusic();
        } else {
          if (!game.isMusicPlaying) {
            game.resumeMusic();
          }
        }
    } 
    if (event.code === 'KeyR') {
      // restart
      console.log("Restart");
      game.stopwatch.clear();
      game.stopwatch.start();
      //game.roundOver = true;
      //game.pauseMusic();
      for (let i = 0; i <game.targets.length; i++) {
        game.scene.remove(game.targets[i]);
      }
      game.targets.splice(0, game.targets.length);
      for (let i = 0; i < game.buildings.length; i++) {
        game.scene.remove(game.buildings[i]);
      }
      game.buildings.splice(0, game.buildings.length);
      for (let i = 0; i < game.trees.length; i++) {
        game.scene.remove(game.trees[i]);
      }
      game.trees.splice(0, game.trees.length);
      for (let i = 0; i < game.bushes.length; i++) {
        game.scene.remove(game.bushes[i]);
      }
      game.bushes.splice(0, game.bushes.length);
      for (let i = 0; i < game.boulders.length; i++) {
        game.scene.remove(game.boulders[i]);
      }
      game.boulders.splice(0, game.boulders.length)
      game.initialize();
      if (!game.mute) game.playMusic();
    }
    if (event.code === 'KeyK') {
        for (var t = 0; t < game.targets.length; t++) {
            var target = game.targets[t];
            game.scene.remove(target);
            game.explosion(target);
            game.removeTarget(target);
        }
    }
    /*
    if (event.code === 'Space') {
        if (controls.isLocked) {
            event.preventDefault(); // Prevent default action of spacebar
            fireBullet();
            playBulletSound();
        }
    } else if (event.key === 'e' || event.key === 'E') {
        playExplosionSound();
    }*/
  }
};

window.onload = function() {
  new Targets().run();
}
