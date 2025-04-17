import * as THREE from 'three'
import {
    IMAGE_PATH,
    IMAGE_REGION,
    IMAGE_SHAPE,
    POLYGON,
    type ImagePath,
    type ImageRegion,
    type ImageShape,
    type ImageTree,
} from 'three-pcb'
import { BufferGeometryUtils } from 'three/examples/jsm/Addons.js'
import { renderImagePath } from './path'
import { renderImageRegion } from './region'
import { renderImageShape } from './shape'
export const renderGerberAsync = (
    gerberData: ImageTree,
    color: THREE.ColorRepresentation,
    size: number,
    _progress: (number: number) => void = () => {},
): Promise<THREE.Group> => {
    return new Promise((resolve) => {
        resolve(renderGerber(gerberData, color, size, _progress))
    })
}
// let reNum = 0
export const renderGerber = (
    gerberData: ImageTree,
    _color: THREE.ColorRepresentation,
    size: number,
    _progress: (number: number) => void = () => {},
): THREE.Group => {
    let region: THREE.BufferGeometry[] = []
    let path: THREE.BufferGeometry[] = []
    let shape: THREE.BufferGeometry[] = []
    let shapeReglon: THREE.BufferGeometry[] = []
    let current = 0
    _progress(current)
    for (let index = 0; index < gerberData.children.length; index++) {
        const element = gerberData.children[index]
        if (Math.ceil((index / gerberData.children.length) * 100) != current) {
            current = Math.ceil((index / gerberData.children.length) * 100)
            _progress(current)
        }
        if (element.type == IMAGE_REGION) {
            // reNum++
            // if (reNum < 700 || reNum > 800) {
            //     continue
            // }
            // if (reNum > 800) {
            //     continue
            // }
            // console.log('region', element)

            const geo = renderImageRegion(element as ImageRegion)
            region.push(geo)
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
                if (item.type == POLYGON) {
                    shapeReglon.push(item.geometry)
                } else {
                    shape.push(item.geometry)
                }
            })

            continue
        }
        console.log(element)
    }

    const group = new THREE.Group()

    const material = new THREE.MeshStandardMaterial({
        color: 0x00ff00,
    })

    const material2 = new THREE.MeshStandardMaterial({
        color: 0x00ffff,
    })
    const material3 = new THREE.MeshStandardMaterial({
        color: 0xff00ff,
    })
    const material4 = new THREE.MeshStandardMaterial({
        color: 0xff0000,
    })

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
        const pathMesh = new THREE.Mesh(mergedPath, material2)
        group.add(pathMesh)
        for (const geometry of path) {
            geometry.dispose()
        }
        path = []
        mergedPath.dispose()
    }

    if (shape.length > 0) {
        const mergedShape = BufferGeometryUtils.mergeGeometries(shape, false)
        const shapeMesh = new THREE.Mesh(mergedShape, material3)

        group.add(shapeMesh)
        for (const geometry of shape) {
            geometry.dispose()
        }
        shape = []
        mergedShape.dispose()
    }
    if (shapeReglon.length > 0) {
        const mergedShapeRe = BufferGeometryUtils.mergeGeometries(shapeReglon, false)
        const shapeMeshRe = new THREE.Mesh(mergedShapeRe, material4)
        group.add(shapeMeshRe)
        for (const geometry of shapeReglon) {
            geometry.dispose()
        }
        shapeReglon = []
        mergedShapeRe.dispose()
    }
    material.dispose()
    group.scale.setZ(size)
    return group
}
