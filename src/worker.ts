import { parse } from './utils/parser'
import { plot } from './utils/plotter'
import { render } from './utils/render'

import {
    ModParse,
    ModParseAndPlotAndRender,
    ModPlot,
    ModRender,
    ModRenderProgress,
    WorkerMessageParse,
    WorkerMessageParseAndPlotAndRender,
    WorkerMessageParseResp,
    WorkerMessagePlot,
    WorkerMessagePlotResp,
    WorkerMessageRender,
    WorkerMessageRenderProgressResp,
    WorkerMessageRenderResp,
} from './workerType'
onmessage = (
    event: MessageEvent<
        | WorkerMessageParse
        | WorkerMessagePlot
        | WorkerMessageRender
        | WorkerMessageParseAndPlotAndRender
    >
) => {
    switch (event.data.mod) {
        case ModParse:
            postMessage({
                mod: ModParse,
                uuid: event.data.uuid,
                data: parse(event.data.data),
            } as WorkerMessageParseResp)
            break
        case ModPlot:
            postMessage({
                mod: ModPlot,
                uuid: event.data.uuid,
                data: plot(event.data.data, event.data.outline),
            } as WorkerMessagePlotResp)
            break
        case ModRender:
            let progressRender: undefined | ((percent: number) => void) = undefined
            if (event.data.opt._progress) {
                progressRender = (percent: number) => {
                    postMessage({
                        mod: ModRenderProgress,
                        uuid: event.data.uuid,
                        data: percent,
                    } as WorkerMessageRenderProgressResp)
                }
            }
            const renderResultRender = render(
                event.data.data,
                event.data.opt._color,
                progressRender,
                event.data.opt.outline
            )
            postMessage({
                mod: ModRender,
                uuid: event.data.uuid,
                data: renderResultRender.toJSON(),
            } as WorkerMessageRenderResp)
            break
        case ModParseAndPlotAndRender:
            let progressRender2: undefined | ((percent: number) => void) = undefined
            if (event.data.opt._progress) {
                progressRender2 = (percent: number) => {
                    postMessage({
                        mod: ModRenderProgress,
                        uuid: event.data.uuid,
                        data: percent,
                    } as WorkerMessageRenderProgressResp)
                }
            }
            const plotAndParse = plot(parse(event.data.data), event.data.outline)
            const renderResult = render(
                plotAndParse,
                event.data.opt._color,
                progressRender2,
                event.data.opt.outline
            )
            postMessage({
                mod: ModRender,
                uuid: event.data.uuid,
                data: renderResult.toJSON(),
            } as WorkerMessageRenderResp)
            break
        default:
            console.warn('[ThreePCB] Invalid worker message', event.data)
    }
}
