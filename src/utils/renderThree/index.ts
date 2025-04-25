import * as THREE from 'three'
import { BufferGeometryUtils } from 'three/examples/jsm/Addons.js'
import {
    IMAGE_PATH,
    IMAGE_REGION,
    IMAGE_SHAPE,
    PLOT_POLYGON,
    type ImagePath,
    type ImageRegion,
    type ImageShape,
    type ImageTree,
} from '../plotter'
import { extrudeSettings } from './config'
import { renderImageOutline } from './outline'
import { renderImagePath } from './path'
import { renderImageRegion } from './region'
import { renderImageShape } from './shape'
export * from './config'
export * from './path'
export * from './pcb'
export * from './region'
export * from './renderer'
export * from './shape'
// let reNum = 0
export const renderThree = (
    gerberData: ImageTree,
    _color: THREE.ColorRepresentation,
    _progress: (number: number) => void = () => {},
    outline: boolean
): THREE.Group => {
    let region: THREE.BufferGeometry[] = []
    let path: THREE.BufferGeometry[] = []
    let shape: THREE.BufferGeometry[] = []
    let shapeReglon: THREE.BufferGeometry[] = []
    let current = 0
    _progress(current)
    const outlineShape = outline ? new THREE.Shape() : null
    for (let index = 0; index < gerberData.children.length; index++) {
        const element = gerberData.children[index]
        if (Math.ceil((index / gerberData.children.length) * 100) != current) {
            current = Math.ceil((index / gerberData.children.length) * 100)
            _progress(current)
        }

        if (outlineShape) {
            renderImageOutline(element, outlineShape)
            continue
        }

        if (element.type == IMAGE_REGION) {
            const geo = renderImageRegion(element as ImageRegion)
            if (geo != null) {
                region.push(geo)
            }
            continue
        }
        if (element.type == IMAGE_PATH) {
            const geo = renderImagePath(element as ImagePath)
            path.push(...geo)
            continue
        }
        if (element.type == IMAGE_SHAPE) {
            const geo = renderImageShape(element as ImageShape)
            geo.forEach((item) => {
                if (item.type == PLOT_POLYGON) {
                    shapeReglon.push(item.geometry)
                } else {
                    shape.push(item.geometry)
                }
            })

            continue
        }
    }

    const group = new THREE.Group()

    if (outlineShape) {
        const geometry = new THREE.ExtrudeGeometry(outlineShape, extrudeSettings)
        geometry.translate(0, 0, -0.5)
        region.push(geometry)
    }
    const material = new THREE.MeshBasicMaterial({
        color: _color,
    })

    // const material2 = new THREE.MeshStandardMaterial({
    //     color: 0x00ffff,
    // })
    // const material3 = new THREE.MeshStandardMaterial({
    //     color: 0xff00ff,
    // })
    // const material4 = new THREE.MeshStandardMaterial({
    //     color: 0xff0000,
    // })

    if (region.length > 0) {
        const mergedRegion = BufferGeometryUtils.mergeGeometries(region, false)
        const mesh = new THREE.Mesh(mergedRegion, material)
        mergedRegion.dispose()
        group.add(mesh)
        for (const geometry of region) {
            geometry.dispose()
        }
        region = []
    }

    if (path.length > 0) {
        const mergedPath = BufferGeometryUtils.mergeGeometries(path, false)
        const pathMesh = new THREE.Mesh(mergedPath, material)
        group.add(pathMesh)
        for (const geometry of path) {
            geometry.dispose()
        }
        path = []
        mergedPath.dispose()
    }

    if (shape.length > 0) {
        const mergedShape = BufferGeometryUtils.mergeGeometries(shape, false)
        const shapeMesh = new THREE.Mesh(mergedShape, material)

        group.add(shapeMesh)
        for (const geometry of shape) {
            geometry.dispose()
        }
        shape = []
        mergedShape.dispose()
    }
    if (shapeReglon.length > 0) {
        const mergedShapeRe = BufferGeometryUtils.mergeGeometries(shapeReglon, false)
        const shapeMeshRe = new THREE.Mesh(mergedShapeRe, material)
        group.add(shapeMeshRe)
        for (const geometry of shapeReglon) {
            geometry.dispose()
        }
        shapeReglon = []
        mergedShapeRe.dispose()
    }
    material.dispose()
    return group
}
