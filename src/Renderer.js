import * as THREE from 'three/webgpu'
import { Inspector } from 'three/addons/inspector/Inspector.js'

export default class Renderer {
    constructor(canvas, sizes) {
        this.instance = new THREE.WebGPURenderer({ canvas, antialias: true })
        this.instance.shadowMap.enabled = true
        this.instance.shadowMap.type = THREE.PCFSoftShadowMap
        this.instance.setClearColor(0x07040c)
        this.instance.inspector = new Inspector()
        this.resize(sizes)
    }

    resize(sizes) {
        this.instance.setSize(sizes.width, sizes.height)
        this.instance.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    }
}