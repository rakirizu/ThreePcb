import * as THREE from 'three'
import {
    ARC,
    PLOT_LINE,
    type ImagePath,
    type PathArcSegment,
    type PathLineSegment,
} from '../plotter'

const renderImagePathLine = (el: PathLineSegment): THREE.Curve<any> => {
    return new THREE.LineCurve(
        new THREE.Vector2(el.start[0], el.start[1]),
        new THREE.Vector2(el.end[0], el.end[1])
    )
}

const renderImagePathArc = (el: PathArcSegment): THREE.Curve<any> => {
    return new THREE.EllipseCurve(
        el.center[0],
        el.center[1],
        el.radius,
        el.radius,
        el.start[2],
        el.end[2],
        el.start[2] > el.end[2]
    )
}

export const renderImagePath = (el: ImagePath): THREE.BufferGeometry[] => {
    let geometries: THREE.ExtrudeGeometry[] = []
    // 3. 定义矩形截面（width: 宽度，height: 厚度）
    const width = 1,
        height = el.width
    const shape = new THREE.Shape()
    shape.moveTo(-width / 2, -height / 2)
    shape.lineTo(width / 2, -height / 2)
    shape.lineTo(width / 2, height / 2)
    shape.lineTo(-width / 2, height / 2)
    shape.lineTo(-width / 2, -height / 2)
    // 4. 挤出设置：使用 extrudePath 沿 spline 扫描

    for (const key in el.segments) {
        if (Object.prototype.hasOwnProperty.call(el.segments, key)) {
            const element = el.segments[key]
            let curve: THREE.Curve<any> | null = null
            if (element.type == PLOT_LINE) {
                curve = renderImagePathLine(element)
            } else if (element.type == ARC) {
                curve = renderImagePathArc(element)
            } else {
                console.warn('[WebGerber] Invalid segment type:', element)
                continue
            }
            const vectorPoints = curve.getPoints(50).map((p) => new THREE.Vector3(p.x, p.y, 0))
            // const spline = createRoundedPath(vectorPoints, 3)

            const spline = new THREE.CatmullRomCurve3(vectorPoints, false, 'catmullrom', 2)
            const extrudeSettings = {
                steps: 1,
                bevelEnabled: true,
                extrudePath: spline,
            }
            // 5. 创建 Mesh
            const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings)
            // geometry.translate(10, 10, 0)
            geometries.push(geometry)
        }
    }
    // const mergedGeometry = BufferGeometryUtils.mergeGeometries(geometries, false)
    // const material = new THREE.MeshStandardMaterial({
    //     color: 0x00ff00,
    // })

    // for (const geometry of geometries) {
    //     geometry.dispose()
    // }
    // const mesh = new THREE.Mesh(mergedGeometry, material)
    // mergedGeometry.dispose()
    // material.dispose()

    return geometries
}
