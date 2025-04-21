import * as THREE from 'three'
import { GerberTree } from './utils/parser'
import { ImageTree } from './utils/plotter'
export interface WorkerMessage {
    data:
        | WorkerMessageParse
        | WorkerMessagePlot
        | WorkerMessageRender
        | WorkerMessageParseAndPlotAndRender
}

export interface WorkerMessageParseAndPlotAndRender {
    mod: typeof ModParseAndPlotAndRender
    uuid: string
    data: string
    outline: boolean
    opt: gerberRenderOpt
}
export interface WorkerMessageParseAndPlotAndRenderResp {
    mod: typeof ModParseAndPlotAndRender
    uuid: string
    data: THREE.Group
}

export interface WorkerMessageParse {
    mod: typeof ModParse
    uuid: string
    data: string
}
export interface WorkerMessageParseResp {
    mod: typeof ModParse
    uuid: string
    data: GerberTree
}

export interface WorkerMessagePlot {
    mod: typeof ModPlot
    uuid: string
    data: GerberTree
    outline: boolean
}
export interface WorkerMessagePlotResp {
    mod: typeof ModPlot
    uuid: string
    data: ImageTree
}
export interface gerberRenderOpt {
    _color: number
    _progress?: boolean
    outline: boolean
}

export interface WorkerMessageRender {
    mod: typeof ModRender
    uuid: string
    data: ImageTree
    opt: gerberRenderOpt
}

export interface WorkerMessageRenderResp {
    mod: typeof ModRender
    uuid: string
    data: THREE.Object3DJSON
}
export interface WorkerMessageRenderProgressResp {
    mod: typeof ModRenderProgress
    uuid: string
    data: number
}

export const ModParseAndPlotAndRender = 'parseAndPlotAndRender'

export const ModParse = 'parse'

export const ModPlot = 'plot'

export const ModRender = 'render'

export const ModRenderProgress = 'renderProgress'

export type WorkerMessageResp =
    | WorkerMessageParseResp
    | WorkerMessagePlotResp
    | WorkerMessageRenderResp
    | WorkerMessageRenderProgressResp
    | WorkerMessageParseAndPlotAndRenderResp
