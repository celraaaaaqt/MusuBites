import { pb } from "/admin/lib/pb.js";
import { esc, loadingHtml, errorHtml } from "/admin/lib/utils.js";

export let categories = [];
let productCounts = new Map(); //category id -> number of products
let search = "";
let root = null;

export async function loadCategories() {
  categories = await pb.collection("categories").getFullList({ sort: "name", requestKey: null });
}

async function loadCounts() {
  try {
    const prods = await pb.collection("products").getFullList({
      fields: "id,product_category",
      requestKey: null,
    });
    const map = new Map();
    prods.forEach((p) => map.set(p.product_category, (map.get(p.product_category) || 0) + 1));
    productCounts = map;
  } catch {
    productCounts = new Map();
  }
}

const countOf = (c) => productCounts.get(c.id) || 0;

function listHtml() {
  const q = search.trim().toLowerCase();
  const list = categories.filter((c) => !q || String(c.name).toLowerCase().includes(q));

  if (list.length === 0) {
    return `
      <div class="flex min-h-[320px] flex-col items-center justify-center px-6 text-center">
        <div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-100 text-primary-700">
          <i class="fa-solid fa-layer-group text-2xl"></i>
        </div>
        <h3 class="mt-5 text-lg font-semibold text-gray-900">No categories found</h3>
        <p class="mt-2 max-w-md text-sm text-gray-500">
          ${categories.length ? "Try a different search." : "Categories are managed by an administrator."}
        </p>
      </div>`;
  }

  return `
    <div class="divide-y divide-gray-100">
      ${list.map((c) => `
        <div class="flex items-center justify-between gap-4 p-5">
          <div class="flex items-center gap-4">
            <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-100 text-primary-700">
              <i class="fa-solid fa-layer-group"></i>
            </div>
            <div>
              <h3 class="font-semibold text-gray-900">${esc(c.name)}</h3>
              <p class="mt-1 text-sm text-gray-500">${countOf(c)} product${countOf(c) === 1 ? "" : "s"}</p>
            </div>
          </div>
          ${c.is_active === false
            ? `<span class="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-500">Inactive</span>`
            : ""}
        </div>`).join("")}
    </div>`;
}

export function renderCategories() {
  const withProducts = categories.filter((c) => countOf(c) > 0).length;
  const stat = (label, value, icon, tone) => `
    <div class="rounded-2xl border border-hairline bg-white p-5 shadow-sm">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-gray-500">${label}</p>
          <p class="mt-2 text-2xl font-bold text-gray-900">${value}</p>
        </div>
        <div class="flex h-11 w-11 items-center justify-center rounded-xl ${tone}">
          <i class="fa-solid ${icon}"></i>
        </div>
      </div>
    </div>`;

  return `
    <div class="mb-8">
      <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">Categories</h1>
      <p class="mt-1 text-sm text-gray-500">Categories used by your products.</p>
    </div>

    <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-8">
      ${stat("Total Categories", categories.length, "fa-layer-group", "bg-primary-100 text-primary-700")}
      ${stat("Categories With Products", withProducts, "fa-box", "bg-green-100 text-green-600")}
      ${stat("Empty Categories", categories.length - withProducts, "fa-folder-open", "bg-primary-100 text-primary-700")}
    </div>

    <div class="rounded-2xl border border-hairline bg-white shadow-sm overflow-hidden">
      <div class="flex flex-col gap-4 border-b border-hairline p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 class="text-lg font-bold text-gray-900">Category List</h2>
          <p class="mt-1 text-sm text-gray-500">Categories available when adding products.</p>
        </div>
        <div class="relative w-full sm:w-72">
          <i class="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
          <input id="category-search" type="text" value="${esc(search)}" placeholder="Search categories..."
            class="w-full rounded-xl border border-hairline bg-gray-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100" />
        </div>
      </div>
      <div id="category-list">${listHtml()}</div>
    </div>`;
}

export async function mountCategories(container) {
  root = container;
  container.onclick = (e) => { if (e.target.closest("#retry-load")) mountCategories(root); };
  container.onsubmit = null;
  container.oninput = (e) => {
    if (e.target.id !== "category-search") return;
    search = e.target.value;
    root.querySelector("#category-list").innerHTML = listHtml();
  };

  container.innerHTML = loadingHtml("categories");
  try {
    await Promise.all([loadCategories(), loadCounts()]);
  } catch (err) {
    container.innerHTML = errorHtml(err);
    return;
  }
  container.innerHTML = renderCategories();
}