import * as THREE from 'three/webgpu'
import { color, uniform, mrt, vec4, float, uv, vec2, smoothstep, floor, step, sin, time, hash, instanceIndex, shapeCircle, instancedBufferAttribute } from 'three/tsl'

export default class Paillettes {
    constructor(scene, renderer) {
        this.setUniforms()
        this.setMesh(scene)
    }

    setUniforms() {
        this.uColor = uniform(color('#f9f9f9'))
        this.uIntensity = uniform(float(4.))
        this.size = uniform(0.03)
        this.radius = 8
        this.count = 4000
    }

    setMesh(scene) {
        // 1. Positions sur la sphère (spirale de Fibonacci)
        const positions = new Float32Array(this.count * 3)
        const golden = Math.PI * (3 - Math.sqrt(5))

        for (let i = 0; i < this.count; i++) {
            const y = 1 - (i / (this.count - 1)) * 2
            const r = Math.sqrt(1 - y * y)
            const theta = golden * i

            positions[i * 3 + 0] = Math.cos(theta) * r * (Math.random() * this.radius)
            positions[i * 3 + 1] = y * (Math.random() * this.radius) - Math.random() * 0.1
            positions[i * 3 + 2] = Math.sin(theta) * r * (Math.random() * this.radius)
        }

        const posAttr = new THREE.InstancedBufferAttribute(positions, 3)
        const basePos = instancedBufferAttribute(posAttr)

        // 2. Valeur aléatoire par particule
        const phase = hash(instanceIndex).mul(Math.PI * 2)

        // 3. Légère respiration radiale autour de la position de base
        const wobble = sin(time.mul(2).add(phase)).mul(0.03).add(1)

        // 4. Scintillement façon paillette
        const twinkle = sin(time.mul(4).add(phase)).mul(0.5).min(0.5)

        const dist = uv().distance(vec2(0.5))
        const glow = float(0.5).div(dist).sub(1.).max(0.0)

        const pointsMat = new THREE.PointsNodeMaterial({
            colorNode: this.uColor.mul(this.uIntensity).mul(twinkle),
            opacityNode: glow,
            positionNode: basePos.mul(wobble),
            scaleNode: this.size,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,  // les particules qui se chevauchent s'additionnent
        })

        const sparkleColor = this.uColor.mul(this.uIntensity).mul(twinkle)
        const sparkleAlpha = glow.mul(float(1.).pow(3.0))

        pointsMat.mrtNode = mrt({
            emissive: vec4(sparkleColor, sparkleAlpha)
        })

        const points = new THREE.Sprite(pointsMat)
        points.count = this.count
        points.position.set(0, 1, 0)
        scene.add(points)
    }
}