import React, { ForwardedRef, MutableRefObject } from 'react'
import { fabric } from 'fabric'

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

    // 放下圖片，把他加到 canvas
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
      if (!fabricRef.current) return
      const id = e.dataTransfer.getData('text/plain')
      const img = document.getElementById(id) as HTMLImageElement

      const newImage = new fabric.Image(img, {
        width: img.naturalWidth,
        height: img.naturalHeight,
        left: e.clientX,
        top: e.clientY,
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
          backgroundColor: '#ffff',
          isDrawingMode: false,
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

    return (
      <>
        <div onDrop={handleDrop} className='canvas__wrapper'>
          <canvas
            id='canvas'
            ref={ref}
            width='600px'
            height='800px'
            style={{ border: '1px solid #d5d5d5' }}
          />
        </div>
      </>
    )
  }
)

export default Canvas
