import { formatVND, formatDate } from "@/helpers/format";
import { DATE_TIME_FORMAT } from "@/constants/application";

export function printReceipt(order) {
  if (!order) return;

  const printWindow = window.open("", "_blank", "width=400,height=600");
  if (!printWindow) {
    alert("Trình duyệt chặn mở cửa sổ in. Vui lòng bỏ chặn pop-up để in hóa đơn.");
    return;
  }

  const itemsHtml = (order.items || []).map((it) => {
    const name = it.name || it.productId?.name || "Món ăn";
    const qty = it.qty || 1;
    const price = formatVND(it.unitPrice || it.price || (it.lineTotal ? it.lineTotal / qty : 0));
    const total = formatVND(it.lineTotal || (it.unitPrice || it.price || 0) * qty);
    const variants = (it.variants || []).map((v) => v.name).join(", ");
    const note = it.note ? `<div style="font-size: 11px; font-style: italic; color: #555;">✍️ ${it.note}</div>` : "";

    return `
      <div style="border-bottom: 1px dashed #ddd; padding: 6px 0;">
        <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 13px;">
          <span>${qty}x ${name}</span>
          <span>${total}</span>
        </div>
        ${variants ? `<div style="font-size: 11px; color: #666;">+ ${variants}</div>` : ""}
        ${note}
      </div>
    `;
  }).join("");

  const content = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Hóa đơn ${order.orderNumber || order.code || ""}</title>
        <meta charset="utf-8" />
        <style>
          @page { size: 80mm auto; margin: 0; }
          body {
            font-family: 'Courier New', Courier, monospace, sans-serif;
            width: 78mm;
            margin: 0 auto;
            padding: 8px;
            font-size: 12px;
            color: #000;
          }
          .text-center { text-align: center; }
          .text-right { text-align: right; }
          .bold { font-weight: bold; }
          .divider { border-top: 1px dashed #000; margin: 8px 0; }
          .header { margin-bottom: 8px; }
          .header h2 { margin: 0; font-size: 18px; text-transform: uppercase; }
          .header p { margin: 2px 0; font-size: 11px; }
          .row { display: flex; justify-content: space-between; margin: 3px 0; }
          .total-row { font-size: 15px; font-weight: bold; margin-top: 6px; }
          .footer { margin-top: 12px; font-size: 11px; }
        </style>
      </head>
      <body>
        <div class="header text-center">
          <h2>SIPPOINT COFFEE</h2>
          <p>ĐC: 123 Đường Cà Phê, Quận 1, TP.HCM</p>
          <p>Hotline: 0123 456 789</p>
        </div>

        <div class="divider"></div>

        <div class="text-center bold" style="font-size: 14px; margin-bottom: 4px;">
          HÓA ĐƠN THANH TOÁN
        </div>

        <div class="row">
          <span>Mã đơn:</span>
          <span class="bold">${order.orderNumber || order.code || ""}</span>
        </div>
        <div class="row">
          <span>Bàn/Loại:</span>
          <span class="bold">${order.tableName || (order.isPickup ? "Mang đi" : "Tại chỗ")}</span>
        </div>
        <div class="row">
          <span>Khách hàng:</span>
          <span>${order.customerName || order.customerId?.fullName || "Khách lẻ"}</span>
        </div>
        <div class="row">
          <span>Thời gian:</span>
          <span>${formatDate(order.createdAt || new Date(), DATE_TIME_FORMAT)}</span>
        </div>

        <div class="divider"></div>

        <div style="font-weight: bold; margin-bottom: 4px;">CHI TIẾT MÓN:</div>
        ${itemsHtml}

        <div class="divider"></div>

        ${order.subtotal ? `
        <div class="row">
          <span>Tạm tính:</span>
          <span>${formatVND(order.subtotal)}</span>
        </div>` : ""}

        ${order.discount ? `
        <div class="row">
          <span>Giảm giá:</span>
          <span>-${formatVND(order.discount)}</span>
        </div>` : ""}

        <div class="row total-row">
          <span>TỔNG TIỀN:</span>
          <span>${formatVND(order.totalAmount || order.total || 0)}</span>
        </div>

        <div class="row" style="margin-top: 4px;">
          <span>Thanh toán:</span>
          <span class="bold">${order.paymentMethod === "TRANSFER" ? "Chuyển khoản QR" : "Tiền mặt"}</span>
        </div>

        <div class="divider"></div>

        <div class="footer text-center">
          <p class="bold">CẢM ƠN QUÝ KHÁCH & HẸN GẶP LẠI!</p>
          <p style="font-style: italic; color: #444;">Wifi: SipPoint_Guest / Pass: sippoint888</p>
        </div>

        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() { window.close(); }, 500);
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(content);
  printWindow.document.close();
}
