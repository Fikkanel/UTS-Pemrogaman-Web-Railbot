/**
 * ==============================================================================
 * RailBot Frontend Logic (script.js)
 *
 * Deskripsi: Script utama untuk menangani semua interaksi di sisi klien
 * untuk aplikasi RailBot. Ini termasuk pengiriman pesan,
 * rendering UI, penanganan event, dan komunikasi dengan backend API.
 *
 * Bergantung pada: config.js, auth.js
 * ==============================================================================
 */

// 1. KONSTANTA DAN ELEMEN DOM
// ------------------------------------------------------------------------------
const chatMessages = document.getElementById('chatMessages');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const typingIndicator = document.getElementById('typingIndicator');
const logoutBtn = document.getElementById('logoutBtn');
const suggestionsContainer = document.getElementById('suggestionsContainer');

let isTyping = false;


// 2. FUNGSI UTILITAS UI
// ------------------------------------------------------------------------------

/**
 * Memformat teks mentah menjadi HTML (misalnya, newline menjadi <br>, **bold** menjadi <strong>).
 * @param {string} text - Teks yang akan diformat.
 * @returns {string} - String HTML yang sudah diformat.
 */
function formatMessage(text) {
    const urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    return text
        .replace(/\n/g, '<br>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(urlRegex, (url) => `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`);
}

/**
 * Menggulir kontainer chat ke paling bawah.
 */
function scrollToBottom() {
    setTimeout(() => {
        if (chatMessages) {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }, 100);
}

/**
 * Menampilkan indikator "sedang mengetik".
 */
function showTypingIndicator() {
    if (typingIndicator) {
        typingIndicator.style.display = 'flex';
        isTyping = true;
        scrollToBottom();
    }
}

/**
 * Menyembunyikan indikator "sedang mengetik".
 */
function hideTypingIndicator() {
    if (typingIndicator) {
        typingIndicator.style.display = 'none';
        isTyping = false;
    }
}

/**
 * Menambahkan pesan baru ke dalam UI chat.
 * @param {string} content - Isi pesan.
 * @param {boolean} isUser - True jika pesan dari pengguna, false jika dari bot.
 */
function addMessage(content, isUser = false) {
    if (!chatMessages) return;

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user' : 'bot'}`;

    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    const avatarImg = document.createElement('img');
    avatarImg.src = isUser ? 'logo/chatme.png' : 'logo/robotchat.png';
    avatarImg.alt = isUser ? 'User Avatar' : 'Bot Avatar';
    avatar.appendChild(avatarImg);

    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';

    const messageText = document.createElement('div');
    messageText.className = 'message-text';
    messageText.innerHTML = isUser ? content.replace(/\n/g, '<br>') : formatMessage(content);
    messageContent.appendChild(messageText);

    if (!isUser) {
        const actionButtons = createActionButtons();
        messageContent.appendChild(actionButtons);
    }

    if (isUser) {
        messageDiv.appendChild(messageContent);
        messageDiv.appendChild(avatar);
    } else {
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(messageContent);
    }

    const welcomeMessage = document.querySelector('.welcome-message');
    if (welcomeMessage) {
        welcomeMessage.style.display = 'none';
    }

    chatMessages.insertBefore(messageDiv, typingIndicator);
    scrollToBottom();
}


// 3. FUNGSI INTERAKSI PESAN (TOMBOL AKSI)
// ------------------------------------------------------------------------------

/**
 * Membuat dan mengembalikan grup tombol aksi (suka, tidak suka, salin, bagikan).
 * @returns {HTMLElement} - Div yang berisi tombol-tombol aksi.
 */
function createActionButtons() {
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'message-actions';

    const buttons = [
        { name: 'like', title: 'Suka', icon: '<path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>', handler: handleLikeDislike },
        { name: 'dislike', title: 'Tidak Suka', icon: '<path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zM7 2h3v7H7z"></path>', handler: handleLikeDislike },
        { name: 'copy', title: 'Salin Teks', icon: '<rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>', handler: handleCopy },
    ];

    if (navigator.share) {
        buttons.push({ name: 'share', title: 'Bagikan', icon: '<circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>', handler: handleShare });
    }

    buttons.forEach(({ name, title, icon, handler }) => {
        const btn = document.createElement('button');
        btn.className = `action-button ${name}`;
        btn.title = title;
        btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${icon}</svg>`;
        btn.onclick = (e) => handler(e, name);
        actionsDiv.appendChild(btn);
    });

    return actionsDiv;
}

function handleLikeDislike(event, type) {
    const button = event.currentTarget;
    const actionsDiv = button.parentElement;
    const likeButton = actionsDiv.querySelector('.like');
    const dislikeButton = actionsDiv.querySelector('.dislike');

    if (type === 'like') {
        button.classList.toggle('active');
        if (dislikeButton.classList.contains('active')) {
            dislikeButton.classList.remove('active');
        }
    } else if (type === 'dislike') {
        button.classList.toggle('active');
        if (likeButton.classList.contains('active')) {
            likeButton.classList.remove('active');
        }
    }
}

function handleCopy(event) {
    const button = event.currentTarget;
    const messageText = button.closest('.message-content').querySelector('.message-text').innerText;

    navigator.clipboard.writeText(messageText).then(() => {
        button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
        button.classList.add('active');
        setTimeout(() => {
            button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';
            button.classList.remove('active');
        }, 2000);
    }).catch(err => console.error('Gagal menyalin teks: ', err));
}

async function handleShare(event) {
    const messageText = event.currentTarget.closest('.message-content').querySelector('.message-text').innerText;
    try {
        await navigator.share({ title: 'Respons dari RailBot', text: messageText });
    } catch (err) {
        console.error('Error saat berbagi: ', err);
    }
}


// 4. LOGIKA UTAMA & KOMUNIKASI API
// ------------------------------------------------------------------------------

/**
 * Mengirim pesan yang diketik pengguna ke backend API.
 */
async function sendMessage() {
    const message = messageInput.value.trim();
    if (!message || isTyping) return;

    addMessage(message, true);
    messageInput.value = '';
    messageInput.style.height = 'auto';
    sendButton.disabled = true;
    showTypingIndicator();

    try {
        // Gunakan fetchWithAuth dari auth.js untuk request yang aman
        const response = await fetchWithAuth(`${API_BASE_URL}/api/chat`, {
            method: 'POST',
            body: JSON.stringify({ message: message })
        });

        if (!response || !response.ok) {
            const errorData = response ? await response.json() : { message: 'Network error' };
            throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        setTimeout(() => {
            addMessage(data.response, false);
        }, 500);

    } catch (error) {
        console.error('Error:', error);
        addMessage(`Maaf, terjadi kesalahan: ${error.message}. Silakan coba lagi nanti.`, false);
    } finally {
        hideTypingIndicator();
        sendButton.disabled = false;
        messageInput.focus();
    }
}

/**
 * Mengirim teks dari chip saran sebagai pesan baru.
 * @param {string} suggestion - Teks saran.
 */
function sendSuggestion(suggestion) {
    if (messageInput) {
        messageInput.value = suggestion;
        sendMessage();
    }
}

/**
 * Memuat data pengguna dari API dan memperbarui UI.
 */
async function loadUserData() {
    try {
        const response = await fetchWithAuth(`${API_BASE_URL}/api/profile`);
        if (!response || !response.ok) throw new Error('Gagal memuat profil pengguna.');

        const data = await response.json();
        const user = data.user;

        const welcomeName = document.getElementById('welcome-name');
        if (welcomeName) {
            welcomeName.textContent = user.full_name.split(' ')[0] || 'User';
        }

        const adminMenu = document.getElementById('admin-menu');
        if (user.role === 'admin' && adminMenu) {
            adminMenu.style.display = 'block';
        }
    } catch (error) {
        console.error("Gagal memuat data pengguna:", error);
        // Jika gagal, auth.js akan otomatis mengarahkan ke halaman login
    }
}


// 5. INISIALISASI & EVENT LISTENERS
// ------------------------------------------------------------------------------

/**
 * Menambahkan event listener ke elemen-elemen UI.
 */
function initializeEventListeners() {
    if (sendButton) {
        sendButton.addEventListener('click', sendMessage);
    }

    if (messageInput) {
        messageInput.addEventListener('input', function() {
            this.style.height = 'auto';
            const newHeight = Math.min(this.scrollHeight, 120);
            this.style.height = `${newHeight}px`;
        });
        messageInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            logout(); // Fungsi logout dari auth.js
        });
    }

    const userAvatar = document.querySelector('.user-avatar');
    const dropdownMenu = document.querySelector('.dropdown-menu');
    if (userAvatar && dropdownMenu) {
        userAvatar.addEventListener('click', (event) => {
            event.stopPropagation();
            dropdownMenu.classList.toggle('show');
        });
        window.addEventListener('click', () => {
            if (dropdownMenu.classList.contains('show')) {
                dropdownMenu.classList.remove('show');
            }
        });
    }

    // Menambahkan event listener ke semua chip saran
    if (suggestionsContainer) {
        suggestionsContainer.addEventListener('click', (event) => {
            if (event.target && event.target.classList.contains('suggestion-chip')) {
                sendSuggestion(event.target.textContent);
            }
        });
    }
}

/**
 * Titik masuk utama aplikasi saat halaman selesai dimuat.
 */
document.addEventListener('DOMContentLoaded', () => {
    // Cek apakah pengguna berada di halaman yang memerlukan login
    if (document.body.classList.contains('requires-auth')) {
        // Jika tidak ada token, auth.js akan redirect. Jika ada, muat data.
        if (getAuthToken()) {
            loadUserData();
        } else {
            // Jika tidak ada token, paksa redirect (sebagai fallback)
            window.location.href = 'login.html';
            return;
        }
    }

    initializeEventListeners();
    
    // Fokus ke input di desktop
    if (window.innerWidth >= 768 && messageInput) {
        messageInput.focus();
    }
    
    console.log('🚀 RailBot Frontend Loaded Successfully.');
});
