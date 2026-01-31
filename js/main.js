// Main JavaScript functionality for JS Learning Website

// Progress Tracking using localStorage
const ProgressTracker = {
    STORAGE_KEY: 'jslearning_progress',

    // Get all progress data
    getProgress() {
        const data = localStorage.getItem(this.STORAGE_KEY);
        return data ? JSON.parse(data) : {
            completedLessons: [],
            quizScores: {}
        };
    },

    // Save progress data
    saveProgress(data) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    },

    // Mark a lesson as complete
    completeLesson(lessonId) {
        const progress = this.getProgress();
        if (!progress.completedLessons.includes(lessonId)) {
            progress.completedLessons.push(lessonId);
            this.saveProgress(progress);
        }
        this.updateUI();
    },

    // Check if a lesson is complete
    isLessonComplete(lessonId) {
        const progress = this.getProgress();
        return progress.completedLessons.includes(lessonId);
    },

    // Save quiz score
    saveQuizScore(quizId, score, total) {
        const progress = this.getProgress();
        progress.quizScores[quizId] = { score, total, date: new Date().toISOString() };
        this.saveProgress(progress);
    },

    // Get quiz score
    getQuizScore(quizId) {
        const progress = this.getProgress();
        return progress.quizScores[quizId] || null;
    },

    // Calculate overall progress percentage
    getOverallProgress() {
        const progress = this.getProgress();
        const totalLessons = 8; // 4 basics + 4 intermediate
        return Math.round((progress.completedLessons.length / totalLessons) * 100);
    },

    // Update progress UI elements
    updateUI() {
        // Update progress bar on homepage
        const progressFill = document.querySelector('.progress-fill');
        const progressText = document.querySelector('.progress-text span:last-child');

        if (progressFill && progressText) {
            const percentage = this.getOverallProgress();
            progressFill.style.width = `${percentage}%`;
            progressText.textContent = `${percentage}% Complete`;
        }

        // Update topic cards completion status
        document.querySelectorAll('.topic-card').forEach(card => {
            const lessonId = card.dataset.lesson;
            if (lessonId && this.isLessonComplete(lessonId)) {
                card.classList.add('completed');
            }
        });

        // Update mark complete button
        this.updateCompleteButton();
    },

    // Update the mark complete button state
    updateCompleteButton() {
        const lessonId = document.body.dataset.lesson;
        const markCompleteBtn = document.querySelector('.mark-complete .btn');
        const completeStatus = document.querySelector('.complete-status');

        if (lessonId && markCompleteBtn) {
            if (this.isLessonComplete(lessonId)) {
                markCompleteBtn.style.display = 'none';
                if (completeStatus) {
                    completeStatus.style.display = 'flex';
                }
            } else {
                markCompleteBtn.style.display = 'flex';
                if (completeStatus) {
                    completeStatus.style.display = 'none';
                }
            }
        }
    },

    // Reset all progress
    reset() {
        localStorage.removeItem(this.STORAGE_KEY);
        this.updateUI();
    }
};

// Mobile Navigation Toggle
function initMobileNav() {
    const mobileMenuBtn = document.querySelector('.mobile-menu');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            mobileMenuBtn.textContent = navLinks.classList.contains('active') ? '✕' : '☰';
        });
    }
}

// Mark Lesson Complete Handler
function initMarkComplete() {
    const markCompleteBtn = document.querySelector('.mark-complete .btn');
    const lessonId = document.body.dataset.lesson;

    if (markCompleteBtn && lessonId) {
        markCompleteBtn.addEventListener('click', () => {
            ProgressTracker.completeLesson(lessonId);

            // Show success animation
            markCompleteBtn.innerHTML = '✓ Completed!';
            markCompleteBtn.classList.remove('btn-primary');
            markCompleteBtn.classList.add('btn-success');

            setTimeout(() => {
                ProgressTracker.updateUI();
            }, 500);
        });
    }
}

// Smooth scroll for anchor links
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initMobileNav();
    initMarkComplete();
    initSmoothScroll();
    ProgressTracker.updateUI();

    // Initialize code editors if the module is loaded
    if (typeof CodeEditor !== 'undefined') {
        CodeEditor.initAll();
    }
});

// Export for use in other modules
window.ProgressTracker = ProgressTracker;
