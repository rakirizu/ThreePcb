import * as THREE from 'three'
import { type LaminarStructure } from 'three-pcb'
export interface PCBRender {
    Top: LayerStruct
    Btm: LayerStruct
    OutLine: THREE.Object3D
}
export interface LayerStruct {
    Copper: THREE.Object3D
    SolderMask: THREE.Object3D
    SolderPaste: THREE.Object3D
    Silkscreen: THREE.Object3D
}

export const assemblyPCB = (
    scene: THREE.Scene,
    _pcb: PCBRender,
    thicknessConfig: LaminarStructure,
) => {
    const mainBoardThickness =
        thicknessConfig.Total -
        thicknessConfig.Copper * 2 -
        thicknessConfig.Silkscreen * 2 -
        thicknessConfig.SolderMask * 2 -
        thicknessConfig.SolderPaste * 2
    _pcb.OutLine.scale.setZ(mainBoardThickness)

    _pcb.Top.Copper.scale.setZ(thicknessConfig.Copper)
    _pcb.Btm.Copper.scale.setZ(thicknessConfig.Copper)

    // _pcb.Top.SolderMask.scale.setZ(thicknessConfig.SolderMask)
    // _pcb.Btm.SolderMask.scale.setZ(thicknessConfig.SolderMask)

    // _pcb.Top.SolderPaste.scale.setZ(thicknessConfig.SolderPaste)
    // _pcb.Btm.SolderPaste.scale.setZ(thicknessConfig.SolderPaste)

    // _pcb.Top.Silkscreen.scale.setZ(thicknessConfig.Silkscreen)
    // _pcb.Btm.Silkscreen.scale.setZ(thicknessConfig.Silkscreen)

    const halfMainBoardThickness = mainBoardThickness / 2
    _pcb.Top.Copper.position.setZ(halfMainBoardThickness - thicknessConfig.Copper)
    _pcb.Btm.Copper.position.setZ(halfMainBoardThickness - thicknessConfig.Copper)

    scene.add(_pcb.OutLine)
    scene.add(_pcb.Top.Copper)
    // 你好
    
    scene.add(_pcb.Btm.Copper)
    scene.updateMatrix()
    scene.updateMatrixWorld()
}
