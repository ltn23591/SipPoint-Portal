# 📊 SipPoint - Admin & POS Store Management Portal

[![React](https://img.shields.io/badge/React-v19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-v8-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Shadcn UI](https://img.shields.io/badge/Shadcn_UI-Components-000000?style=for-the-badge&logo=shadcnui&logoColor=white)](https://ui.shadcn.com/)
[![React Router](https://img.shields.io/badge/React_Router-v7-CA4245?style=for-the-badge&logo=reactrouter&logoColor=white)](https://reactrouter.com/)
[![Recharts](https://img.shields.io/badge/Recharts-Data_Viz-22B5BF?style=for-the-badge)](https://recharts.org/)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)

**SipPoint-Portal** là Hệ thống Quản trị & Vận hành Cửa hàng toàn diện dành cho Chủ cửa hàng, Quản lý và Nhân viên Thu ngân / Pha chế của chuỗi **SipPoint Coffee & Tea**. Hệ thống tích hợp màn hình POS bán hàng, quản lý đơn hàng Kanban thời gian thực, in hóa đơn nhiệt và quản trị CRM / Marketing tập trung.

---

## 🚀 Các Chức năng & Phân hệ Quản trị Chính

### 1. 📈 Dashboard Realtime & Phân tích Doanh thu
- **Thống kê tổng quan**: Theo dõi Doanh thu, Tổng đơn hàng, Khách hàng mới và Tỷ lệ chuyển đổi theo ngày/tuần/tháng.
- **Biểu đồ trực quan**: Tích hợp **Recharts** vẽ biểu đồ doanh thu theo khung giờ, top 5 món bán chạy nhất và tỷ lệ phương thức thanh toán (VietQR vs Tiền mặt).

### 2. 🛒 POS & Quản lý Đơn hàng Kanban
- **Màn hình POS Thu ngân**: Tạo đơn nhanh chóng, chọn khu vực/bàn, áp mã giảm giá và tùy chọn hình thức Ăn tại chỗ / Mang về / Giao hàng.
- **Bảng Kanban Đơn hàng**: Theo dõi tiến trình xử lý đơn hàng theo dạng cột trực quan (`PENDING` ➔ `CONFIRMED` ➔ `PREPARING` ➔ `READY` ➔ `COMPLETED`).
- **In Hóa đơn nhiệt 80mm**: Tích hợp tính năng tự động định dạng và in bill hóa đơn thanh toán chuẩn 80mm cho máy in nhiệt.
- **Cập nhật Real-time**: Lắng nghe sự kiện từ WebSocket (Socket.io) tự động nhận đơn mới từ Landing Page mà không cần F5 trang.

### 3. 🗺️ Quản lý Sơ đồ Bàn & Khu vực (Zone & Table Map)
- Quản lý danh sách Khu vực (Tầng 1, Tầng 2, Sân thượng, v.v.).
- Quản lý vị trí & trạng thái bàn ăn thời gian thực: **Trống** (`AVAILABLE`), **Đang có khách** (`OCCUPIED`), **Cần dọn dẹp** (`CLEANING`).

### 4. ☕ Quản lý Thực đơn & Tồn kho Nguyên liệu
- **Catalog Sản phẩm**: Thêm/Sửa/Xóa sản phẩm, danh mục, biến thể Size (M/L) và bảng giá Topping.
- **Tồn kho Nguyên liệu**: Quản lý số lượng tồn kho nguyên vật liệu pha chế, thiết lập định mức tối thiểu và cảnh báo sắp hết hàng.

### 5. 🎯 Quản lý Marketing, Khuyến mãi & CRM
- **Chiến dịch Marketing (Campaigns)**: Quản lý các chương trình ưu đãi, mã giảm giá (**Voucher**) theo phân khúc khách hàng.
- **Banner Quảng cáo**: Đăng tải và quản lý banner hiển thị trên ứng dụng khách hàng.
- **CRM & Phân khúc Khách hàng**: Quản lý thông tin khách hàng, lịch sử mua hàng, nâng/hạ hạng thẻ hội viên (Đồng, Bạc, Vàng, Kim Cương).
- **Vòng quay May mắn (LuckyWheel)**: Thiết lập danh sách phần thưởng và tỷ lệ trúng thưởng cho game quay số.

### 6. 👥 Quản lý Nhân viên & Phân quyền (RBAC)
- Quản lý tài khoản nhân viên, thiết lập vai trò (**ADMIN**, **MANAGER**, **STAFF**).
- Phân quyền chi tiết theo từng trang và tính năng đảm bảo an toàn dữ liệu.

### 7. 📑 Quản lý Ca làm việc, Nhật ký & Báo cáo
- **Quản lý Ca làm (Shifts)**: Chốt két đầu ca/cuối ca, đối soát doanh thu tiền mặt và chuyển khoản.
- **Nhật ký Hoạt động (Activity Logs)**: Ghi lại lịch sử thao tác của nhân viên trên hệ thống.
- **Báo cáo & Xuất file Excel**: Tích hợp **SheetJS (XLSX)** xuất báo cáo doanh thu, đơn hàng, khách hàng ra file Excel `.xlsx`.

---

## 🛠️ Công nghệ Sử dụng

- **Core Framework**: React 19, Vite 8 (JavaScript).
- **Styling & UI Kit**: TailwindCSS v4, Shadcn UI, Radix UI primitives, Lucide Icons.
- **State Management & Fetching**:
  - **TanStack Query (React Query v5)**: Caching & sync dữ liệu API.
  - **Zustand**: Quản lý trạng thái local & auth session.
- **Biểu đồ & Báo cáo**: Recharts, SheetJS (`xlsx`).
- **Realtime**: Socket.io-client.
- **Notification & Modal**: Sonner Toast notification.

---

## 📁 Cấu trúc Thư mục Dự án

```
SipPoint-Portal/
├── public/           # Static assets & favicon
├── src/
│   ├── apis/         # Axios API clients (auth, orders, products, analytics...)
│   ├── assets/       # Media, images & logos
│   ├── components/   # UI components dùng chung (Sidebar, Header, Table, Dialogs)
│   ├── constants/    # Constants, ENUMs, route paths
│   ├── contexts/     # App level contexts
│   ├── helpers/      # Format currency, date, thermal print helpers
│   ├── hooks/        # Custom React hooks
│   ├── lib/          # Utilities (clsx, tailwind-merge)
│   ├── pages/        # 25+ trang quản trị (dashboard, orders, menu, customers, staff...)
│   ├── routes/       # Centralized Routing setup & Protected routes
│   ├── stores/       # Zustand state management stores
│   ├── App.jsx       # Main App component
│   ├── index.css     # Global TailwindCSS setup
│   └── main.jsx      # Application entry point
├── .env              # Biến môi trường
├── vercel.json       # Cấu hình Vercel SPA Rewrites
├── vite.config.js    # Cấu hình Vite builder
└── package.json      # Dependencies & Scripts
```

---

## 💻 Hướng dẫn Cài đặt & Khởi chạy Local

### 1. Cài đặt Dependencies
```bash
npm install
```

### 2. Cấu hình Biến môi trường (`.env`)
Tạo file `.env` tại thư mục gốc:

```env
# API Endpoint kết nối Backend Server
VITE_APP_API_URL=http://localhost:5000
```

### 3. Khởi chạy Môi trường Development
```bash
npm run dev
```
Trình duyệt sẽ tự động mở ứng dụng tại `http://localhost:5173`.

---

## 🚀 Triển khai Production (Vercel)

Dự án đã được cấu hình sẵn tệp `vercel.json` phục vụ triển khai trên **Vercel**:

- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Cấu hình SPA Rewrite (`vercel.json`)**:
  ```json
  {
    "rewrites": [
      { "source": "/(.*)", "destination": "/index.html" }
    ]
  }
  ```
  *(Giúp ngăn chặn lỗi `404: NOT_FOUND` khi người dùng F5 hoặc truy cập trực tiếp vào các route như `/login`, `/orders`, `/dashboard`).*
