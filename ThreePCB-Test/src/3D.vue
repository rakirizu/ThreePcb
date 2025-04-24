<script setup lang="ts">
import * as THREE from 'three'
import {
    defaultColor,
    DefaultLaminar,
    NewRenderByElement,
    Render,
    type RenderInitParams,
} from 'three-pcb'
import threeWorker from 'three-pcb/worker/runner?worker'
import * as typed from 'three-pcb/worker/types'
import { onMounted, ref, useTemplateRef } from 'vue'
import { loadZip, loadZipFileData } from './utils/loadzip'
import { renderPCBSvg } from './utils/svg'
// import { renderPCBSvg, type PCBRender } from './utils/pcb'
const threeDom = useTemplateRef('testThree')
let renderer: Render | null = null
const parserWorker = [
    new threeWorker(),
    new threeWorker(),
    new threeWorker(),
    new threeWorker(),
    new threeWorker(),
    new threeWorker(),
]
// let pcbResult: PCBRender = { Top: {}, Btm: {} } as PCBRender
const doAss = () => {
    if (renderer?.Scene) {
        renderPCBSvg()
    }
}
const workerOnmessage = (e: MessageEvent) => {
    const message = e.data as typed.WorkerMessageResp
    let result: THREE.Object3D<THREE.Object3DEventMap> | null = null
    if (message.mod == 'render' || message.mod == 'renderDrill') {
        var loader = new THREE.ObjectLoader()
        result = loader.parse(message.data)
    }
    switch (message.uuid) {
        case 'top_copper':
            if (message.mod == 'render') {
                pcbResult.Top.Copper = result as THREE.Object3D<THREE.Object3DEventMap>
                progress.value[0] = 100
            }
            if (message.mod == 'renderProgress') {
                progress.value[0] = message.data
            }

            break
        case 'btm_copper':
            if (message.mod == 'render') {
                pcbResult.Btm.Copper = result as THREE.Object3D<THREE.Object3DEventMap>
                progress.value[1] = 100
            }
            if (message.mod == 'renderProgress') {
                progress.value[1] = message.data
            }
            break
        case 'outline':
            if (message.mod == 'render') {
                pcbResult.OutLine = result as THREE.Group<THREE.Object3DEventMap>
                progress.value[2] = 100

                console.log(result?.children)
            }
            if (message.mod == 'renderProgress') {
                progress.value[2] = message.data
            }
            break
        case 'top_silk':
            if (message.mod == 'render') {
                pcbResult.Top.Silkscreen = result as THREE.Object3D<THREE.Object3DEventMap>
                progress.value[3] = 100
            }
            if (message.mod == 'renderProgress') {
                progress.value[3] = message.data
            }
            break
        case 'btm_silk':
            if (message.mod == 'render') {
                pcbResult.Btm.Silkscreen = result as THREE.Object3D<THREE.Object3DEventMap>
                progress.value[4] = 100
            }
            if (message.mod == 'renderProgress') {
                progress.value[4] = message.data
            }
            break
        case 'top_mask':
            if (message.mod == 'render') {
                pcbResult.Top.SolderMask = result as THREE.Object3D<THREE.Object3DEventMap>

                progress.value[5] = 100
            }
            if (message.mod == 'renderProgress') {
                progress.value[5] = message.data
            }
            break
        case 'btm_mask':
            if (message.mod == 'render') {
                pcbResult.Btm.SolderMask = result as THREE.Object3D<THREE.Object3DEventMap>

                progress.value[6] = 100
            }
            if (message.mod == 'renderProgress') {
                progress.value[6] = message.data
            }
            break
        case 'top_paste':
            if (message.mod == 'render') {
                pcbResult.Top.SolderPaste = result as THREE.Object3D<THREE.Object3DEventMap>
                progress.value[7] = 100
            }
            if (message.mod == 'renderProgress') {
                progress.value[7] = message.data
            }
            break
        case 'btm_paste':
            if (message.mod == 'render') {
                pcbResult.Btm.SolderPaste = result as THREE.Object3D<THREE.Object3DEventMap>
                progress.value[8] = 100
            }
            if (message.mod == 'renderProgress') {
                progress.value[8] = message.data
            }
            break
        case 'drill':
            console.log('drill', message)
            if (message.mod == 'renderDrill') {
                const drill = result as THREE.Object3D<THREE.Object3DEventMap>
                pcbResult.Drill = drill
                // renderer?.Scene.add(drill)
                progress.value[9] = 100
                console.log('drill ok')
            }
            if (message.mod == 'renderProgress') {
                progress.value[9] = message.data
            }
            break
    }
}

for (let index = 0; index < parserWorker.length; index++) {
    const element = parserWorker[index]
    element.onerror = (e) => {
        console.error(e)
    }
    element.onmessageerror = (e) => {
        console.warn(e)
    }
    element.onmessage = workerOnmessage
}

