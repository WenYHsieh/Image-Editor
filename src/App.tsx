import React from 'react'
import Canvas from './Canvas'
import ImageStorage from './ImageStorage'
import SaveFileBlock from './SaveFileBlock'

const App = () => {
  const fabricRef = React.useRef<fabric.Canvas | null>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  return (
    <>
      <Canvas fabricRef={fabricRef} ref={canvasRef} /> <ImageStorage />
      <SaveFileBlock fabricRef={fabricRef} />
    </>
  )
}

export default App
