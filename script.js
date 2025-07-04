class TodoApp {
    constructor() {
        this.todos = JSON.parse(localStorage.getItem('todos')) || [];
        this.filter = 'all';
        this.draggedId = null;
        this.init();
    }

    init() {
        this.todoInput = document.getElementById('todoInput');
        this.addBtn = document.getElementById('addBtn');
        this.todoList = document.getElementById('todoList');
        this.itemCount = document.getElementById('itemCount');
        this.clearCompleted = document.getElementById('clearCompleted');
        
        this.showAll = document.getElementById('showAll');
        this.showActive = document.getElementById('showActive');
        this.showCompleted = document.getElementById('showCompleted');

        this.bindEvents();
        this.render();
    }

    bindEvents() {
        this.addBtn.addEventListener('click', () => this.addTodo());
        this.todoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTodo();
        });

        this.clearCompleted.addEventListener('click', () => this.clearCompletedTodos());

        this.showAll.addEventListener('click', () => this.setFilter('all'));
        this.showActive.addEventListener('click', () => this.setFilter('active'));
        this.showCompleted.addEventListener('click', () => this.setFilter('completed'));
    }

    addTodo() {
        const text = this.todoInput.value.trim();
        if (!text) return;
        const todo = {
            id: Date.now(),
            text: text,
            completed: false,
            createdAt: new Date().toISOString()
        };
        this.todos.push(todo);
        this.saveTodos();
        this.todoInput.value = '';
        this.render(() => {
            const li = this.todoList.querySelector('li[data-id="' + todo.id + '"]');
            if (li) {
                li.classList.add('adding');
                setTimeout(() => li.classList.remove('adding'), 300);
            }
        });
    }

    deleteTodo(id) {
        const li = this.todoList.querySelector('li[data-id="' + id + '"]');
        if (li) {
            li.classList.add('removing');
            setTimeout(() => {
                this.todos = this.todos.filter(t => t.id !== id);
                this.saveTodos();
                this.render();
            }, 250);
        } else {
            this.todos = this.todos.filter(t => t.id !== id);
            this.saveTodos();
            this.render();
        }
    }

    toggleTodo(id) {
        const todo = this.todos.find(todo => todo.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveTodos();
            this.render();
        }
    }

    clearCompletedTodos() {
        this.todos = this.todos.filter(todo => !todo.completed);
        this.saveTodos();
        this.render();
    }

    setFilter(filter) {
        this.filter = filter;
        
        // Update active filter button
        document.querySelectorAll('.filter-buttons button').forEach(btn => {
            btn.classList.remove('active');
        });
        
        if (filter === 'all') this.showAll.classList.add('active');
        else if (filter === 'active') this.showActive.classList.add('active');
        else if (filter === 'completed') this.showCompleted.classList.add('active');

        this.render();
    }

    getFilteredTodos() {
        switch (this.filter) {
            case 'active':
                return this.todos.filter(todo => !todo.completed);
            case 'completed':
                return this.todos.filter(todo => todo.completed);
            default:
                return this.todos;
        }
    }

    render(cb) {
        this.todoList.innerHTML = '';
        const filteredTodos = this.getFilteredTodos();
        if (filteredTodos.length === 0) {
            const empty = document.createElement('li');
            empty.className = 'empty-state';
            empty.textContent = 'No tasks';
            this.todoList.appendChild(empty);
        } else {
            filteredTodos.forEach(todo => {
                const li = document.createElement('li');
                li.className = 'todo-item' + (todo.completed ? ' completed' : '');
                li.setAttribute('data-id', todo.id);
                li.setAttribute('draggable', 'true');
                li.innerHTML = `
                    <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''}>
                    <span class="todo-text">${this.escapeHtml(todo.text)}</span>
                    <button class="delete-btn">Delete</button>
                `;
                const checkbox = li.querySelector('.todo-checkbox');
                const deleteBtn = li.querySelector('.delete-btn');
                const textSpan = li.querySelector('.todo-text');
                checkbox.addEventListener('change', () => this.toggleTodo(todo.id));
                deleteBtn.addEventListener('click', () => this.deleteTodo(todo.id));
                textSpan.addEventListener('dblclick', (e) => this.startEditTodo(todo.id, textSpan));
                // Drag events
                li.addEventListener('dragstart', e => {
                    this.draggedId = todo.id;
                    li.classList.add('dragging');
                });
                li.addEventListener('dragend', e => {
                    this.draggedId = null;
                    li.classList.remove('dragging');
                });
                li.addEventListener('dragover', e => {
                    e.preventDefault();
                    li.classList.add('drag-over');
                });
                li.addEventListener('dragleave', e => {
                    li.classList.remove('drag-over');
                });
                li.addEventListener('drop', e => {
                    e.preventDefault();
                    li.classList.remove('drag-over');
                    if (this.draggedId && this.draggedId !== todo.id) {
                        this.moveTodo(this.draggedId, todo.id);
                    }
                });
                this.todoList.appendChild(li);
            });
        }
        const activeCount = this.todos.filter(todo => !todo.completed).length;
        this.itemCount.textContent = `${activeCount} item${activeCount !== 1 ? 's' : ''} left`;
        if (cb) cb();
    }

    moveTodo(draggedId, targetId) {
        const fromIdx = this.todos.findIndex(t => t.id === draggedId);
        const toIdx = this.todos.findIndex(t => t.id === targetId);
        if (fromIdx === -1 || toIdx === -1) return;
        const [moved] = this.todos.splice(fromIdx, 1);
        this.todos.splice(toIdx, 0, moved);
        this.saveTodos();
        this.render();
    }

    startEditTodo(id, textSpan) {
        const todo = this.todos.find(t => t.id === id);
        if (!todo) return;
        const input = document.createElement('input');
        input.type = 'text';
        input.value = todo.text;
        input.className = 'edit-todo-input';
        input.maxLength = 100;
        textSpan.replaceWith(input);
        input.focus();
        input.setSelectionRange(input.value.length, input.value.length);
        const finish = () => {
            const newText = input.value.trim();
            if (newText && newText !== todo.text) {
                todo.text = newText;
                this.saveTodos();
            }
            this.render();
        };
        input.addEventListener('blur', finish);
        input.addEventListener('keydown', e => {
            if (e.key === 'Enter') finish();
            if (e.key === 'Escape') this.render();
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    saveTodos() {
        localStorage.setItem('todos', JSON.stringify(this.todos));
    }
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TodoApp();
    const featuresBtn = document.getElementById('featuresBtn');
    const featuresModal = document.getElementById('featuresModal');
    const closeFeatures = document.getElementById('closeFeatures');
    featuresBtn.addEventListener('click', () => {
        featuresModal.classList.add('active');
    });
    closeFeatures.addEventListener('click', () => {
        featuresModal.classList.remove('active');
    });
    featuresModal.addEventListener('click', e => {
        if (e.target === featuresModal) featuresModal.classList.remove('active');
    });
});