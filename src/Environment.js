import * as THREE from 'three/webgpu'

const PANELS = [
    { color: '#ff4f9e', intensity: 16, position: [-6, 4.5, -3], scale: [0.1, 5, 5], rotationY: Math.PI / 2 },
    { color: '#9a6bff', intensity: 14, position: [6, 3.5, -4], scale: [0.1, 4.5, 4.5], rotationY: -Math.PI / 2 },
    { color: '#ffcf7a', intensity: 20, position: [0, 9, 1], scale: [7, 0.1, 5], rotationY: 0 },
    { color: '#5fd6ff', intensity: 10, position: [0, 2.5, 7], scale: [5, 3.5, 0.1], rotationY: 0 },
    { color: '#ffffff', intensity: 26, position: [0, 6.5, -9], scale: [3.5, 3.5, 0.1], rotationY: 0 },
]

export default class Environment {
    constructor(renderer, scene) {
        this.renderer = renderer
        this.scene = scene
    }

    createRoom() {
        const geometry = new THREE.BoxGeometry(1, 1, 1)
        geometry.deleteAttribute('uv')

        const envScene = new THREE.Scene()

        const room = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: '#1c1424', side: THREE.BackSide }))
        room.scale.set(24, 24, 24)
        envScene.add(room)

        for (const panel of PANELS) {
            const material = new THREE.MeshLambertMaterial({ color: 0x000000, emissive: panel.color, emissiveIntensity: panel.intensity })
            const mesh = new THREE.Mesh(geometry, material)
            mesh.position.set(...panel.position)
            mesh.scale.set(...panel.scale)
            mesh.rotation.y = panel.rotationY
            envScene.add(mesh)
        }

        return envScene
    }

    async bake() {
        await this.renderer.init()

        // Permet de générer une texture d'environnement à partir d'une scène 3D
        // donc on on génère les panneaux
        // puis on s'en sert pour l'éclairage et les reflets
        const pmremGenerator = new THREE.PMREMGenerator(this.renderer)
        const envScene = this.createRoom()
        const renderTarget = pmremGenerator.fromScene(envScene, 0)

        this.scene.environment = renderTarget.texture
        this.scene.environmentIntensity = 1.2

        pmremGenerator.dispose()
        envScene.traverse((child) => {
            if (child.isMesh) {
                child.geometry.dispose()
                child.material.dispose()
            }
        })

        this.setDebug()
    }

    setDebug() {
        const gui = this.renderer.inspector.createParameters('Environment')
        gui.add(this.scene, 'environmentIntensity', 0, 3, 0.01).name('intensity')
        gui.addColor(this.scene, 'background').name('background')
    }
}
