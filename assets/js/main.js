/**
 * I created this class strictly for documentation purposes at first.  It is in use now.
 * @property {string} question This is the question that is being asked.
 * @property {string[]} options An array of possible answers to choose from.
 * @property {number} solution The index of the correct answer from options.
 */
class Question {
  constructor(question, options, solution) {
    this.question = question;
    this.options = options;
    this.solution = solution;
  }
}

/**
 * Array of Question classes.
 * @type {Question[]}
 * @private
 */
const _questions = [
  new Question(
    'Which word is not a keyword in JavaScript?',
    ['while', 'for', 'true', 'live'],
    3
  ),
  new Question(
    'Which word is not a valid method to create a function in JavaScript?',
    ['const a = a => {...}', '(() => { ... })()', 'callback ()', 'function t() {...}'],
    2
    ),
  new Question(
    'This works in IE8:',
    ['fetch', 'Intl.Locale', 'console.debug', 'XMLHttpRequest'],
    3
  ),
  new Question(
    'JavaScript went live in what year?',
    ['1900', '2020', '1995', '1993'],
    2
  ),
  new Question(
    'You can convert a number to a string by using?',
    ['Int2String', 'Stringify', '2String', 'toString'],
    3
  )
];

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

/**
 * This class is the brain of the quiz.  It takes an array of questions that will include options and the answers.
 * It maps them to the buttons and asks the questions.  It also keeps track of the answers provided.
 * @property {Question[]} questions An array of Question classes.
 * @property {jQuery} $ The element for the quiz card.
 * @property {number} currentIndex The current index directing us to which Question we are using.
 * @property {number[]} answers An array of numbers which point to which option was provided as the question. The
 * index to the number matches the questions.  So this.questions[4].solution === this.answers[4] will tell us if the
 * answer is correct.
 */
class QuizCard {
  /**
   * Takes an Array of Question classes.
   * @param {Question[]} questions
   */
  constructor(questions) {
    // Sets the array of Question classes.
    this.questions = questions;

    // Getting the quiz card.
    this.$ = $('#quiz');

    // Setting the index at the beginning.
    this.currentIndex = 0;

    // Setting an empty answers array.
    this.answers = [];
  }

  /**
   * Getter for the current Question class in use.
   * @returns {Question}
   */
  get current() {
    return this.questions[this.currentIndex]
  }

  /**
   * Provides the number of correct questions answered.
   * @returns {number}
   */
  get correct() {
    let correct = 0;
    this.#iterateThroughAnswers((solution, answered) => {
      if(solution === answered) correct++;
    })

    return correct;
  }

  /**
   * A private method performs a blocking forEach iterating through the answers provided.
   * The callback is provided the correct index and the index provided.
   * @param {function} callback The callback is passed solution, answered.
   */
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

  /**
   * Fills out the quiz card with the question and options available.
   * @returns {QuizCard|null}  Returns null if there are no more questions available.
   */
  display() {
    // If the currentIndex is the same as the length of the questions then we have gone through all the questions.
    if(this.currentIndex === this.questions.length) return null;

    // Filling out the quiz card.
    this.$.find('#question').text(this.current.question);
    this.$.find('[data-opt="0"]').text(this.current.options[0]);
    this.$.find('[data-opt="1"]').text(this.current.options[1]);
    this.$.find('[data-opt="2"]').text(this.current.options[2]);
    this.$.find('[data-opt="3"]').text(this.current.options[3]);
    return this;
  }

  /**
   * Provides a score from 0-100 based on correct answers provided based on amount of questions there are.
   * @returns {number}
   */
  calculate() {
    return Math.round((this.correct / this.questions.length) * 100);
  }

  /**
   * A promise that fades the html card back into page.
   * @returns {Promise<QuizCard>}
   */
  async show() {
    await fadeIn(this.$);
    return this;
  }

  /**
   * A promise that fades the html card off of the page.
   * @returns {Promise<QuizCard>}
   */
  async hide() {
    await fadeOut(this.$);
    return this;
  }
}

/**
 * This class probably was not needed.  Perhaps in a different version it will be removed.  It covers the high-score
 * card that records the name.
 * @property {jQuery} $ The card element inside a jQuery object.
 * @property {jQuery} form The form element inside a jQuery object.
 */
class EndCard {
  constructor() {
    // Getting the card element.
    this.$ = $('#end');

    // Getting the form element.
    this.form = this.$.find('#high-score');
  }

  /**
   * A promise that fades the html card on to the page.
   * @returns {Promise<EndCard>}
   */
  async show() {
    await fadeIn(this.$);
    return this;
  }

  /**
   * A promise that fades the html card off of the page.
   * @returns {Promise<EndCard>}
   */
  async hide() {
    await fadeOut(this.$);
    return this;
  }
}

/**
 * Class was created to properly document the ScoreStorage class.
 * @property {string} name The name provided for the high score.
 * @property {number} score The score they got on the quiz.
 * @property {number} date The unix timestamp in ms.
 */
class Score {
  constructor(name, score) {
    this.name = name;
    this.score = score;
    this.date = new Date().getTime();
  }

  /**
   * A literal version of the class.
   * @returns {{date: number, score: number, name: string}}
   */
  toObject() {
    return {
      name: this.name,
      score: this.score,
      date: this.date
    }
  }

  /**
   * This is stringify version of the literal version.
   * @returns {string}
   */
  toString() {
    return JSON.stringify(this.toObject())
  }
}

