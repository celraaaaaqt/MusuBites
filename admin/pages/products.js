import { categories } from "./categories.js";

export let products = [];

export function renderProducts() {
  return `
    <!-- Products Header -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
      <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">
          Products
        </h1>
        <p class="mt-1 text-sm text-gray-500">
          Manage the products available on your kiosk.
        </p>
      </div>

      <button
        id="add-product-btn"
        class="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700"
      >
        <i class="fa-solid fa-plus"></i>
        Add Product
      </button>
    </div>

    <!-- Product Stats -->      
    <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">

      <div class="rounded-2xl border border-hairline bg-white p-5 shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-500">Total Products</p>
            <p class="mt-2 text-2xl font-bold text-gray-900">
              ${products.length}
            </p>
          </div>

          <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-100 text-primary-700">
            <i class="fa-solid fa-box"></i>
          </div>
        </div>
      </div>

      <div class="rounded-2xl border border-hairline bg-white p-5 shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-500">Active Products</p>
            <p class="mt-2 text-2xl font-bold text-gray-900">
              ${products.length}
            </p>
          </div>

          <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 text-green-600">
            <i class="fa-solid fa-circle-check"></i>
          </div>
        </div>
      </div>

      <div class="rounded-2xl border border-hairline bg-white p-5 shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-500">Out of Stock</p>
            <p class="mt-2 text-2xl font-bold text-gray-900">
              0
            </p>
          </div>

          <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-red-100 text-red-600">
            <i class="fa-solid fa-circle-xmark"></i>
          </div>
        </div>
      </div>

      <div class="rounded-2xl border border-hairline bg-white p-5 shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-500">Categories</p>
            <p class="mt-2 text-2xl font-bold text-gray-900">
              0
            </p>
          </div>

          <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-100 text-primary-700">
            <i class="fa-solid fa-layer-group"></i>
          </div>
        </div>
      </div>

    </div>

    <!-- Product List -->
    <div class="rounded-2xl border border-hairline bg-white shadow-sm overflow-hidden">

      <div class="flex flex-col gap-4 border-b border-hairline p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 class="text-lg font-bold text-gray-900">
            Product List
          </h2>

          <p class="mt-1 text-sm text-gray-500">
            View and manage your kiosk products.
          </p>
        </div>

        <div class="relative w-full sm:w-72">
          <i class="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>

          <input
            type="text"
            placeholder="Search products..."
            class="w-full rounded-xl border border-hairline bg-gray-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
          />
        </div>
      </div>

      <!-- Product List Content -->
      <div id="product-list">

        ${
          products.length === 0
            ? `
              <div class="flex min-h-[320px] flex-col items-center justify-center px-6 text-center">

                <div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-100 text-primary-700">
                  <i class="fa-solid fa-box-open text-2xl"></i>
                </div>

                <h3 class="mt-5 text-lg font-semibold text-gray-900">
                  No products yet
                </h3>

                <p class="mt-2 max-w-md text-sm text-gray-500">
                  You haven't added any products yet. Add your first product to start managing your kiosk menu.
                </p>

                <button
                  id="empty-add-product-btn"
                  class="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-700"
                >
                  <i class="fa-solid fa-plus"></i>
                  Add Product
                </button>

              </div>
            `
            : `
              <div class="divide-y divide-gray-100">
               ${products.map((product, index) => `
  <div class="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">

    <div class="flex items-center gap-4">
      <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-primary-700">
        <i class="fa-solid fa-box"></i>
      </div>

      <div>
        <h3 class="font-semibold text-gray-900">
          ${product.name}
        </h3>

        <p class="mt-1 text-sm text-gray-500">
          ${product.category || "No category"}
        </p>
      </div>
    </div>

    <div class="flex items-center justify-between gap-5 sm:justify-end">

      <p class="font-semibold text-gray-900">
        ₱${Number(product.price).toFixed(2)}
      </p>

      <div class="flex items-center gap-2">

        <button
          type="button"
          data-edit-product="${index}"
          class="flex h-9 w-9 items-center justify-center rounded-lg text-primary-500 transition hover:bg-primary-50 hover:text-primary-700"
          title="Edit product"
        >
          <i class="fa-solid fa-pen"></i>
        </button>

        <button
          type="button"
          data-delete-product="${index}"
          class="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition hover:bg-red-50 hover:text-red-600"
          title="Delete product"
        >
          <i class="fa-solid fa-trash"></i>
        </button>

      </div>

    </div>

  </div>
`).join("")}
              </div>
            `
        }

      </div>
    </div>

    <!-- Add Product Modal -->
    <div
      id="add-product-modal"
      class="fixed inset-0 z-[100] hidden items-center justify-center bg-black/40 p-4"
    >
      <div class="w-full max-w-lg rounded-2xl bg-white shadow-xl">

        <!-- Modal Header -->
        <div class="flex items-center justify-between border-b border-hairline px-6 py-5">
          <div>
            <h2 class="text-xl font-bold text-gray-900">
              Add Product
            </h2>

            <p class="mt-1 text-sm text-gray-500">
              Add a new product to your kiosk.
            </p>
          </div>

          <button
            id="close-product-modal"
            type="button"
            class="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
          >
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <!-- Form -->
        <form id="add-product-form" class="space-y-5 p-6">

          <div>
            <label
              for="product-name"
              class="mb-2 block text-sm font-semibold text-gray-700"
            >
              Product Name
            </label>

            <input
              id="product-name"
              type="text"
              placeholder="Enter product name"
              class="w-full rounded-xl border border-hairline bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
            />
          </div>

          <div>
            <label
              for="product-price"
              class="mb-2 block text-sm font-semibold text-gray-700"
            >
              Price
            </label>

            <div class="relative">
              <span class="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                ₱
              </span>

              <input
                id="product-price"
                type="number"
                min="0"
                placeholder="0.00"
                class="w-full rounded-xl border border-hairline bg-gray-50 py-3 pl-9 pr-4 text-sm outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
              />
            </div>
          </div>

          <div>
            <label
              for="product-category"
              class="mb-2 block text-sm font-semibold text-gray-700"
            >
              Category
            </label>

         <select
  id="product-category"
  class="w-full rounded-xl border border-hairline bg-gray-50 px-4 py-3 text-sm text-gray-500 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
>
  <option value="">Select category</option>

  ${categories.map((category) => `
    <option value="${category.name}">
      ${category.name}
    </option>
  `).join("")}
</select>
          </div>

          <div class="flex justify-end gap-3 border-t border-hairline pt-5">

            <button
              type="button"
              id="cancel-product-modal"
              class="rounded-xl border border-hairline px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              class="rounded-xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-700"
            >
              Add Product
            </button>

          </div>

        </form>
      </div>
    </div>
  `;
}