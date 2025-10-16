async function handleLogin(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const loginBtn = document.getElementById('loginBtn');
    const spinner = loginBtn.querySelector('.spinner-border');

    loginBtn.disabled = true;
    spinner.parentElement.textContent = "Memproses...";
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Login gagal');
        }

        localStorage.setItem('accessToken', data.access_token);
        window.location.href = 'index.html';

    } catch (error) {
        alert(error.message);
        loginBtn.disabled = false;
        loginBtn.innerHTML = 'Masuk';
    }
}

function logout() {
    localStorage.removeItem('accessToken');
    window.location.href = 'login.html';
}

function getAuthToken() {
    return localStorage.getItem('accessToken');
}

async function fetchWithAuth(url, options = {}) {
    const token = getAuthToken();
    if (!token) {
        logout(); 
        return;
    }

    const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers,
    };

    try {
        const response = await fetch(url, { ...options, headers });
        if (response.status === 401) { 
            logout();
            return;
        }
        return response;
    } catch (error) {
        console.error("Fetch error:", error);
        throw error;
    }
}