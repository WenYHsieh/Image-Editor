import React from 'react'
import { fabric } from 'fabric'

const Canvas = () => {
  const fabricRef = React.useRef<fabric.Canvas | null>(null)
  const canvasRef = React.useRef(null)
  const [currentColor, setCurrentColor] = React.useState('#8989D1')
  // 滑鼠的模式：筆刷或是選取
  const [isDrawingMode, setIsDrawingMode] = React.useState(false)

  const handleToggleDrawingMode = () => {
    const fabricInstance = fabricRef.current
    if (fabricInstance) {
      fabricInstance.isDrawingMode = !fabricInstance.isDrawingMode
      setIsDrawingMode(fabricInstance.isDrawingMode)
    }
  }
  // 新增方形
  const addRectangle = (color: string, left: number, top: number) => {
    const fabricInstance = fabricRef.current as fabric.Canvas

    const rect = new fabric.Rect({
      top,
      left,
      width: 50,
      height: 50,
      fill: color,
    })

    fabricInstance.add(rect)
  }

  // 新增文字方塊
  const addTextbox = (left: number, top: number) => {
    const fabricInstance = fabricRef.current as fabric.Canvas

    const text = new fabric.Textbox('文字', { left, top })
    fabricInstance.add(text)
  }

  // 選色
  const handleColorPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentColor((e.target as HTMLInputElement).value)
  }

  const handleAddMaterial = () => {
    if (!fabricRef.current) return

    const fabricInstance = fabricRef.current as fabric.Canvas
    let startPoint = null as null | { x: number; y: number }
    let rect = null as null | fabric.Rect

    fabricInstance.on('mouse:down', (event) => {
      // 如果座標有東西了就不繼續產生
      if (event.target) return
      startPoint = fabricInstance.getPointer(event.e)
      rect = new fabric.Rect({
        left: startPoint.x,
        top: startPoint.y,
        width: 0,
        height: 0,
        fill: 'transparent',
        stroke: currentColor,
        strokeWidth: 2,
      })
      fabricInstance.add(rect)
    })

    fabricInstance.on('mouse:move', (event) => {
      if (!startPoint || event.target) return

      const currentPoint = fabricInstance.getPointer(event.e)
      const width = currentPoint.x - startPoint.x
      const height = currentPoint.y - startPoint.y

      rect.set({ width, height })
      fabricInstance.renderAll()
    })

    fabricInstance.on('mouse:up', () => {
      startPoint = null
      rect = null
    })
  }

  React.useEffect(() => {
    if (!fabricRef) return
    // 初始化 fabric
    const initFabric = () => {
      fabricRef.current = new fabric.Canvas(canvasRef.current, {
        isDrawingMode,
      })
    }

    initFabric()

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

    // 在雙擊位置新增文字方塊
    fabricRef.current.on('mouse:dblclick', (options) => {
      if (options.target) return
      addTextbox(options.e.clientX, options.e.clientY)
    })

    handleAddMaterial()
  }, [currentColor])

  return (
    <>
      <canvas
        ref={canvasRef}
        width='800px'
        height='500px'
        style={{ border: '1px solid #a0a0a0' }}
      />
      <input
        type='color'
        id='colorpicker'
        value={currentColor}
        onChange={handleColorPick}
      ></input>
      <button onClick={handleToggleDrawingMode}>
        {isDrawingMode ? '一般模式' : '畫圖模式'}
      </button>
    </>
  )
}

export default Canvas
