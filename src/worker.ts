import * as THREE from 'three'
import { parse } from './utils/parser'
import { plot } from './utils/plotter'
import { render } from './utils/render'

import {
    ModParse,
    ModParseAndPlotAndRender,
    ModPlot,
    ModPlotAndRenderDrill,
    ModRender,
    ModRenderProgress,
    WorkerMessageParse,
    WorkerMessageParseAndPlotAndRender,
    WorkerMessageParseResp,
    WorkerMessagePlot,
    WorkerMessagePlotAndRenderDrill,
    WorkerMessagePlotAndRenderDrillResp,
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
        | WorkerMessagePlotAndRenderDrill
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
                event.data.outline
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
                event.data.outline
            )
            postMessage({
                mod: ModRender,
                uuid: event.data.uuid,
                data: renderResult.toJSON(),
            } as WorkerMessageRenderResp)
            break
        case ModPlotAndRenderDrill:
            let progressRenderDrill: undefined | ((percent: number) => void) = undefined
            let currentIndex = 0
            const totalLength = event.data.data.length
            const singleProgress = 1 / totalLength

            if (event.data.opt._progress) {
                progressRenderDrill = (percent: number) => {
                    percent =
                        ((percent / 100) * singleProgress + currentIndex * singleProgress) * 100
                    postMessage({
                        mod: ModRenderProgress,
                        uuid: event.data.uuid,
                        data: percent,
                    } as WorkerMessageRenderProgressResp)
                }
            }
            let group = new THREE.Group()
            for (currentIndex = 0; currentIndex < event.data.data.length; currentIndex++) {
                const element = event.data.data[currentIndex]
                const drillParseResult = parse(element)
                console.log('drillParseResult', drillParseResult)
                if (drillParseResult.filetype != 'drill') {
                    continue
                }
                const plotAndParse = plot(drillParseResult, false)
                const renderResult = render(
                    plotAndParse,
                    event.data.opt._color,
                    progressRenderDrill,
                    false
                )
                group.add(renderResult)
            }
            postMessage({
                mod: ModPlotAndRenderDrill,
                uuid: event.data.uuid,
                data: group.toJSON(),
            } as WorkerMessagePlotAndRenderDrillResp)

            break

        default:
            console.warn('[ThreePCB] Invalid worker message', event.data)
    }
}
