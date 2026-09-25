import * as THREE from 'three/webgpu'

const DISCO_LIGHTS = [
    { color: '#ff5fa2', intensity: 6, radius: 2.4, baseY: 1.6, speed: 0.35, offset: 0 },
    { color: '#9a6bff', intensity: 5, radius: 2.1, baseY: 1.1, speed: -0.28, offset: Math.PI * 0.66 },
    { color: '#ffcf7a', intensity: 5, radius: 2.6, baseY: 1.9, speed: 0.22, offset: Math.PI * 1.33 },
]

export default class Lights {
    constructor(scene, renderer) {
        this.setKeyLight(scene)
        this.setAmbientLight(scene)
        this.setDiscoLights(scene)
        this.setDebug(renderer)
    }

    setKeyLight(scene) {
        const directionalLight = new THREE.DirectionalLight(0xfff2f6, 2.6)
        directionalLight.castShadow = true
        directionalLight.position.set(2, 0.75, -1).normalize().multiplyScalar(10)
        directionalLight.shadow.camera.top = 10
        directionalLight.shadow.camera.right = 10
        directionalLight.shadow.camera.bottom = -10
        directionalLight.shadow.camera.left = -10
        directionalLight.shadow.camera.near = 0.01
        directionalLight.shadow.camera.far = 20
        directionalLight.shadow.radius = 3
        directionalLight.shadow.normalBias = 0.1
        scene.add(directionalLight)
        this.directionalLight = directionalLight
    }

    setAmbientLight(scene) {
        this.ambientLight = new THREE.AmbientLight(0xd9c2ff, 0.35)
        scene.add(this.ambientLight)
    }

    setDiscoLights(scene) {
        this.discoLights = DISCO_LIGHTS.map((config) => {
            const light = new THREE.PointLight(config.color, config.intensity, 8, 2)
            light.userData = { ...config }
            light.position.set(config.radius, config.baseY, 0)
            scene.add(light)
            return light
        })
    }

    setDebug(renderer) {
        const gui = renderer.inspector.createParameters('Lights')
        gui.add(this.directionalLight, 'intensity', 0, 10, 0.1).name('keyIntensity')
        gui.addColor(this.directionalLight, 'color').name('keyColor')
        gui.add(this.ambientLight, 'intensity', 0, 2, 0.01).name('ambientIntensity')
        gui.addColor(this.ambientLight, 'color').name('ambientColor')

        this.discoLights.forEach((light, index) => {
            const folder = gui.addFolder(`Disco ${index + 1}`)
            folder.addColor(light, 'color').name('color')
            folder.add(light, 'intensity', 0, 20, 0.1).name('intensity')
            folder.add(light.userData, 'radius', 0, 5, 0.05).name('radius')
            folder.add(light.userData, 'baseY', 0, 4, 0.05).name('height')
            folder.add(light.userData, 'speed', -2, 2, 0.01).name('speed')
        })
    }

    update(elapsed) {
        for (const light of this.discoLights) {
            const { radius, baseY, speed, offset } = light.userData
            const angle = elapsed * speed + offset
            light.position.x = Math.cos(angle) * radius
            light.position.z = Math.sin(angle) * radius
            light.position.y = baseY + Math.sin(elapsed * speed * 1.4 + offset) * 0.35
        }
    }
}
