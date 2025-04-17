import type { ExtrudeGeometryOptions } from 'three'

export const extrudeSettings: ExtrudeGeometryOptions = {
    depth: 1,
    bevelEnabled: true,
    bevelSize: 0,
    bevelSegments: 1,
    bevelThickness: 0,
    steps: 1,
}

export interface colorSettings {
    Copper: number
    SolderMask: number
    SolderPaste: number
    Silkscreen: number
}

export const defaultColor: colorSettings = {
    Copper: 0xe18a3b,
    SolderMask: 0x6a8d52,
    SolderPaste: 0xb2b6b6,
    Silkscreen: 0xffffff,
}
export interface LaminarStructure {
    //铜层厚度
    Copper: number
    //阻焊层厚度
    SolderMask: number
    //锡膏层
    SolderPaste: number
    //基板
    Substrate: number
    //丝印层
    Silkscreen: number
}
export const DefaultLaminar: LaminarStructure = {
    Copper: 0.035,
    SolderMask: 0.01,
    SolderPaste: 0.01,
    Substrate: 0.87,
    Silkscreen: 0.01,
}
