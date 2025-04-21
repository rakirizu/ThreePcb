// Graphic plotter
// Takes nodes and turns them into graphics to be added to the image
import {
    CCW_ARC,
    CLEAR,
    CW_ARC,
    DARK,
    DONE,
    DRILL,
    Filetype,
    GerberNode,
    GRAPHIC,
    GraphicType,
    INTERPOLATE_MODE,
    InterpolateModeType,
    LINE,
    LOAD_POLARITY,
    MOVE,
    QUADRANT_MODE,
    REGION_MODE,
    SEGMENT,
    SHAPE,
    SINGLE,
    SLOT,
} from '../../parser'

import type { Location } from '../location-store'
import type { Tool } from '../tool-store'
import { MACRO_TOOL, SIMPLE_TOOL } from '../tool-store'
import * as Tree from '../tree'

import { plotMacro } from './plot-macro'
import { ArcDirection, CCW, CW, plotContour, plotLine, plotSegment } from './plot-path'
import { plotShape } from './plot-shape'

export interface GraphicPlotter {
    plot: (node: GerberNode, tool: Tool | undefined, location: Location) => Tree.ImageGraphic[]
}

export function createGraphicPlotter(filetype: Filetype, isOutline: boolean): GraphicPlotter {
    let prototype = { ...GraphicPlotterPrototype }
    prototype._isOutline = isOutline
    const plotter = Object.create(prototype)
    return filetype === DRILL ? Object.assign(plotter, DrillGraphicPlotterTrait) : plotter
}

interface GraphicPlotterImpl extends GraphicPlotter {
    _currentPath: CurrentPath | undefined
    _arcDirection: ArcDirection | undefined
    _ambiguousArcCenter: boolean
    _regionMode: boolean
    _defaultGraphic: GraphicType | undefined
    _polarity: typeof DARK | typeof CLEAR
    _isOutline: boolean
    _setGraphicState: (node: GerberNode) => void

    _plotCurrentPath: (
        node: GerberNode,
        nextTool: Tool | undefined,
        nextGraphicType: GraphicType | undefined
    ) => Tree.ImageGraphicBase | undefined
}

interface CurrentPath {
    segments: Tree.PathSegment[]
    tool: Tool | undefined
    region: boolean
}

const GraphicPlotterPrototype: GraphicPlotterImpl = {
    _currentPath: undefined,
    _arcDirection: undefined,
    _ambiguousArcCenter: false,
    _regionMode: false,
    _defaultGraphic: undefined,
    _polarity: DARK,
    _isOutline: false,

    plot(node: GerberNode, tool: Tool | undefined, location: Location): Tree.ImageGraphic[] {
        const graphics: Tree.ImageGraphic[] = []

        let nextGraphicType: GraphicType | undefined
        if (node.type !== GRAPHIC) {
            nextGraphicType = undefined
        } else if (node.graphic !== undefined) {
            nextGraphicType = node.graphic
        } else if (this._defaultGraphic !== undefined) {
            nextGraphicType = this._defaultGraphic
        }

        const pathGraphic = this._plotCurrentPath(node, tool, nextGraphicType)

        if (pathGraphic !== undefined) {
            graphics.push({
                ...pathGraphic,
                polarity: this._polarity,
                dcode: undefined,
            })
        }

        this._setGraphicState(node)

        if (nextGraphicType === SHAPE && tool?.type === SIMPLE_TOOL) {
            graphics.push({
                type: Tree.IMAGE_SHAPE,
                shape: plotShape(tool, location),
                polarity: this._polarity,
                dcode: tool.dcode,
            })
        }

        if (nextGraphicType === SHAPE && tool?.type === MACRO_TOOL) {
            graphics.push({
                type: Tree.IMAGE_SHAPE,
                shape: plotMacro(tool, location),
                polarity: this._polarity,
                dcode: tool.dcode,
            })
        }

        if (nextGraphicType === SEGMENT && this._regionMode) {
            this._currentPath = this._currentPath ?? {
                segments: [],
                region: this._regionMode,
                tool,
            }

            this._currentPath.segments.push(
                plotSegment(location, this._arcDirection, this._ambiguousArcCenter)
            )
        }

        if (nextGraphicType === SEGMENT && !this._regionMode) {
            const pathGraphic = plotLine(
                plotSegment(location, this._arcDirection, this._ambiguousArcCenter),
                tool,
                this._isOutline
            )

            if (pathGraphic !== undefined) {
                graphics.push({
                    ...pathGraphic,
                    polarity: this._polarity,
                    dcode: tool?.dcode,
                })
            }
        }

        if (nextGraphicType === SLOT) {
            console.log('nextGraphicType === SLOT')
            const slotPathGraphic = plotLine(plotSegment(location), tool)

            if (slotPathGraphic !== undefined) {
                graphics.push({
                    ...slotPathGraphic,
                    polarity: this._polarity,
                    dcode: tool?.dcode,
                })
            }
        }

        return graphics
    },

    _setGraphicState(node: GerberNode) {
        if (node.type === INTERPOLATE_MODE) {
            this._arcDirection = arcDirectionFromMode(node.mode)
        }

        if (node.type === QUADRANT_MODE) {
            this._ambiguousArcCenter = node.quadrant === SINGLE
        }

        if (node.type === REGION_MODE) {
            this._regionMode = node.region
        }

        if (node.type === LOAD_POLARITY) {
            this._polarity = node.polarity
        }

        if (node.type === GRAPHIC) {
            switch (node.graphic) {
                case SEGMENT: {
                    this._defaultGraphic = SEGMENT
                    break
                }
                case MOVE: {
                    this._defaultGraphic = MOVE
                    break
                }
                case SHAPE: {
                    this._defaultGraphic = SHAPE
                    break
                }
                default: {
                    break
                }
            }
        }
    },

    _plotCurrentPath(
        node: GerberNode,
        nextTool: Tool | undefined,
        nextGraphicType: GraphicType | undefined
    ): Tree.ImageGraphicBase | undefined {
        if (this._currentPath === undefined) {
            return undefined
        }

        if (
            nextTool !== this._currentPath.tool ||
            node.type === REGION_MODE ||
            node.type === DONE ||
            (nextGraphicType === MOVE && this._currentPath.region) ||
            nextGraphicType === SHAPE ||
            node.type === LOAD_POLARITY
        ) {
            console.log('_plotCurrentPath', this._currentPath)
            const pathGraphic = plotContour(this._currentPath.segments)

            this._currentPath = undefined
            return pathGraphic
        }
    },
}

const DrillGraphicPlotterTrait: Partial<GraphicPlotterImpl> = {
    _defaultGraphic: SHAPE,
    _ambiguousArcCenter: true,

    _setGraphicState(node: GerberNode): GraphicType | undefined {
        if (node.type === INTERPOLATE_MODE) {
            const { mode } = node
            this._arcDirection = arcDirectionFromMode(mode)

            if (mode === CW_ARC || mode === CCW_ARC || mode === LINE) {
                this._defaultGraphic = SEGMENT
            } else if (mode === MOVE) {
                this._defaultGraphic = MOVE
            } else {
                this._defaultGraphic = SHAPE
            }
        }

        if (node.type !== GRAPHIC) {
            return undefined
        }

        return node.graphic ?? this._defaultGraphic
    },
}

function arcDirectionFromMode(mode: InterpolateModeType | undefined): ArcDirection | undefined {
    if (mode === CCW_ARC) return CCW
    if (mode === CW_ARC) return CW
    return undefined
}
