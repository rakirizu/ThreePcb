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
    Drill: number
    Silkscreen: number
    BaseBoard: number
}

export const defaultColor: colorSettings = {
    Copper: 0x168039,
    SolderMask: 0x225933,
    Silkscreen: 0xdddddd,
    BaseBoard: 0xbfa782,
    Drill: 0x333333,
}
export interface LaminarStructure {
    //铜层厚度
    Copper: number
    //阻焊层厚度
    SolderMask: number
    //绿油层
    Oil: number
    //基板
    Total: number
    //丝印层
    Silkscreen: number
}
export const DefaultLaminar: LaminarStructure = {
    Copper: 0.035,
    SolderMask: 0.04,
    Oil: 0.01,
    Total: 1.6,
    Silkscreen: 0.01,
}
