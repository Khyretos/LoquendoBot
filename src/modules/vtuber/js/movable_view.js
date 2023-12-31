if (!Number.prototype.limit) {
  // eslint-disable-next-line no-extend-native
  Number.prototype.limit = function (min, max) {
    if (this < min) return min;
    if (this > max) return max;
    return this;
  };
}

function movableView(s, screenBound = false) {
  let xoff;
  let yoff;
  let minXY;
  let maxX;
  let maxY;
  let dragging = false;

  function screenBounds() {
    if (screenBound) {
      [maxX, maxY] = Window.this.screenBox('workarea', 'dimension');
      const [w, h] = Window.this.box('dimension', 'border');
      maxX -= w;
      maxY -= h;
      minXY = 0;
    } else {
      maxX = Number.MAX_SAFE_INTEGER;
      maxY = Number.MAX_SAFE_INTEGER;
      minXY = Number.MIN_SAFE_INTEGER;
    }
  }

  function onMouseDown(e) {
    screenBounds();
    e.target.state.capture(true);

    const [x, y] = Window.this.box('position', 'border', 'screen');
    xoff = e.screenX - x;
    yoff = e.screenY - y;

    dragging = true;
  }

  function onMouseMove(e) {
    if (dragging) {
      Window.this.move((e.screenX - xoff).limit(minXY, maxX), (e.screenY - yoff).limit(minXY, maxY));
    }
  }

  function onMouseUp(e) {
    if (dragging) {
      dragging = false;
      e.target.state.capture(false);
    }
  }

  const elements = document.querySelectorAll(s);
  for (let i = 0; i < elements.length; ++i) {
    // elements[i].on('mousedown', onMouseDown);
    // elements[i].on('mousemove', onMouseMove);
    // elements[i].on('mouseup', onMouseUp);
  }
  return !!elements.length;
}

// | Module export (uncomment bellow)
export { movableView as default };
