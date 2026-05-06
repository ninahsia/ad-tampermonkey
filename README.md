# Ad Group Page Additional Functions

A Tampermonkey userscript that adds keyboard shortcuts and extra functionality to the HourLoop Amazon Ads admin pages.

## Installation

1. Install the [Tampermonkey](https://www.tampermonkey.net/) browser extension
2. Click the link below to install the script directly (auto-update enabled):
   [ad-group-page.user.js](https://raw.githubusercontent.com/ninahsia/ad-tampermonkey/master/ad-group-page.user.js)

## Supported Pages

- `https://admin.hourloop.com/amazon_ads/list_ad_groups*`
- `https://admin.hourloop.com/amazon_ads/list_keywords*`

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Cmd/Ctrl + T` | Copy selected keyword / ad group names to clipboard |
| `Cmd/Ctrl + G` | Trigger column header menu option 1 |
| `Cmd/Ctrl + 2~5` | Trigger column header menu options 2–5 |
| `Cmd/Ctrl + X` | Trigger column header menu option 7 |
| `Cmd/Ctrl + 6` | Trigger second column header menu option 1 |
| `Cmd/Ctrl + I` | Open Amazon StyleSnap links for selected rows |
| `Cmd/Ctrl + D` | Open Amazon product page (`/dp/`) links for selected rows |
| `Cmd/Ctrl + E` | Select / deselect all active rows |
| `Cmd/Ctrl + B` | Deselect all rows |
| `Enter` | Toggle select on hovered row |
| `Cmd/Ctrl + ↑ / ↓` | Move selection up / down one row |

## Context Menu

Right-clicking the **keyword** column header popup button adds a **"Copy selected texts"** option to copy selected keywords to clipboard.

## Version

`2026.05.06.V13`
