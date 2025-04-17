import { parse, plot } from 'three-pcb'
export const parseAndPlot = (data: string) => {
    const gerberParse = parse(data)
    const gerberPlot = plot(gerberParse)
    return gerberPlot
}
