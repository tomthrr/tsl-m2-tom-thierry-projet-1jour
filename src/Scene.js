import * as THREE from 'three/webgpu'

export default class Scene {
    constructor(renderer) {
        this.instance = new THREE.Scene()
        this.instance.background = new THREE.Color('#15161c')
    }
}