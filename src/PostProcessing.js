import * as THREE from 'three/webgpu'
import { emissive, mrt, output, pass } from 'three/tsl'
import { bloom } from 'three/addons/tsl/display/BloomNode.js'

export default class PostProcessing {
    constructor(renderer, scene, camera) {
        this.pipeline = new THREE.RenderPipeline(renderer)
        const scenePass = pass(scene, camera)
        scenePass.setMRT(mrt({ output, emissive }))
        const scenePassColor = scenePass.getTextureNode('output')
        const emissivePass = scenePass.getTextureNode('emissive')
        this.bloomPass = bloom(emissivePass, 1.1, 0.35, 0.05)
        this.pipeline.outputNode = scenePassColor.add(this.bloomPass)
        this.setDebug(renderer)
    }

    setDebug(renderer) {
        const gui = renderer.inspector.createParameters('Bloom')
        gui.add(this.bloomPass.strength, 'value', 0, 5, 0.01).name('strength')
        gui.add(this.bloomPass.radius, 'value', 0, 1, 0.01).name('radius')
        gui.add(this.bloomPass.threshold, 'value', 0, 1, 0.01).name('threshold')
    }

    render() {
        this.pipeline.render()
    }
}