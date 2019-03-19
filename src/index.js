const threesixty = (container, images, options) => {
  if (!container) {
    throw new Error('A container argument is required')
  }

  if (!images) {
    throw new Error('An images argument is required')
  }

  const defaults = {
    interactive: true,
    reverse: false,
    currentFrame: 0
  }

  const o = Object.assign({}, defaults, options)
  const totalFrames = images.length

  let mouseX = 0
  let oldMouseX = 0

  //------------------------------------------------------------------------------
  //
  //  Initialisation
  //
  //------------------------------------------------------------------------------

  const init = () => {
    preloadimages(images, start)
  }

  const preloadimages = (sourceImages, cb) => {
    const total = sourceImages.length
    let loaded = 0

    const onload = () => {
      if (++loaded >= total) cb(finalImages)
    }

    const finalImages = sourceImages.map((item) => {
      const image = new Image()
      image.src = item
      image.onload = onload
      image.onerror = onload
      image.onabort = onload
      image.draggable = false
      return image
    })
  }

  const start = (loadedImages) => {
    images = loadedImages

    emptyDomNode(container)
    container.appendChild(images[o.currentFrame])

    if (o.interactive) {
      initListeners()
    }
  }

  //------------------------------------------------------------------------------
  //
  //  Events
  //
  //------------------------------------------------------------------------------

  const initListeners = () => {
    container.addEventListener('touchstart', startDrag, {passive: true})
    container.addEventListener('mousedown', startDrag)
  }

  const drag = (e) => {
    if (!isTouchEvent(e)) {
      e.preventDefault()
    }

    mouseX = (e.pageX !== undefined) ? e.pageX : e.changedTouches[0].pageX

    if (o.reverse) {
      if (mouseX > oldMouseX) {
        previous()
      } else if (mouseX < oldMouseX) {
        next()
      }
    } else {
      if (mouseX < oldMouseX) {
        previous()
      } else if (mouseX > oldMouseX) {
        next()
      }
    }

    oldMouseX = mouseX
  }

  const startDrag = (e) => {
    if (!isTouchEvent(e)) {
      e.preventDefault()
    }

    document.addEventListener('touchmove', drag, {passive: true})
    document.addEventListener('mousemove', drag)
    document.addEventListener('touchend', stopDrag)
    document.addEventListener('mouseup', stopDrag)
  }

  const stopDrag = (e) => {
    if (!isTouchEvent(e)) {
      e.preventDefault()
    }

    document.removeEventListener('touchmove', drag)
    document.removeEventListener('mousemove', drag)
    document.addEventListener('touchend', stopDrag, {passive: true})
    document.addEventListener('mouseup', stopDrag)
  }

  //------------------------------------------------------------------------------
  //
  //  Sequence management
  //
  //------------------------------------------------------------------------------

  const replaceImage = () => {
    container.replaceChild(images[o.currentFrame], container.childNodes[0])
  }

  const previous = () => {
    o.currentFrame--
    if (o.currentFrame < 0) o.currentFrame = totalFrames - 1
    replaceImage()
  }

  const next = () => {
    o.currentFrame++
    if (o.currentFrame === totalFrames) o.currentFrame = 0
    replaceImage()
  }

  const isInteractive = () => o.interactive
  const isReverse = () => o.reverse
  const getCurrentFrame = () => o.currentFrame

  //------------------------------------------------------------------------------
  //
  //  API
  //
  //------------------------------------------------------------------------------

  return {
    init,
    previous,
    next,
    isInteractive,
    isReverse,
    getCurrentFrame
  }
}

//------------------------------------------------------------------------------
//
//  Utilities
//
//------------------------------------------------------------------------------

const emptyDomNode = (element) => {
  if (element.hasChildNodes()) {
    while (element.firstChild) {
      element.removeChild(element.firstChild)
    }
  }
}

const isTouchEvent = (e) => {
  return e.touches
}

export default threesixty
