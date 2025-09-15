// app/_hotjar.js
export function initHotjar(siteId) {
  if (typeof window === "undefined") return;
  if (window.__hotjarLoaded) return;

  const id = Number(siteId || process.env.NEXT_PUBLIC_HOTJAR_ID || 6508289);
  if (!id) return;

  (function (h, o, t, j, a, r) {
    h.hj =
      h.hj ||
      function () {
        (h.hj.q = h.hj.q || []).push(arguments);
      };
    h._hjSettings = { hjid: id, hjsv: 6 };
    a = o.getElementsByTagName("head")[0];
    r = o.createElement("script");
    r.async = 1;
    r.src = t + h._hjSettings.hjid + j + h._hjSettings.hjsv;
    a.appendChild(r);
  })(window, document, "https://static.hotjar.com/c/hotjar-", ".js?sv=");

  window.__hotjarLoaded = true;
}

export function hjStateChange(url) {
  if (typeof window !== "undefined" && typeof window.hj === "function") {
    window.hj("stateChange", url);
  }
}