/**
 * This class controls the localStorage usage as well as the html display of the high scores.
 * @property {Score[]} scores An array of Score classes.
 */
class ScoreStorage {
  constructor() {
    // Setting an empty array for future scores.
    this.scores = [];

    // Getting any scores from the localStorage.
    this.getScores();
  }

  /**
   * Getting localStorage scores.  Requests an update to the high score modal as after it is complete.
   * @returns {undefined|[]} Returning only to end the method early.
   */
  getScores() {
    // Getting the scores from localStorage.
    let scores = localStorage.getItem('high-scores');

    // If it is empty then setting an empty array.
    if(scores === null) return this.scores = [];

    // Parsing the string to convert it to an array with objects inside.
    this.scores = JSON.parse(scores);

    // Updating the High Score modal.
    this.updateScoreCard();
  }

  /**
   * Saves the current scores to the localStorage.
   */
  setScores() {
    // Stringify the array.
    let storageString = JSON.stringify(this.scores);

    // Saving the string to localStorage.
    localStorage.setItem('high-scores', storageString);

    // Updating High Score Modal.
    this.updateScoreCard();
  }

  /**
   * The table that displays high scores is provides #number1-#number5.  This is a simple way to update them.
   * @param {number} n The number of the tr you are updating.
   * @param {string} name Name that got the high score.
   * @param {number|string} score Score they got.
   */
  displayScoreCard(n, name, score) {
    // Getting the jQuery object with the tr element.
    let parent = jQuery(`#number${(n)}`);

    // finding the first child and placing the name.
    parent.children().first().text(name)

    // finding the last child and placing the score.
    parent.children().last().text(score);
  }

  /**
   * Resetting all the scores to EMPTY/00
   */
  resetScoreCard() {
    for(let i = 1; i < 6; i++) {
      this.displayScoreCard(i, 'EMPTY', '00')
    }
  }

  /**
   * iterating through the scores from scores.  Stopping when we reach top five or run out.  Which ever comes first.
   */
  updateScoreCard() {
    this.resetScoreCard();
    let i = 1;
    for(let score of this.scores) {
      if(i === 6) return;
      this.displayScoreCard(i, score.name, score.score);
      i++
    }
  }

  /**
   * Sorts by:
   *    If score is greater
   *    If score is equal but date is older
   */
  sortScores() {
    let tempArray = Array().concat(this.scores) // Creating a new array.
    tempArray.sort((a,b) => {
      return a.score > b.score ? -1 : // If Score is higher
        (a.score === b.score && a.date < b.date) ? -1 : 1; // Then check if the score is equal and date is lower.
    })

    this.scores = tempArray;
  }

  /**
   * Adds a new Score class.
   * @param {string} name Who took the quiz.
   * @param {number} score The score they got.
   */
  newScore(name, score) {
    this.getScores();

    this.scores.push(new Score(name, score));

    this.sortScores();

    this.setScores();
  }

  /**
   * Clears the scores from the localStorage and the high score modal.
   */
  clearScores() {
    this.scores = [];
    this.setScores();
  }
}

// Getting the timer setup.
let timer = new TimeManagement();

// Getting the Quiz Card setup.
let quiz = new QuizCard(_questions);

// Getting the end card setup.
let endCard = new EndCard();

// Getting Score Storage setup.
let scores = new ScoreStorage();

// Configuring the timer when it starts.
timer.onStart(el => {
  el.parentElement.classList.add('bg-success');
  el.parentElement.classList.remove('bg-danger');
})

// Configuring the timer when it stops.
timer.onEnd(el => {
  el.parentElement.classList.add('bg-danger');
  el.parentElement.classList.remove('bg-success');
  quiz.hide()
    .then(() => {
      $('#score').text(quiz.calculate());
      return endCard.show()
    });
})

/**
 * This is the eventHandler for when you click the start quiz button.
 */
function startQuiz() {
  let start = $('#start');
  quiz = new QuizCard(_questions);
  timer.start();
  quiz.display();
  fadeOut(start)
    .then(() => quiz.show());
}

/**
 * This is the eventHandler for when you click the clear scores button.
 */
function onClearScores() {
  scores.clearScores();
}

/**
 * The eventHandler when an answer button is clicked.
 */
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

/**
 * Fork for what to do if the answer was correct or not.
 * @param isCorrectAnswer
 */
function provideMark(isCorrectAnswer) {
  if(isCorrectAnswer) {
    toast();
  } else {
    toast(false);
    timer.subtractTime(10);
  }
}

/**
 * EventHandler if they decide not click cancel instead of recording a score.
 */
function cancelRequestToRecordScore() {
  endCard.hide()
    .then(() => fadeIn($('#start')));
}

/**
 * EventHandler for when they submit a score.
 * @param event
 * @returns {*|jQuery}
 */
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

  // Event click if they cancel the request to record a score.
  $('#cancel-request').click(cancelRequestToRecordScore)

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

/**
 * Custom toast for when they answer a question.
 * @param correct
 */
function toast(correct = true) {
  const toast = jQuery(`<output></output>`);
  toast
    .addClass('toast text-white')
    .addClass(!correct ? 'bg-danger' : 'bg-success')
    .text(!correct ? 'Incorrect' : 'Correct')
    .appendTo('#toast');
  setTimeout(() => toast.remove(), 3300);
}