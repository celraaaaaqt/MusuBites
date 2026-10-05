import { pb } from './pb.js';

//pocketbase connecttion
if (!pb.authStore.isValid || pb.authStore.record?.role !== 'staff') {
  pb.authStore.clear();
  window.location.href = '/admin/admin_login.html';
}

export function logout() {
  pb.authStore.clear();
  window.location.href = '/admin/admin_login.html';
}