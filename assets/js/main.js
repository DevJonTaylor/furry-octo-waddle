/**
 * The questions are contained inside an array which houses objects.  These objects are then passed to the
 * Question class.
 */
const _questions = [
  {
    question: 'Which word is not a keyword in JavaScript?',
    options: ['while', 'for', 'true', 'live'],
    solution: 3
  },
  {
    question: 'Which word is not a valid method to create a function in JavaScript?',
    options: ['const a = a => {...}', '(() => { ... })()', 'callback ()', 'function t() {...}'],
    solution: 2
  },
  {
    question: 'This works in IE8:',
    options: ['fetch', 'Intl.Locale', 'console.debug', 'XMLHttpRequest'],
    solution: 3
  },
  {
    question: 'JavaScript went live in what year?',
    options: ['1900', '2020', '1995', '1993'],
    solution: 2
  },
  {
    question: 'You can convert a number to a string by using?',
    options: ['Int2String', 'Stringify', '2String', 'toString'],
    solution: 3
  },
  {
    question: 'Which word is not a keyword in JavaScript?',
    options: ['while', 'for', 'true', 'live'],
    solution: 3
  }
]

/**
 *
 * @property {number} time The current time on the timer.
 * @property {number} interval The interval ID that is returned from setInterval function.
 * @property {HTMLElement} el The element that will display the current time left.
 */
class TimeManagement {
  #tickTime = 1000;
  #start = 75;

  /**
   * Starts a timer based on the private options.
   */
  constructor() {
    // The time is set based on the private property #start.
    this.time = 0;

    // Bind the method so that when it is called *this* is still TimeManagement.
    // #tickTime is a private property that defines how fast the tick method will run.
    this.interval = 0;

    // This is the element that will display the current time remaining.
    this.el = document.querySelector('#timer');

    this.events = {
      tick: [],
      end: [],
      start: []
    }
  }

  /**
   * This sets an event handler to run at the end of the timer.
   * @param {function} cb The function to handle the event.
   */
  onEnd(cb) {
    this.events.end.push(cb);
  }

  /**
   * A event handler for the start of the timer.
   * @param {function} cb The function to handle the event.
   */
  onStart(cb) {
    this.events.start.push(cb);
  }

  /**
   * An event handler to run when a tick runs.
   * @param {function} cb The function to handle the event.
   */
  onTick(cb) {
    this.events.tick.push(cb);
  }

  /**
   * Starts or resets the time and interval.
   */
  start() {
    this.time = this.#start;
    this.display();
    this.interval = setInterval(this.tick.bind(this), this.#tickTime);
    this.emit('start', this.el);
  }

  emit(eventName, ...args) {
    for(let handler of this.events[eventName]) {
      handler(...args);
    }
  }

  /**
   * A way to ensure that display is the same and scalable if needed.
   */
  display() {
    this.el.innerText = this.time;
  }

  /**
   * This method tells the timer what to do every tick.
   */
  tick() {
    if(this.time <= 0) {
      this.stopTimer();
    }

    this.display();
    this.subtractTime(1);
    this.emit('tick', this.el, this.time);
  }

  /**
   * This method stops the timer regardless if the time on the clock is zero.
   */
  stopTimer() {
    clearInterval(this.interval);
    this.display();
    this.emit('end', this.el);
  }

  /**
   * Subtracts a specific amount from the timer.
   * @param {number} n Amount to be subtracted.
   */
  subtractTime(n) {
    if(n >= this.time) this.time = 0;
    else this.time -= n;
  }
}

class QuizCard {
  constructor(questions) {
    this.questions = questions;
    this.$ = $('#quiz');
    this.currentIndex = 0;
    this.answers = [];
  }

  get current() {
    return this.questions[this.currentIndex]
  }

  get correct() {
    let correct = 0;
    this.#iterateThroughAnswers((solution, answered) => {
      if(solution === answered) correct++;
    })

    return correct;
  }

  #iterateThroughAnswers(callback) {
    for(let i in this.answers) {
      let solution = this.questions[i].solution;
      let answered = this.answers[i];
      callback(solution, answered);
    }
  }

  /**
   * Checks the answer provided and adds it to the array of answers.
   * @param {string} answer numeric value of what the answer was.
   * @returns {boolean} Was the answer correct.
   */
  answerQuestion(answer) {
    const answerInt = parseInt(answer);
    const correctAnswer = this.questions[this.currentIndex].solution;
    const answeredCorrectly = correctAnswer === answerInt;
    this.answers.push(answerInt);
    this.currentIndex++;
    return answeredCorrectly;
  }

  display() {
    // If the currentIndex is the same as the length of the questions then we have gone through all the questions.
    if(this.currentIndex === this.questions.length) return null;

    // Filling out the quiz card.
    this.$.find('#question').text(this.current.question);
    this.$.find('[data-opt="0"]').text(this.current.options[0]);
    this.$.find('[data-opt="1"]').text(this.current.options[1]);
    this.$.find('[data-opt="2"]').text(this.current.options[2]);
    this.$.find('[data-opt="3"]').text(this.current.options[3]);
  }

  calculate() {
    return Math.round((this.correct / this.questions.length) * 100);
  }

  async show() {
    await fadeIn(this.$);
    return this;
  }

  async hide() {
    await fadeOut(this.$);
    return this;
  }
}

