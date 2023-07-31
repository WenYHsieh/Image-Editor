import React from 'react'
import './css/imageStorage.scss'

type UploadedImage = {
  name: string
  imgDataURL: string
}

const ImageStorage = () => {
  const imageStorageRef = React.useRef(null)
  const [isExpand, setIsExpand] = React.useState(true)
  const [uploadedImage, setUploadedImage] = React.useState<
    Array<UploadedImage>
  >([])

  const convertBase64 = (file: File) => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader()
      fileReader.readAsDataURL(file)

      fileReader.onload = () => {
        const fileContent = (fileReader.result as string)?.split(',')[1]
        resolve(fileContent)
      }

      fileReader.onerror = (error) => {
        reject(error)
      }
    })
  }
  const handleUploadFile = async (
    target:
      | React.ChangeEvent<HTMLInputElement>['target']
      | React.DragEvent<HTMLDivElement>['dataTransfer']
  ) => {
    if (!target || !target.files) return
    const file = target.files[0]
    const { name, type } = file
    const fileContent = await convertBase64(file)

    const imgDataURL = `data:${type};base64,${fileContent}`
    setUploadedImage((uploadedImage: Array<UploadedImage>) => {
      return [...uploadedImage, { name, imgDataURL }]
    })
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    handleUploadFile(event.dataTransfer)
  }

  const handleDragStart = (event: React.DragEvent<HTMLDivElement>) => {
    event.dataTransfer.setData(
      'text/plain',
      (event.target as HTMLDivElement).id
    )
  }

  const renderImageBlocks = () => {
    if (uploadedImage.length === 0) return <></>
    return (
      <div className='image__blocks' onDragStart={handleDragStart}>
        {uploadedImage?.map(({ name, imgDataURL }) => {
          return (
            <div className='image__block' key={name}>
              <img id={name} src={imgDataURL} draggable='true'></img>
              <label>{name}</label>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <>
      <div
        ref={imageStorageRef}
        className={`imageStorage__wrapper ${isExpand ? 'expand' : 'close'}`}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <label> Image Storage</label>
        <hr></hr>
        <input
          type='file'
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            handleUploadFile(event.target)
          }
        ></input>
        {renderImageBlocks()}
        <button
          className='expandBtn'
          onClick={() => {
            setIsExpand(!isExpand)
          }}
        >
          {isExpand ? '>' : '<'}
        </button>
      </div>
    </>
  )
}

export default ImageStorage
