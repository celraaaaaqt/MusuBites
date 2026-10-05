import { pb } from "/admin/lib/pb.js";
    import { esc, peso, formatDate, toast, pbError, loadingHtml, errorHtml } from "/admin/lib/utils.js";

    //values in my pocketbase collections
    const PAID = "Paid";
    const PENDING = "Pending";
    const COMPLETED = "Complete"; //payment.status option meaning the order is completed
    const CANCELLED = "Cancelled";
    const CASH = "Cash"; //payment.payment_method option for cash
    //number fields on the payment collection 
    const CASH_RECEIVED_FIELD = "cash_received";
    const CHANGE_FIELD = "change";
    // -------------------------------------------------------------------------------

    const EXPAND = "cart_items.product,customer_info_via_orders";

    export let orders = [];
    let payments = new Map(); // order id -> payment record
    let filter = "all"; // all | pending | completed
    let search = "";
    let selectedId = null;
    let processing = false;
    let active = false;
    let root = null;
    let unsubscribe = null;
    let refreshTimer = null;

    const isPayable = (o) => !o.payment_status || o.payment_status === PENDING;
    // "Order status" = the status field on the linked payment record.
    const orderStatus = (o) =>
    payments.get(o.id)?.status || (o.payment_status === CANCELLED ? CANCELLED : PENDING);
    const customerOf = (o) => [].concat(o.expand?.customer_info_via_orders ?? [])[0] || null;
    const itemsOf = (o) => [].concat(o.expand?.cart_items ?? []);

    /* ------------------------------ data ------------------------------ */

    async function loadOrders() {
    orders = await pb.collection("orders").getFullList({
        sort: "-created",
        expand: EXPAND,
        requestKey: null,
    });

    try {
        const list = await pb.collection("payment").getFullList({ sort: "-created", requestKey: null });
        const map = new Map();
        list.forEach((p) => { if (!map.has(p.order)) map.set(p.order, p); });
        payments = map;
    } catch {
        payments = new Map(); // payment details are optional for display
    }
    }

    async function savePayment(order, cash) {
    let record = null;
    try {
        record = await pb.collection("payment").getFirstListItem(
        pb.filter("order = {:id}", { id: order.id }),
        { requestKey: null }
        );
    } catch (err) {
        if (err.status !== 404) throw err;
    }

    if (record) {
        return pb.collection("payment").update(
        record.id,
        {
            status: COMPLETED,
            payment_method: CASH,
            [CASH_RECEIVED_FIELD]: cash.received,
            [CHANGE_FIELD]: cash.change,
        },
        { requestKey: null }
        );
    }
    return pb.collection("payment").create(
        {
        order: order.id,
        amount: order.total,
        payment_method: CASH,
        status: COMPLETED,
        [CASH_RECEIVED_FIELD]: cash.received,
        [CHANGE_FIELD]: cash.change,
        },
        { requestKey: null }
    );
    }

    // 1) orders.payment_status -> Paid, 2) payment.status -> Completed.
    // If step 2 fails, step 1 is rolled back so the order never shows Paid
    // without being Completed.
    async function markPaid(order, cash) {
    const fresh = await pb.collection("orders").getOne(order.id, { requestKey: null });
    if (fresh.payment_status === PAID) throw new Error("This order has already been paid.");
    if (!isPayable(fresh)) throw new Error(`This order is ${fresh.payment_status} and cannot be paid.`);

    const previous = { payment_status: fresh.payment_status };

    await pb.collection("orders").update(
        order.id,
        { payment_status: PAID },
        { requestKey: null }
    );

    try {
        await savePayment(fresh, cash);
    } catch (err) {
        try {
        await pb.collection("orders").update(order.id, previous, { requestKey: null });
        } catch {
        throw new Error("The payment record failed and the order could not be rolled back. Refresh and check this order.");
        }
        throw err;
    }
    }

    /* ------------------------------ render ------------------------------ */

    const badge = (text, tone) =>
    `<span class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${tone}">${esc(text)}</span>`;
    const payBadge = (s) =>
    badge(s || PENDING, s === PAID ? "bg-green-100 text-green-700"
        : s === CANCELLED ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700");
    const statusBadge = (s) =>
    badge(s, s === COMPLETED ? "bg-green-100 text-green-700"
        : s === CANCELLED ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-600");

    function visibleOrders() {
    const q = search.trim().toLowerCase();
    return orders.filter((o) => {
        if (filter === "pending" && !isPayable(o)) return false;
        if (filter === "completed" && orderStatus(o) !== COMPLETED) return false;
        if (!q) return true;
        return [o.order_number, customerOf(o)?.customer_name]
        .some((v) => String(v ?? "").toLowerCase().includes(q));
    });
    }

    function rowsHtml() {
    const list = visibleOrders();
    if (!list.length) {
        return `
        <div class="flex min-h-[320px] flex-col items-center justify-center px-6 text-center">
            <div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-100 text-primary-700">
            <i class="fa-solid fa-receipt text-2xl"></i>
            </div>
            <h3 class="mt-5 text-lg font-semibold text-gray-900">No orders found</h3>
            <p class="mt-2 max-w-md text-sm text-gray-500">Orders from the kiosk will appear here.</p>
        </div>`;
    }

    return `<div class="divide-y divide-gray-100">${list.map((o) => {
        const c = customerOf(o);
        return `
        <button type="button" data-view-order="${o.id}"
            class="flex w-full flex-col gap-3 p-5 text-left transition hover:bg-gray-50 sm:flex-row sm:items-center sm:justify-between">
            <div class="flex items-center gap-4">
            <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-primary-700">
                <i class="fa-solid fa-receipt"></i>
            </div>
            <div>
                <h3 class="font-semibold text-gray-900">Order #${esc(o.order_number)}</h3>
                <p class="mt-1 text-sm text-gray-500">${esc(c?.customer_name || "Walk-in customer")} · ${esc(formatDate(o.created))}</p>
            </div>
            </div>
            <div class="flex flex-wrap items-center gap-3 sm:justify-end">
            <p class="font-semibold text-gray-900">${peso(o.total)}</p>
            ${payBadge(o.payment_status)}
            ${statusBadge(orderStatus(o))}
            </div>
        </button>`;
    }).join("")}</div>`;
    }

    function detailHtml(o) {
    const c = customerOf(o);
    const unpaid = isPayable(o);
    const items = itemsOf(o);
    const pay = payments.get(o.id);

    // Amount paid / change shown once the order is Paid.
    //  Cash     -> what staff entered when confirming (cash_received / change)
    //  E-wallet -> exact total was paid via QR, so change is 0
    const isPaid = o.payment_status === PAID;
    const isCashPay = pay?.payment_method === CASH;
    const orderTotal = Number(o.total || 0);
    const amountPaid = isCashPay
        ? Number(pay?.[CASH_RECEIVED_FIELD]) || orderTotal
        : Number(pay?.amount) || orderTotal;
    const changeGiven = isCashPay
        ? Number(pay?.[CHANGE_FIELD]) || Math.max(0, amountPaid - orderTotal)
        : 0;

    return `
        <div class="space-y-5 p-6">
        <div class="flex flex-wrap items-center gap-2">
            ${payBadge(o.payment_status)} ${statusBadge(orderStatus(o))}
            <span class="text-sm text-gray-500">${esc(formatDate(o.created))}</span>
        </div>

        <div class="rounded-xl bg-gray-50 p-4 text-sm">
            <p class="font-semibold text-gray-900">${esc(c?.customer_name || "Walk-in customer")}</p>
            ${c?.customer_contact ? `<p class="mt-1 text-gray-500">${esc(c.customer_contact)}</p>` : ""}
            ${c?.customer_gmail ? `<p class="text-gray-500">${esc(c.customer_gmail)}</p>` : ""}
        </div>

        <div>
            <h3 class="mb-2 text-sm font-semibold text-gray-700">Items</h3>
            <div class="divide-y divide-gray-100 rounded-xl border border-hairline">
            ${items.length ? items.map((i) => `
                <div class="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                <div>
                    <p class="font-medium text-gray-900">${esc(i.expand?.product?.product_name || "Unknown product")}</p>
                    <p class="text-gray-500">${esc(i.quantity)} × ${peso(i.price)}</p>
                </div>
                <p class="font-semibold text-gray-900">${peso(i.subtotal)}</p>
                </div>`).join("")
                : `<p class="px-4 py-3 text-sm text-gray-500">No item details available.</p>`}
            </div>
        </div>

        <div class="flex items-center justify-between border-t border-hairline pt-4">
            <span class="text-sm font-medium text-gray-500">Total</span>
            <span class="text-xl font-bold text-gray-900">${peso(o.total)}</span>
        </div>

        ${isPaid ? `
            <div class="space-y-2">
            <div class="flex items-center justify-between text-sm">
                <span class="font-medium text-gray-500">Amount paid</span>
                <span class="font-semibold text-gray-900">${peso(amountPaid)}</span>
            </div>
            <div class="flex items-center justify-between text-sm">
                <span class="font-medium text-gray-500">Change</span>
                <span class="font-semibold text-gray-900">${peso(changeGiven)}</span>
            </div>
            </div>` : ""}

        ${unpaid ? `
            <div>
            <label for="cash-received" class="mb-2 block text-sm font-semibold text-gray-700">Cash received</label>
            <div class="relative">
                <span class="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-500">₱</span>
                <input id="cash-received" type="number" min="0" step="0.01" placeholder="${Number(o.total || 0).toFixed(2)}"
                class="w-full rounded-xl border border-hairline bg-gray-50 py-3 pl-9 pr-4 text-sm outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100" />
            </div>
            <p class="mt-2 text-sm text-gray-500">Change: <span id="cash-change" class="font-semibold text-gray-900">${peso(0)}</span></p>
            </div>
            <button id="confirm-cash-btn" type="button" ${processing ? "disabled" : ""}
            class="w-full rounded-xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60">
            <i class="fa-solid fa-money-bill-wave mr-2"></i>
            ${processing ? "Processing..." : "Confirm Cash Payment"}
            </button>`
        : o.payment_status !== PAID ? `
            <div class="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            <i class="fa-solid fa-ban mr-2"></i> This order is ${esc(o.payment_status)} and cannot be paid.
            </div>`
        : `
            <div class="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">
            <i class="fa-solid fa-circle-check mr-2"></i>
            Paid${pay?.payment_method ? ` via ${esc(pay.payment_method)}` : ""} — order completed.
            </div>`}
        </div>`;
    }

    export function renderOrders() {
    const selected = orders.find((o) => o.id === selectedId);
    const tab = (key, label) => `
        <button type="button" data-order-filter="${key}"
        class="rounded-xl px-4 py-2 text-sm font-semibold transition ${
            filter === key ? "bg-primary-600 text-white" : "bg-white text-gray-600 border border-hairline hover:bg-gray-50"
        }">${label}</button>`;

    return `
        <div id="orders-page">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
            <div>
            <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">Orders</h1>
            <p class="mt-1 text-sm text-gray-500">View orders and confirm cash payments.</p>
            </div>
            <button id="refresh-orders" type="button"
            class="inline-flex items-center justify-center gap-2 rounded-xl border border-hairline bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50">
            <i class="fa-solid fa-rotate"></i> Refresh
            </button>
        </div>

        <div class="rounded-2xl border border-hairline bg-white shadow-sm overflow-hidden">
            <div class="flex flex-col gap-4 border-b border-hairline p-5 lg:flex-row lg:items-center lg:justify-between">
            <div class="flex flex-wrap gap-2">
                ${tab("all", "All")}${tab("pending", "Pending payment")}${tab("completed", "Completed")}
            </div>
            <div class="relative w-full lg:w-72">
                <i class="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                <input id="order-search" type="text" value="${esc(search)}" placeholder="Search order # or customer..."
                class="w-full rounded-xl border border-hairline bg-gray-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100" />
            </div>
            </div>
            <div id="order-list">${rowsHtml()}</div>
        </div>

        <div id="order-modal" class="fixed inset-0 z-[100] ${selected ? "flex" : "hidden"} items-center justify-center bg-black/40 p-4">
            <div class="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-xl">
            <div class="flex items-center justify-between border-b border-hairline px-6 py-5">
                <div>
                <h2 class="text-xl font-bold text-gray-900">Order #${esc(selected?.order_number)}</h2>
                <p class="mt-1 text-sm text-gray-500">Order details and payment.</p>
                </div>
                <button type="button" data-close-order-modal
                class="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-700">
                <i class="fa-solid fa-xmark"></i>
                </button>
            </div>
            ${selected ? detailHtml(selected) : ""}
            </div>
        </div>
        </div>`;
    }

    /* ------------------------------ behaviour ------------------------------ */

    function paint() {
    if (!active || !root) return;
    root.innerHTML = renderOrders();
    }

    async function refreshSilently() {
    try {
        await loadOrders();
        window.dispatchEvent(new Event("orders-changed")); // updates the sidebar badge
    } catch (err) { console.warn("Order refresh failed:", err); }
    }

    async function confirmCash() {
    if (processing) return;
    const order = orders.find((o) => o.id === selectedId);
    if (!order) return;

    const received = Number(root.querySelector("#cash-received")?.value);
    if (!Number.isFinite(received) || received < Number(order.total)) {
        toast(`Enter the cash received (at least ${peso(order.total)}).`, "error");
        return;
    }
    const change = received - Number(order.total);
    const ok = window.confirm(
        `Order #${order.order_number}\nTotal: ${peso(order.total)}\nCash received: ${peso(received)}\nChange: ${peso(change)}\n\nConfirm payment?`
    );
    if (!ok) return;

    processing = true;
    paint();

    try {
        await markPaid(order, { received, change });
        toast(`Order #${order.order_number} marked as Paid and Completed.`);
    } catch (err) {
        toast(pbError(err), "error");
    } finally {
        processing = false;
    }

    // Always re-read from PocketBase so the UI shows what is really saved.
    await refreshSilently();
    paint();
    }

    function onClick(e) {
    const t = e.target;
    if (t.closest("#retry-load")) return mountOrders(root);

    const view = t.closest("[data-view-order]");
    if (view) { selectedId = view.dataset.viewOrder; return paint(); }

    const tab = t.closest("[data-order-filter]");
    if (tab) { filter = tab.dataset.orderFilter; return paint(); }

    if (t.closest("#refresh-orders")) {
        return refreshSilently().then(() => { paint(); toast("Orders refreshed.", "info"); });
    }
    if (t.closest("[data-close-order-modal]") || t.id === "order-modal") {
        if (processing) return;
        selectedId = null;
        return paint();
    }
    if (t.closest("#confirm-cash-btn")) return confirmCash();
    }

    function onInput(e) {
    if (e.target.id === "cash-received") {
        const order = orders.find((o) => o.id === selectedId);
        const change = Number(e.target.value) - Number(order?.total || 0);
        root.querySelector("#cash-change").textContent = peso(Math.max(change, 0));
        return;
    }
    if (e.target.id !== "order-search") return;
    search = e.target.value;
    root.querySelector("#order-list").innerHTML = rowsHtml();
    }

    async function dropRealtime() {
    clearTimeout(refreshTimer);
    if (unsubscribe) {
        try { await unsubscribe(); } catch { /* ignore */ }
        unsubscribe = null;
    }
    }

    async function startRealtime() {
    await dropRealtime();
    try {
        unsubscribe = await pb.collection("orders").subscribe("*", () => {
        clearTimeout(refreshTimer);
        refreshTimer = setTimeout(async () => {
            if (!active || processing) return;
            await refreshSilently();
            paint();
        }, 400);
        });
    } catch (err) {
        console.warn("Realtime unavailable; use the Refresh button.", err);
    }
    }

    export async function stopOrdersRealtime() {
    active = false;
    await dropRealtime();
    }

    export async function mountOrders(container) {
    root = container;
    active = true;
    selectedId = null;
    container.onclick = onClick;
    container.oninput = onInput;
    container.onsubmit = null;

    container.innerHTML = loadingHtml("orders");
    try {
        await loadOrders();
    } catch (err) {
        if (active) container.innerHTML = errorHtml(err);
        return;
    }
    if (!active) return;
    paint();
    startRealtime();
    }