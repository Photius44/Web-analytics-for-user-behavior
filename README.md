# 📊 Web Analytics SaaS Platform - Hệ Thống Phân Tích Hành Vi Người Dùng & AI Gợi Ý Tối Ưu UX

[![Next.js](https://img.shields.io/badge/Frontend-Next.js%2016%20(App%20Router)-black?logo=next.js&style=flat-square)](https://nextjs.org)
[![Express](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express-green?logo=express&style=flat-square)](https://expressjs.com)
[![Prisma](https://img.shields.io/badge/ORM-Prisma%207-2d3748?logo=prisma&style=flat-square)](https://prisma.io)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL%20(Supabase)-4169e1?logo=postgresql&style=flat-square)](https://supabase.com)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178c6?logo=typescript&style=flat-square)](https://typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS%204-38bdf8?logo=tailwind-css&style=flat-square)](https://tailwindcss.com)

Hệ thống **Web Analytics SaaS** là nền tảng thu thập, xử lý và phân tích hành vi người dùng thời gian thực (real-time). Hệ thống bao gồm một mã nhúng thu thập dữ liệu gọn nhẹ (Vanilla JS), server API hiệu năng cao tích hợp ORM lưu trữ vào cơ sở dữ liệu PostgreSQL (Supabase Cloud), và một Dashboard phân tích trực quan nâng cao hỗ trợ công nghệ **AI Insights** tự động phân tích lỗ hổng trải nghiệm và liên kết trực tiếp tới bằng chứng phiên hoạt động của người dùng (Rage Clicks, Bounce).

---

## ✨ Các Tính Năng Cốt Lõi

*   **📊 Real-time Dashboard**: Cung cấp cái nhìn toàn diện về chỉ số KPI chính: Tổng số khách truy cập (Total Visitors), Lượt xem trang (Page Views), Thời lượng phiên trung bình (Avg. Session Duration), Tỷ lệ thoát (Bounce Rate).
*   **🔥 Click Heatmap (Bản Đồ Nhiệt)**: Mô phỏng trực quan tương tác click trên giao diện website. Các điểm nóng (Hot Zones) được vẽ bằng công nghệ CSS Radial Gradients tự động co giãn bán kính tỏa nhiệt dựa trên tần suất tương tác thực tế từ CSDL.
*   **🖱️ Session History & Replay**: Lưu trữ lịch sử duyệt trang, phân tích chi tiết phiên làm việc, thiết bị, hệ điều hành, trình duyệt và chuỗi hành trình duyệt trang (Page Path Sequence) của từng khách truy cập.
*   **💡 AI Insights & UX Optimization**: Trí tuệ nhân tạo phân tích dữ liệu hành vi, chỉ ra các điểm bất thường như hiện tượng "Rage Click" (click ức chế liên tục) hoặc tỷ lệ thoát bất thường, đưa ra gợi ý cải thiện cấu trúc trang kèm nút **Analyze Evidence** để truy xuất bằng chứng cụ thể.

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

| Lớp (Layer) | Công nghệ tích hợp | Mô tả |
| :--- | :--- | :--- |
| **Frontend** | React 19, Next.js 16 (App Router), TypeScript, Recharts, Lucide Icons | Xây dựng giao diện ứng dụng phía Client Single Page, tối ưu tải trang tĩnh (SSG) & render linh hoạt. |
| **Styling** | Tailwind CSS v4, Radix UI Components | Giao diện giao thoa tối giản sang trọng theo phong cách tối (Dark Mode), hỗ trợ chuyển đổi linh hoạt. |
| **Backend** | Node.js, Express, TypeScript, Morgan | Cung cấp RESTful API, log request truy cập, xử lý CORS phân tán mở cho mọi domain client nhúng tracker. |
| **Database** | PostgreSQL, Prisma ORM, Supabase Cloud | Hệ quản trị cơ sở dữ liệu quan hệ lưu trữ phiên và sự kiện, kết nối thông qua Connection Pool Adaptor PG. |
| **Tracker** | Custom Vanilla JS Script (ES6) | File mã nguồn mở tự kích hoạt nhúng vào các website cần đo lường, tối ưu hóa kích thước và đường truyền. |

---

## 📂 Kiến Trúc Hệ Thống & Cấu Trúc Thư Mục

Hệ thống được thiết kế theo mô hình tách biệt hoàn toàn dịch vụ (Decoupled Split Architecture):

```text
user-behavior/
├── backend/                  # DỊCH VỤ BACKEND (Node.js + Express + Prisma)
│   ├── prisma/
│   │   └── schema.prisma     # Định nghĩa cấu trúc bảng (Project, Session, Event)
│   ├── src/
│   │   ├── controllers/      # Bộ điều hướng logic
│   │   │   ├── analytics.controller.ts  # Phân tích tổng quan, Heatmap & Session
│   │   │   └── track.controller.ts      # Xử lý nuốt dữ liệu từ tracker.js
│   │   ├── lib/
│   │   │   └── prisma.ts     # Khởi tạo Singleton Prisma Client
│   │   ├── routes/           # Định tuyến API
│   │   │   ├── analytics.routes.ts
│   │   │   └── track.routes.ts
│   │   └── index.ts          # Cổng khởi chạy Server chính (Port 5000)
│   ├── tsconfig.json         # Cấu hình compiler TypeScript cho backend
│   └── package.json
│
└── frontend/                 # ỨNG DỤNG FRONTEND (Next.js 16 + Tailwind CSS)
    ├── app/                  # App Router của Next.js
    │   ├── page.tsx          # Dashboard tổng quan chính (Live-data)
    │   ├── ai-insights/      # Trang gợi ý tối ưu UX tích hợp liên kết bằng chứng
    │   ├── heatmap/          # Trang bản đồ nhiệt click dựa trên tọa độ x,y thực tế
    │   └── sessions/         # Trang quản lý chi tiết danh sách phiên người dùng
    ├── components/           # Các thành phần tái sử dụng
    │   └── dashboard/
    │       ├── analytics-cards.tsx # Top Pages và Device Types widgets
    │       └── kpi-card.tsx        # Khung KPI tích hợp sparkline
    ├── hooks/
    │   └── useAnalytics.ts   # Custom hook kết nối API backend reactive
    ├── public/
    │   └── tracker.js        # Mã nguồn tracking script tự kích hoạt nhúng vào client
    └── package.json
```

---

## 🔬 Giải Pháp Kỹ Thuật Đột Phá (Technical Highlights)

### 1. Cơ Chế Gom Hàng Đợi & Hợp Nhất Sự Kiện (Batching & Beacon API)
*   **Vấn đề**: Việc gửi HTTP Request về server trên mỗi hành động click hoặc scroll của người dùng sẽ tạo áp lực nghẽn mạng khổng lồ, gây lag trình duyệt của khách hàng.
*   **Giải pháp trong `tracker.js`**:
    *   Sử dụng cấu trúc mảng **Queue** nội bộ để tạm lưu sự kiện.
    *   Tự động gom sự kiện (Batching) và đẩy về backend định kỳ sau mỗi **5 giây** hoặc khi đạt giới hạn **10 sự kiện** tùy điều kiện nào đến trước.
    *   Lắng nghe trạng thái tắt trang (`visibilitychange` và `beforeunload`) để kích hoạt **`navigator.sendBeacon()`** đẩy nốt các sự kiện cuối cùng ngầm về server, cam kết không mất dữ liệu ngay cả khi người dùng tắt tab đột ngột.
    *   Giới hạn tần suất tính toán cuộn trang bằng cơ chế **`throttle (250ms)`** để bảo toàn hiệu năng phần cứng cho thiết bị di động.

### 2. Xử Lý Ghi Hàng Loạt & Upsert Phiên Hoạt Động (Transaction & createMany)
*   **Vấn đề**: Tránh tình trạng khóa bảng hoặc chậm phản hồi khi client đẩy lên mảng chứa hàng chục sự kiện một lúc.
*   **Giải pháp trong `track.controller.ts`**:
    *   Bọc toàn bộ tiến trình phân tích thông tin thiết bị và ghi dữ liệu trong một **Prisma Database Transaction (`prisma.$transaction`)** đảm bảo tính toàn vẹn (atomic).
    *   Sử dụng **`createMany()`** của Prisma để insert số lượng lớn sự kiện đồng thời chỉ với một câu lệnh ghi duy nhất, gia tăng tốc độ phản hồi API về mức dưới `< 20ms`.
    *   Tự động phát hiện phiên hoạt động (`Session`) hiện có để cập nhật mốc kết thúc (`endedAt`) và tính toán lại thời lượng phiên (`durationSeconds`).

### 3. Prisma Client Singleton Pattern
*   **Vấn đề**: Trong môi trường phát triển (Development), Next.js và Node Server reload liên tục (Hot Reload) khiến hàng trăm kết nối CSDL ảo bị khởi tạo song song, nhanh chóng làm cạn kiệt cổng kết nối của PostgreSQL.
*   **Giải pháp trong `src/lib/prisma.ts`**: Lưu trữ instance của Prisma Client vào đối tượng toàn cục `globalThis`. Server sẽ tái sử dụng instance này qua mỗi lần reload thay vì khởi tạo lại kết nối mới.

### 4. Liên Kết Bằng Chứng Trực Quan (AI Evidence Link Flow)
*   Một cải tiến mang tính thực tiễn cao phục vụ nghiên cứu khoa học: Hệ thống AI Insights chỉ ra lỗi (ví dụ: người dùng ức chế click liên tục do nút hỏng). 
*   Khi người dùng bấm **Analyze Evidence**, ứng dụng sử dụng cơ chế truyền tải tham số tìm kiếm (`?filter=rage_click` hoặc `?filter=bounce`) thông qua Next.js `useSearchParams()`. Hệ thống sẽ tự động lọc danh sách phiên hoạt động thời gian thực từ CSDL để người quản trị đối soát ngay lập tức phiên gặp lỗi.

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Dự Án

### Yêu Cầu Hệ Thống
*   Đã cài đặt **Node.js LTS** (Khuyên dùng v20 trở lên)
*   Hệ quản trị cơ sở dữ liệu **PostgreSQL** (Có thể dùng docker hoặc cloud Supabase)

### Bước 1: Thiết Lập Database (Supabase) & Cấu Hình Môi Trường
Tạo file `.env` tại thư mục `/backend` và điền chuỗi kết nối PostgreSQL của bạn:
```env
# URL kết nối cơ sở dữ liệu PostgreSQL trực tiếp
DATABASE_URL="postgresql://postgres:password@db.supabase.co:5432/postgres?schema=public"
PORT=5000
```

### Bước 2: Cài Đặt Dependencies & Chạy Migrations (Backend)
Mở cửa sổ terminal tại thư mục `/backend` và thực thi:
```bash
# 1. Cài đặt các gói phụ thuộc (Express, Prisma, PostgreSQL client)
npm install

# 2. Đồng bộ hóa Schema của dự án lên PostgreSQL
npx prisma migrate dev --name init

# 3. Chạy server backend dưới chế độ phát triển
npm run dev
```
*Server API backend sẽ lắng nghe tại địa chỉ: `http://localhost:5000`*

### Bước 3: Cài Đặt & Khởi Chạy Ứng Dụng Client (Frontend)
Mở cửa sổ terminal thứ hai tại thư mục `/frontend` và thực thi:
```bash
# 1. Cài đặt các thư viện Frontend (React, Recharts, Lucide)
npm install

# 2. Xây dựng bản dev và chạy Next.js Server
npm run dev
```
*Giao diện Dashboard phân tích sẽ chạy tại: `http://localhost:3000`*

---

## 📈 Kiểm Thử Thực Tế Quy Trình Đo Lường (End-to-End Test)
1. Truy cập vào trang Dashboard `http://localhost:3000`.
2. Mã nhúng [tracker.js](file:///D:/Hoc%20tap/du%20an/PJbehavior/user-behavior/frontend/public/tracker.js) được tích hợp trong mã nguồn trang sẽ tự động nhận diện Project ID `test-project-1234`, tiến hành tạo định danh khách truy cập và phiên làm việc, gửi sự kiện `PAGE_VIEW` về server.
3. Khi bạn click hoặc scroll trên giao diện trang Dashboard, các hành động sẽ được lưu vào hàng đợi và truyền tải tự động sau mỗi 5 giây.
4. Bạn có thể mở cơ sở dữ liệu hoặc kiểm tra tab Network để xem tiến trình truyền tải Batch JSON mượt mà.
5. Kiểm tra các trang **Heatmap**, **Sessions**, **AI Insights** để xem toàn bộ dữ liệu thực tế được hiển thị thời gian thực.
