class JonDom {
  constructor(selector) {
    this.$(selector);
  }

  $(selector) {
    this._el = document.querySelectorAll(selector);
  }

  forEach(callback) {
    for(let i = 0; i < this._el.length; i++) {
      let node = this._el[i];
      callback(node, i, this._el);
    }
  }

  addClass(...cls) {
    this.forEach(node => node.classList.add(...cls));
  }

  removeClass(...cls) {
    this.forEach(node => node.classList.remove(...cls));
  }

  hasClass(cls, callback) {
    let hasClass = false;
    this.forEach(node => {
      if(node.classList.contains(cls)) {
        callback(node);
        hasClass = true;
      }
    })
    return hasClass;
  }

  show() {
    this.forEach(node => node.style.display = 'show');
  }

  hide() {
    this.forEach(node => node.style.display = 'none');
  }

  on(eventName, eventListener) {
    this.forEach(node => node.addEventListener(eventName, eventListener));
  }

  once(eventName, eventListener) {
    function runMeOneTime(event) {
      event.currentTarget.removeEventListener(eventName, runMeOneTime);
      eventListener(event);
    }
    this.forEach(node => node.addEventListener(eventName, runMeOneTime));
  }

  onClick(eventListener) {
    this.on('click', eventListener);
  }

  onClickOnce(eventListener) {
    this.once('click', eventListener);
  }
}
function _$(selector) {
  return new JonDom(selector);
}

(_$$ => {
  const _options = {
    transitionTime: 300
  }

  _$('#start .btn')
    .onClick(() => {
    flipOut(_$('#start'))
      .then(() => flipIn(_$('#quiz')));
  })

  function flipIn($) {
    return new Promise(res => {
      $.show();
      $.removeClass('transition');
      res();
    })
  }

  function flipOut($) {
    return new Promise(res => {
      $.addClass('transition');
      setTimeout(() => {
        $.hide();
        res();
      }, _options.transitionTime);
    })
  }


})(JonDom)