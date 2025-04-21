import JSZip from 'jszip'
import {
    identifyLayers,
    SIDE_BOTTOM,
    SIDE_TOP,
    TYPE_COPPER,
    TYPE_DRILL,
    TYPE_OUTLINE,
    TYPE_SILKSCREEN,
    TYPE_SOLDERMASK,
    TYPE_SOLDERPASTE,
} from 'three-pcb'

export const loadZip = async (file: File): Promise<GerberData> => {
    let GerberData: GerberData | null = {
        Top: {
            Copper: '',
            SolderMask: '',
            SolderPaste: '',
            Silkscreen: '',
        },
        Btm: {
            Copper: '',
            SolderMask: '',
            SolderPaste: '',
            Silkscreen: '',
        },
        Drill: [],
        Outline: '',
    }
    const zip = new JSZip()
    const result = await zip.loadAsync(file)
    let files: string[] = []
    result.forEach(function (_relativePath, _file) {
        files.push(_relativePath)
    })

    const filesLayer = identifyLayers(files)
    for (const _relativePath in filesLayer) {
        const layerInfo = filesLayer[_relativePath]
        console.log(layerInfo)
        if (layerInfo.side == SIDE_TOP) {
            switch (layerInfo.type) {
                case TYPE_COPPER:
                    GerberData.Top.Copper = _relativePath
                    break
                case TYPE_SOLDERMASK:
                    GerberData.Top.SolderMask = _relativePath
                    break
                case TYPE_SOLDERPASTE:
                    GerberData.Top.SolderPaste = _relativePath
                    break
                case TYPE_SILKSCREEN:
                    GerberData.Top.Silkscreen = _relativePath
                    break
                default:
                    break
            }
        }
        if (layerInfo.side == SIDE_BOTTOM) {
            switch (layerInfo.type) {
                case TYPE_COPPER:
                    GerberData.Btm.Copper = _relativePath
                    break
                case TYPE_SOLDERMASK:
                    GerberData.Btm.SolderMask = _relativePath
                    break
                case TYPE_SOLDERPASTE:
                    GerberData.Btm.SolderPaste = _relativePath
                    break
                case TYPE_SILKSCREEN:
                    GerberData.Btm.Silkscreen = _relativePath
                    break
                default:
                    break
            }
        }
        if (layerInfo.type == TYPE_DRILL) {
            GerberData.Drill.push(_relativePath)
        }
        if (layerInfo.type == TYPE_OUTLINE) {
            GerberData.Outline = _relativePath
        }
    }

    console.log(GerberData)
    return GerberData
}

export const loadZipFileData = async (file: File, filename: string): Promise<string> => {
    const zip = new JSZip()
    const result = await zip.loadAsync(file)
    const data = result.file(filename)?.async('string')

    return data ? await data : ''
}
