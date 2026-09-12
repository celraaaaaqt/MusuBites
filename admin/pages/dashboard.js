export function renderDashboard() {
  return `
    <div class="mb-8">

      <p class="text-sm text-gray-400 mb-1">
        Overview
      </p>

      <h2 class="text-2xl sm:text-3xl font-bold">
        Dashboard
      </h2>

      <p class="text-sm text-gray-500 mt-1">
        Overview of your kiosk.
      </p>

    </div>


    <!-- QUICK STATS -->
    <section
      class="
        grid
        grid-cols-1
        sm:grid-cols-2
        xl:grid-cols-4
        gap-4
        mb-8
      "
    >

      <!-- Today's Sales -->
      <article
        class="
          bg-white
          border border-hairline
          rounded-2xl
          p-5
        "
      >

        <div class="flex items-center justify-between">

          <div>
            <p class="text-sm text-gray-500">
              Today's Sales
            </p>

            <h3 class="text-2xl font-bold mt-2">
              ₱0
            </h3>
          </div>

          <div
            class="
              w-11 h-11
              rounded-xl
              bg-primary-100
              text-primary-600
              flex items-center justify-center
              font-semibold
            "
          >
            ₱
          </div>

        </div>

      </article>


      <!-- Orders Today -->
      <article
        class="
          bg-white
          border border-hairline
          rounded-2xl
          p-5
        "
      >

        <div class="flex items-center justify-between">

          <div>
            <p class="text-sm text-gray-500">
              Orders Today
            </p>

            <h3 class="text-2xl font-bold mt-2">
              0
            </h3>
          </div>

          <div
            class="
              w-11 h-11
              rounded-xl
              bg-primary-100
              text-primary-600
              flex items-center justify-center
              font-semibold
            "
          >
            #
          </div>

        </div>

      </article>


      <!-- Pending Orders -->
      <article
        class="
          bg-white
          border border-hairline
          rounded-2xl
          p-5
        "
      >

        <div class="flex items-center justify-between">

          <div>
            <p class="text-sm text-gray-500">
              Pending Orders
            </p>

            <h3 class="text-2xl font-bold mt-2">
              0
            </h3>
          </div>

          <div
            class="
              w-11 h-11
              rounded-xl
              bg-primary-100
              text-primary-600
              flex items-center justify-center
              font-semibold
            "
          >
            !
          </div>

        </div>

      </article>


      <!-- Products -->
      <article
        class="
          bg-white
          border border-hairline
          rounded-2xl
          p-5
        "
      >

        <div class="flex items-center justify-between">

          <div>
            <p class="text-sm text-gray-500">
              Products
            </p>

            <h3 class="text-2xl font-bold mt-2">
              0
            </h3>
          </div>

          <div
            class="
              w-11 h-11
              rounded-xl
              bg-primary-100
              text-primary-600
              flex items-center justify-center
              font-semibold
            "
          >
            ▦
          </div>

        </div>

      </article>

    </section>


    <!-- SALES OVERVIEW -->
    <section class="mb-8">

      <article
        class="
          bg-white
          border border-hairline
          rounded-2xl
          p-6
        "
      >

        <div class="flex items-center justify-between mb-6">

          <div>

            <h3 class="font-semibold">
              Sales Overview
            </h3>

            <p class="text-xs text-gray-400 mt-1">
              Track your kiosk sales performance.
            </p>

          </div>

          <select
            class="
              text-xs
              border border-gray-200
              rounded-lg
              px-3 py-2
              outline-none
              bg-white
              focus:border-primary-500
            "
          >
            <option>This Week</option>
            <option>This Month</option>
            <option>This Year</option>
          </select>

        </div>


        <div
          class="
            h-64
            flex
            flex-col
            items-center
            justify-center
            border border-dashed
            border-gray-200
            rounded-xl
          "
        >

          <div
            class="
              w-12 h-12
              rounded-xl
              bg-primary-50
              text-primary-500
              flex items-center justify-center
              text-xl
              mb-3
            "
          >
            ◫
          </div>

          <p class="text-sm font-medium text-gray-700">
            No sales data yet
          </p>

          <p class="text-xs text-gray-400 mt-1 text-center px-4">
            Sales data will appear here once orders are completed.
          </p>

        </div>

      </article>

    </section>


    <!-- RECENT ORDERS -->
    <section
      class="
        bg-white
        border border-hairline
        rounded-2xl
        overflow-hidden
      "
    >

      <div
        class="
          p-6
          flex items-center justify-between
          border-b border-hairline
        "
      >

        <div>

          <h3 class="font-semibold">
            Recent Orders
          </h3>

          <p class="text-xs text-gray-400 mt-1">
            Latest orders from the kiosk.
          </p>

        </div>

        <a
          href="#"
          class="
            text-sm
            font-medium
            text-primary-600
            hover:text-primary-700
          "
        >
          View all
        </a>

      </div>


      <div
        class="
          py-16
          px-6
          text-center
        "
      >

        <div
          class="
            mx-auto
            w-12 h-12
            rounded-xl
            bg-primary-50
            text-primary-500
            flex items-center justify-center
            text-xl
            mb-3
          "
        >
          ▤
        </div>

        <p class="text-sm font-medium text-gray-700">
          No orders yet
        </p>

        <p class="text-xs text-gray-400 mt-1">
          Orders from the kiosk will appear here.
        </p>

      </div>

    </section>
  `;
}