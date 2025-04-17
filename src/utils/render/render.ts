import * as THREE from 'three'
export class Render {
    Scene: THREE.Scene
    Camera: THREE.OrthographicCamera | THREE.PerspectiveCamera
    Renderer: THREE.WebGLRenderer
    constructor(
        scene: THREE.Scene,
        camera: THREE.OrthographicCamera | THREE.PerspectiveCamera,
        renderer: THREE.WebGLRenderer
    ) {
        this.Scene = scene
        this.Camera = camera
        this.Renderer = renderer
    }
}
