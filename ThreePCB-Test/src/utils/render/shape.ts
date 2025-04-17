import * as THREE from 'three'
import {
    CIRCLE,
    LAYERED_SHAPE,
    POLYGON,
    RECTANGLE,
    type CircleShape,
    type ImageShape,
    type LayeredShape,
    type PolygonShape,
    type Position,
    type RectangleShape,
} from 'three-pcb'
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
                shapeRectangle.r,
            ),
            extrudeSettings,
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
const renderImageShapePolygon = (points: Position[]): THREE.BufferGeometry => {
    const heartShape = new THREE.Shape()
    if (points.length <= 2) {
        console.warn('[ThreePCB] Invalid polygon points length (need 3):', points)
        return new THREE.BufferGeometry()
    }

    heartShape.moveTo(points[0][0], points[0][1])
    for (let index = 1; index < points.length; index++) {
        const element = points[index]
        if (element.length < 2) {
            console.warn('[ThreePCB] Invalid segment data length (need 2):', element)
            continue
        }

        heartShape.lineTo(element[0], element[1])
        heartShape.moveTo(element[0], element[1])
    }
    heartShape.lineTo(points[0][0], points[0][1])
    const geometry = new THREE.ExtrudeGeometry(heartShape, extrudeSettings)
    geometry.deleteAttribute('uv')
    geometry.translate(0, 0, extrudeSettings.depth ? -extrudeSettings.depth / 2 : -0.5)

    return geometry
}
export interface renderImageShapeResult {
    erase: boolean
    geometry: THREE.BufferGeometry
    type: typeof CIRCLE | typeof RECTANGLE | typeof POLYGON
}
export const renderImageShape = (el: ImageShape): renderImageShapeResult[] => {
    let geometry: renderImageShapeResult[] = []
    switch (el.shape.type) {
        case CIRCLE:
            const shapeCircle = el.shape as CircleShape
            geometry.push({
                erase: false,
                geometry: renderImageShapeCircle(shapeCircle),
                type: el.shape.type,
            })

            break
        case RECTANGLE:
            const shapeRectangle = el.shape as RectangleShape
            const buildShape = renderImageShapeRectangle(shapeRectangle)
            if (shapeRectangle.r) {
                geometry.push({
                    erase: false,
                    geometry: buildShape,
                    type: POLYGON,
                })
            } else {
                geometry.push({
                    erase: false,
                    geometry: buildShape,
                    type: RECTANGLE,
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
                    case CIRCLE:
                        const shapeLayeredCircle = shape as CircleShape
                        geometry.push({
                            erase: false,
                            geometry: renderImageShapeCircle(shapeLayeredCircle),
                            type: shape.type,
                        })
                        break
                    case RECTANGLE:
                        const shapeLayeredRectangle = shape as RectangleShape
                        geometry.push({
                            erase: false,
                            geometry: renderImageShapeRectangle(shapeLayeredRectangle),
                            type: shape.type,
                        })
                        break
                    case POLYGON:
                        const shapeLayeredPolygon = shape as PolygonShape
                        console.log(shapeLayeredPolygon.points)
                        geometry.push({
                            erase: false,
                            geometry: renderImageShapePolygon(shapeLayeredPolygon.points),
                            type: shape.type,
                        })
                        break
                }
            })
            break
        default:
            console.warn('[ThreePCB] Invalid shape type:', el.shape.type, el)
    }

    return geometry
}
