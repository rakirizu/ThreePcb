# WebGerber
Printed circuit board visualization tools for JavaScript, fork from [tracespace/tracespace](https://github.com/tracespace/tracespace)

✨ Support SVG and [three.js](https://github.com/mrdoob/three.js)!

![PCB](https://github.com/rakirizu/WebGerber/blob/main/img/pcb.png?raw=true)

## Install
npm
```shell
npm install web-gerber
```
pnpm
```shell
pnpm install web-gerber
```
yarn
```shell
yarn add web-gerber
```

## Usage
### 1. parse and plot
```typescript
import { parse, plot } from 'web-gerber'

const gerber_str = "" // load your gerber string from somewhere

const parse_result = parse(gerber_str)
const plot_result = plot(parse_result)
```
### 2. render
#### 2.1. Render to svg
Now, you can convert `plot_result` to svg
> Notice: We use [syntax-tree/hast-util-to-html](https://github.com/syntax-tree/hast-util-to-html) convert svg tree to svg in html, you should install this first, such as `npm install hast-util-to-html` or `yarn add hast-util-to-html`
```TypeScript
import { renderSVG } from 'web-gerber'
import { toHtml } from 'hast-util-to-html' //if you want to convert svg tree to html

const svg_tree = renderSVG(plot_result)

// convert to html and show in html
const html_svg = toHtml(svg_tree)
// show in html
document.getElementById('svg')!.innerHTML = html_svg
```
full demo is in [TEST/src/Svg.vue](https://github.com/rakirizu/WebGerber/blob/main/TEST/src/Svg.vue)
#### 2.2. Render in three.js
First, initialization three.js interface,

if you already have three.js interface
```typescript
// if you already have three.js scene, camera, and render
import { NewRenderByThreeInterface } from 'web-gerber'
const three_pcb_render = NewRenderByThreeInterface(scene,camera,renderer)
```
or you can use `NewRenderByElement` quickly start three.js interface
```typescript
import { NewRenderByElement } from 'web-gerber'

//you should provide dom to render, please refer to three.js doc for details.

const el = document.getElementById('testThreeDom')  // make sure it's width and height!
const parm: RenderInitParams = {
    AddAnimationLoop: true,
    AddAxesHelper: true,
    AddOrbitControls: true,
    AddResizeListener: true,
}
const three_pcb_render = NewRenderByElement(el, parm)
```

Second, render to three.js object
```Typescript
import { renderThree,defaultColor } from 'web-gerber'

const three_mesh = renderThree(plot_result,defaultColor.BaseBoard, undefined, false)

```
three_mesh can add to three.js scene by `scene.add(three_mesh)`, but we often need assemble different layers. web-gerber provide `assemblyPCBToThreeJS` to  directly assemble different layers.
```typescript
// you should render outline, drill, (copper, soldermask, silk) of top and bottom
// top_copper_mesh = renderThree(plot_result_top_copper,defaultColor.Copper, undefined, false)
// btm_copper_mesh = renderThree(plot_result_btm_copper,defaultColor.Copper, undefined, false)
import { DefaultLaminar } from 'web-gerber' //default layer thickness


const pcb_struct = {
	Top: {
		Copper: top_copper_mesh,
		SolidMask: top_mask_mesh,
		Silkscreen: top_silk_mesh
	},
	Btm:{
		Copper: btm_copper_mesh,
		SolidMask: btm_mask_mesh,
		Silkscreen: btm_silk_mesh
	},
	Outline: outline_mesh,
	Drill: drill_mesh
}


assemblyPCBToThreeJS(three_pcb_render.Scene, pcb_struct, DefaultLaminar)
```
If all goes well, you will see a beautiful PCB in three.js, good luck :)

## Worker
For large or complex PCB, the time required for rendering is usually very long, and web pages may become block, resulting in a poor user experience, worker can improved this problem.

WebGerber Support rendering 3D by [Worker](https://developer.mozilla.org/en-US/docs/Web/API/Worker/Worker), You can use by:
```Typescript
import threeWorker from 'web-gerber/worker/runner?worker'
const renderWorker = new threeWorker()
```
Of course, we support multiple workers:

```typescript
import threeWorker from 'web-gerber/worker/runner?worker'
const renderWorker1 = new threeWorker()
const renderWorker2 = new threeWorker()
const renderWorker3 = new threeWorker()
...
```
Now, you can `postMessage` to worker and receive `onmessage` from worker !

> worker's documentwWait for the update. It will come soon...
> star this project for support us!