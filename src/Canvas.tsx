import React, { ForwardedRef, MutableRefObject } from 'react'
import { fabric } from 'fabric'

type DBTargets = 'rect' | 'text'
type Props = {
  fabricRef: MutableRefObject<fabric.Canvas | null>
}

const Canvas = React.forwardRef(
  ({ fabricRef }: Props, ref: ForwardedRef<HTMLCanvasElement>) => {
    if (typeof ref === 'function') {
      throw new Error(
        `Only React Refs that are created with createRef or useRef are supported`
      )
    }

    // const canvasRef = ref
    const [currentColor, setCurrentColor] = React.useState('#8989D1')
    const [currentWidth, setCurrentWidth] = React.useState(5)
    const [dbClickTarget, setDBClickTarget] = React.useState<DBTargets>()

    // 滑鼠的模式：筆刷或是選取
    const [isDrawingMode, setIsDrawingMode] = React.useState(false)

    // 一般模式跟畫圖模式間切換
    const handleToggleDrawingMode = (
      e: React.ChangeEvent<HTMLSelectElement>
    ) => {
      const fabricInstance = fabricRef.current
      if (fabricInstance) {
        const mode = e.target.value
        fabricInstance.isDrawingMode = mode === 'draw'
        setIsDrawingMode(fabricInstance.isDrawingMode)
      }
    }

    // 取消畫圖模式
    const closeDrawingMode = () => {
      const fabricInstance = fabricRef.current
      if (fabricInstance) {
        fabricInstance.isDrawingMode = false
        setIsDrawingMode(false)
      }
    }
    // 新增方形
    const addRectangle = (left: number, top: number) => {
      const fabricInstance = fabricRef.current as fabric.Canvas

      const rect = new fabric.Rect({
        top: top - 25,
        left: left - 25,
        width: 50,
        height: 50,
        fill: currentColor,
      })

      fabricInstance.add(rect)
    }

    // 新增文字方塊
    const addTextbox = (left: number, top: number) => {
      const fabricInstance = fabricRef.current as fabric.Canvas

      const text = new fabric.Textbox('文字', {
        top: top - 25,
        left: left - 25,
        fill: currentColor,
      })
      fabricInstance.add(text)
    }

    // 選色
    const handleColorPick = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newColor = (e.target as HTMLInputElement).value
      setCurrentColor(newColor)

      if (!fabricRef.current) return
      const activeObject = fabricRef.current.getActiveObject()
      if (activeObject) {
        activeObject.set('fill', newColor)
        fabricRef.current.renderAll()
      }
    }

    // 選寬度
    const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setCurrentWidth(parseInt((e.target as HTMLInputElement).value))
    }

    // 雙擊事件處理
    const dbClickHandler = (options: any) => {
      if (options.target) return
      if (dbClickTarget === 'text')
        addTextbox(options.e.clientX, options.e.clientY)
      if (dbClickTarget === 'rect')
        addRectangle(options.e.clientX, options.e.clientY)
    }

    // 清除全部的物件
    const clearCanvas = () => {
      const fabricInstance = fabricRef.current
      if (fabricInstance) {
        fabricInstance.clear()
      }
    }

    // 清除選擇的物件
    const removeObject = () => {
      const fabricInstance = fabricRef.current
      if (!fabricInstance) return
      const active = fabricInstance.getActiveObject()

      if (active) {
        fabricInstance.remove(active)
        if (active.type == 'activeSelection') {
          const objects = (active as fabric.ActiveSelection).getObjects()
          objects.forEach((object: fabric.Object) =>
            fabricInstance.remove(object)
          )
          fabricInstance.discardActiveObject().renderAll()
        }
      }
    }

    // 放下圖片，把他加到 canvas
    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
      if (!fabricRef.current) return
      const id = event.dataTransfer.getData('text/plain')
      const img = document.getElementById(id) as HTMLImageElement

      const newImage = new fabric.Image(img, {
        width: img.naturalWidth,
        height: img.naturalHeight,
        left: event.clientX,
        top: event.clientY,
        scaleX: 0.5,
        scaleY: 0.5,
      })

      fabricRef.current.add(newImage)
      return false
    }

    React.useEffect(() => {
      // 初始化 fabric
      const initFabric = () => {
        if (!fabricRef || ref === null) return
        fabricRef.current = new fabric.Canvas(ref?.current, {
          isDrawingMode,
        })
      }
      const initBrush = () => {
        if (!fabricRef.current) return
        const brush = new fabric.PencilBrush(fabricRef.current)

        // 設置筆刷的顏色和粗細
        brush.color = currentColor
        brush.width = currentWidth
        fabricRef.current.freeDrawingBrush = brush
      }

      initFabric()
      initBrush()

      const disposeFabric = () => {
        const fabricInstance = fabricRef.current as fabric.Canvas

        fabricInstance.dispose()
      }
      return () => {
        disposeFabric()
      }
    }, [])

    React.useEffect(() => {
      if (!fabricRef.current) return

      const fabricInstance = fabricRef.current as fabric.Canvas

      // 在雙擊位置新增文字方塊
      fabricInstance.on('mouse:dblclick', dbClickHandler)

      return () => {
        fabricInstance.off('mouse:dblclick', dbClickHandler)
      }
    }, [currentColor, dbClickTarget])

    React.useEffect(() => {
      // 賦值的左手邊不能有問號（optional)

      const fabricInstance = fabricRef.current
      if (fabricInstance) {
        const brush = fabricInstance.freeDrawingBrush
        if (brush) brush.color = currentColor
        if (brush) brush.width = currentWidth
      }
    }, [currentColor, currentWidth])

    return (
      <>
        <div onDrop={handleDrop}>
          <canvas
            id='canvas'
            ref={ref}
            width='800px'
            height='500px'
            style={{ border: '1px solid #a0a0a0' }}
          />
        </div>
        <input
          type='color'
          id='colorpicker'
          value={currentColor}
          onChange={handleColorPick}
        ></input>
        <select
          id='mode'
          onChange={handleToggleDrawingMode}
          defaultValue={isDrawingMode ? 'draw' : 'default'}
        >
          <option value='default'>一般模式</option>
          <option value='draw'>畫圖模式</option>
        </select>
        <button
          onClick={() => {
            setDBClickTarget('rect')
            closeDrawingMode()
          }}
        >
          新增方形
        </button>
        <button
          onClick={() => {
            setDBClickTarget('text')
            closeDrawingMode()
          }}
        >
          新增文字
        </button>
        寬度
        <input
          type='range'
          min='1'
          max='100'
          value={currentWidth}
          onChange={handleWidthChange}
        ></input>
        <button onClick={clearCanvas}>清除畫布</button>
        <button onClick={removeObject}>清除選擇物件</button>
      </>
    )
  }
)

export default Canvas
