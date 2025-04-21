import { parse, plot } from 'three-pcb'
export const parseAndPlot = (data: string) => {
    const gerberParse = parse(data)
    console.log(gerberParse)
    const gerberPlot = plot(gerberParse, true)
    return gerberPlot
}
