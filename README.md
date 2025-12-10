# CHM 前端（React + TypeScript + Vite）

以 React 19 + Vite 7 + TypeScript 5 開發的主機與服務管理介面，涵蓋使用者/角色、排程、備份、檔案、網路、防火牆與多項伺服器服務的前端操作。頁面採文件型路由自動註冊並內建登入驗證、版面配置與主題切換。

## 技術棧
- React 19、React Router 7、TypeScript 5、Vite 7
- Tailwind CSS 4 + Radix UI/shadcn 元件、lucide/react-icons
- 資料處理：axios、@tanstack/react-table、react-hook-form + zod、recharts
- OpenAPI：`@hey-api/openapi-ts` 生成 axios 客戶端（`src/api/openapi-client`）
- 品質工具：ESLint 9、`vite-plugin-checker`、TypeScript 專案參考建置

## 功能導覽（對應側邊選單）
- Dashboard：總覽群集 CPU/Memory/Disk 圖表、主機狀態清單、Apache 服務狀態表、依安全等級篩選。
- User：CHM 使用者/群組管理、角色權限（`allowedRoles` 受權控管）。
- System：備份（建立/還原/刪除）、系統設定、mCA 憑證管理、系統與主機日誌。
- Host Management：PC Manager（註冊主機、群組分配、CIDR 驗證）、Process Manager、Cron Management（CRUD、匯入匯出）、通知頁。
- Resources & Services：Servers（Apache/Nginx/BIND/DHCP/LDAP/MySQL/ProFTPD/Samba/Squid/SSH 主機列表與詳細）、Software Package、File Manager（實體/虛擬檔案/資料夾管理）。
- Network：Firewall（各主機啟用/停用、Policy、Rule CRUD）、Network Configuration（NIC/DNS/Route 編輯）。
- 其他：Login/Unauthorized/Not Found 頁面，路由守衛 `RequireAuth`。

## 專案結構
- `src/main.tsx`：全域注入 ThemeProvider、Tooltip、EventBus、AuthProvider 與 Router。
- `src/router.tsx`：以 `import.meta.glob` 自動載入 `src/pages/**`，支援 `requiresAuth/allowedRoles/layout` 中繼資料。
- `src/components`：Layout、AppSidebar、Topbar、shadcn 風格 UI 元件與主題切換。
- `src/pages`：依功能分頁（Backup、Firewall、pc-manager、cron_management、Servers/*...），`Content.tsx` 為主要呈現。
- `src/api/openapi-client`：OpenAPI 自動生成的 axios SDK。
- `vite.config.ts`：Tailwind 4、檢查插件、`@` → `src` 路徑別名、dev 代理。

## 環境需求
- Node.js 18+（建議 20+）、pnpm。
- 開發階段 `/api` 會代理到 `https://127.0.0.1:50050`；若後端使用自簽憑證，預期根憑證位於 `../certs/rootCA.pem` 供開發 HTTPS agent 與 OpenAPI 生成使用。

## 快速開始
```bash
pnpm install          # 安裝依賴
pnpm dev              # 啟動開發伺服器（預設 http://localhost:3000）
pnpm build            # 型別檢查後產出 dist/
pnpm preview          # 以本地伺服器預覽正式版
```

## 常用腳本
- `pnpm lint`：ESLint（零警告門檻）。
- `pnpm type-check`：只跑 TypeScript 型別檢查。
- `pnpm gen:api-client`：依 OpenAPI 重新生成 `src/api/openapi-client`。指令內已設 `NODE_EXTRA_CA_CERTS=../certs/rootCA.pem`，需確保憑證存在，後端可於 `https://127.0.0.1:50050/api-doc/openapi.json` 提供文件。

## 開發注意事項
- 路由守衛：頁面可透過 `Component.meta` 設定 `requiresAuth`（預設 true）、`allowedRoles`、`layout`。`RequireAuth` 會依 meta 決定是否導向登入/Unauthorized。
- 主題與提示：`ThemeProvider` 使用 `localStorage` key `vite-ui-theme`，`sonner` 用於全域 toast。
- API 代理：開發模式下 `/api` 走 Vite proxy，若缺憑證會以 HTTP 失敗請求；需連到真實後端請先放置 `../certs/rootCA.pem`。
- 資料來源：多數頁面以 axios 直呼 `/api/*`，若後端未啟動則會顯示 mock 或空資料。
- 路徑別名：`@` 指向 `src`，請使用絕對匯入以保持一致。

## 部署
- 執行 `pnpm build`，將 `dist/` 內容部署到靜態站點或任何支援 SPA 的伺服器。
- 若生產環境仍需與後端 HTTPS 溝通，確保反向代理或憑證設定與開發代理一致。