onMounted(() => {
    console.log(parserWorker)
    const parm: RenderInitParams = {
        AddAnimationLoop: true,
        AddAxesHelper: true,
        AddOrbitControls: true,
        AddResizeListener: true,
    }

    if (!threeDom.value) {
        console.error('threeDom is null')
        return
    } else {
        renderer = NewRenderByElement(threeDom.value, parm)

        console.log(renderer?.Camera)
    }
})
const openGerber = async (event: Event) => {
    const target = event.target as HTMLInputElement
    if (target.files && target.files.length > 0) {
        console.log('target.files', target.files)
        const res = await loadZip(target.files[0])
        // const plotResult = parseAndPlot(await loadZipFileData(target.files[0], res.Outline))
        // console.log(plotResult)
        // const renderResult = render(plotResult, defaultColor.BaseBoard, undefined, true)
        // console.log(renderResult.children[0].geometry)
        // const frontPoints = extractPointsAtZ(renderResult.children[0].geometry, 0.5)
        // const backPoints = extractPointsAtZ(renderResult.children[0].geometry,1);
        // const frontShape = new THREE.Shape(frontPoints)
        // const frontFace = new THREE.Mesh(
        //     new THREE.ShapeGeometry(frontShape),
        //     new THREE.MeshStandardMaterial({ color: 0xff0000 }),
        // )

        // renderer?.Scene.add(renderResult)
        // return
        parserWorker[0].postMessage({
            mod: 'parseAndPlotAndRender',
            uuid: 'top_copper',
            data: await loadZipFileData(target.files[0], res.Top.Copper),
            opt: {
                _color: 0x168039,
                _progress: true,
                thickness: 0.35,
                outline: false,
            },
            outline: false,
        } as typed.WorkerMessageParseAndPlotAndRender)

        parserWorker[1].postMessage({
            mod: 'parseAndPlotAndRender',
            uuid: 'btm_copper',
            data: await loadZipFileData(target.files[0], res.Btm.Copper),
            opt: {
                _color: defaultColor.Copper,
                _progress: true,
                thickness: 0.35,
            },
            outline: false,
        } as typed.WorkerMessageParseAndPlotAndRender)

        parserWorker[2].postMessage({
            mod: 'parseAndPlotAndRender',
            uuid: 'top_silk',
            data: await loadZipFileData(target.files[0], res.Top.Silkscreen),
            opt: {
                _color: defaultColor.Silkscreen,
                _progress: true,
                thickness: 0.35,
            },
            outline: false,
        } as typed.WorkerMessageParseAndPlotAndRender)
        parserWorker[3].postMessage({
            mod: 'parseAndPlotAndRender',
            uuid: 'btm_silk',
            data: await loadZipFileData(target.files[0], res.Btm.Silkscreen),
            opt: {
                _color: defaultColor.Silkscreen,
                _progress: true,
                thickness: 0.35,
            },
            outline: false,
        } as typed.WorkerMessageParseAndPlotAndRender)

        console.log(
            'top_paste',
            res.Top.SolderPaste,
            await loadZipFileData(target.files[0], res.Top.SolderPaste),
        )
        parserWorker[4].postMessage({
            mod: 'parseAndPlotAndRender',
            uuid: 'top_paste',
            data: await loadZipFileData(target.files[0], res.Top.SolderPaste),
            opt: {
                _color: defaultColor.SolderPaste,
                _progress: true,
                thickness: 0.35,
            },
            outline: false,
        } as typed.WorkerMessageParseAndPlotAndRender)
        parserWorker[4].postMessage({
            mod: 'parseAndPlotAndRender',
            uuid: 'btm_paste',
            data: await loadZipFileData(target.files[0], res.Btm.SolderPaste),
            opt: {
                _color: defaultColor.SolderPaste,
                _progress: true,
                thickness: 0.35,
            },
            outline: false,
        } as typed.WorkerMessageParseAndPlotAndRender)

        parserWorker[4].postMessage({
            mod: 'parseAndPlotAndRender',
            uuid: 'top_mask',
            data: await loadZipFileData(target.files[0], res.Top.SolderMask),
            opt: {
                _color: 0xc9a632,
                _progress: true,
                thickness: 0.35,
            },
            outline: false,
        } as typed.WorkerMessageParseAndPlotAndRender)
        parserWorker[4].postMessage({
            mod: 'parseAndPlotAndRender',
            uuid: 'btm_mask',
            data: await loadZipFileData(target.files[0], res.Btm.SolderMask),
            opt: {
                _color: 0xc9a632,
                _progress: true,
                thickness: 0.35,
            },
            outline: false,
        } as typed.WorkerMessageParseAndPlotAndRender)
        parserWorker[4].postMessage({
            mod: 'parseAndPlotAndRender',
            uuid: 'outline',
            data: await loadZipFileData(target.files[0], res.Outline),
            opt: {
                _color: defaultColor.BaseBoard,
                _progress: true,
                thickness: 0.35,
            },
            outline: true,
        } as typed.WorkerMessageParseAndPlotAndRender)

        // console.log('drill', res.Drill)
        let drillList: string[] = []
        for (let index = 0; index < res.Drill.length; index++) {
            const element = res.Drill[index]
            drillList.push(await loadZipFileData(target.files[0], element))
        }
        // drillList.push(element)

        // renderer?.Scene.add(modelres)

        // console.log('drillList', drillList)

        parserWorker[5].postMessage({
            mod: 'renderDrill',
            uuid: 'drill',
            data: drillList,
            opt: {
                _color: 0x333333,
                _progress: true,
                thickness: 0.35,
            },
        } as typed.WorkerMessagePlotAndRenderDrill)
        // const gerberData = parseAndPlot(outline)
        // console.log(gerberData.children[0])
        // console.log('res', gerberData)
        // const group = render(
        //     gerberData,
        //     defaultColor.Copper,
        //     DefaultLaminar.Copper,
        //     (p: number) => {
        //         progress.value = p
        //     },
        // )
    } else {
        console.error('No file selected')
    }
}
const progress = ref([0, 0, 0, 0, 0, 0, 0, 0, 0, 0])
</script>

<template>
    <input type="file" @change="openGerber" />
    <div v-for="(_, i) in progress">
        <progress style="width: 200px" max="100" :value="progress[i]"></progress>
        <!-- <button @click="openGerber">打开Gerber</button> -->
    </div>
    <div>
        <button @click="doAss">组转</button>
    </div>
    <div ref="testThree" style="width: 1000px; height: 1000px; background-color: white"></div>
</template>

<style scoped></style>
