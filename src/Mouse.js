import * as THREE from 'three/webgpu'

export default class Mouse {
    constructor(sizes) {
        this.coordinates = new THREE.Vector2()
        this.sizes = sizes
    }

    update(event) {
        this.coordinates.x = event.clientX / this.sizes.width * 2 - 1
        this.coordinates.y = -(event.clientY / this.sizes.height) * 2 + 1
    }
}