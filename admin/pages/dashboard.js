import { pb } from "/admin/lib/pb.js";
import { esc, peso, formatDate, loadingHtml, errorHtml } from "/admin/lib/utils.js";

const PAID = "Paid";
const PENDING = "Pending";
const CANCELLED = "Cancelled";

let data = null; //recent, orders, pendingCount, productCount
let range = "week"; //week | month | year
let root = null;


//helpers
const parse = (v) => new Date(String(v).replace(" ", "T"));
const pad = (n) => String(n).padStart(2, "0");
const dayKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

function startOfWeek(now) {
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); //monday
  return d;
}

//datas
async function load() {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const weekStart = startOfWeek(now);
  const from = weekStart < startOfYear ? weekStart : startOfYear;

  const [recent, orders, pending, prods] = await Promise.all([
    pb.collection("orders").getList(1, 5, {
      sort: "-created",
      expand: "customer_info_via_orders",
      requestKey: null,
    }),
    pb.collection("orders").getFullList({
      filter: pb.filter("created >= {:from}", { from }),
      fields: "id,total,payment_status,created",
      requestKey: null,
    }),
    pb.collection("orders").getList(1, 1, {
      filter: pb.filter("payment_status = {:s}", { s: PENDING }),
      fields: "id",
      requestKey: null,
    }),
    pb.collection("products").getList(1, 1, { fields: "id", requestKey: null }),
  ]);

  data = {
    recent: recent.items,
    orders,
    pendingCount: pending.totalItems,
    productCount: prods.totalItems,
  };
}

function series() {
  const now = new Date();
  const sums = new Map();

  data.orders
    .filter((o) => o.payment_status === PAID)
    .forEach((o) => {
      const d = parse(o.created);
      const k = range === "year" ? `${d.getFullYear()}-${d.getMonth()}` : dayKey(d);
      sums.set(k, (sums.get(k) || 0) + Number(o.total || 0));
    });

  const points = [];
  if (range === "week") {
    const start = startOfWeek(now);
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      points.push({ label: d.toLocaleDateString("en-PH", { weekday: "short" }), value: sums.get(dayKey(d)) || 0 });
    }
  } else if (range === "month") {
    const days = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    for (let i = 1; i <= days; i++) {
      const d = new Date(now.getFullYear(), now.getMonth(), i);
      points.push({ label: String(i), value: sums.get(dayKey(d)) || 0 });
    }
  } else {
    for (let m = 0; m < 12; m++) {
      const d = new Date(now.getFullYear(), m, 1);
      points.push({
        label: d.toLocaleDateString("en-PH", { month: "short" }),
        value: sums.get(`${now.getFullYear()}-${m}`) || 0,
      });
    }
  }
  return points;
}

//renderer
const emptyChart = `
  <div class="h-64 flex flex-col items-center justify-center border border-dashed border-gray-200 rounded-xl">
    <div class="w-12 h-12 rounded-xl bg-primary-50 text-primary-500 flex items-center justify-center text-xl mb-3">◫</div>
    <p class="text-sm font-medium text-gray-700">No sales data yet</p>
    <p class="text-xs text-gray-400 mt-1 text-center px-4">Sales data will appear here once orders are completed.</p>
  </div>`;

const compactPeso = (v) =>
  "₱" + Number(v).toLocaleString("en-PH", { maximumFractionDigits: v < 100 ? 2 : 0 });

function chartHtml() {
  const pts = series();
  const max = Math.max(...pts.map((p) => p.value));
  if (max <= 0) return emptyChart;

  const total = pts.reduce((sum, p) => sum + p.value, 0);
  const showValues = pts.length <= 12; //month view has too many bars; use tooltips

  return `
    <p class="mb-4 text-sm text-gray-500">Total: <span class="font-semibold text-gray-900">${peso(total)}</span></p>
    <div class="h-64 flex items-end gap-1 sm:gap-2">
      ${pts.map((p) => `
        <div class="flex h-full min-w-0 flex-1 flex-col items-center justify-end" title="${esc(p.label)}: ${peso(p.value)}">
          ${showValues && p.value > 0 ? `<span class="mb-1 w-full truncate text-center text-[10px] font-semibold text-gray-700 sm:text-xs">${compactPeso(p.value)}</span>` : ""}
          <div class="w-full rounded-t-lg bg-primary-500" style="height:${p.value > 0 ? Math.max((p.value / max) * 75, 2) : 0}%"></div>
          <span class="mt-2 w-full truncate text-center text-[10px] text-gray-400 sm:text-xs">${esc(p.label)}</span>
        </div>`).join("")}
    </div>`;
}

