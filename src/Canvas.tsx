import React from 'react'
import { fabric } from 'fabric'

const Canvas = () => {
  const fabricRef = React.useRef<fabric.Canvas | null>(null)
  const canvasRef = React.useRef(null)

  const handleToggleDrawingMode = () => {
    const fabricInstance = fabricRef.current
    if (fabricInstance) {
      fabricInstance.isDrawingMode = !fabricInstance.isDrawingMode
    }
  }

  React.useEffect(() => {
    if (!fabricRef) return
    // 初始化 fabric
    const initFabric = () => {
      fabricRef.current = new fabric.Canvas(canvasRef.current, {
        isDrawingMode: false,
      })
    }

    // 新增方形
    const addRectangle = (color: string) => {
      const rect = new fabric.Rect({
        top: 50,
        left: 50,
        width: 50,
        height: 50,
        fill: color,
      })

      fabricRef.current.add(rect)
    }

    const disposeFabric = () => {
      fabricRef.current.dispose()
    }

    initFabric()
    addRectangle('red')
    addRectangle('blue')

    return () => {
      disposeFabric()
    }
  }, [])
  console.log(fabricRef.current?.isDrawingMode)
  // TODO 字不會變
  return (
    <>
      <canvas
        ref={canvasRef}
        width='500px'
        height='500px'
        style={{ border: '1px solid red' }}
      />
      <button onClick={handleToggleDrawingMode}>
        {fabricRef.current?.isDrawingMode ? '畫圖模式' : '一般模式'}
      </button>
    </>
  )
}

export default Canvas
