<script setup lang="ts">
import { toHtml } from 'hast-util-to-html'
import { parse, plot } from 'three-pcb'
import { loadZip, loadZipFileData } from './utils/loadzip'
import { renderSVG } from './utils/svgRender'
const openGerber = async (event: Event) => {
    const target = event.target as HTMLInputElement
    if (target.files && target.files.length > 0) {
        const res = await loadZip(target.files[0])
        console.log('res', res)
        const result = plot(parse(await loadZipFileData(target.files[0], res.Top.Copper)), false)
        console.log('result', result)
        const result2 = toHtml(renderSVG(result))
        document.getElementById('svg')!.innerHTML = result2
    }
}
</script>
<template>
    <input type="file" @change="openGerber" />
    <div id="svg"></div>
</template>
