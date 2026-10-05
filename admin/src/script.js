import { logout } from "/admin/lib/auth-guard.js"; //runs the staff-only guard too
import { pb } from "/admin/lib/pb.js";
import { mountDashboard } from "/admin/pages/dashboard.js";
import { mountOrders, stopOrdersRealtime } from "/admin/pages/orders.js";
import { mountProducts } from "/admin/pages/products.js";
import { mountCategories } from "/admin/pages/categories.js";
import {mountRatings} from "/admin/pages/ratings.js";
 
const content = document.getElementById("app-content");

const pages = {
  dashboard: { link: "dashboard-link", mount: mountDashboard },
  orders: { link: "orders-link", mount: mountOrders },
  products: { link: "products-link", mount: mountProducts },
  categories: { link: "categories-link", mount: mountCategories },
  ratings: { link: "ratings-link", mount: mountRatings },
};

//sidebar badge = number of orders with payment status Pending.
async function updateOrdersBadge() {
  const badge = document.getElementById("orders-badge");
  if (!badge) return;
  try {
    const res = await pb.collection("orders").getList(1, 1, {
      filter: pb.filter("payment_status = {:s}", { s: "Pending" }),
      fields: "id",
      requestKey: null,
    });
    badge.textContent = String(res.totalItems);
  } catch { /* keep the previous value */ }
}
window.addEventListener("orders-changed", updateOrdersBadge);

function setActive(name) {
  Object.entries(pages).forEach(([key, { link }]) => {
    const el = document.getElementById(link);
    if (el) el.dataset.active = String(key === name);
  });
}

async function navigate(name) {
  const key = pages[name] ? name : "dashboard";

  await stopOrdersRealtime();
  //each page installs its own handlers adn clear the previous pages
  content.onclick = content.oninput = content.onsubmit = content.onchange = null;

  setActive(key);
  updateOrdersBadge();
  await pages[key].mount(content);
}

Object.entries(pages).forEach(([name, { link }]) => {
  document.getElementById(link)?.addEventListener("click", (e) => {
    e.preventDefault();
    if (location.hash.slice(1) === name) navigate(name);
    else location.hash = name; //triggers hashchange
  });
});

window.addEventListener("hashchange", () => navigate(location.hash.slice(1)));
document.getElementById("logout-btn")?.addEventListener("click", logout);

navigate(location.hash.slice(1) || "dashboard");