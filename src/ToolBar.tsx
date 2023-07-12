import React, { MutableRefObject } from 'react'
import { fabric } from 'fabric'
import './css/toolBar.scss'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faAngleDown,
  faAngleUp,
  faAnglesDown,
  faAnglesUp,
  faBroom,
  faCheck,
  faCrop,
  faFont,
  faHandPointer,
  faPaintBrush,
  faShapes,
  faTrashCan,
} from '@fortawesome/free-solid-svg-icons'
import SaveFileBlock from './SaveFileBlock'

type DBTargets = 'rect' | 'text'
type Props = {
  fabricRef: MutableRefObject<fabric.Canvas | null>
}
type OnCropObjects = {
  img: fabric.Image | null
  mask: fabric.Rect | null
}

const ToolBar = ({ fabricRef }: Props) => {
  const [isExpand, setIsExpand] = React.useState(true)
  const [currentColor, setCurrentColor] = React.useState('black')
  const [currentWidth, setCurrentWidth] = React.useState(1)
  const [currentOpacity, setCurrentOpacity] = React.useState(10)
  const [dbClickTarget, setDBClickTarget] = React.useState<DBTargets>()
  const [onCropObjects, setOnCropObjects] = React.useState<OnCropObjects>({
    img: null,
    mask: null,
  })
  const [clip, setClip] = React.useState({
    top: 0,
    left: 0,
    width: 0,
    height: 0,
  })

  // 一般模式跟畫圖模式間切換
  const handleToggleDrawingMode = (mode: 'draw' | 'mouse') => {
    const fabricInstance = fabricRef.current
    if (fabricInstance) {
      fabricInstance.isDrawingMode = mode === 'draw'
    }
  }

  // 取消畫圖模式
  const closeDrawingMode = () => {
    const fabricInstance = fabricRef.current
    if (fabricInstance) {
      fabricInstance.isDrawingMode = false
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
    // 綁定在選得時取得一些關於這 object 的資訊，之後要用來對應渲染到工具列上
    rect.on('selected', handleObjectSelection)
  }

  // 新增文字方塊
  const addTextbox = (left: number, top: number) => {
    const fabricInstance = fabricRef.current as fabric.Canvas

    const text = new fabric.Textbox('文字', {
      top: top - 25,
      left: left - 25,
      fill: currentColor,

      // textBackgroundColor: 'red',
      // backgroundColor: 'green',
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

  // 選透明度
  const handleOpacityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentOpacity(parseInt((e.target as HTMLInputElement).value))
  }

  // 雙擊事件處理
  const dbClickHandler = (options: any) => {
    if (options.target) return
    if (dbClickTarget === 'text')
      addTextbox(options.e.offsetX, options.e.offsetY)
    if (dbClickTarget === 'rect')
      addRectangle(options.e.offsetX, options.e.offsetY)
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

  // 圖層工具
  const handleLayoutControl = (
    mode: 'toFront' | 'toBack' | 'toForward' | 'toBackward'
  ) => {
    const fabricInstance = fabricRef.current

    if (fabricInstance) {
      const activeObject = fabricInstance?.getActiveObject()
      if (!activeObject) return

      switch (mode) {
        case 'toFront':
          fabricInstance.bringToFront(activeObject)
          break
        case 'toBack':
          fabricInstance.sendToBack(activeObject)
          break
        case 'toForward':
          fabricInstance.bringForward(activeObject)
          break
        case 'toBackward':
          fabricInstance.sendBackwards(activeObject)
      }
    }
  }

  const handleObjectSelection = (e: fabric.IEvent) => {
    const activeObject = e.target as fabric.Object

    const color = activeObject?.fill as string
    const opacity = activeObject?.opacity as number

    setCurrentColor(color)
    setCurrentOpacity(opacity * 10)
  }

  // 把裁切遮罩放到選中的圖片上
  const handleClip = () => {
    const fabricInstance = fabricRef.current
    if (!fabricInstance) return
    const activeObject = fabricInstance.getActiveObject()
    if (!activeObject || activeObject.type !== 'image') return

    setOnCropObjects((onCropObjects: OnCropObjects) => {
      return { ...onCropObjects, img: activeObject as fabric.Image }
    })
    const { left, top } = activeObject as fabric.Image & {
      left: number
      top: number
    }
    const width = activeObject.getScaledWidth()
    const height = activeObject.getScaledHeight()
    activeObject.selectable = false
    const clipMask = new fabric.Rect({
      top,
      left,
      width: width,
      height: height,
      fill: 'rgb(178, 178, 178, 0.3)',
      transparentCorners: false,
      cornerColor: 'rgb(178, 178, 178, 0.8)',
      strokeWidth: 1,
      cornerStrokeColor: 'black',
      borderColor: 'black',
      borderDashArray: [5, 5],
      cornerStyle: 'circle',
    })
    clipMask.setControlVisible('mtr', false)
    fabricInstance.add(clipMask)
    setOnCropObjects((onCropObjects: OnCropObjects) => {
      return { ...onCropObjects, mask: clipMask }
    })
    fabricInstance.bringToFront(clipMask)

    const clipMaskId = fabricInstance.getObjects().indexOf(clipMask)
    fabricInstance.setActiveObject(fabricInstance.item(clipMaskId) as any)
    clipMask.on('moving', () => {
      handleKeepClipInsideImg({ clipMask, top, left, height, width })
    })
    clipMask.on('scaling', () => {
      handleKeepClipInsideImg({ clipMask, top, left, height, width })
    })
  }

  const handleKeepClipInsideImg = ({
    clipMask,
    top,
    left,
    height,
    width,
  }: {
    clipMask: fabric.Rect
    top: number
    left: number
    height: number
    width: number
  }) => {
    const { top: maskTop, left: maskLeft } = clipMask as {
      top: number
      left: number
    }
    const maskHeight = clipMask.getScaledHeight() as number
    const maskWidth = clipMask.getScaledWidth()

    // 裁切遮罩不可以超過圖片
    if (maskTop < top) {
      clipMask.top = top
    }
    if (maskLeft < left) {
      clipMask.left = left
    }
    if (maskTop > top + height - maskHeight) {
      clipMask.top = top + height - maskHeight
    }

    if (maskLeft > left + (width - maskWidth)) {
      clipMask.left = left + width - maskWidth
    }

    setClip({
      top: maskTop,
      left: maskLeft,
      width: maskWidth,
      height: maskHeight,
    })
  }

  // 裁切照片，把圖片變成遮罩的大小
  const handleCrop = () => {
    const fabricInstance = fabricRef.current
    if (!fabricInstance || !onCropObjects.img || !onCropObjects.mask) return

    const { top, left, width, height } = clip
    const onCropImg = onCropObjects.img as fabric.Image
    onCropImg.selectable = true
    fabricInstance.remove(onCropObjects.mask)
    onCropImg.set({
      cropX: left - (onCropImg.left as number),
      cropY: top - (onCropImg.top as number),
      width,
      height,
    })

    setOnCropObjects({ img: null, mask: null })

    fabricInstance.renderAll()
  }

  React.useEffect(() => {
    const initBrush = () => {
      if (!fabricRef.current) return
      const brush = new fabric.PencilBrush(fabricRef.current)

      // 設置筆刷的顏色和粗細
      brush.color = currentColor
      brush.width = currentWidth

      fabricRef.current.freeDrawingBrush = brush
    }

    initBrush()
  }, [])

  React.useEffect(() => {
    const fabricInstance = fabricRef.current as fabric.Canvas
    if (!fabricInstance) return

    // 在雙擊位置新增文字方塊
    fabricInstance.on('mouse:dblclick', dbClickHandler)

    //TODO 取消選擇的物件帶到最上層的動作

    return () => {
      fabricInstance.off('mouse:dblclick', dbClickHandler)
    }
  }, [currentColor, dbClickTarget])

  React.useEffect(() => {
    // 賦值的左手邊不能有問號（optional)

    const fabricInstance = fabricRef.current
    if (fabricInstance) {
      const brush = fabricInstance.freeDrawingBrush
      if (brush) {
        brush.color = currentColor
        brush.width = currentWidth
      }
    }
  }, [currentColor, currentWidth])

  React.useEffect(() => {
    const fabricInstance = fabricRef.current
    if (fabricInstance) {
      const activeObject = fabricInstance.getActiveObject()
      if (!activeObject) return
      if (activeObject.get('type') !== 'rect') return

      activeObject.opacity = currentOpacity / 10
      fabricInstance.renderAll()
    }
  }, [currentOpacity])

  return (
    <div className={`toolBar ${isExpand ? 'expend' : 'close'}`}>
      <label> Tool Bar</label>
      <hr />
      <div className='toolGroup__container'>
        <div className='toolGroup'>
          <button
            onClick={() => {
              handleToggleDrawingMode('draw')
            }}
          >
            <FontAwesomeIcon icon={faPaintBrush} size='xl' />
          </button>
          <button
            onClick={() => {
              handleToggleDrawingMode('mouse')
            }}
          >
            <FontAwesomeIcon icon={faHandPointer} size='xl' />
          </button>
        </div>
        <div className='toolGroup'>
          <button
            onClick={() => {
              setDBClickTarget('rect')
              closeDrawingMode()
            }}
          >
            <FontAwesomeIcon icon={faShapes} size='xl' />
          </button>
          <button
            onClick={() => {
              setDBClickTarget('text')
              closeDrawingMode()
            }}
          >
            <FontAwesomeIcon icon={faFont} size='xl' />
          </button>
        </div>
        <div className='toolGroup'>
          <label> Color</label>
          <input
            type='color'
            id='colorpicker'
            value={currentColor}
            onChange={handleColorPick}
          ></input>
        </div>
        <div className='toolGroup'>
          <label> Width</label>
          <input
            type='range'
            min='1'
            max='100'
            value={currentWidth}
            onChange={handleWidthChange}
          ></input>
        </div>
        <div className='toolGroup'>
          <label> Opacity</label>
          <input
            type='range'
            min='1'
            max='10'
            value={currentOpacity}
            onChange={handleOpacityChange}
          ></input>
        </div>
        <div className='toolGroup'>
          <label> Layer</label>
          <button
            onClick={() => {
              handleLayoutControl('toForward')
            }}
          >
            <FontAwesomeIcon icon={faAngleUp} size='xl' />
          </button>
          <button
            onClick={() => {
              handleLayoutControl('toFront')
            }}
          >
            <FontAwesomeIcon icon={faAnglesUp} size='xl' />
          </button>
          <button
            onClick={() => {
              handleLayoutControl('toBackward')
            }}
          >
            <FontAwesomeIcon icon={faAngleDown} size='xl' />
          </button>
          <button
            onClick={() => {
              handleLayoutControl('toBack')
            }}
          >
            <FontAwesomeIcon icon={faAnglesDown} size='xl' />
          </button>
        </div>
        <div className='toolGroup'>
          <label> Crop </label>
          <button onClick={handleClip}>
            <FontAwesomeIcon icon={faCrop} size='xl' />
          </button>
          <button onClick={handleCrop}>
            <FontAwesomeIcon icon={faCheck} size='xl' />
          </button>
        </div>

        <div className='toolGroup'>
          <button onClick={clearCanvas}>
            <FontAwesomeIcon icon={faBroom} size='xl' />
          </button>
          <button onClick={removeObject}>
            <FontAwesomeIcon icon={faTrashCan} size='xl' />
          </button>
        </div>

        <hr />
        <div className='toolGroup'>
          <SaveFileBlock fabricRef={fabricRef} />
        </div>
      </div>
      <button
        className='expandBtn'
        onClick={() => {
          setIsExpand(!isExpand)
        }}
      >
        {isExpand ? '<' : '>'}
      </button>
    </div>
  )
}

export default ToolBar
