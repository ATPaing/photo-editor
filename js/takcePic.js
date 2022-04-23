const root = document.documentElement
const noticeBoard = document.querySelector('.notice-board')
const video = document.querySelector('video')
const audio = document.querySelector('audio')
const captureBtn = document.querySelector('.capture')
const retakeBtn = document.querySelector('.retake')
const confirmBtn = document.querySelector('.confirm')
const settingSection = document.querySelector('.setting')
const settingComponents = document.querySelectorAll('.setting-component')
const pickerSection = document.querySelector('.picker')

const canvasOne = document.querySelector('.canvas-one')
const ctxOne = canvasOne.getContext('2d')
const canvasTwo = document.querySelector('.canvas-two')
const ctxTwo = canvasTwo.getContext('2d')

const editSection = document.querySelector('.for-edit')
const cropSection = document.querySelector('.for-crop')
const colorAdjustSection = document.querySelector('.for-color-adjust')
const pencilBtn = document.querySelector('.pencil')
const eraserBtn = document.querySelector('.eraser')
const colorInput = document.querySelector('input[type="color"]')
const colorRanges = document.querySelectorAll('input[type="range"]')
const sizeDisplay = document.querySelector('.size-display')
const okBtn = document.querySelector('.ok-btn')
const saveBtn = document.querySelector('.save-btn')
const downloadBtn = document.querySelector('.download-btn')

const resize = document.querySelector('.resize')
const resizerBottomRight = document.querySelector('.bottom-right')

let width = video.videoWidth
let height = video.videoHeight

let reqDrawing = false
let drawingStarted = false

let reqErasing = false
let erasingStarted = false

let changingStarted = false

let hue = 0
let size = 15

function requestVideo(){
    navigator.mediaDevices.getUserMedia({video: true})
        .then(localMediaStream => {
            console.log(localMediaStream)
            video.srcObject = localMediaStream
            video.play()
            video.oncanplay  = () => {
                captureBtn.style.display = 'block'
            }
        })
        .catch(err => {
            noticeBoard.innerHTML = `
              <p>Please enable video permission to continue</p>
            `
            noticeBoard.style.color = 'red'
        })
}

window.addEventListener('load', requestVideo)

function captureImage(){
    audio.currentTime = 0
    audio.play()
    video.pause()
    retakeBtn.style.display = 'block'
    confirmBtn.style.display = 'block'
}
captureBtn.addEventListener('click', captureImage)

function retakeImage(){
    video.play()
    retakeBtn.style.display = 'none'
    confirmBtn.style.display = 'none'
}
retakeBtn.addEventListener('click', retakeImage)

function startEditPhoto(){
    retakeBtn.style.display = 'none'
    confirmBtn.style.display = 'none'
    captureBtn.style.display = 'none'
    settingSection.classList.add('setting-active')
    paintImgOnCanvasOne()
}
function paintImgOnCanvasOne(){
    canvasOne.style.display = 'block'
    canvasOne.width = video.offsetWidth
    canvasOne.height = video.offsetHeight
    ctxOne.drawImage(video,0,0,canvasOne.width,canvasOne.height)
}
confirmBtn.addEventListener('click', startEditPhoto)



settingComponents.forEach((SC,i) => {
    SC.addEventListener('click', () => {
        noticeBoard.textContent = ''
        if(changingStarted === true){
            noticeBoard.innerHTML = `<p>Please save before switching mode or refresh the page to clear all</p>`
            noticeBoard.style.color = 'red'
            return
        }
        pickerSection.style.transform = 'translateX(0)'
        if(i === 0){
            editSection.style.display = 'flex'
            cropSection.style.display = 'none'
            colorAdjustSection.style.display = 'none'
            resize.style.display = 'none'
            canvasTwo.style.display = 'block'
        }
        if(i === 1){
            editSection.style.display = 'none'
            cropSection.style.display = 'flex'
            colorAdjustSection.style.display = 'none'
            resize.style.display = 'block'
            canvasTwo.style.display = 'none'       
        }
        if(i === 2){
            editSection.style.display = 'none'
            cropSection.style.display = 'none'
            colorAdjustSection.style.display = 'flex'
            resize.style.display = 'none'
            canvasTwo.style.display = 'none'  
        }
    })
})

