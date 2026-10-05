import { pb } from "/admin/lib/pb.js";
import { esc, peso, toast, pbError, loadingHtml, errorHtml } from "/admin/lib/utils.js";
import { categories, loadCategories } from "./categories.js";


//staff can manage products and stock available on the MusuGo app.
const LOW_STOCK = 5;

export let products = [];
let search = "";
let modalOpen = false;
let editingId = null;
let root = null;

export async function loadProducts() {
  products = await pb.collection("products").getFullList({
    sort: "product_name",
    expand: "product_category",
    requestKey: null,
  });
}

const categoryName = (p) => p.expand?.product_category?.name || "No category";
const isActive = (p) => p.is_active !== false;

function stockBadge(p) {
  const n = Number(p.stocks) || 0;
  if (n <= 0) return `<span class="rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">Out of stock</span>`;
  if (n <= LOW_STOCK) return `<span class="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">Low · ${n}</span>`;
  return `<span class="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">${n} in stock</span>`;
}

function listHtml() {
  const q = search.trim().toLowerCase();
  const list = products.filter((p) =>
    !q || [p.product_name, categoryName(p)].some((v) => String(v ?? "").toLowerCase().includes(q))
  );

  if (list.length === 0) {
    return `
      <div class="flex min-h-[320px] flex-col items-center justify-center px-6 text-center">
        <div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-100 text-primary-700">
          <i class="fa-solid fa-box-open text-2xl"></i>
        </div>
        <h3 class="mt-5 text-lg font-semibold text-gray-900">${products.length ? "No matching products" : "No products yet"}</h3>
        <p class="mt-2 max-w-md text-sm text-gray-500">
          ${products.length
            ? "Try a different search."
            : "You haven't added any products yet. Add your first product to start managing your MusuGo app menu."}
        </p>
        ${products.length ? "" : `
          <button id="empty-add-product-btn" type="button"
            class="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-700">
            <i class="fa-solid fa-plus"></i> Add Product
          </button>`}
      </div>`;
  }

  return `
    <div class="divide-y divide-gray-100">
      ${list.map((p) => `
        <div class="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div class="flex items-center gap-4">
            ${p.product_image
              ? `<img src="${esc(pb.files.getURL(p, p.product_image, { thumb: "100x100" }))}" alt="" class="h-12 w-12 shrink-0 rounded-xl object-cover" />`
              : `<div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-primary-700"><i class="fa-solid fa-box"></i></div>`}
            <div>
              <h3 class="font-semibold text-gray-900">
                ${esc(p.product_name)}
                ${isActive(p) ? "" : `<span class="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">Inactive</span>`}
              </h3>
              <p class="mt-1 text-sm text-gray-500">${esc(categoryName(p))}</p>
            </div>
          </div>
          <div class="flex items-center justify-between gap-5 sm:justify-end">
            ${stockBadge(p)}
            <p class="font-semibold text-gray-900">${peso(p.price)}</p>
            <button type="button" data-edit-product="${p.id}" title="Edit product"
              class="flex h-9 w-9 items-center justify-center rounded-lg text-primary-500 transition hover:bg-primary-50 hover:text-primary-700">
              <i class="fa-solid fa-pen"></i>
            </button>
          </div>
        </div>`).join("")}
    </div>`;
}

function modalHtml() {
  const p = editingId ? products.find((x) => x.id === editingId) : null;
  const editing = Boolean(p);
  const cats = categories;
  const input = "w-full rounded-xl border border-hairline bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100";
  const label = "mb-2 block text-sm font-semibold text-gray-700";

  return `
    <div id="add-product-modal" class="fixed inset-0 z-[100] ${modalOpen ? "flex" : "hidden"} items-center justify-center bg-black/40 p-4">
      <div class="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-xl">
        <div class="flex items-center justify-between border-b border-hairline px-6 py-5">
          <div>
            <h2 class="text-xl font-bold text-gray-900">${editing ? "Edit Product" : "Add Product"}</h2>
            <p class="mt-1 text-sm text-gray-500">${editing ? "Update product details and stock." : "Add a new product to your MusuGo app."}</p>
          </div>
          <button id="close-product-modal" type="button"
            class="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-700">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        ${modalOpen ? `
        <form id="add-product-form" class="space-y-5 p-6" novalidate>
          <div>
            <label for="product-name" class="${label}">Product Name</label>
            <input id="product-name" type="text" placeholder="Enter product name" value="${esc(p?.product_name)}" class="${input}" />
          </div>

          <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label for="product-price" class="${label}">Price</label>
              <div class="relative">
                <span class="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-500">₱</span>
                <input id="product-price" type="number" min="0" step="0.01" placeholder="0.00" value="${esc(p?.price)}"
                  class="w-full rounded-xl border border-hairline bg-gray-50 py-3 pl-9 pr-4 text-sm outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100" />
              </div>
            </div>
            <div>
              <label for="product-stocks" class="${label}">Stock Quantity</label>
              <input id="product-stocks" type="number" min="0" step="1" placeholder="0" value="${esc(p?.stocks ?? "")}" class="${input}" />
            </div>
          </div>

          <div>
            <label for="product-category" class="${label}">Category</label>
            <select id="product-category" class="${input}">
              <option value="">Select category</option>
              ${cats.map((c) => `<option value="${c.id}" ${c.id === p?.product_category ? "selected" : ""}>${esc(c.name)}${c.is_active === false ? " (inactive)" : ""}</option>`).join("")}
            </select>
          </div>

          <div>
            <label for="product-image" class="${label}">Image <span class="font-normal text-gray-400">(optional)</span></label>
            <input id="product-image" type="file" accept="image/*" class="${input}" />
          </div>

          <label class="flex cursor-pointer items-center gap-2">
            <input id="product-active" type="checkbox" ${p ? (isActive(p) ? "checked" : "") : "checked"}
              class="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
            <span class="text-sm text-gray-600">Active (visible on the MusuGo app)</span>
          </label>

          <p id="product-form-error" class="text-sm text-red-600"></p>

          <div class="flex justify-end gap-3 border-t border-hairline pt-5">
            <button type="button" id="cancel-product-modal"
              class="rounded-xl border border-hairline px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50">Cancel</button>
            <button type="submit" id="product-submit-btn"
              class="rounded-xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60">
              ${editing ? "Save Changes" : "Add Product"}
            </button>
          </div>
        </form>` : ""}
      </div>
    </div>`;
}

