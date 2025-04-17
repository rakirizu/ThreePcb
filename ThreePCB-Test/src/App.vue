<script setup lang="ts">
import { NewRenderByElement, type RenderInitParams } from 'three-pcb'

import { onMounted, ref, useTemplateRef } from 'vue'
import type { Render } from '../../dist/utils/render/render'
import { loadZip, loadZipFileData } from './utils/loadzip'
import { parseAndPlot } from './utils/parse'
import { renderGerberAsync } from './utils/render'
import { defaultColor, DefaultLaminar } from './utils/render/config'
const threeDom = useTemplateRef('testThree')
let render: Render | null = null
onMounted(() => {
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
        render = NewRenderByElement(threeDom.value, parm)

        console.log(render?.Camera)
    }
})

const openGerber = async (event: Event) => {
    const target = event.target as HTMLInputElement
    if (target.files && target.files.length > 0) {
        console.log('target.files', target.files)
        const res = await loadZip(target.files[0])
        const outline = await loadZipFileData(target.files[0], res.Top.Copper)
        const gerberData = parseAndPlot(outline)
        console.log(gerberData.children[0])
        console.log('res', gerberData)
        renderGerberAsync(gerberData, defaultColor.Copper, DefaultLaminar.Copper, (p) => {
            progress.value = p
        }).then((group) => {
            render?.Scene.add(group)
        })
    } else {
        console.error('No file selected')
    }
}
const progress = ref(0)
</script>

<template>
    <div>
        <input type="file" @change="openGerber" />
        <progress style="width: 200px" max="100" :value="progress"></progress>
        <!-- <button @click="openGerber">打开Gerber</button> -->
    </div>
    <div ref="testThree" style="width: 1000px; height: 1000px; background-color: white"></div>
</template>

<style scoped></style>
