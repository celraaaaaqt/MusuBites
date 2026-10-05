import { pb } from "/admin/lib/pb.js";
import { esc, formatDate, toast, loadingHtml, errorHtml } from "/admin/lib/utils.js";

// Customer ratings submitted from the order-status page (customer_ratings collection).
// `rating` is a select field, so PocketBase returns it as a string ("1".."5").

export let ratings = [];
let filter = "all"; // all | 5 | 4 | 3 | 2 | 1
let search = "";
let root = null;

export async function loadRatings() {
  ratings = await pb.collection("customer_ratings").getFullList({
    sort: "-created",
    expand: "customer_order",
    requestKey: null,
  });
}

const starsOf = (r) => Math.min(5, Math.max(0, Number(r.rating) || 0));
const orderNumberOf = (r) => r.expand?.customer_order?.order_number || "";
const countFor = (n) => ratings.filter((r) => starsOf(r) === n).length;

function starsHtml(n, size = "text-sm") {
  return `<span class="inline-flex items-center gap-0.5 ${size}" aria-label="${n} out of 5 stars">${
    [1, 2, 3, 4, 5].map((i) =>
      `<i class="fa-solid fa-star ${i <= n ? "text-yellow-400" : "text-gray-200"}"></i>`
    ).join("")
  }</span>`;
}

function visibleRatings() {
  const q = search.trim().toLowerCase();
  return ratings.filter((r) => {
    if (filter !== "all" && starsOf(r) !== Number(filter)) return false;
    if (!q) return true;
    return [r.customer_name, orderNumberOf(r), r.feedback]
      .some((v) => String(v ?? "").toLowerCase().includes(q));
  });
}

function listHtml() {
  const list = visibleRatings();

  if (list.length === 0) {
    return `
      <div class="flex min-h-[320px] flex-col items-center justify-center px-6 text-center">
        <div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-100 text-primary-700">
          <i class="fa-solid fa-star text-2xl"></i>
        </div>
        <h3 class="mt-5 text-lg font-semibold text-gray-900">${ratings.length ? "No matching ratings" : "No ratings yet"}</h3>
        <p class="mt-2 max-w-md text-sm text-gray-500">
          ${ratings.length
            ? "Try a different filter or search."
            : "Ratings appear here after customers rate a paid order from their receipt page."}
        </p>
      </div>`;
  }

  return `
    <div class="divide-y divide-gray-100">
      ${list.map((r) => {
        const n = starsOf(r);
        const orderNo = orderNumberOf(r);
        return `
        <div class="flex flex-col gap-3 p-5">
          <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div class="flex items-center gap-4">
              <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-primary-700">
                <i class="fa-solid fa-user"></i>
              </div>
              <div>
                <h3 class="font-semibold text-gray-900">${esc(r.customer_name || "Unknown")}</h3>
                <p class="mt-1 text-sm text-gray-500">
                  ${orderNo ? `Order #${esc(orderNo)} · ` : ""}${esc(formatDate(r.created))}
                </p>
              </div>
            </div>
            <div class="flex items-center gap-2 sm:justify-end">
              ${starsHtml(n)}
              <span class="text-sm font-semibold text-gray-700">${n}/5</span>
            </div>
          </div>
          ${r.feedback
            ? `<p class="rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-700 whitespace-pre-line">${esc(r.feedback)}</p>`
            : `<p class="text-sm italic text-gray-400">No written feedback.</p>`}
        </div>`;
      }).join("")}
    </div>`;
}

export function renderRatings() {
  const total = ratings.length;
  const average = total ? ratings.reduce((sum, r) => sum + starsOf(r), 0) / total : 0;
  const withFeedback = ratings.filter((r) => String(r.feedback ?? "").trim()).length;

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

  const tab = (key, label) => `
    <button type="button" data-rating-filter="${key}"
      class="rounded-xl px-4 py-2 text-sm font-semibold transition ${
        filter === key ? "bg-primary-600 text-white" : "bg-white text-gray-600 border border-hairline hover:bg-gray-50"
      }">${label}</button>`;

  return `
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
      <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">Ratings</h1>
        <p class="mt-1 text-sm text-gray-500">What customers said about their orders.</p>
      </div>
      <button id="refresh-ratings" type="button"
        class="inline-flex items-center justify-center gap-2 rounded-xl border border-hairline bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50">
        <i class="fa-solid fa-rotate"></i> Refresh
      </button>
    </div>

    <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-8">
      ${stat("Average Rating", total ? `${average.toFixed(1)} <span class="text-base font-medium text-gray-400">/ 5</span>` : "—", "fa-star", "bg-yellow-100 text-yellow-500")}
      ${stat("Total Ratings", total, "fa-comments", "bg-primary-100 text-primary-700")}
      ${stat("With Written Feedback", withFeedback, "fa-message", "bg-green-100 text-green-600")}
    </div>

    <div class="rounded-2xl border border-hairline bg-white shadow-sm overflow-hidden">
      <div class="flex flex-col gap-4 border-b border-hairline p-5 lg:flex-row lg:items-center lg:justify-between">
        <div class="flex flex-wrap gap-2">
          ${tab("all", `All (${total})`)}
          ${[5, 4, 3, 2, 1].map((n) => tab(String(n), `${n}★ (${countFor(n)})`)).join("")}
        </div>
        <div class="relative w-full lg:w-72">
          <i class="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
          <input id="rating-search" type="text" value="${esc(search)}" placeholder="Search customer, order # or feedback..."
            class="w-full rounded-xl border border-hairline bg-gray-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100" />
        </div>
      </div>
      <div id="rating-list">${listHtml()}</div>
    </div>`;
}

/* ------------------------------ behaviour ------------------------------ */

function paint() {
  if (root) root.innerHTML = renderRatings();
}

function onClick(e) {
  const t = e.target;
  if (t.closest("#retry-load")) return mountRatings(root);

  const tab = t.closest("[data-rating-filter]");
  if (tab) { filter = tab.dataset.ratingFilter; return paint(); }

  if (t.closest("#refresh-ratings")) {
    return loadRatings()
      .then(() => { paint(); toast("Ratings refreshed.", "info"); })
      .catch((err) => toast("Could not refresh ratings: " + (err?.message || "error"), "error"));
  }
}

function onInput(e) {
  if (e.target.id !== "rating-search") return;
  search = e.target.value;
  root.querySelector("#rating-list").innerHTML = listHtml();
}

export async function mountRatings(container) {
  root = container;
  container.onclick = onClick;
  container.oninput = onInput;
  container.onsubmit = null;
  container.onchange = null;

  container.innerHTML = loadingHtml("ratings");
  try {
    await loadRatings();
  } catch (err) {
    container.innerHTML = errorHtml(err);
    return;
  }
  paint();
}