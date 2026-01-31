// Interactive Code Editor Module

const CodeEditor = {
    // Initialize all code editors on the page
    initAll() {
        document.querySelectorAll('.code-editor').forEach((editor, index) => {
            this.init(editor, index);
        });
    },

    // Initialize a single code editor
    init(editorElement, id) {
        const textarea = editorElement.querySelector('.editor-textarea');
        const runBtn = editorElement.querySelector('.run-btn');
        const resetBtn = editorElement.querySelector('.reset-btn');
        const outputContent = editorElement.querySelector('.output-content');

        if (!textarea || !runBtn || !outputContent) return;

        // Store original code for reset
        const originalCode = textarea.value;

        // Handle tab key in textarea
        textarea.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                e.preventDefault();
                const start = textarea.selectionStart;
                const end = textarea.selectionEnd;
                textarea.value = textarea.value.substring(0, start) + '    ' + textarea.value.substring(end);
                textarea.selectionStart = textarea.selectionEnd = start + 4;
            }
        });

        // Run button handler
        runBtn.addEventListener('click', () => {
            this.runCode(textarea.value, outputContent);
        });

        // Reset button handler
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                textarea.value = originalCode;
                outputContent.textContent = '';
                outputContent.classList.remove('error');
            });
        }

        // Allow Ctrl/Cmd + Enter to run code
        textarea.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                this.runCode(textarea.value, outputContent);
            }
        });
    },

    // Execute JavaScript code safely
    runCode(code, outputElement) {
        outputElement.textContent = '';
        outputElement.classList.remove('error');

        // Create a custom console.log that captures output
        const outputs = [];
        const customConsole = {
            log: (...args) => {
                outputs.push(args.map(arg => this.formatOutput(arg)).join(' '));
            },
            error: (...args) => {
                outputs.push('Error: ' + args.map(arg => this.formatOutput(arg)).join(' '));
            },
            warn: (...args) => {
                outputs.push('Warning: ' + args.map(arg => this.formatOutput(arg)).join(' '));
            },
            info: (...args) => {
                outputs.push('Info: ' + args.map(arg => this.formatOutput(arg)).join(' '));
            },
            clear: () => {
                outputs.length = 0;
            }
        };

        try {
            // Create a function with custom console
            const wrappedCode = `
                (function(console) {
                    ${code}
                })
            `;

            // Execute the code
            const fn = eval(wrappedCode);
            const result = fn(customConsole);

            // If there's a return value and no console output, show it
            if (result !== undefined && outputs.length === 0) {
                outputs.push(this.formatOutput(result));
            }

            // Display output
            if (outputs.length > 0) {
                outputElement.textContent = outputs.join('\n');
            } else {
                outputElement.textContent = '(No output)';
                outputElement.style.opacity = '0.5';
                setTimeout(() => {
                    outputElement.style.opacity = '1';
                }, 100);
            }
        } catch (error) {
            outputElement.textContent = `Error: ${error.message}`;
            outputElement.classList.add('error');
        }
    },

    // Format different types of output
    formatOutput(value) {
        if (value === null) return 'null';
        if (value === undefined) return 'undefined';
        if (typeof value === 'string') return value;
        if (typeof value === 'function') return value.toString();
        if (Array.isArray(value)) {
            return '[' + value.map(v => this.formatValue(v)).join(', ') + ']';
        }
        if (typeof value === 'object') {
            try {
                return JSON.stringify(value, null, 2);
            } catch (e) {
                return String(value);
            }
        }
        return String(value);
    },

    // Format values for array/object display
    formatValue(value) {
        if (typeof value === 'string') return `"${value}"`;
        if (value === null) return 'null';
        if (value === undefined) return 'undefined';
        if (Array.isArray(value)) {
            return '[' + value.map(v => this.formatValue(v)).join(', ') + ']';
        }
        if (typeof value === 'object') {
            return JSON.stringify(value);
        }
        return String(value);
    }
};

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    CodeEditor.initAll();
});

// Export for use in other modules
window.CodeEditor = CodeEditor;
