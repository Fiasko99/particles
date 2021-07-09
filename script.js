(function() {
  let canvas = document.createElement('canvas')
  let camera
  let scene
  ctx = canvas.getContext('2d')
  w = canvas.width = innerWidth
  h = canvas.height = innerHeight
  particles = []
  newParticles = []
  properties = {
    bgcolor: `rgb(0, 0, 0)`,
    particleRadius: 3,
    particleCount: 100,
    velocity: 2,
    lineLength: 100,
    particleLife: 6
  }
  fps = 60
  press = false

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(60, w/h, 1, -1);
  camera.lookAt(scene.position)

  renderer = new THREE.WebGLRenderer({
      antialias: true
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor('#000000', 0.98);

  document.body.appendChild(canvas);

  controls = new THREE.TrackballControls(camera);

  controls.rotateSpeed = 1.0;
  controls.zoomSpeed = 1.2;
  controls.panSpeed = 0.8;
  controls.staticMoving = false;
  controls.dynamicDampingFactor = 0.3;

  function getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }

  window.onresize = function() {
    w = canvas.width = innerWidth
    h = canvas.height = innerHeight
  }

  window.onmousemove = function (e) {
    if (press) {
      particles.push(new Particle(e.clientX, e.clientY))
      setTimeout(() => {
        particles.shift()
      }, 500)
    }
  }

  window.onmousedown = function (e) {
    press = true
  }

  window.onmouseup = function (e) {
    press = false
  }

  class Particle{
    constructor(x, y) {
      this.x = x && y ? x : Math.random() * w
      this.y = x && y ? y : Math.random() * h
      this.velocityX = (Math.random() < 0.5 ? -1 * Math.random() : Math.random()) * properties.velocity 
      this.velocityY = (Math.random() < 0.5 ? -1 * Math.random() : Math.random()) * properties.velocity
      this.life = x && y ? 
                  Math.random() * properties.particleLife * fps / 3  : 
                  Math.random() * properties.particleLife * fps
      this.red = getRandomInt(256)
      this.green = getRandomInt(256)
      this.blue = getRandomInt(256)
      this.circle = this.life
    }

    position() {
      this.x + this.velocityX > w && this.velocityX > 0 || 
      this.x + this.velocityX < 0 && this.velocityX < 0 ?
      this.velocityX *= -1 :
      this.velocityX

      this.y + this.velocityY > h && this.velocityY > 0 || 
      this.y + this.velocityY < 0 && this.velocityY < 0 ?
      this.velocityY *= -1 :
      this.velocityY

      this.x += this.velocityX
      this.y += this.velocityY
    }

    reDraw() {
      ctx.beginPath()
      ctx.arc(this.x, this.y, properties.particleRadius, 0, Math.PI * 2)
      ctx.closePath()
      ctx.fillStyle = `rgba(
        ${this.red}, 
        ${this.green}, 
        ${this.blue}, 
        1
      )`
      ctx.fill()
    }

    reCalcLife() {
      if (this.life < 1) {
        this.x = Math.random() * w
        this.y = Math.random() * h
        this.velocityX = (Math.random() < 0.5 ? -1 * Math.random() : Math.random()) * properties.velocity 
        this.velocityY = (Math.random() < 0.5 ? -1 * Math.random() : Math.random()) * properties.velocity
        this.life = Math.random() * properties.particleLife * fps
        this.circle = this.life
      }
      this.life > 1 ? this.life-- : this.life
    }

    drawLife() {

      ctx.beginPath()
      ctx.arc(
        this.x, 
        this.y, 
        this.life > this.circle / 2 ? 
          (this.circle - this.life) / (properties.particleLife): 
          (this.circle - (this.circle - this.life)) / properties.particleLife, 
        0, 
        Math.PI * 2
      )
      ctx.closePath()
      ctx.fillStyle = `rgba(
        ${this.red}, 
        ${this.green}, 
        ${this.blue}, 
        ${this.life / (properties.particleLife * fps)}
      )`
      ctx.fill()
    }
  }

  function reDrawBg() {
    ctx.fillStyle = properties.bgcolor
    ctx.fillRect(0, 0, w, h)
  }

  function drawLines(objs) {
    let x1, y1, x2, y2, length, opacity
    objs.forEach(i => {
      objs.forEach(j => {
        x1 = i.x
        y1 = i.y
        x2 = j.x
        y2 = j.y
        length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
        if (length < properties.lineLength) {
          opacity = length/properties.lineLength - 0.2
          ctx.lineWidth = opacity
          ctx.strokeStyle = `rgba(
            ${i.red > j.red ? i.red - j.red : j.red - i.red}, 
            ${i.green > j.green ? i.green - j.green : j.green - i.green}, 
            ${i.blue > j.blue ? i.blue - j.blue : j.blue - i.blue}, 
            ${opacity}
          )`
          ctx.beginPath()
          ctx.moveTo(x1, y1)
          ctx.lineTo(x2, y2)
          ctx.closePath()
          ctx.stroke()
        }
      });
    });
  }

  function reDrawParticles(arr) {
    arr.forEach(particle => {
      particle.reCalcLife()
      particle.position()
      particle.drawLife()
      particle.reDraw()
    });
  }

  function loop() {
    reDrawBg()
    reDrawParticles(particles)
    drawLines(particles)
    renderer.render(scene, camera);
    requestAnimationFrame(loop);
  }
  

  function init() {
    for (let i = 0; i < properties.particleCount; i++) {
      particles.push(new Particle)
    }
    loop()
  }

  init()

}())

