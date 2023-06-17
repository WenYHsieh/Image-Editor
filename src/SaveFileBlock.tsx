import React, { MutableRefObject } from 'react'

type Props = {
  fabricRef: MutableRefObject<fabric.Canvas | null>
}

const SaveFileBlock = ({ fabricRef }: Props) => {
  const fileNameRef = React.useRef(null)
  const saveAsName = () => {
    if (!fileNameRef.current) return

    // format:  Either "jpeg" or "png"
    const dataURL = fabricRef.current.toDataURL({ format: 'png' })

    const link = document.createElement('a')
    link.download = (fileNameRef.current as HTMLInputElement).value
    link.href = dataURL
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    if (link.parentNode) link.parentNode.removeChild(link)
  }
  return (
    <>
      輸出檔名 (PNG)：<input ref={fileNameRef}></input>
      <button onClick={saveAsName}>save</button>
    </>
  )
}

export default SaveFileBlock
