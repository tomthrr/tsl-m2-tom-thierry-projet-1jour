import * as THREE from 'three/webgpu'
import { color, float, uniform, vec2, bool } from 'three/tsl'
import {
    createBowlColorNode, createBowlEmissiveNode, createBowlPositionNode, createBowlRoughnessNode
} from '../shaders/BowlShader.js'

export default class Bowl {
    constructor(scene, renderer, mouse, camera) {
        this.mouse = mouse
        this.camera = camera
        this.setUniforms()
        this.setMaterial()
        this.setMesh(scene)
        this.setInsideMesh(scene)
        this.setDebug(renderer)
        this.setRaycaster()
    }

    setUniforms() {
        this.uHoverCell = uniform(vec2(-1))
        this.uNbCells = uniform(float(48))
        this.uAmplitude = uniform(float(0.012))
        this.uBorder = uniform(float(0.03))
        this.uvColor = uniform(bool(false))
        this.uRoseColor = uniform(color('#ff8fb3'))
        this.uSilverColor = uniform(color('#e9edf2'))
        this.uSparkleColor = uniform(color('#fff3f8'))
        this.uSparkleIntensity = uniform(float(6))
        this.rotationSpeed = 0.0015
    }

    setMaterial() {
        this.material = new THREE.MeshStandardNodeMaterial({ side: THREE.DoubleSide })
        this.material.positionNode = createBowlPositionNode(this.uHoverCell, this.uNbCells, this.uAmplitude)
        this.material.colorNode = createBowlColorNode(this.uBorder, this.uRoseColor, this.uSilverColor, this.uNbCells, this.uHoverCell)
        this.material.roughnessNode = createBowlRoughnessNode(this.uNbCells)
        this.material.emissiveNode = createBowlEmissiveNode(this.uNbCells, this.uHoverCell, this.uSparkleColor, this.uSparkleIntensity)
        this.material.metalness = 0.92
        this.material.envMapIntensity = 1.6
    }

    setMesh(scene) {
        this.mesh = new THREE.Mesh(new THREE.SphereGeometry(0.5, 128, 128), this.material)
        this.mesh.castShadow = true
        this.mesh.receiveShadow = true
        this.mesh.position.y = 1
        scene.add(this.mesh)
    }

    setInsideMesh(scene) {
        this.inside = new THREE.Mesh(
            new THREE.SphereGeometry(0.479, 64, 64),
            new THREE.MeshStandardNodeMaterial({ side: THREE.DoubleSide, color: new THREE.Color('#15161c'), metalness: 0.7, roughness: 0.6 })
        )
        this.inside.castShadow = true
        this.inside.receiveShadow = true
        this.inside.position.y = 1
        scene.add(this.inside)
    }

    setDebug(renderer) {
        const gui = renderer.inspector.createParameters('Bowl')
        gui.add(this.uAmplitude, 'value', 0, 1, 0.001).name('amplitude')
        gui.add(this.material, 'metalness', 0, 1, 0.001).name('metalness')
        gui.add(this.uNbCells, 'value', 1, 100, 1).name('nbCells')
        gui.add(this.uBorder, 'value', 0, 0.5, 0.001).name('border')
        gui.add(this.uvColor, 'value').name('uvColor')
        gui.add(this.uSparkleIntensity, 'value', 0, 20, 0.1).name('sparkleIntensity')
        gui.add(this.material, 'envMapIntensity', 0, 3, 0.01).name('envMapIntensity')
        gui.add(this, 'rotationSpeed', 0, 0.02, 0.0005).name('rotationSpeed')
        gui.addColor(this.uRoseColor, 'value').name('roseColor')
        gui.addColor(this.uSilverColor, 'value').name('silverColor')
        gui.addColor(this.uSparkleColor, 'value').name('sparkleColor')
    }

    setRaycaster() {
        this.raycaster = new THREE.Raycaster()
    }

    checkIntersections() {
        this.raycaster.setFromCamera(this.mouse.coordinates, this.camera)
        const intersects = this.raycaster.intersectObject(this.mesh, true)
        if (intersects.length > 0) {
            const uv = intersects[0].uv
            const cellX = Math.floor(uv.x * this.uNbCells.value)
            const cellY = Math.floor(uv.y * this.uNbCells.value)
            this.uHoverCell.value.set(cellX, cellY)
        } else {
            this.uHoverCell.value.set(-1, -1)
        }
    }

    update() {
        this.mesh.rotation.y += this.rotationSpeed
    }
}
