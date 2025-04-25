interface GerberLayer {
    Copper: string
    SolderMask: string
    SolderPaste: string
    Silkscreen: string
}
interface GerberData {
    Top: GerberLayer
    Btm: GerberLayer
    Drill: string[]
    Outline: string
}
