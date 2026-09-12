

export let categories = [];

export function renderCategories() {
  return `
    <!-- Categories Header -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
      <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">
          Categories
        </h1>

        <p class="mt-1 text-sm text-gray-500">
          Organize your kiosk products into categories.
        </p>
      </div>

      <button
        id="add-category-btn"
        class="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700"
      >
        <i class="fa-solid fa-plus"></i>
        Add Category
      </button>
    </div>

    <!-- Category Stats -->
    <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-8">

      <!-- Total Categories -->
      <div class="rounded-2xl border border-hairline bg-white p-5 shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-500">
              Total Categories
            </p>

            <p class="mt-2 text-2xl font-bold text-gray-900">
              ${categories.length}
            </p>
          </div>

          <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-100 text-primary-700">
            <i class="fa-solid fa-layer-group"></i>
          </div>
        </div>
      </div>

      <!-- Categories With Products -->
      <div class="rounded-2xl border border-hairline bg-white p-5 shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-500">
              Categories With Products
            </p>

            <p class="mt-2 text-2xl font-bold text-gray-900">
              0
            </p>
          </div>

          <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 text-green-600">
            <i class="fa-solid fa-box"></i>
          </div>
        </div>
      </div>

      <!-- Empty Categories -->
      <div class="rounded-2xl border border-hairline bg-white p-5 shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-500">
              Empty Categories
            </p>

            <p class="mt-2 text-2xl font-bold text-gray-900">
              ${categories.length}
            </p>
          </div>

          <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-100 text-primary-700">
            <i class="fa-solid fa-folder-open"></i>
          </div>
        </div>
      </div>

    </div>

    <!-- Categories List -->
    <div class="rounded-2xl border border-hairline bg-white shadow-sm overflow-hidden">

      <!-- List Header -->
      <div class="flex flex-col gap-4 border-b border-hairline p-5 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <h2 class="text-lg font-bold text-gray-900">
            Category List
          </h2>

          <p class="mt-1 text-sm text-gray-500">
            Manage the categories used by your products.
          </p>
        </div>

        <div class="relative w-full sm:w-72">
          <i class="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>

          <input
            type="text"
            placeholder="Search categories..."
            class="w-full rounded-xl border border-hairline bg-gray-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
          />
        </div>

      </div>

      <!-- Category Content -->
      <div id="category-list">

        ${
          categories.length === 0
            ? `
              <div class="flex min-h-[320px] flex-col items-center justify-center px-6 text-center">

                <div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-100 text-primary-700">
                  <i class="fa-solid fa-layer-group text-2xl"></i>
                </div>

                <h3 class="mt-5 text-lg font-semibold text-gray-900">
                  No categories yet
                </h3>

                <p class="mt-2 max-w-md text-sm text-gray-500">
                  Create your first category to start organizing your kiosk products.
                </p>

                <button
                  id="empty-add-category-btn"
                  class="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-700"
                >
                  <i class="fa-solid fa-plus"></i>
                  Add Category
                </button>

              </div>
            `
            : `
              <div class="divide-y divide-gray-100">
                ${categories.map((category) => `
                  <div class="flex items-center justify-between gap-4 p-5">

                    <div class="flex items-center gap-4">
                      <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-100 text-primary-700">
                        <i class="fa-solid fa-layer-group"></i>
                      </div>

                      <div>
                        <h3 class="font-semibold text-gray-900">
                          ${category.name}
                        </h3>

                        <p class="mt-1 text-sm text-gray-500">
                          0 products
                        </p>
                      </div>
                    </div>

                    <button
                      class="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                      title="Delete category"
                    >
                      <i class="fa-solid fa-trash"></i>
                    </button>

                  </div>
                `).join("")}
              </div>
            `
        }

      </div>
    </div>

    <!-- Add Category Modal -->
    <div
      id="add-category-modal"
      class="fixed inset-0 z-[100] hidden items-center justify-center bg-black/40 p-4"
    >
      <div class="w-full max-w-md rounded-2xl bg-white shadow-xl">

        <!-- Modal Header -->
        <div class="flex items-center justify-between border-b border-hairline px-6 py-5">

          <div>
            <h2 class="text-xl font-bold text-gray-900">
              Add Category
            </h2>

            <p class="mt-1 text-sm text-gray-500">
              Create a category for your products.
            </p>
          </div>

          <button
            id="close-category-modal"
            type="button"
            class="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
          >
            <i class="fa-solid fa-xmark"></i>
          </button>

        </div>

        <!-- Form -->
        <form id="add-category-form" class="space-y-5 p-6">

          <div>
            <label
              for="category-name"
              class="mb-2 block text-sm font-semibold text-gray-700"
            >
              Category Name
            </label>

            <input
              id="category-name"
              type="text"
              placeholder="e.g. Drinks"
              class="w-full rounded-xl border border-hairline bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
            />
          </div>

          <div class="flex justify-end gap-3 border-t border-hairline pt-5">

            <button
              type="button"
              id="cancel-category-modal"
              class="rounded-xl border border-hairline px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              class="rounded-xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-700"
            >
              Add Category
            </button>

          </div>

        </form>

      </div>
    </div>
  `;
}