// Graphic plotter
// Takes nodes and turns them into graphics to be added to the image
import type { Filetype, GerberNode, GraphicType, InterpolateModeType } from '../../parser'
import {
  CCW_ARC,
  CW_ARC,
  DONE,
  DRILL,
  GRAPHIC,
  INTERPOLATE_MODE,
  LINE,
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
import type { ArcDirection } from './plot-path'
import { CCW, CW, plotPath, plotSegment } from './plot-path'
import { plotShape } from './plot-shape'

export interface GraphicPlotter {
  plot: (node: GerberNode, tool: Tool | undefined, location: Location) => Tree.ImageGraphic[]
}

export function createGraphicPlotter(filetype: Filetype): GraphicPlotter {
  const plotter = Object.create(GraphicPlotterPrototype)

  return filetype === DRILL ? Object.assign(plotter, DrillGraphicPlotterTrait) : plotter
}

interface GraphicPlotterImpl extends GraphicPlotter {
  _currentPath: CurrentPath | undefined
  _arcDirection: ArcDirection | undefined
  _ambiguousArcCenter: boolean
  _regionMode: boolean
  _defaultGraphic: GraphicType | undefined

  _setGraphicState: (node: GerberNode) => GraphicType | undefined

  _plotCurrentPath: (
    node: GerberNode,
    nextTool: Tool | undefined,
    nextGraphicType: GraphicType | undefined
  ) => Tree.ImageGraphic | undefined
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

  plot(node: GerberNode, tool: Tool | undefined, location: Location): Tree.ImageGraphic[] {
    const graphics: Tree.ImageGraphic[] = []
    const nextGraphicType = this._setGraphicState(node)
    const pathGraphic = this._plotCurrentPath(node, tool, nextGraphicType)

    if (pathGraphic !== undefined) {
      graphics.push(pathGraphic)
    }

    if (nextGraphicType === SHAPE && tool?.type === SIMPLE_TOOL) {
      graphics.push({ type: Tree.IMAGE_SHAPE, shape: plotShape(tool, location) })
    }

    if (nextGraphicType === SHAPE && tool?.type === MACRO_TOOL) {
      graphics.push({ type: Tree.IMAGE_SHAPE, shape: plotMacro(tool, location) })
    }

    if (nextGraphicType === SEGMENT) {
      this._currentPath = this._currentPath ?? {
        segments: [],
        region: this._regionMode,
        tool,
      }

      this._currentPath.segments.push(
        plotSegment(location, this._arcDirection, this._ambiguousArcCenter)
      )
    }

    if (nextGraphicType === SLOT) {
      const slotPathGraphic = plotPath([plotSegment(location)], tool)

      if (slotPathGraphic !== undefined) {
        graphics.push(slotPathGraphic)
      }
    }

    return graphics
  },

  _setGraphicState(node: GerberNode): GraphicType | undefined {
    if (node.type === INTERPOLATE_MODE) {
      this._arcDirection = arcDirectionFromMode(node.mode)
    }

    if (node.type === QUADRANT_MODE) {
      this._ambiguousArcCenter = node.quadrant === SINGLE
    }

    if (node.type === REGION_MODE) {
      this._regionMode = node.region
    }

    if (node.type !== GRAPHIC) {
      return undefined
    }

    if (node.graphic === SEGMENT) {
      this._defaultGraphic = SEGMENT
    } else if (node.graphic !== undefined) {
      this._defaultGraphic = undefined
    }

    return node.graphic ?? this._defaultGraphic
  },

  _plotCurrentPath(
    node: GerberNode,
    nextTool: Tool | undefined,
    nextGraphicType: GraphicType | undefined
  ): Tree.ImageGraphic | undefined {
    if (this._currentPath === undefined) {
      return undefined
    }

    if (
      nextTool !== this._currentPath.tool ||
      node.type === REGION_MODE ||
      node.type === DONE ||
      (nextGraphicType === MOVE && this._currentPath.region) ||
      nextGraphicType === SHAPE
    ) {
      const pathGraphic = plotPath(
        this._currentPath.segments,
        this._currentPath.tool,
        this._currentPath.region
      )

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
