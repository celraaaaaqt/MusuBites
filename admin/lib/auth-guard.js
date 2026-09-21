import { pb } from './pb.js';

// Import this at the very top of dashboard.js, categories.js, products.js —
// any script running on a staff-only page.

if (!pb.authStore.isValid || pb.authStore.record?.role !== 'staff') {
  pb.authStore.clear();
  window.location.href = '/admin/admin_login.html';
}

export function logout() {
  pb.authStore.clear();
  window.location.href = '/admin/admin_login.html';
}