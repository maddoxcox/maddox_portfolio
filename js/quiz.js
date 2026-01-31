// Quiz System Module

const QuizSystem = {
    currentQuiz: null,
    currentQuestion: 0,
    score: 0,
    answers: [],
    isAnswered: false,

    // Initialize quiz from data attribute or inline data
    init(quizData) {
        this.currentQuiz = quizData;
        this.currentQuestion = 0;
        this.score = 0;
        this.answers = new Array(quizData.questions.length).fill(null);
        this.isAnswered = false;

        this.renderProgress();
        this.renderQuestion();
        this.updateButtons();
    },

    // Render progress dots
    renderProgress() {
        const progressContainer = document.querySelector('.quiz-progress');
        if (!progressContainer) return;

        progressContainer.innerHTML = '';
        this.currentQuiz.questions.forEach((_, index) => {
            const dot = document.createElement('div');
            dot.className = 'dot';
            if (index === this.currentQuestion) {
                dot.classList.add('active');
            }
            if (this.answers[index] !== null) {
                dot.classList.add(this.answers[index] ? 'correct' : 'incorrect');
            }
            progressContainer.appendChild(dot);
        });
    },

    // Render current question
    renderQuestion() {
        const questionCard = document.querySelector('.question-card');
        if (!questionCard) return;

        const question = this.currentQuiz.questions[this.currentQuestion];

        questionCard.innerHTML = `
            <div class="question-number">Question ${this.currentQuestion + 1} of ${this.currentQuiz.questions.length}</div>
            <div class="question-text">${question.question}</div>
            ${question.code ? `
                <div class="code-block">
                    <div class="code-header"><span class="language">JavaScript</span></div>
                    <pre><code>${this.escapeHtml(question.code)}</code></pre>
                </div>
            ` : ''}
            <ul class="options-list">
                ${question.options.map((option, index) => `
                    <li class="option" data-index="${index}">
                        <span class="option-marker">${String.fromCharCode(65 + index)}</span>
                        <span class="option-text">${option}</span>
                    </li>
                `).join('')}
            </ul>
            <div class="feedback"></div>
        `;

        // Add click handlers to options
        questionCard.querySelectorAll('.option').forEach(option => {
            option.addEventListener('click', () => {
                if (!this.isAnswered) {
                    this.selectOption(parseInt(option.dataset.index));
                }
            });
        });

        this.isAnswered = false;
    },

    // Handle option selection
    selectOption(index) {
        if (this.isAnswered) return;

        const question = this.currentQuiz.questions[this.currentQuestion];
        const isCorrect = index === question.correct;

        this.isAnswered = true;
        this.answers[this.currentQuestion] = isCorrect;

        if (isCorrect) {
            this.score++;
        }

        // Update UI
        const options = document.querySelectorAll('.option');
        options.forEach((option, i) => {
            option.classList.remove('selected');
            if (i === index) {
                option.classList.add(isCorrect ? 'correct' : 'incorrect');
            }
            if (i === question.correct && !isCorrect) {
                option.classList.add('correct');
            }
        });

        // Show feedback
        const feedback = document.querySelector('.feedback');
        if (feedback) {
            feedback.className = `feedback show ${isCorrect ? 'correct' : 'incorrect'}`;
            feedback.innerHTML = isCorrect
                ? `<strong>Correct!</strong> ${question.explanation || ''}`
                : `<strong>Incorrect.</strong> ${question.explanation || `The correct answer is ${String.fromCharCode(65 + question.correct)}.`}`;
        }

        this.renderProgress();
        this.updateButtons();
    },

    // Update navigation buttons
    updateButtons() {
        const prevBtn = document.querySelector('.prev-btn');
        const nextBtn = document.querySelector('.next-btn');
        const submitBtn = document.querySelector('.submit-btn');

        if (prevBtn) {
            prevBtn.style.display = this.currentQuestion > 0 ? 'inline-block' : 'none';
        }

        if (nextBtn && submitBtn) {
            const isLastQuestion = this.currentQuestion === this.currentQuiz.questions.length - 1;
            nextBtn.style.display = !isLastQuestion && this.isAnswered ? 'inline-block' : 'none';
            submitBtn.style.display = isLastQuestion && this.isAnswered ? 'inline-block' : 'none';
        }
    },

    // Go to next question
    nextQuestion() {
        if (this.currentQuestion < this.currentQuiz.questions.length - 1) {
            this.currentQuestion++;
            this.renderProgress();
            this.renderQuestion();
            this.updateButtons();
        }
    },

    // Go to previous question
    prevQuestion() {
        if (this.currentQuestion > 0) {
            this.currentQuestion--;
            this.renderProgress();
            this.renderQuestion();
            this.updateButtons();

            // Restore previous answer state
            if (this.answers[this.currentQuestion] !== null) {
                this.isAnswered = true;
                const question = this.currentQuiz.questions[this.currentQuestion];
                const options = document.querySelectorAll('.option');
                options[question.correct].classList.add('correct');
                this.updateButtons();
            }
        }
    },

    // Submit quiz and show results
    submit() {
        const quizContainer = document.querySelector('.quiz-container');
        if (!quizContainer) return;

        const percentage = Math.round((this.score / this.currentQuiz.questions.length) * 100);
        let message = '';
        let messageClass = '';

        if (percentage >= 90) {
            message = 'Excellent! You\'ve mastered this topic!';
            messageClass = 'excellent';
        } else if (percentage >= 70) {
            message = 'Great job! You have a solid understanding.';
            messageClass = 'good';
        } else if (percentage >= 50) {
            message = 'Good effort! Review the lessons and try again.';
            messageClass = 'average';
        } else {
            message = 'Keep learning! Review the lessons and practice more.';
            messageClass = 'needs-work';
        }

        // Save score
        if (typeof ProgressTracker !== 'undefined') {
            ProgressTracker.saveQuizScore(
                this.currentQuiz.id,
                this.score,
                this.currentQuiz.questions.length
            );
        }

        quizContainer.innerHTML = `
            <div class="results-container fade-in">
                <h2>Quiz Complete!</h2>
                <div class="results-score">${this.score}/${this.currentQuiz.questions.length}</div>
                <div class="results-percentage">${percentage}%</div>
                <div class="results-message ${messageClass}">${message}</div>
                <div class="results-actions">
                    <button class="btn btn-secondary retry-btn">Try Again</button>
                    <a href="../../index.html" class="btn btn-primary">Back to Home</a>
                </div>
            </div>
        `;

        // Add retry handler
        document.querySelector('.retry-btn')?.addEventListener('click', () => {
            location.reload();
        });
    },

    // Escape HTML for safe display
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

// Initialize quiz when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Look for quiz data
    const quizDataElement = document.getElementById('quiz-data');
    if (quizDataElement) {
        try {
            const quizData = JSON.parse(quizDataElement.textContent);
            QuizSystem.init(quizData);

            // Set up navigation buttons
            document.querySelector('.prev-btn')?.addEventListener('click', () => {
                QuizSystem.prevQuestion();
            });

            document.querySelector('.next-btn')?.addEventListener('click', () => {
                QuizSystem.nextQuestion();
            });

            document.querySelector('.submit-btn')?.addEventListener('click', () => {
                QuizSystem.submit();
            });
        } catch (e) {
            console.error('Failed to parse quiz data:', e);
        }
    }
});

// Export for use in other modules
window.QuizSystem = QuizSystem;
