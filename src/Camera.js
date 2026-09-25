import * as THREE from 'three/webgpu'

export default class Camera {
    constructor(scene, sizes) {
        this.instance = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 100)
        this.instance.position.x = 5
        this.instance.position.y = 2
        this.instance.position.z = 2.5
        scene.add(this.instance)
    }

    resize(sizes) {
        this.instance.aspect = sizes.width / sizes.height
        this.instance.updateProjectionMatrix()
    }
}