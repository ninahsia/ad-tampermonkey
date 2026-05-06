// ==UserScript==
// @name         Ad Group Page Additional Functions (V13)
// @namespace    http://tampermonkey.net/
// @version      2026.05.06.V13
// @description  修正 fitData layout 下 updateDefinition 造成的欄位錯位
// @author       Nina Hsia
// @match        https://admin.hourloop.com/amazon_ads/list_ad_groups*
// @match        https://admin.hourloop.com/amazon_ads/list_keywords*
// @updateURL    https://raw.githubusercontent.com/ninahsia/ad-tampermonkey/master/ad-group-page.user.js
// @downloadURL  https://raw.githubusercontent.com/ninahsia/ad-tampermonkey/master/ad-group-page.user.js
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(function () {
    "use strict";

    const SELECTOR = "#ad-groups-table, #keywords-table";
    const INIT_FLAG = "__agp_v13";
    let cachedTable = null;

    const isEditing = (e) => {
        const tag = e.target.tagName;
        return e.target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(tag);
    };

    const getTable = () => {
        if (cachedTable && document.body.contains(cachedTable.element)) return cachedTable;
        if (typeof window.Tabulator !== "undefined" && window.Tabulator.findTable) {
            const tables = window.Tabulator.findTable(SELECTOR);
            if (tables && tables.length > 0) return tables[0];
        }
        return null;
    };

    const injectCSS = () => {
        if (document.getElementById("agp-css")) return;
        const s = document.createElement("style");
        s.id = "agp-css";
        s.textContent = `
            #agp-copy-item {
                /* placeholder to keep style tag non-empty */
            }
            #agp-copy-menu {
                position: fixed;
                background: #1e1e1e;
                border: 1px solid #444;
                border-radius: 4px;
                padding: 4px 0;
                z-index: 99999;
                min-width: 180px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.5);
            }
            #agp-copy-menu div {
                padding: 8px 16px;
                color: #eee;
                cursor: pointer;
                font-size: 13px;
            }
            #agp-copy-menu div:hover {
                background: rgba(255,255,255,0.1);
            }
        `;
        document.head.appendChild(s);
    };

    // ✅ 用 DOM 方式注入 copy menu，完全不碰 column definition
    function addCopyKeywordMenu(table) {
        try {
            const column = table.getColumn("keyword");
            if (!column) return;

            const colEl = column.getElement();
            const btn = colEl.querySelector(".tabulator-header-popup-button");
            if (!btn || btn.__agp_patched) return;

            btn.__agp_patched = true;

            btn.addEventListener("click", (e) => {
                // 等原生 menu 出現後再加入我們的 item
                setTimeout(() => {
                    const menu = document.querySelector(".tabulator-menu");
                    if (!menu || menu.querySelector("#agp-copy-item")) return;

                    const item = document.createElement("div");
                    item.id = "agp-copy-item";
                    item.className = "tabulator-menu-item";
                    item.textContent = "Copy selected texts";
                    item.addEventListener("click", () => {
                        const selected = table.getSelectedRows();
                        if (!selected.length) { alert("Select something."); return; }
                        const text = selected.map(r => {
                            const d = r.getData();
                            return d.keyword || d.ad_group_name || "";
                        }).filter(Boolean).join("\n");
                        navigator.clipboard.writeText(text);
                        menu.remove();
                    });

                    menu.appendChild(item);
                }, 30);
            });

        } catch (err) {
            console.warn("[AGP] addCopyKeywordMenu error:", err);
        }
    }

    function init() {
        const table = getTable();
        if (!table || table[INIT_FLAG]) return;

        injectCSS();
        addCopyKeywordMenu(table);

        table[INIT_FLAG] = true;
        cachedTable = table;

        console.log("[AGP] V13 Loaded");
    }

    function clickHeaderMenu(colIndex, optionIndex) {
        const btns = document.querySelectorAll(".tabulator-col .tabulator-header-popup-button");
        if (!btns[colIndex]) return;
        btns[colIndex].click();
        setTimeout(() => {
            const items = document.querySelectorAll(".tabulator-menu-item");
            if (items[optionIndex]) items[optionIndex].click();
        }, 50);
    }

    // ===== Keyboard =====
    window.addEventListener("keydown", (e) => {
        if (isEditing(e)) return;
        const table = getTable();
        if (!table) return;

        const isCmd = e.metaKey || e.ctrlKey;
        const key = e.key.toLowerCase();

        if (isCmd && key === "t") {
            e.preventDefault();
            e.stopImmediatePropagation();
            const selected = table.getSelectedRows();
            if (!selected.length) return;
            const text = selected.map(r => {
                const d = r.getData();
                return d.keyword || d.ad_group_name || "";
            }).filter(Boolean).join("\n");
            navigator.clipboard.writeText(text);
            return;
        }

        if (isCmd && key === "g") {
            e.preventDefault();
            clickHeaderMenu(0, 0);
            return;
        }

        if (isCmd && ["2","3","4","5","x"].includes(key)) {
            e.preventDefault();
            const map = { "2": 1, "3": 2, "4": 3, "5": 4, "x": 6 };
            clickHeaderMenu(0, map[key]);
            return;
        }

        if (isCmd && key === "6") {
            e.preventDefault();
            clickHeaderMenu(1, 0);
            return;
        }

        if (isCmd && key === "i") {
            e.preventDefault();
            const links = [];
            table.getSelectedRows().forEach(r => {
                const img = r.getElement().querySelector("img");
                if (img?.src) links.push("https://www.amazon.com/stylesnap?q=" + img.src);
            });
            if (links.length <= 20) links.forEach(url => window.open(url));
            return;
        }

        if (isCmd && key === "d") {
            e.preventDefault();
            const links = table.getSelectedRows()
                .map(r => r.getElement().querySelector('a[href*="/dp/"]')?.href)
                .filter(Boolean);
            if (links.length <= 20) links.forEach(url => window.open(url));
            return;
        }

        if (isCmd && key === "e") {
            e.preventDefault();
            const active = table.getRows("active");
            table.getSelectedRows().length
                ? table.deselectRow(active)
                : table.selectRow(active);
            return;
        }

        if (isCmd && key === "b") {
            e.preventDefault();
            table.deselectRow();
            return;
        }

        if (e.key === "Enter") {
            const hovered = document.querySelector(".tabulator-row:hover");
            if (hovered) {
                e.preventDefault();
                const row = table.getRows().find(r => r.getElement() === hovered);
                row?.toggleSelect();
            }
            return;
        }

        if (isCmd && (e.key === "ArrowUp" || e.key === "ArrowDown")) {
            e.preventDefault();
            const s = table.getSelectedRows();
            if (!s.length) return;
            const t = e.key === "ArrowUp"
                ? s[0].getPrevRow()
                : s[s.length - 1].getNextRow();
            if (t) {
                table.deselectRow();
                t.select();
            }
        }

    }, true);

    setInterval(init, 2000);
    init();

})();