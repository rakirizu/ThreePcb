// @tracespace/plotter
// build abstract board images from @tracespace/parser ASTs
import type { GerberTree } from '../parser'

import { fromGraphics as sizeFromGraphics } from './bounding-box'
import { createGraphicPlotter } from './graphic-plotter'
import { createLocationStore } from './location-store'
import { getPlotOptions } from './options'
import { createToolStore } from './tool-store'
import type { ImageGraphic, ImageTree } from './tree'
import { IMAGE } from './tree'

export * as BoundingBox from './bounding-box'
export { positionsEqual, TWO_PI } from './coordinate-math'
export * from './tree'

export function plot(tree: GerberTree): ImageTree {
  const plotOptions = getPlotOptions(tree)
  const toolStore = createToolStore()
  const locationStore = createLocationStore()
  const graphicPlotter = createGraphicPlotter(tree.filetype)
  const children: ImageGraphic[] = []

  for (const node of tree.children) {
    const tool = toolStore.use(node)
    const location = locationStore.use(node, plotOptions)
    const graphics = graphicPlotter.plot(node, tool, location)

    children.push(...graphics)
  }

  return {
    type: IMAGE,
    units: plotOptions.units,
    size: sizeFromGraphics(children),
    children,
  }
}
