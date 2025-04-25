# WebGerber
适用于JavaScript的印刷电路板可视化工具, 从 [tracespace/tracespace](https://github.com/tracespace/tracespace) 项目派生而来


## 安装
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

## 使用
### 1. parse and plot
```typescript
import { parse, plot } from 'web-gerber'

const gerber_str = "" // 根据你的情况给gerber_str赋值

const parse_result = parse(gerber_str)
const plot_result = plot(parse_result)
```
### 2. render
#### 2.1. Render to svg
当我们成功`parse`和`plot`后，就可以将`plot`的结果`plot_result`转化为SVG了，
> 注意: 需要使用 [syntax-tree/hast-util-to-html](https://github.com/syntax-tree/hast-util-to-html) 将生成的SVG结构体转为HTML, 默认是不带的，你需要根据你使用的包管理工具进行安装, 例如 `npm install hast-util-to-html` or `yarn add hast-util-to-html`
```TypeScript
import { renderSVG } from 'web-gerber'
import { toHtml } from 'hast-util-to-html' //如果你需要转为html里面显示的话需要导入这个

const svg_tree = renderSVG(plot_result)

// 转为HTML
const html_svg = toHtml(svg_tree)
// 在HTML中显示
document.getElementById('svg')!.innerHTML = html_svg
```
完整的示例在 [TEST/src/Svg.vue](https://github.com/rakirizu/WebGerber/blob/main/TEST/src/Svg.vue)
#### 2.2. Render in three.js
首先，需要初始化Three.js实例，可以是现有的，也可以新创建

如果目前已经有实例的话，可以直接基于当前实例去使用，scene,camera,renderer都需要是当前已初始化的
```typescript
import { NewRenderByThreeInterface } from 'web-gerber'
const three_pcb_render = NewRenderByThreeInterface(scene,camera,renderer)
```
如果当前没有实例，可以通过 `NewRenderByElement` 快速创建一个，只需要给渲染的目标DOM即可。
```typescript
import { NewRenderByElement } from 'web-gerber'

//你需要自己创建一个id为testThreeDom的DIV DOM，并给需要的长宽
const el = document.getElementById('testThreeDom') 
const parm: RenderInitParams = {
    AddAnimationLoop: true,  //是否添加内部的持续选热
    AddAxesHelper: true,     //是否添加一个轴辅助工具
    AddOrbitControls: true,  //是否添加控制器方便控制视角
    AddResizeListener: true, //是否监听窗口改变事件以自适应大小
}
const three_pcb_render = NewRenderByElement(el, parm)
```

然后需要将不同的层文件渲染为不同的Mesh对象
```Typescript
import { renderThree,defaultColor } from 'web-gerber'

const three_mesh = renderThree(plot_result,defaultColor.BaseBoard, undefined, false)

```
这个时候就可以提供 `scene.add(three_mesh)` 添加到3D中直接查看了，但是只有单层的, 我们通常需要不同层组装起来看起来是一个完整的、更真实的PCB，web-gerber 提供了一个 `assemblyPCBToThreeJS` 工具将不同层的mesh组装为一个PCB，前提是渲染好不同层的Mesh。
```typescript
// you should render outline, drill, (copper, soldermask, silk) of top and bottom
// top_copper_mesh = renderThree(plot_result_top_copper,defaultColor.Copper, undefined, false)
// btm_copper_mesh = renderThree(plot_result_btm_copper,defaultColor.Copper, undefined, false)
import { DefaultLaminar } from 'web-gerber' //默认组装层高度

//这些都需要你自己渲染
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
如果一切顺利，一个好看的PCB的将在你的Three.js创建的3D场景中渲染出来, 祝您好运 :)

## Worker
渲染大型或复杂的PCB通常会花费非常长的时间，如果全部放在JS主线程中执行会导致网页卡死带来糟糕的用户体验，我们提供了Worker去改善这个问题

WebGerber 支持通过[Worker](https://developer.mozilla.org/en-US/docs/Web/API/Worker/Worker)渲染3D模型, 通过以下方式使用它:
```Typescript
import threeWorker from 'web-gerber/worker/runner?worker'
const renderWorker = new threeWorker()
```
你可以创建多个Worker去榨干用户所有的CPU性能：

```typescript
import threeWorker from 'web-gerber/worker/runner?worker'
const renderWorker1 = new threeWorker()
const renderWorker2 = new threeWorker()
const renderWorker3 = new threeWorker()
...
```
现在你可以 `postMessage` 给worker或接收来自worker的 `onmessage`

> Worker的相关文档还在完善中，将在不久后到来...
> star 这个项目来支持我们!