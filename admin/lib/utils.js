
export const esc = (v) =>
  String(v ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));

export const peso = (n) =>
  "₱" + Number(n || 0).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export function formatDate(value) {
  if (!value) return "—";
  const d = new Date(String(value).replace(" ", "T"));
  return isNaN(d) ? "—" : d.toLocaleString("en-PH", {
    month: "short", day: "numeric", year: "numeric",
    hour: "numeric", minute: "2-digit",
  });
}

//page error handling
export function pbError(err) {
  if (err?.isAbort) return "The request was cancelled. Please try again.";
  if (err?.status === 0) return "Cannot reach the server. Check your connection.";
  if (err?.status === 401 || err?.status === 403) {
    return "You don't have permission to do that.";
  }
  const fieldMsgs = err?.response?.data
    ? Object.values(err.response.data).map((v) => v?.message).filter(Boolean)
    : [];
  return fieldMsgs[0] || err?.response?.message || err?.message || "Something went wrong.";
}

export function toast(message, type = "success") {
  const colors = { success: "bg-green-600", error: "bg-red-600", info: "bg-gray-800" };
  const el = document.createElement("div");
  el.className =
    `fixed bottom-5 right-5 z-[200] max-w-sm rounded-xl px-4 py-3 text-sm font-medium text-white shadow-lg ${colors[type] || colors.info}`;
  el.textContent = message;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 4500);
}

export const loadingHtml = (label) => `
  <div class="flex min-h-[320px] items-center justify-center text-sm text-gray-500">
    <i class="fa-solid fa-spinner fa-spin mr-2"></i> Loading ${esc(label)}...
  </div>`;

export const errorHtml = (err) => `
  <div class="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-hairline bg-white px-6 text-center">
    <div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 text-red-600">
      <i class="fa-solid fa-triangle-exclamation text-2xl"></i>
    </div>
    <h3 class="mt-5 text-lg font-semibold text-gray-900">Couldn't load data</h3>
    <p class="mt-2 max-w-md text-sm text-gray-500">${esc(pbError(err))}</p>
    <button id="retry-load" type="button"
      class="mt-5 rounded-xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-700">
      Try again
    </button>
  </div>`;