class EndCard {
  constructor() {
    this.$ = $('#end');
    this.form = this.$.find('#high-score');
  }

  async show() {
    await fadeIn(this.$);
    return this;
  }

  async hide() {
    await fadeOut(this.$);
    return this;
  }
}

class ScoreStorage {
  constructor() {
    this.scores = [];

    this.getScores();
  }

  getScores() {
    let scores = localStorage.getItem('high-scores');
    if(scores === null) return this.scores = [];
    this.scores = JSON.parse(scores);
    this.updateScoreCard();
  }

  setScores() {
    let storageString = JSON.stringify(this.scores);
    localStorage.setItem('high-scores', storageString);
    this.updateScoreCard();
  }

  displayScoreCard(n, name, score) {
    let parent = jQuery(`#number${(n)}`);
    parent.children().first().text(name)
    parent.children().last().text(score);
  }

  resetScoreCard() {
    for(let i = 1; i < 6; i++) {
      this.displayScoreCard(i, 'EMPTY', '00')
    }
  }

  updateScoreCard() {
    this.resetScoreCard();
    let i = 1;
    for(let score of this.scores) {
      if(i === 6) return;
      this.displayScoreCard(i, score.name, score.score);
      i++
    }
  }

  sortScores() {
    let tempArray = Array().concat(this.scores) // Creating a new array.
    tempArray.sort((a,b) => {
      return a.score > b.score ? -1 : // If Score is higher
        (a.score === b.score && a.date < b.date) ? -1 : 1; // Then check if the score is equal and date is lower.
    })

    this.scores = tempArray;
  }

  newScore(name, score) {
    const date = new Date().getTime();
    this.getScores();

    this.scores.push({
      name,
      score,
      date
    })

    this.sortScores();

    this.setScores();
  }

  clearScores() {
    this.scores = [];
    this.setScores();
  }
}

let timer = new TimeManagement();
let quiz = new QuizCard(_questions);
let endCard = new EndCard();
let scores = new ScoreStorage();

timer.onStart(el => {
  el.parentElement.classList.add('bg-success');
  el.parentElement.classList.remove('bg-danger');
})

timer.onEnd(el => {
  el.parentElement.classList.add('bg-danger');
  el.parentElement.classList.remove('bg-success');
  quiz.hide()
    .then(() => {
      $('#score').text(quiz.calculate());
      return endCard.show()
    });
})

function startQuiz() {
  let start = $('#start');
  quiz = new QuizCard(_questions);
  timer.start();
  quiz.display();
  fadeOut(start)
    .then(() => quiz.show());
}

function onClearScores() {
  scores.clearScores();
}

function answerQuestion() {
  // Converting {this} to jQuery.
  const self = $(this);

  // Getting the answer provided.
  const answerGiven = self.attr('data-opt');

  // Finding out if it is the correct answer.
  provideMark(quiz.answerQuestion(answerGiven));

  // Fading in and out.
  quiz.hide()
    .then(() => {

      if(quiz.display() === null) {
        // The onEnd for timer we are showing endCard.
        return timer.stopTimer();
      }
      return quiz.show();
    })
}

function provideMark(isCorrectAnswer) {
  if(isCorrectAnswer) {
    toast();
  } else {
    toast(false);
    timer.subtractTime(10);
  }
}

function submitHighScore(event) {
  event.preventDefault();
  const userName = $('#user-name');
  const userNameText = userName.val();
  const score = parseInt($('#score').text());

  if(userNameText === '') return userName
    .parent()
    .find('span')
    .removeClass('d-none');
  userName
    .parent()
    .find('span')
    .addClass('d-none');
  userName.val('');
  scores.newScore(userNameText, score);
  endCard.hide()
    .then(() => fadeIn($('#start')));
}

jQuery(function($) {
  // Setting event for starting the quiz.
  $('#start .btn').click(startQuiz)

  // Setting event for answering a question.
  $('#quiz .btn').click(answerQuestion)

  // Setting event for clearing scores.
  $('#clear-scores').click(onClearScores);

  // Setting event for score submission.
  endCard.form.on('submit', submitHighScore)
})

/**
 * This takes a jQuery element and fades it out using Bootstrap.  Bootstrap's fade is 150ms, a promise is returned.
 * @param {jQuery} jQueryElement
 * @returns {Promise<jQuery>}
 */
function fadeOut(jQueryElement) {
  return new Promise(res => {
    jQueryElement
      .removeClass('show')
      .addClass('fade')
    setTimeout(() => {
      jQueryElement.addClass('d-none');
      res(jQueryElement);
    }, 150)
  })
}

/**
 * Fades a jQuery element in using Bootstrap.  Bootstrap's fade is 150ms, a promise is returned.
 * @param {jQuery} jQueryElement
 * @returns {Promise<jQuery>}
 */
function fadeIn(jQueryElement) {
  return new Promise(res => {
    jQueryElement
      .removeClass('d-none')
      .addClass('show', 'fade')
    setTimeout(() => res(jQueryElement), 150);
  })
}

function toast(correct = true) {
  const toast = jQuery(`<output></output>`);
  toast
    .addClass('toast text-white')
    .addClass(!correct ? 'bg-danger' : 'bg-success')
    .text(!correct ? 'Incorrect' : 'Correct')
    .appendTo('#toast');
  setTimeout(() => toast.remove(), 3300);
}