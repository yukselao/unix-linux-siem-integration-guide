/* ============================================================
   Unix/Linux SIEM Integration Guide — Chart.js rendering
   Charts are self-hosted (chart.umd.min.js) and drawn on both
   the English and Turkish builds. Labels are localized via the
   <html lang="..."> attribute that mkdocs-material sets per page.
   ============================================================ */
(function () {
  "use strict";

  function isTurkish() {
    var lang = (document.documentElement.getAttribute("lang") || "en").toLowerCase();
    return lang.indexOf("tr") === 0;
  }

  function buildLoginChart() {
    var el = document.getElementById("chart-logins");
    if (!el || typeof Chart === "undefined") return;

    var tr = isTurkish();
    new Chart(el, {
      type: "bar",
      data: {
        labels: ["web-01", "db-01", "mail-01", "proxy-01", "app-01"],
        datasets: [
          {
            label: tr ? "Başarılı giriş" : "Successful logins",
            data: [42, 18, 9, 31, 55],
            backgroundColor: "#2e7d32"
          },
          {
            label: tr ? "Hatalı giriş" : "Failed logins",
            data: [7, 3, 12, 5, 21],
            backgroundColor: "#c62828"
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "bottom" },
          title: {
            display: true,
            text: tr
              ? "Örnek SIEM panosu: sunucu başına giriş denemeleri"
              : "Example SIEM dashboard: login attempts per host"
          }
        },
        scales: {
          y: { beginAtZero: true, ticks: { precision: 0 } }
        }
      }
    });
  }

  function buildFacilityChart() {
    var el = document.getElementById("chart-facilities");
    if (!el || typeof Chart === "undefined") return;

    var tr = isTurkish();
    new Chart(el, {
      type: "doughnut",
      data: {
        labels: tr
          ? ["auth/authpriv", "kern", "daemon", "user", "cron", "diğer"]
          : ["auth/authpriv", "kern", "daemon", "user", "cron", "other"],
        datasets: [
          {
            data: [38, 12, 18, 15, 9, 8],
            backgroundColor: [
              "#1565c0", "#6a1b9a", "#ef6c00",
              "#2e7d32", "#00838f", "#90a4ae"
            ]
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "bottom" },
          title: {
            display: true,
            text: tr
              ? "İletilen logların facility dağılımı"
              : "Facility distribution of forwarded logs"
          }
        }
      }
    });
  }

  function init() {
    buildLoginChart();
    buildFacilityChart();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
