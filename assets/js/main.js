const _transition = {
  time: 300,
  delay: 5,
  cls: 'transition',
  timeOut(callback) {
    const timeout = this.time + this.delay;
    return setTimeout(callback, timeout);
  }
}
const _timer = {
  interval: 1000,
  start: 75,
  tick: 1,
  incorrect: 10
}
const q1 = {
    question: "Questions 1",
    options: [
      "Option 1",
      "Option 2",
      "Option 3",
      "Option 4"
    ],
    solution: 2
}, q2 = {
    question: "Questions 2",
    options: [
      "Option 1",
      "Option 2",
      "Option 3",
      "Option 4"
    ],
    solution: 2
}, q3 = {
    question: "Questions 3",
    options: [
      "Option 1",
      "Option 2",
      "Option 3",
      "Option 4"
    ],
    solution: 2
}, q4 = {
    question: "Questions 4",
    options: [
      "Option 1",
      "Option 2",
      "Option 3",
      "Option 4"
    ],
    solution: 2
}, q5 = {
    question: "Questions 5",
    options: [
      "Option 1",
      "Option 2",
      "Option 3",
      "Option 4"
    ],
    solution: 2
  }

class Question {
  #answerProvided = null;

  constructor({question, options, solution}) {
    this.question = question;
    this.solution = solution;
    this.options = options;
  }

  get answer() {
    return this.#answerProvided;
  }

  set answer(answer) {
    this.#answerProvided = answer;
  }

  get isCorrect() {
    return this.answer === this.solution;
  }

  get isAnswered() {
    return this.answer !== null;
  }
}

class QuizManager {
  #container;
  #timer;
  #endHigh;
  constructor($_Container, timer, $_endHigh) {
    this.#timer = timer;
    this.#container = $_Container;
    this.questions = [];
    this.currentIndex = 0;
    this.#endHigh = $_endHigh;
  }

  get correct() {
    let correct = 0;
    for(let question of this.questions) {
      if(question.isCorrect) correct++;
    }

    return correct;
  }

  get score() {
    return `${this.correct / this.questions.length * 100}%`;
  }

  get current() {
    return this.questions[this.currentIndex];
  }

  get options() {
    return this.current.options;
  }

  set answer(answer) {
    this.current.answer = answer;
    if(!this.current.isCorrect)
      this.#timer.subtract(_timer.incorrect);
    this.currentIndex++;
    this.flipOut()
      .then(() => {
        if(this.currentIndex < this.questions.length) {
          this.update()
          return this.flipIn();
        } else {
          return this.flipIn(this.#endHigh)
        }
      })
  }

  flipOut($_ = this.#container) {
    return new Promise(res => {
      $_.addClass(_transition.cls);
      _transition.timeOut(() => {
        $_.hide();
        res();
      });
    });
  }

  flipIn($_ = this.#container) {
    return new Promise(res => {
      $_.show();
      $_.removeClass(_transition.cls);
      _transition.timeOut(res);
    })
  }

  start($_start) {
    this.reset();
    this.flipOut($_start)
      .then(() => {
        this.update();
        return this.flipIn();
      })
      .then(() => {
        this.#timer.start();
      })
  }

  update() {
    let h3 = this.#container.children('h3');
    let buttons = this.#container.children('.btn');

    h3.text(this.current.question);

    buttons.forEach((node, i) => {
      node.innerText = this.options[i];
      node.dataset.option = i;
    });
  }

  addQuestion({question, solution, options}) {
    this.questions.push(new Question({question, solution, options}))
    return this;
  }

  reset() {
    for(let question of this.questions)
      question.answer = null;
  }
}

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

  text(text) {
    this.forEach(node => node.innerText = text);
  }

  static _$(selector) {
    return new JonDom(selector);
  }

  static DOMReady(callback) {
    let stateReadyCheck = setInterval(() => {
      if(document.readyState === 'complete') {
        clearInterval(stateReadyCheck);
        callback(this._$);
      }
    }, 10);
  }
}

class TimeController {
  constructor(_$) {
    this._$ = _$;
    this.current = _timer.start;
  }

  start() {
    this.current = _timer.start;
    this.interval = setInterval(this.tick.bind(this), _timer.interval);
  }

  tick() {
    this.subtract(1);
    this.write();
    if(this.current === 0) this.stop();
  }

  stop() {
    clearInterval(this.interval);
  }

  write() {
    this._$.text(this.current);
  }

  subtract(amount) {
    this.current -= amount;
  }
}

JonDom.DOMReady(_$ => {
  function flipIn($) {
    return new Promise(res => {
      $.show();
      $.removeClass('transition');
      res();
    })
  }

  const start = _$('#start');
  const quiz = _$('#quiz');
  const timer = new TimeController(_$('#timer'));
  const endHigh = _$('#end-high');
  const controller = new QuizManager(quiz, timer, endHigh);

  controller.addQuestion(q1)
    .addQuestion(q2)
    .addQuestion(q3)
    .addQuestion(q4)
    .addQuestion(q5);

  start.children('.btn')
    .onClickOnce(event => {
      controller.start(start);
      event.stopImmediatePropagation();
    })

  quiz.children('.btn')
    .onClick(event => {
      let el = event.currentTarget;
      if(el.classList.contains('btn')) {
        controller.answer = el.dataset.option;
        event.stopImmediatePropagation();
      }
    })
})