import React from 'react'
import Canvas from './Canvas'
import ImageStorage from './ImageStorage'
import SaveFileBlock from './SaveFileBlock'
import ToolBar from './ToolBar'
import './css/app.scss'

const App = () => {
  const fabricRef = React.useRef<fabric.Canvas | null>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  return (
    <>
      <div className='layout'>
        <ToolBar fabricRef={fabricRef} />
        <Canvas fabricRef={fabricRef} ref={canvasRef} />
        <ImageStorage />
      </div>
      <SaveFileBlock fabricRef={fabricRef} />
    </>
  )
}

export default App
