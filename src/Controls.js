import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

export default class Controls {
    constructor(camera, canvas) {
        this.instance = new OrbitControls(camera, canvas)
        this.instance.target.set(0, 1, 0)
        this.instance.enableDamping = true
    }

    update() {
        this.instance.update()
    }
}