import * as THREE from 'three/webgpu'
import { abs, bool, color, float, Fn, If, int, Loop, mix, uniform, uv, vec2 } from 'three/tsl'

export default class Floor {
    constructor(scene, renderer) {
        this.setUniforms()
        this.setCircleNode()
        this.setCirclesNode()
        this.setMaterial()
        this.setMesh(scene)
        this.setDebug(renderer)
    }

    setUniforms() {
        this.uDarkColor = uniform(color('#120a18'))
        this.uColorA = uniform(color('#ff5fa2'))
        this.uColorB = uniform(color('#c9a7ff'))
        this.uRingRadius = uniform(float(0.075))
        this.uRingThickness = uniform(float(0.02))
        this.uRingSpan = uniform(float(0.1))
    }

    setCircleNode() {
        this.circle = Fn(({ coordinates = uv(), center = vec2(0.5), radius = float(0.25), thickness = float(0.02), inverted = bool(false), discarded = bool(false) }) => {
            const lineSDF = coordinates.distance(center).sub(radius)
            const line = abs(lineSDF).step(thickness.div(2))
            If(inverted.not(), () => line.assign(line.oneMinus()))
            line.lessThanEqual(0).and(discarded).discard()
            return line
        }, {
            coordinates: 'vec2', center: 'vec2', radius: 'float', thickness: 'float', inverted: 'bool', discarded: 'bool', return: 'float'
        })
    }

    setCirclesNode() {
        this.circles = Fn(({ coordinates = uv(), center = vec2(0.5), radius = float(0.25), thickness = float(0.02), inverted = bool(false), discarded = bool(false), count = int(5), span = float(0.1) }) => {
            const lines = float(0)
            Loop({ start: 0, end: count, type: 'float', condition: '<' }, ({ i }) => {
                lines.addAssign(this.circle({ coordinates, center, radius: radius.add(i.mul(span)), thickness, inverted: bool(false), discarded: bool(false) }))
            })
            If(inverted, () => lines.assign(lines.oneMinus()))
            lines.lessThanEqual(0).and(discarded).discard()
            return lines
        })
    }

    setMaterial() {
        this.material = new THREE.MeshStandardNodeMaterial({ transparent: true, side: THREE.DoubleSide })
        const rings = this.circles({ radius: this.uRingRadius, thickness: this.uRingThickness, span: this.uRingSpan })
        this.material.colorNode = mix(this.uDarkColor, mix(this.uColorA, this.uColorB, uv().x), rings)
        this.material.opacityNode = uv().sub(0.5).length().smoothstep(0.5, 0.2)
        this.material.metalness = 0.6
        this.material.roughness = 0.35
    }

    setMesh(scene) {
        this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(10, 10, 10, 10), this.material)
        this.mesh.rotation.x = -Math.PI * 0.5
        this.mesh.receiveShadow = true
        scene.add(this.mesh)
    }

    setDebug(renderer) {
        const gui = renderer.inspector.createParameters('Floor')
        gui.add(this.material, 'metalness', 0, 1, 0.001).name('metalness')
        gui.add(this.material, 'roughness', 0, 1, 0.001).name('roughness')
        gui.add(this.uRingRadius, 'value', 0, 0.3, 0.001).name('ringRadius')
        gui.add(this.uRingThickness, 'value', 0.001, 0.1, 0.001).name('ringThickness')
        gui.add(this.uRingSpan, 'value', 0.02, 0.3, 0.001).name('ringSpacing')
        gui.addColor(this.uDarkColor, 'value').name('darkColor')
        gui.addColor(this.uColorA, 'value').name('colorA')
        gui.addColor(this.uColorB, 'value').name('colorB')
    }
}
