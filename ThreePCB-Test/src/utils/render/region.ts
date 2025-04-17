import * as THREE from 'three'
import { ARC, LINE, type ImageRegion, type PathArcSegment } from 'three-pcb'
import { extrudeSettings } from './config'
let has = false
export const renderImageRegion = (el: ImageRegion): THREE.BufferGeometry => {
    const heartShape = new THREE.Shape()
    heartShape.moveTo(el.segments[0].start[0], el.segments[0].start[1])
    for (let index = 0; index < el.segments.length; index++) {
        const element = el.segments[index]

        if (element.start.length < 2 || element.end.length < 2) {
            console.warn('[ThreePCB] Invalid segment data length (need 2):', element)
            continue
        }

        if (element.type == ARC) {
            const regionData = element as PathArcSegment
            if (!has) {
                has = true
                console.log(regionData)
            }

            // let start, end: number
            // if (regionData.start[2] > regionData.end[2]) {
            //     start = regionData.end[2]
            //     end = regionData.start[2]
            // } else {
            //     start = regionData.start[2]
            //     end = regionData.end[2]
            // }
            console.log('!!!', regionData)

            heartShape.absarc(
                regionData.center[0],
                regionData.center[1],
                regionData.radius,
                regionData.start[2],
                regionData.end[2],
                regionData.start[2] > regionData.end[2],
            )
        } else if (element.type == LINE) {
            heartShape.lineTo(element.end[0], element.end[1])
        }
    }
    // const spline = createRoundedPath(vectorPoints, 3)

    const geometry = new THREE.ExtrudeGeometry(heartShape, extrudeSettings)
    geometry.translate(0, 0, -0.5)
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
    return geometry
}