function letDrawingOnCanvas(){
    noticeBoard.innerHTML = `<p>Use <code>mousewheel</code> to adjust the size</p>`
    if(reqDrawing === false && reqErasing === false){
        canvasTwo.style.display = 'block'
        const width = video.offsetWidth
        const height = video.offsetHeight
        canvasTwo.width = width
        canvasTwo.height = height
    }
    canvasTwo.style.setProperty('cursor', 'url(images/pencil.svg) -18 75,auto')
    root.style.setProperty('--eraser-before-transform','translateY(-100%)')
    eraserBtn.style.pointerEvents = 'auto'
    sizeDisplay.textContent = size
    reqDrawing = true
    reqErasing = false
    
}
pencilBtn.addEventListener('click', letDrawingOnCanvas)

canvasTwo.addEventListener('mousedown', () => {
    if(reqDrawing){
        drawingStarted = true
        erasingStarted = false
    }else if(reqErasing){
        drawingStarted = false
        erasingStarted = true
    }

})
canvasTwo.addEventListener('mouseout', () => {
    erasingStarted = false
    drawingStarted = false
    ctxTwo.beginPath()
})
canvasTwo.addEventListener('mouseup', () => {
    drawingStarted = false
    erasingStarted = false
    ctxTwo.beginPath()
})

function draw(e){
    if(
       (reqDrawing === false && reqErasing === false) || 
       (drawingStarted === false &&  erasingStarted === false)
    ){
        return
    }
    
    const rect = video.getBoundingClientRect()

    let scaleX = canvasTwo.width / rect.width
    let scaleY = canvasTwo.height / rect.height
    let mouse = {
        x : (e.clientX - rect.x) * scaleX,
        y : (e.clientY - rect.y) * scaleY
    }

    if(drawingStarted === true){
        ctxTwo.lineWidth = size   
        ctxTwo.strokeStyle = colorInput.value
        ctxTwo.lineCap = "round"
        ctxTwo.lineTo(mouse.x,mouse.y)
        ctxTwo.stroke()
        ctxTwo.moveTo(mouse.x,mouse.y)
    }else if(erasingStarted === true){
        ctxTwo.clearRect(mouse.x,mouse.y,size,size)
    }  
    changingStarted = true 
    console.log('working')
}
canvasTwo.addEventListener('mousemove', draw)

function letErasingOnCanvas(){
    noticeBoard.innerHTML = `<p>Use <code>mousewheel</code> to adjust the size</p>`
    canvasTwo.style.setProperty('cursor', 'url(images/eraser.svg) -18 50,auto')
    size += 4
    sizeDisplay.textContent = size
    reqDrawing = false
    reqErasing = true
}
eraserBtn.addEventListener('click', letErasingOnCanvas)

function adjustSize(e){
    if(
        reqDrawing === false && reqErasing === false
      ){
          return
      }
      if(e.deltaY < 0 ){
          size -= 3
  
      }else if(e.deltaY > 0 ){
          size += 3
      }
      if(size < 0){
          size = 1
      }
      if(size > 100){
          size = 99
      }
      if(reqDrawing){
          sizeDisplay.textContent = size
      }else if(reqErasing){
          sizeDisplay.textContent = size
          if(size > 100){
              sizeDisplay.textContent = 100
          }
      }
  
      hue += 15
      let textColor = `hsl(${hue} 100% 95%)`
      sizeDisplay.style.color = textColor
}

window.addEventListener('wheel',adjustSize)

function combineTwoLayers(){
    ctxOne.drawImage(canvasOne,0,0,canvasOne.width,canvasOne.height)
    ctxOne.drawImage(canvasTwo,0,0,canvasOne.width,canvasOne.height)
    canvasTwo.style.display = 'none'
    ctxTwo.clearRect(0,0,canvasTwo.width,canvasTwo.height)
    noticeBoard.innerHTML =`<code>Saved</code>`
    changingStarted = false
}
saveBtn.addEventListener('click', combineTwoLayers)