export function renderProducts() {
  const outOfStock = products.filter((p) => (Number(p.stocks) || 0) <= 0).length;
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
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
      <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">Products</h1>
        <p class="mt-1 text-sm text-gray-500">Manage the products and stock available on your MusuGo app.</p>
      </div>
      <button id="add-product-btn" type="button"
        class="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700">
        <i class="fa-solid fa-plus"></i> Add Product
      </button>
    </div>

    <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
      ${stat("Total Products", products.length, "fa-box", "bg-primary-100 text-primary-700")}
      ${stat("Active Products", products.filter(isActive).length, "fa-circle-check", "bg-green-100 text-green-600")}
      ${stat("Out of Stock", outOfStock, "fa-circle-xmark", "bg-red-100 text-red-600")}
      ${stat("Categories", categories.length, "fa-layer-group", "bg-primary-100 text-primary-700")}
    </div>

    <div class="rounded-2xl border border-hairline bg-white shadow-sm overflow-hidden">
      <div class="flex flex-col gap-4 border-b border-hairline p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 class="text-lg font-bold text-gray-900">Product List</h2>
          <p class="mt-1 text-sm text-gray-500">View and manage your MusuGo app products.</p>
        </div>
        <div class="relative w-full sm:w-72">
          <i class="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
          <input id="product-search" type="text" value="${esc(search)}" placeholder="Search products..."
            class="w-full rounded-xl border border-hairline bg-gray-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100" />
        </div>
      </div>
      <div id="product-list">${listHtml()}</div>
    </div>

    ${modalHtml()}`;
}

/* ------------------------------ behaviour ------------------------------ */

function paint() {
  if (root) root.innerHTML = renderProducts();
}

function openModal(id) {
  editingId = id || null;
  modalOpen = true;
  paint();
  root.querySelector("#product-name")?.focus();
}

function closeModal() {
  modalOpen = false;
  editingId = null;
  paint();
}

function onClick(e) {
  const t = e.target;
  if (t.closest("#retry-load")) return mountProducts(root);
  if (t.closest("#add-product-btn, #empty-add-product-btn")) return openModal(null);

  const edit = t.closest("[data-edit-product]");
  if (edit) return openModal(edit.dataset.editProduct);

  if (t.closest("#close-product-modal, #cancel-product-modal") || t.id === "add-product-modal") {
    if (root.querySelector("#product-submit-btn")?.disabled) return; // saving
    closeModal();
  }
}

function onInput(e) {
  if (e.target.id !== "product-search") return;
  search = e.target.value;
  root.querySelector("#product-list").innerHTML = listHtml();
}

async function onSubmit(e) {
  if (e.target.id !== "add-product-form") return;
  e.preventDefault();

  const form = e.target;
  const $ = (sel) => form.querySelector(sel);
  const errEl = $("#product-form-error");
  const btn = $("#product-submit-btn");
  const fail = (msg) => { errEl.textContent = msg; };
  errEl.textContent = "";

  const name = $("#product-name").value.trim();
  const priceRaw = $("#product-price").value;
  const stocksRaw = $("#product-stocks").value;
  const price = Number(priceRaw);
  const stocks = Number(stocksRaw);
  const category = $("#product-category").value;

  if (!name) return fail("Enter a product name.");
  if (priceRaw === "" || !Number.isFinite(price) || price < 0) return fail("Enter a valid price (0 or more).");
  if (stocksRaw === "" || !Number.isInteger(stocks) || stocks < 0) return fail("Stock must be a whole number (0 or more).");
  if (!category) return fail("Select a category.");

  const data = new FormData();
  data.append("product_name", name);
  data.append("price", String(price));
  data.append("stocks", String(stocks));
  data.append("product_category", category);
  data.append("is_active", String($("#product-active").checked));
  const file = $("#product-image").files[0];
  if (file) data.append("product_image", file);

  const wasEditing = Boolean(editingId);
  btn.disabled = true;
  btn.textContent = "Saving...";

  try {
    if (wasEditing) await pb.collection("products").update(editingId, data, { requestKey: null });
    else await pb.collection("products").create(data, { requestKey: null });
  } catch (err) {
    // Keep the modal open with the typed values so nothing is lost.
    fail(pbError(err));
    btn.disabled = false;
    btn.textContent = wasEditing ? "Save Changes" : "Add Product";
    return;
  }

  try {
    await loadProducts();
  } catch (err) {
    toast("Saved, but the list could not be refreshed: " + pbError(err), "error");
  }
  toast(wasEditing ? "Product updated." : "Product added.");
  closeModal();
}

export async function mountProducts(container) {
  root = container;
  modalOpen = false;
  editingId = null;
  container.onclick = onClick;
  container.oninput = onInput;
  container.onsubmit = onSubmit;

  container.innerHTML = loadingHtml("products");
  try {
    await Promise.all([loadCategories(), loadProducts()]);
  } catch (err) {
    container.innerHTML = errorHtml(err);
    return;
  }
  paint();
}