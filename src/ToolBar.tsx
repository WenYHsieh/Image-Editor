import React, { MutableRefObject } from 'react'
import { fabric } from 'fabric'
import './css/toolBar.scss'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faBroom,
  faFont,
  faHandPointer,
  faPaintBrush,
  faShapes,
  faTrashCan,
} from '@fortawesome/free-solid-svg-icons'

type DBTargets = 'rect' | 'text'
type Props = {
  fabricRef: MutableRefObject<fabric.Canvas | null>
}
const ToolBar = ({ fabricRef }: Props) => {
  const [currentColor, setCurrentColor] = React.useState('#8989D1')
  const [currentWidth, setCurrentWidth] = React.useState(5)
  const [currentOpacity, setCurrentOpacity] = React.useState(10)
  const [dbClickTarget, setDBClickTarget] = React.useState<DBTargets>()

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
      opacity: 0.7,
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

  const handleLayoutControl = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const fabricInstance = fabricRef.current

    if (fabricInstance) {
      const activeObject = fabricInstance?.getActiveObject()
      if (!activeObject) return
      const layerControlValue = e.target.value

      switch (layerControlValue) {
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
    <div className='toolBar'>
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
        <input
          type='color'
          id='colorpicker'
          value={currentColor}
          onChange={handleColorPick}
        ></input>{' '}
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
        寬度
        <input
          type='range'
          min='1'
          max='100'
          value={currentWidth}
          onChange={handleWidthChange}
        ></input>
      </div>
      <div className='toolGroup'>
        透明度
        <input
          type='range'
          min='1'
          max='10'
          value={currentOpacity}
          onChange={handleOpacityChange}
        ></input>
      </div>

      <div className='toolGroup'>
        <button onClick={clearCanvas}>
          <FontAwesomeIcon icon={faBroom} size='xl' />
        </button>
        <button onClick={removeObject}>
          <FontAwesomeIcon icon={faTrashCan} size='xl' />
        </button>
      </div>
      <div className='toolGroup'>
        <select
          id='layerControl'
          onChange={handleLayoutControl}
          defaultValue='default'
        >
          <option value='default'>設定圖層</option>
          <option value='toFront'>到最前面</option>
          <option value='toBack'>到最後面</option>
          <option value='toForward'>向前一層</option>
          <option value='toBackward'>向後一層</option>
        </select>
      </div>
    </div>
  )
}

export default ToolBar
