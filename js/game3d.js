// 3D Game classes and helpers
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/export
// https://www.freecodecamp.org/news/module-exports-how-to-export-in-node-js-and-javascript/
// https://javascript.info/import-export
// https://dev.to/askyt/how-to-export-a-class-in-javascript-nfm
export function randomColorHex() {
  let letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

export const genRanHexString = size => "0x" + [...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');

export function randomInt(min, max){
  return Math.floor(Math.random() * (max - min + 1) ) + min;
}

export function randomFloat(min, max, decimals) {
  return parseFloat((Math.random() * (min - max) + max).toFixed(decimals));
}

export class  StopWatch {
  constructor() {
    this.watch = { elapsedTime: 0 }
    this.time = "00:00:00:00";
  }
  
  start() {
    //reset start time
    this.watch.startTime = Date.now();
    //run `setInterval()` and save id
    this.watch.intervalId = setInterval(() => {
      //calculate elapsed time
      const elapsedTime = Date.now() - this.watch.startTime + this.watch.elapsedTime;
      //calculate different time measurements based on elapsed time
      const milliseconds = parseInt((elapsedTime%1000)/10);
      const seconds = parseInt((elapsedTime/1000)%60);
      const minutes = parseInt((elapsedTime/(1000*60))%60);
      const hour = parseInt((elapsedTime/(1000*60*60))%24);
      //display time
      this.make_time(hour, minutes, seconds, milliseconds);
    }, 100);
  }

  stop() {
    this.watch.elapsedTime += Date.now() - this.watch.startTime;
    clearInterval(this.watch.intervalId);
  }

  clear() {
    this.watch.elapsedTime = 0;
    this.watch.startTime = Date.now();
    this.make_time(0, 0, 0, 0);
  }

  make_time(hour, minutes, seconds, milliseconds) {
    const leadZeroTime = [hour, minutes, seconds, milliseconds].map(time => time < 10 ? `0${time}` : time);
    this.time = leadZeroTime.join(':');
  }
  
  get_time() { 
    return this.time;
  }
}


export class Game {
  constructor() {
    this.stats = Stats();
    document.body.appendChild(this.stats.dom);
    // gui
    this.refresh = true;
    this.gui = new dat.GUI();
    //this.gui.close();
    this.options = {
      run: true, 
      update: true, 
      render: true, 
      geosync: false,
    };
    const optionsFolder = this.gui.addFolder('Options');
    optionsFolder.add(this.options, "run");
    optionsFolder.add(this.options, "update");
    optionsFolder.add(this.options, "render");
    optionsFolder.open();
    // Set up the scene
    // https://threejs.org/docs/#manual/en/introduction/Creating-a-scene
    // https://discoverthreejs.com/book/first-steps/first-scene/
    this.scene = new THREE.Scene();
    // Light
    this.light = new THREE.DirectionalLight(0xff0000, 1);
    this.light.position.set(10, 10, 10);
    this.light.target.position.set(0, 0, 0);
    this.light.castShadow = true;
    this.light.shadowDarkness = 0.5;
    this.light.shadowCameraVisible = true; // only for debugging
    // these six values define the boundaries of the yellow box seen above
    this.light.shadowCameraNear = 2;
    this.light.shadowCameraFar = 5;
    this.light.shadowCameraLeft = -0.5;
    this.light.shadowCameraRight = 0.5;
    this.light.shadowCameraTop = 0.5;
    this.light.shadowCameraBottom = -0.5;
    this.scene.add(this.light);
    this.lightHelper = new THREE.DirectionalLightHelper(this.light);
    this.scene.add(this.lightHelper);
    // Camera
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.set(9, 0.3, 3); // Set camera position 0.1 units above the grid
    this.cameraHelper = new THREE.CameraHelper(this.camera);
    this.scene.add(this.cameraHelper);
    // Create the renderer
    this.renderer = new THREE.WebGLRenderer({ alpha: true, depth: true, antialias: false });
    // Configure renderer settings
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.toneMapping = THREE.ReinhardToneMapping;
    this.renderer.setClearColor(0x000000, 1); // Set background color to black
    this.renderer.domElement.style.position = 'fixed';
    this.renderer.domElement.id = 'renderer';
    this.renderer.domElement.style.zIndex = '-1';
    this.renderer.domElement.style.left = '0';
    this.renderer.domElement.style.top = '0';
    document.body.appendChild(this.renderer.domElement);
    document.addEventListener('keyup', this.handleKeyUp.bind(event, this));
    document.addEventListener('keydown', this.handleKeyDown.bind(event, this));
    document.addEventListener("mousedown", this.handleMouseDown.bind(event, this));
    document.addEventListener('mousemove', this.handleMouseMove.bind(event, this));
  }

  run() {
    requestAnimationFrame(this.run.bind(this));
    if (this.options.run) {
      if (this.options.update) {
        this.update();
        this.stats.update();
      }
      if (this.options.render) {
        this.render();
      }
    }
  }

  update() {} // override in derived class to perform all scene manipulations
  render() {renderer.render(scene, camera);} // override in derived class to perform all scene drawing
  restart() {}

  handleMouseDown(game, event) { // override in derived class to handle the mouse
    let coords = getMousePosition(game.canvas, event);
    console.log("Coordinate x: " + coords[0], "Coordinate y: " + coords[1]);
  }
  
  handleMouseMove(game, event) {}

  handleKeyDown(game, event) {} // override in derived class to handle the keys
  handleKeyUp(game, eventcreateRandomCube) {} // override in derived class to handle the keys
};

//module.exports = { Game3D };
//exports.Game3D = Game;