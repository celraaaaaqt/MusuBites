import { pb } from './pb.js';

const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const errorMessage = document.getElementById('error');

//checks if already logged in
if (pb.authStore.isValid && pb.authStore.record?.role === 'staff') {
  window.location.href = '/admin/dashboard.html';
}

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  errorMessage.textContent = '';

  const submitBtn = loginForm.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Signing in...';

  try {
    const authData = await pb.collection('users').authWithPassword(
      emailInput.value,
      passwordInput.value
    );

    if (authData.record.role !== 'staff') {
      pb.authStore.clear();
      errorMessage.textContent = 'This account does not have staff access.';
      return;
    }

    window.location.href = '/admin/dashboard.html';
  } catch (err) {
    console.error('Login failed:', err);
    errorMessage.textContent = 'Invalid email or password.';
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Sign In';
  }
});