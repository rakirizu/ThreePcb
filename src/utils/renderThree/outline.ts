import * as THREE from 'three'
import { ARC, ImageGraphic, PathArcSegment, PLOT_LINE } from '../plotter'

export const renderImageOutline = (element: ImageGraphic, shape: THREE.Shape) => {
    if (element.type != 'imagePath') {
        console.warn('[WebGerber] Invalid outline type', element)
        return null
    }
    if (element.segments.length != 1) {
        console.warn('[WebGerber] Invalid outline segments length', element)
        return null
    }
    const path = element.segments[0]
    shape.moveTo(path.start[0], path.start[1])
    if (path.type == ARC) {
        const regionData = path as PathArcSegment
        shape.absarc(
            regionData.center[0],
            regionData.center[1],
            regionData.radius,
            regionData.start[2],
            regionData.end[2],
            regionData.start[2] > regionData.end[2]
        )
    } else if (path.type == PLOT_LINE) {
        shape.lineTo(path.end[0], path.end[1])
    } else {
        console.warn('[WebGerber] Invalid outline type', path)
    }
}
