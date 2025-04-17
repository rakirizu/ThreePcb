import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { Render } from './render'

export interface RenderInitParams {
    AddResizeListener?: boolean
    AddAnimationLoop?: boolean
    AddAxesHelper?: boolean
    AddOrbitControls?: boolean
}
export function NewRenderByElement(el: HTMLDivElement, param: RenderInitParams): Render {
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0xeeeeee)
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(el.clientWidth, el.clientHeight)
    var width = el.clientWidth //窗口宽度
    var height = el.clientHeight //窗口高度
    var k = width / height //窗口宽高比
    var s = 500 //三维场景显示范围控制系数，系数越大，显示的范围越大

    const camera = new THREE.OrthographicCamera(-s * k, s * k, s, -s, 0.2, 3000)
    camera.position.z = 5
    camera.position.y = 0
    camera.position.x = 0
    camera.lookAt(0, 0, 0)
    // const camera = new THREE.PerspectiveCamera(75, el.clientWidth / el.clientHeight, 0.1, 1000)

    // camera.position.z = 5
    // camera.position.y = 0
    // camera.position.x = 0
    // camera.lookAt(0, 0, 0)
    scene.add(camera)

    if (param.AddResizeListener) {
        window.addEventListener('resize', () => {
            // camera.aspect = el.clientWidth / el.clientHeight
            camera.updateProjectionMatrix()
            renderer.setSize(el.clientWidth, el.clientHeight)
        })
    }
    if (param.AddAxesHelper) {
        scene.add(new THREE.AxesHelper(10))
    }
    let con: OrbitControls | null = null
    if (param.AddOrbitControls) {
        con = new OrbitControls(camera, renderer.domElement)
        con.update()
    }
    if (param.AddAnimationLoop) {
        renderer.setAnimationLoop(() => {
            renderer.render(scene, camera)
            if (con) {
                con.update()
            }
        })
    }
    //环境光
    var ambient = new THREE.AmbientLight(0xffffff)
    scene.add(ambient)
    el.appendChild(renderer.domElement)
    return NewRenderByThreeInterface(scene, camera, renderer)
}
export function NewRenderByThreeInterface(
    scene: THREE.Scene,
    camera: THREE.PerspectiveCamera | THREE.OrthographicCamera,
    renderer: THREE.WebGLRenderer
): Render {
    return new Render(scene, camera, renderer)
}