function downloadImage(){
    const imgData = canvasOne.toDataURL('image/jpeg')
    this.href = imgData
    this.setAttribute('download','hi')
}

// for moving resize 
let oldX = 0
let oldY = 0
const mouseSpeed = 3
function moveResize(e){
    let resizeTop = resize.offsetTop
    let resizeLeft = resize.offsetLeft

    if (e.pageX < oldX) {
        resizeLeft -= mouseSpeed
        if( resizeLeft >= -1 ){
            resize.style.left = resizeLeft + 'px'
        }
    } else if (e.pageX > oldX) {
        resizeLeft += mouseSpeed
        const maxRight = canvasOne.clientWidth - resize.clientWidth
        if( resizeLeft <= maxRight){
            resize.style.left = resizeLeft + 'px'
        }
    }

    if(e.pageY < oldY){
        resizeTop -= mouseSpeed
        if(resizeTop >= -1){
            resize.style.top = resizeTop + 'px'
        }
       
    }else if(e.pageY > oldY){
        resizeTop += mouseSpeed
        const maxBottom = canvasOne.clientHeight - resize.clientHeight
        if(resizeTop <= maxBottom){
            resize.style.top = resizeTop + 'px'
        }
        
    }
    oldX = e.pageX;
    oldY = e.pageY
 }

resize.addEventListener('mousedown', () => {
    window.addEventListener('mousemove', moveResize)
})
resize.addEventListener('mouseout', () => {
    window.removeEventListener('mousemove', moveResize)
})
resize.addEventListener('mouseup', () => {
    window.removeEventListener('mousemove', moveResize)
})

// for resizer
let isStarted = false
resizerBottomRight.addEventListener('mousedown',() => {
    resize.style.pointerEvents = 'none'
    isStarted = true
    window.addEventListener('mousemove', (e) => {
        if(!isStarted){
            return
        }
        let mouse = {
            x : e.clientX,
            y : e.clientY
        }
        const rect = resize.getBoundingClientRect()
        const width =  mouse.x - rect.left 
        const height = mouse.y - rect.top 
        const maxWidth = canvasOne.offsetWidth
        const maxHeight = canvasOne.offsetHeight
        const minWidth = 30
        const minHeight = 40 
        if(
            width > minWidth &&
            width < maxWidth
        ){
            resize.style.width = width + 'px'
        }
        if(
            height > minHeight &&
            height < maxHeight
        ){
            resize.style.height = height + 'px'
        }
    })
})
window.addEventListener('mouseup', () => {
    isStarted = false
    resize.style.pointerEvents = 'auto'
})

function doCropping(){
    
    const rect = resize.getBoundingClientRect()
    const rectTwo = canvasOne.getBoundingClientRect()
    const dx = rect.x - rectTwo.x
    const dy = rect.y - rectTwo.y
    const dw = rect.width
    const dh = rect.height 
    ctxOne.drawImage(canvasOne,dx,dy,dw,dh,0,0,canvasOne.width,canvasOne.height)
    resize.style.display = 'none'
}

okBtn.addEventListener('click', doCropping)

downloadBtn.addEventListener('click',downloadImage)


let colorChangeState = false
let imgData = null
let redRangeInput = null
let blueRangeInput = null


colorRanges.forEach((CR,i) => {
    CR.addEventListener('mousedown', () => {
        colorChangeState = true
        imgData = ctxOne.getImageData(0,0,canvasOne.width,canvasOne.height)
        data = imgData.data
    })
    window.addEventListener('mouseup', () => {
        colorChangeState = false
    })
    CR.addEventListener('mousemove', () => {
        if(!colorChangeState){
            return
        }
        if(i === 0 ){
            redRangeInput = colorRanges[i].value
        }else if(i === 1){
            blueRangeInput = colorRanges[i].value
        }
        for(let j = 0; j < data.length; j += 4){
            if(i === 0 ){
                data[0 + j] =  redRangeInput 
            }else if( i === 1 ){
                data[2 + j] =  blueRangeInput
            }
        }
        ctxOne.putImageData(imgData,0,0)
    })
})