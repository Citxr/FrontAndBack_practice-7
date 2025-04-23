document.addEventListener('DOMContentLoaded', () => {
    const noteInput = document.getElementById('note-input');
    const addNoteBtn = document.getElementById('add-note-btn');
    const notesList = document.getElementById('notes-list');
    const offlineStatus = document.getElementById('offline-status');

    function updateOnlineStatus() {
        if (navigator.onLine) {
            offlineStatus.style.display = 'none';
        } else {
            offlineStatus.style.display = 'block';
        }
    }

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    updateOnlineStatus();

    function loadNotes() {
        notesList.innerHTML = '';
        const notes = JSON.parse(localStorage.getItem('notes')) || [];

        notes.forEach((note, index) => {
            const noteElement = document.createElement('div');
            noteElement.className = 'note';
            noteElement.innerHTML = `
                <div class="note-text">${note.text}</div>
                <button class="delete-btn" data-index="${index}">Удалить</button>
            `;
            notesList.appendChild(noteElement);
        });

        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = e.target.getAttribute('data-index');
                deleteNote(index);
            });
        });
    }

    function addNote() {
        const text = noteInput.value.trim();
        if (!text) return;

        const notes = JSON.parse(localStorage.getItem('notes')) || [];
        notes.push({ text, date: new Date().toISOString() });
        localStorage.setItem('notes', JSON.stringify(notes));

        noteInput.value = '';
        loadNotes();
    }

    function deleteNote(index) {
        const notes = JSON.parse(localStorage.getItem('notes')) || [];
        notes.splice(index, 1);
        localStorage.setItem('notes', JSON.stringify(notes));
        loadNotes();
    }

    addNoteBtn.addEventListener('click', addNote);
    noteInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            addNote();
        }
    });

    loadNotes();
});

let deferredPrompt;
const installBtn = document.getElementById('install-btn');

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installBtn.classList.remove('hidden');
});

installBtn.addEventListener('click', async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();

    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
        console.log('Пользователь принял предложение установки');
    } else {
        console.log('Пользователь отклонил предложение установки');
    }

    deferredPrompt = null;

    installBtn.classList.add('hidden');
});

window.addEventListener('appinstalled', () => {
    console.log('PWA было установлено');
    installBtn.classList.add('hidden');
    deferredPrompt = null;
});

window.addEventListener('load', () => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
        installBtn.classList.add('hidden');
    }
});