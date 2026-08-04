// AUTH ENGINE
const Auth = {

    getUsers() {
        return JSON.parse(localStorage.getItem('para_users') || '[]');
    },

    saveUsers(users) {
        localStorage.setItem('para_users', JSON.stringify(users));
    },

    getCurrentUser() {
        const id = localStorage.getItem('para_current_user');
        if (!id) return null;
        return this.getUsers().find(u => u.id === id) || null;
    },

    isLoggedIn() {
        return this.getCurrentUser() !== null;
    },

    login(email, password) {
        const user = this.getUsers().find(u => u.email === email && u.password === password);
        if (user) {
            localStorage.setItem('para_current_user', user.id);
            return { success: true, user };
        }
        return { success: false, message: 'Invalid email or password.' };
    },

    register(name, email, password) {
        const users = this.getUsers();
        if (users.find(u => u.email === email)) {
            return { success: false, message: 'Email already registered.' };
        }
        const user = {
            id:         'user_' + Date.now(),
            name,
            email,
            password,
            createdAt: new Date().toISOString()
        };
        users.push(user);
        this.saveUsers(users);
        localStorage.setItem('para_current_user', user.id);
        return { success: true, user };
    },

    logout() {
        localStorage.removeItem('para_current_user');
    },

    resetPassword(email, newPassword) {
        const users = this.getUsers();
        const idx = users.findIndex(u => u.email === email);
        if (idx === -1) return { success: false, message: 'Email not found.' };
        users[idx].password = newPassword;
        this.saveUsers(users);
        return { success: true };
    }

};

// AUTH PAGE UI FUNCTIONS
function showAuthPage(page) {
    ['login', 'signup', 'forgot'].forEach(p => {
        const el = document.getElementById('auth-' + p);
        if (el) el.classList.toggle('hidden', p !== page);
    });
}

function doLogin() {
    const email    = document.getElementById('login-email')?.value.trim();
    const password = document.getElementById('login-password')?.value;

    if (!email || !password) {
        showNotification('Please fill in all fields.', 'warning');
        return;
    }

    const result = Auth.login(email, password);

    if (result.success) {
        showNotification('Welcome back, ' + result.user.name + '!', 'success');
        setTimeout(() => { window.location.href = 'index.html'; }, 1000);
    } else {
        showNotification(result.message, 'error');
    }
}

function doSignup() {
    const name     = document.getElementById('signup-name')?.value.trim();
    const email    = document.getElementById('signup-email')?.value.trim();
    const password = document.getElementById('signup-password')?.value;
    const agree    = document.getElementById('signup-agree')?.checked;

    if (!name || !email || !password) {
        showNotification('Please fill in all fields.', 'warning');
        return;
    }
    if (!agree) {
        showNotification('Please agree to the Terms of Service.', 'warning');
        return;
    }
    if (password.length < 6) {
        showNotification('Password must be at least 6 characters.', 'warning');
        return;
    }

    const result = Auth.register(name, email, password);

    if (result.success) {
        showNotification('Account created! Welcome, ' + name + '!', 'success');
        setTimeout(() => { window.location.href = 'index.html'; }, 1200);
    } else {
        showNotification(result.message, 'error');
    }
}

function doForgot() {
    const email     = document.getElementById('forgot-email')?.value.trim();
    const newpw     = document.getElementById('forgot-newpw')?.value;
    const confirmpw = document.getElementById('forgot-confirmpw')?.value;

    if (!email || !newpw || !confirmpw) {
        showNotification('Please fill in all fields.', 'warning');
        return;
    }
    if (newpw !== confirmpw) {
        showNotification('Passwords do not match.', 'error');
        return;
    }
    if (newpw.length < 6) {
        showNotification('Password must be at least 6 characters.', 'warning');
        return;
    }

    const result = Auth.resetPassword(email, newpw);

    if (result.success) {
        showNotification('Password reset! You can now log in.', 'success');
        setTimeout(() => showAuthPage('login'), 1400);
    } else {
        showNotification(result.message, 'error');
    }
}

// AUTH PAGE SETUP
document.addEventListener('DOMContentLoaded', () => {

    if (!document.getElementById('auth-login')) return;

    if (Auth.isLoggedIn()) {
        window.location.href = 'index.html';
        return;
    }

    document.getElementById('toggle-pw-login')?.addEventListener('click', function () {
        const input = document.getElementById('login-password');
        const icon  = document.getElementById('eye-login');
        input.type  = input.type === 'password' ? 'text' : 'password';
        icon.className = input.type === 'password' ? 'fi fi-rr-eye-crossed' : 'fi fi-rr-eye';
    });

    document.getElementById('toggle-pw-signup')?.addEventListener('click', function () {
        const input = document.getElementById('signup-password');
        const icon  = document.getElementById('eye-signup');
        input.type  = input.type === 'password' ? 'text' : 'password';
        icon.className = input.type === 'password' ? 'fi fi-rr-eye-crossed' : 'fi fi-rr-eye';
    });

    document.addEventListener('keydown', e => {
        if (e.key !== 'Enter') return;
        const loginVisible  = !document.getElementById('auth-login')?.classList.contains('hidden');
        const signupVisible = !document.getElementById('auth-signup')?.classList.contains('hidden');
        const forgotVisible = !document.getElementById('auth-forgot')?.classList.contains('hidden');
        if (loginVisible)  doLogin();
        if (signupVisible) doSignup();
        if (forgotVisible) doForgot();
    });

    document.getElementById('login-submit')?.addEventListener('click', doLogin);
    document.getElementById('signup-submit')?.addEventListener('click', doSignup);
    document.getElementById('forgot-submit')?.addEventListener('click', doForgot);

    document.getElementById('go-forgot')?.addEventListener('click', e => {
        e.preventDefault();
        showAuthPage('forgot');
    });

    document.getElementById('go-signup')?.addEventListener('click', e => {
        e.preventDefault();
        showAuthPage('signup');
    });

    document.getElementById('go-login-from-signup')?.addEventListener('click', e => {
        e.preventDefault();
        showAuthPage('login');
    });

    document.getElementById('go-login-from-forgot')?.addEventListener('click', e => {
        e.preventDefault();
        showAuthPage('login');
    });

    document.getElementById('go-signup-from-forgot')?.addEventListener('click', e => {
        e.preventDefault();
        showAuthPage('signup');
    });

});