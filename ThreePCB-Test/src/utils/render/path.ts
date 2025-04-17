import * as THREE from 'three'
import { ARC, LINE, type ImagePath, type PathArcSegment, type PathLineSegment } from 'three-pcb'

const renderImagePathLine = (el: PathLineSegment, width: number): THREE.Curve<any> => {
    if (el.start[0] > el.end[0]) {
        el.start[0] = el.start[0] + width
    }
    if (el.end[0] > el.start[0]) {
        el.end[0] = el.end[0] + width
    }

    if (el.start[1] > el.end[1]) {
        el.start[1] = el.start[1] + width
    }
    if (el.end[1] > el.start[1]) {
        el.end[1] = el.end[1] + width
    }

    if (el.start[0] < el.end[0]) {
        el.start[0] = el.start[0] - width
    }
    if (el.end[0] < el.start[0]) {
        el.end[0] = el.end[0] - width
    }

    if (el.start[1] < el.end[1]) {
        el.start[1] = el.start[1] - width
    }
    if (el.end[1] < el.start[1]) {
        el.end[1] = el.end[1] - width
    }

    return new THREE.LineCurve(
        new THREE.Vector2(el.start[0], el.start[1]),
        new THREE.Vector2(el.end[0], el.end[1]),
    )
}

const renderImagePathArc = (el: PathArcSegment): THREE.Curve<any> => {
    let start,
        end = 0
    if (el.start[2] > el.end[2]) {
        start = el.end[2]
        end = el.start[2]
    } else {
        start = el.start[2]
        end = el.end[2]
    }
    return new THREE.EllipseCurve(
        el.center[0],
        el.center[1],
        el.radius,
        el.radius,
        start,
        end,
        false,
    )
}

export const renderImagePath = (el: ImagePath): THREE.BufferGeometry[] => {
    let geometries = []
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
            let curve = null
            if (element.type == LINE) {
                curve = renderImagePathLine(element, el.width)
            } else if (element.type == ARC) {
                curve = renderImagePathArc(element)
            } else {
                console.warn('[ThreePCB] Invalid segment type:', element)
                continue
            }
            const vectorPoints = curve.getPoints(50).map((p) => new THREE.Vector3(p.x, p.y, 0))
            // const spline = createRoundedPath(vectorPoints, 3)

            const spline = new THREE.CatmullRomCurve3(vectorPoints, false, 'catmullrom', 2)
            const extrudeSettings = {
                steps: 10,
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
