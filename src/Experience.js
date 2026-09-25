import * as THREE from 'three/webgpu'
import Camera from './Camera.js'
import Controls from './Controls.js'
import Environment from './Environment.js'
import Floor from './objects/Floor.js'
import Bowl from './objects/Bowl.js'
import Lights from './lights/Lights.js'
import Mouse from './Mouse.js'
import PostProcessing from './PostProcessing.js'
import Renderer from './Renderer.js'
import Scene from './Scene.js'

export default class Experience {
    constructor() {
        this.canvas = document.querySelector('canvas.threejs')
        this.sizes = { width: window.innerWidth, height: window.innerHeight }
        this.clock = new THREE.Clock()
        this.scene = new Scene()
        this.renderer = new Renderer(this.canvas, this.sizes)
        this.camera = new Camera(this.scene.instance, this.sizes)
        this.controls = new Controls(this.camera.instance, this.canvas)
        this.mouse = new Mouse(this.sizes)
        this.environment = new Environment(this.renderer.instance, this.scene.instance)
        this.postProcessing = new PostProcessing(this.renderer.instance, this.scene.instance, this.camera.instance)

        window.addEventListener('resize', () => this.resize())
        window.addEventListener('mousemove', (event) => this.mouse.update(event))
    }

    async init() {
        await this.environment.bake()
        this.floor = new Floor(this.scene.instance, this.renderer.instance)
        this.bowl = new Bowl(this.scene.instance, this.renderer.instance, this.mouse, this.camera.instance)
        this.lights = new Lights(this.scene.instance, this.renderer.instance)
        window.addEventListener('mousemove', () => this.bowl.checkIntersections())
        this.renderer.instance.setAnimationLoop(() => this.tick())
    }

    resize() {
        this.sizes.width = window.innerWidth
        this.sizes.height = window.innerHeight
        this.camera.resize(this.sizes)
        this.renderer.resize(this.sizes)
    }

    tick() {
        this.controls.update()
        this.bowl.update()
        this.lights.update(this.clock.getElapsedTime())
        this.postProcessing.render()
    }
}