const stat = (label, value, icon) => `
  <article class="bg-white border border-hairline rounded-2xl p-5">
    <div class="flex items-center justify-between">
      <div>
        <p class="text-sm text-gray-500">${label}</p>
        <h3 class="text-2xl font-bold mt-2">${value}</h3>
      </div>
      <div class="w-11 h-11 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center font-semibold">${icon}</div>
    </div>
  </article>`;

const badge = (text, tone) =>
  `<span class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${tone}">${esc(text)}</span>`;
const payBadge = (s) =>
  badge(s || PENDING, s === PAID ? "bg-green-100 text-green-700"
    : s === CANCELLED ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700");

function recentHtml() {
  if (!data.recent.length) {
    return `
      <div class="py-16 px-6 text-center">
        <div class="mx-auto w-12 h-12 rounded-xl bg-primary-50 text-primary-500 flex items-center justify-center text-xl mb-3">▤</div>
        <p class="text-sm font-medium text-gray-700">No orders yet</p>
        <p class="text-xs text-gray-400 mt-1">Orders from the MusuGo app will appear here.</p>
      </div>`;
  }
  return `<div class="divide-y divide-gray-100">${data.recent.map((o) => {
    const c = [].concat(o.expand?.customer_info_via_orders ?? [])[0];
    return `
      <div class="flex flex-col gap-2 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p class="font-semibold text-gray-900">Order #${esc(o.order_number)}</p>
          <p class="mt-1 text-sm text-gray-500">${esc(c?.customer_name || "Walk-in customer")} · ${esc(formatDate(o.created))}</p>
        </div>
        <div class="flex items-center gap-3">
          <p class="font-semibold text-gray-900">${peso(o.total)}</p>
          ${payBadge(o.payment_status)}
        </div>
      </div>`;
  }).join("")}</div>`;
}

export function renderDashboard() {
  const todayKey = dayKey(new Date());
  const today = data.orders.filter((o) => dayKey(parse(o.created)) === todayKey);
  const todaySales = today
    .filter((o) => o.payment_status === PAID)
    .reduce((sum, o) => sum + Number(o.total || 0), 0);
  const ordersToday = today.filter((o) => o.payment_status !== CANCELLED).length;
  const opt = (v, l) => `<option value="${v}" ${range === v ? "selected" : ""}>${l}</option>`;

  return `
    <div class="mb-8">
      <p class="text-sm text-gray-400 mb-1">Overview</p>
      <h2 class="text-2xl sm:text-3xl font-bold">Dashboard</h2>
    </div>

    <section class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
      ${stat("Today's Sales", peso(todaySales), "₱")}
      ${stat("Orders Today", ordersToday, "#")}
      ${stat("Pending Orders", data.pendingCount, "!")}
      ${stat("Products", data.productCount, "▦")}
    </section>

    <section class="mb-8">
      <article class="bg-white border border-hairline rounded-2xl p-6">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h3 class="font-semibold">Sales Overview</h3>
            <p class="text-xs text-gray-400 mt-1">Paid sales for MusuGo.</p>
          </div>
          <select id="sales-range" class="text-xs border border-gray-200 rounded-lg px-3 py-2 outline-none bg-white focus:border-primary-500">
            ${opt("week", "This Week")}${opt("month", "This Month")}${opt("year", "This Year")}
          </select>
        </div>
        <div id="sales-chart">${chartHtml()}</div>
      </article>
    </section>

    <section class="bg-white border border-hairline rounded-2xl overflow-hidden">
      <div class="p-6 flex items-center justify-between border-b border-hairline">
        <div>
          <h3 class="font-semibold">Recent Orders</h3>
          <p class="text-xs text-gray-400 mt-1">Latest orders from the MusuGo app.</p>
        </div>
        <a href="#orders" class="text-sm font-medium text-primary-600 hover:text-primary-700">View all</a>
      </div>
      ${recentHtml()}
    </section>`;
}

export async function mountDashboard(container) {
  root = container;
  container.onclick = (e) => { if (e.target.closest("#retry-load")) mountDashboard(root); };
  container.oninput = null;
  container.onsubmit = null;
  container.onchange = (e) => {
    if (e.target.id !== "sales-range") return;
    range = e.target.value;
    root.querySelector("#sales-chart").innerHTML = chartHtml();
  };

  container.innerHTML = loadingHtml("dashboard");
  try {
    await load();
  } catch (err) {
    container.innerHTML = errorHtml(err);
    return;
  }
  container.innerHTML = renderDashboard();

  const ordersBadge = document.getElementById("orders-badge"); // optional sidebar badge
  if (ordersBadge) ordersBadge.textContent = String(data.pendingCount);
}