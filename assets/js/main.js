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
    this.forEach(node => node.style.display = '');
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

  children(selector) {
    let newJD = new JonDom('body');
    newJD._el = this._el[0].querySelectorAll(selector);
    return newJD;
  }

  static _$(selector) {
    return new JonDom(selector);
  }

  static DOMReady(callback) {
    setInterval(() => {
      if(document.readyState === 'complete')
        callback(this._$);
    });
  }
}

JonDom.DOMReady(_$ => {
  const _options = {
    transitionTime: 300
  }

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

  const start = _$('#start');
  const quiz = _$('#quiz');

  start.children('.btn')
    .onClickOnce(() => {
      flipOut(start)
        .then(() => flipIn(quiz));
    })

  quiz.children('.btn').onClick(() => {
    flipOut(quiz)
      .then(() => {
        // TODO: update dom
        return flipIn(quiz);
      })
  })
})