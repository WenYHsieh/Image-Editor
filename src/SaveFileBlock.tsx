import React, { MutableRefObject } from 'react'

type Props = {
  fabricRef: MutableRefObject<fabric.Canvas | null>
}

const SaveFileBlock = ({ fabricRef }: Props) => {
  const fileNameRef = React.useRef(null)
  const saveAsName = () => {
    if (!fileNameRef.current || !fabricRef.current) return
    const fileNameInputEle = fileNameRef.current as HTMLInputElement

    // format:  Either "jpeg" or "png"
    const dataURL = fabricRef.current.toDataURL({ format: 'png' })

    const link = document.createElement('a')
    link.download = fileNameInputEle.value
    link.href = dataURL
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    if (link.parentNode) link.parentNode.removeChild(link)
    fileNameInputEle.value = ''
  }
  return (
    <div className='saveFileBlock__wrapper'>
      輸出檔名 (PNG)：<input ref={fileNameRef}></input>
      <button onClick={saveAsName}>save</button>
    </div>
  )
}

export default SaveFileBlock
