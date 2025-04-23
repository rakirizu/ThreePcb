import * as THREE from 'three'
import {
    LAYERED_SHAPE,
    OUTLINE,
    OutlineShape,
    PathArcSegment,
    PLOT_CIRCLE,
    PLOT_POLYGON,
    PLOT_RECTANGLE,
    type CircleShape,
    type ImageShape,
    type LayeredShape,
    type RectangleShape,
} from '../plotter'

import { extrudeSettings } from './config'
const renderImageShapeCircle = (shapeCircle: CircleShape): THREE.CylinderGeometry => {
    const geometry = new THREE.CylinderGeometry(shapeCircle.r, shapeCircle.r, 1)
    geometry.translate(shapeCircle.cx, shapeCircle.cy, 0)

    const matrix = new THREE.Matrix4().makeTranslation(-shapeCircle.cx, -shapeCircle.cy, 0)
    const rotationZ = new THREE.Matrix4().makeRotationX(Math.PI / 2)
    const translateBack = new THREE.Matrix4().makeTranslation(shapeCircle.cx, shapeCircle.cy, 0)

    const transformMatrix = new THREE.Matrix4()
        .multiply(translateBack)
        .multiply(rotationZ)
        .multiply(matrix)
    geometry.applyMatrix4(transformMatrix)
    geometry.deleteAttribute('uv')
    return geometry
}

const drawShape = (x: number, y: number, width: number, height: number, radius: number) => {
    const shape = new THREE.Shape()
    shape.moveTo(x + radius, y)
    shape.lineTo(x + width - radius, y)
    shape.quadraticCurveTo(x + width, y, x + width, y + radius)
    shape.lineTo(x + width, y + height - radius)
    shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
    shape.lineTo(x + radius, y + height)
    shape.quadraticCurveTo(x, y + height, x, y + height - radius)
    shape.lineTo(x, y + radius)
    shape.quadraticCurveTo(x, y, x + radius, y)

    return shape
}

const renderImageShapeRectangle = (shapeRectangle: RectangleShape): THREE.BufferGeometry => {
    let geometry: THREE.BufferGeometry
    if (shapeRectangle.r) {
        geometry = new THREE.ExtrudeGeometry(
            drawShape(
                shapeRectangle.x,
                shapeRectangle.y,
                shapeRectangle.xSize,
                shapeRectangle.ySize,
                shapeRectangle.r
            ),
            extrudeSettings
        )
        geometry.translate(0, 0, extrudeSettings.depth ? -extrudeSettings.depth / 2 : -0.5)
    } else {
        geometry = new THREE.BoxGeometry(shapeRectangle.xSize, shapeRectangle.ySize, 1)
        const cx = shapeRectangle.x + shapeRectangle.xSize / 2
        const cy = shapeRectangle.y + shapeRectangle.ySize / 2

        geometry.translate(cx, cy, 0)
    }
    // const geometry = new THREE.BoxGeometry(shapeRectangle.xSize, shapeRectangle.ySize, 1)

    geometry.deleteAttribute('uv')

    return geometry
}
const renderImageShapeOutline = (segments: PathArcSegment[]) => {
    console.log('renderImageShapeOutline', segments)
    const geometry = new THREE.CylinderGeometry(segments[0].radius, segments[0].radius, 1)
    geometry.translate(segments[0].center[0], segments[0].center[1], 0)
    geometry.deleteAttribute('uv')
    return geometry
}
export interface renderImageShapeResult {
    erase: boolean
    geometry: THREE.BufferGeometry
    type: typeof PLOT_CIRCLE | typeof PLOT_RECTANGLE | typeof PLOT_POLYGON | typeof OUTLINE
}

export const renderImageShape = (el: ImageShape): renderImageShapeResult[] => {
    let geometry: renderImageShapeResult[] = []
    switch (el.shape.type) {
        case PLOT_CIRCLE:
            const shapeCircle = el.shape as CircleShape
            geometry.push({
                erase: false,
                geometry: renderImageShapeCircle(shapeCircle),
                type: el.shape.type,
            })

            break
        case PLOT_RECTANGLE:
            const shapeRectangle = el.shape as RectangleShape
            const buildShape = renderImageShapeRectangle(shapeRectangle)
            if (shapeRectangle.r) {
                geometry.push({
                    erase: false,
                    geometry: buildShape,
                    type: PLOT_POLYGON,
                })
            } else {
                geometry.push({
                    erase: false,
                    geometry: buildShape,
                    type: PLOT_RECTANGLE,
                })
            }

            break
        case LAYERED_SHAPE:
            const shapeLayered = el.shape as LayeredShape
            shapeLayered.shapes.forEach((shape) => {
                if (shape.erase) {
                    console.warn('[ThreePCB] Invalid layered shape (erase):', shape)
                }
                switch (shape.type) {
                    // case PLOT_CIRCLE:
                    //     const shapeLayeredCircle = shape as CircleShape
                    //     geometry.push({
                    //         erase: false,
                    //         geometry: renderImageShapeCircle(shapeLayeredCircle),
                    //         type: shape.type,
                    //     })
                    //     break
                    // case PLOT_RECTANGLE:
                    //     const shapeLayeredRectangle = shape as RectangleShape
                    //     geometry.push({
                    //         erase: false,
                    //         geometry: renderImageShapeRectangle(shapeLayeredRectangle),
                    //         type: shape.type,
                    //     })
                    //     break
                    // case PLOT_POLYGON:
                    //     const shapeLayeredPolygon = shape as PolygonShape
                    //     console.log('renderImageShapePolygon', shapeLayeredPolygon)
                    //     geometry.push({
                    //         erase: false,
                    //         geometry: renderImageShapePolygon(shapeLayeredPolygon.points),
                    //         type: shape.type,
                    //     })
                    //     break
                    case OUTLINE:
                        const shapeLayeredOutline = shape as OutlineShape
                        console.log('renderImageShapeOutline', shapeLayeredOutline)
                        geometry.push({
                            erase: false,
                            geometry: renderImageShapeOutline(
                                shapeLayeredOutline.segments as PathArcSegment[]
                            ),
                            type: 'polygon',
                        })
                        break
                    // default:
                    //     console.warn('[ThreePCB] Invalid shape type in layered shapes', shape)
                    //     break
                }
            })
            break
        default:
            console.warn('[ThreePCB] Invalid shape type:', el.shape.type, el)
    }

    return geometry
}
