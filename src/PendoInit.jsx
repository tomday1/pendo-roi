// src/components/PendoInit.jsx
import { useEffect } from "react";

// helper to generate a random GUID
function generateGUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export default function PendoInit() {
  useEffect(() => {
    const visitorId = generateGUID();

    (function (apiKey) {
      (function (p, e, n, d, o) {
        var v, w, x, y, z;
        o = p[d] = p[d] || {};
        o._q = o._q || [];
        v = ["initialize", "identify", "updateOptions", "pageLoad", "track"];
        for (w = 0, x = v.length; w < x; ++w)
          (function (m) {
            o[m] =
              o[m] ||
              function () {
                o._q[m === v[0] ? "unshift" : "push"]([
                  m,
                  ...Array.prototype.slice.call(arguments, 0),
                ]);
              };
          })(v[w]);
        y = e.createElement(n);
        y.async = !0;
        y.src = "https://cdn.pendo.io/agent/static/" + apiKey + "/pendo.js";
        z = e.getElementsByTagName(n)[0];
        z.parentNode.insertBefore(y, z);
      })(window, document, "script", "pendo");

      window.pendo.initialize({
        visitor: {
          id: visitorId, // 👈 random GUID for each refresh
        },
        account: {
          id: "demo-account", // you can hardcode or generate this too
        },
      });
    })("23446339-1e69-4a79-a236-a6569c099656"); // 👈 your API key
  }, []);

  return null; // doesn’t render UI
}
