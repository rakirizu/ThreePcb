import type { SimpleShape } from '../../parser'
import { CIRCLE, OBROUND, POLYGON, RECTANGLE } from '../../parser'

import { HALF_PI, PI, THREE_HALF_PI, TWO_PI, degreesToRadians } from '../coordinate-math'

import type { Point } from '../location-store'
import * as Tree from '../tree'

export function createShape(shape: SimpleShape, point: Point): Tree.PLOT_SimpleShape {
    const { x, y } = point

    switch (shape.type) {
        case CIRCLE: {
            const { diameter } = shape
            return { type: Tree.PLOT_CIRCLE, cx: x, cy: y, r: diameter / 2 }
        }

        case RECTANGLE:
        case OBROUND: {
            const { xSize, ySize } = shape
            const xHalf = xSize / 2
            const yHalf = ySize / 2
            const rectangle: Tree.RectangleShape = {
                type: Tree.PLOT_RECTANGLE,
                x: x - xHalf,
                y: y - yHalf,
                xSize,
                ySize,
            }

            if (shape.type === OBROUND) {
                rectangle.r = Math.min(xHalf, yHalf)
            }

            return rectangle
        }

        case POLYGON: {
            const { diameter, rotation, vertices } = shape
            const r = diameter / 2
            const offset = degreesToRadians(rotation ?? 0)
            const step = TWO_PI / vertices
            const points = Array.from({ length: vertices }).map<Tree.Position>((_, index) => {
                const theta = step * index + offset
                const pointX = x + r * Math.cos(theta)
                const pointY = y + r * Math.sin(theta)
                return [pointX, pointY]
            })

            return { type: Tree.PLOT_POLYGON, points }
        }
    }
}

export function shapeToSegments(shape: Tree.PLOT_SimpleShape): Tree.PathSegment[] {
    if (shape.type === Tree.PLOT_CIRCLE) {
        const { cx, cy, r } = shape
        return [
            {
                type: Tree.ARC,
                start: [cx + r, cy, 0],
                end: [cx + r, cy, TWO_PI],
                center: [cx, cy],
                radius: r,
            },
        ]
    }

    if (shape.type === Tree.PLOT_RECTANGLE) {
        const { x, y, xSize, ySize, r } = shape

        if (r === xSize / 2) {
            return [
                {
                    type: Tree.PLOT_LINE,
                    start: [x + xSize, y + r],
                    end: [x + xSize, y + ySize - r],
                },
                {
                    type: Tree.ARC,
                    start: [x + xSize, y + ySize - r, 0],
                    end: [x, y + ySize - r, PI],
                    center: [x + r, y + ySize - r],
                    radius: r,
                },
                { type: Tree.PLOT_LINE, start: [x, y + ySize - r], end: [x, y + r] },
                {
                    type: Tree.ARC,
                    start: [x, y + r, PI],
                    end: [x + xSize, y + r, TWO_PI],
                    center: [x + r, y + r],
                    radius: r,
                },
            ]
        }

        if (r === ySize / 2) {
            return [
                { type: Tree.PLOT_LINE, start: [x + r, y], end: [x + xSize - r, y] },
                {
                    type: Tree.ARC,
                    start: [x + xSize - r, y, -HALF_PI],
                    end: [x + xSize - r, y + ySize, HALF_PI],
                    center: [x + xSize - r, y + r],
                    radius: r,
                },
                {
                    type: Tree.PLOT_LINE,
                    start: [x + xSize - r, y + ySize],
                    end: [x + r, y + ySize],
                },
                {
                    type: Tree.ARC,
                    start: [x + r, y + ySize, HALF_PI],
                    end: [x + r, y, THREE_HALF_PI],
                    center: [x + r, y + r],
                    radius: r,
                },
            ]
        }

        return [
            { type: Tree.PLOT_LINE, start: [x, y], end: [x + xSize, y] },
            { type: Tree.PLOT_LINE, start: [x + xSize, y], end: [x + xSize, y + ySize] },
            { type: Tree.PLOT_LINE, start: [x + xSize, y + ySize], end: [x, y + ySize] },
            { type: Tree.PLOT_LINE, start: [x, y + ySize], end: [x, y] },
        ]
    }

    if (shape.type === Tree.PLOT_POLYGON) {
        return shape.points.map((start, index) => {
            const endIndex = index < shape.points.length - 1 ? index + 1 : 0
            return { type: Tree.PLOT_LINE, start, end: shape.points[endIndex] }
        })
    }

    return shape.segments
}
