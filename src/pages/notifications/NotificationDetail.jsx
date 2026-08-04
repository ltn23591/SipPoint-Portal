import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Send } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ROUTE_PATH } from "@/constants/routePaths";
import { NotificationApi } from "@/apis";
import { TEXT } from "./constants";

function Field({ label, children }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}

const EMPTY = {
  title: "",
  content: "",
  recipientType: "all",
  type: "system",
  status: "active",
};

export default function NotificationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const qc = useQueryClient();
  const isCreate = id === "new";
  const readOnly = !isCreate && (location.state?.mode ?? "view") === "view";

  const [form, setForm] = useState(EMPTY);

  const { data: detailData } = useQuery({
    queryKey: ["notification", id],
    queryFn: async () => {
      const res = await NotificationApi.detail(id);
      return res?.data?.data || null;
    },
    enabled: !isCreate && !!id,
  });

  useEffect(() => {
    if (detailData) {
      setForm({
        title: detailData.title || "",
        content: detailData.content || detailData.body || "",
        recipientType: detailData.recipientType || "all",
        type: detailData.type || "system",
        status: detailData.status || "active",
      });
    }
  }, [detailData]);

  const set = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const createMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await NotificationApi.create(payload);
      if (!res?.data?.success) {
        throw new Error(res?.data?.message || "Tạo thông báo thất bại");
      }
      return res.data;
    },
    onSuccess: () => {
      toast.success("Tạo thông báo mới thành công");
      qc.invalidateQueries({ queryKey: ["notifications"] });
      navigate(ROUTE_PATH.NOTIFICATIONS);
    },
    onError: (err) => toast.error(err.message),
  });

  const handleSend = () => {
    if (!form.title.trim() || !form.content.trim()) return;
    createMutation.mutate({
      title: form.title.trim(),
      content: form.content.trim(),
      recipientType: form.recipientType,
      type: form.type,
      status: form.status,
    });
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon-sm" onClick={() => navigate(ROUTE_PATH.NOTIFICATIONS)}>
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-secondary">
            {isCreate ? TEXT.createTitle : TEXT.detailTitle}
          </h1>
          {!isCreate && detailData && <p className="text-sm text-muted-foreground">{detailData.title}</p>}
        </div>
      </div>

      <div className="space-y-5 rounded-xl border bg-card p-6 shadow-sm">
        <Field label="Tiêu đề thông báo">
          <Input value={form.title ?? ""} disabled={readOnly} onChange={(e) => set("title", e.target.value)} placeholder="Nhập tiêu đề..." />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Đối tượng nhận">
            <Select value={form.recipientType} onValueChange={(v) => set("recipientType", v)} disabled={readOnly}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả khách hàng & nhân viên</SelectItem>
                <SelectItem value="customer">Chỉ Khách hàng</SelectItem>
                <SelectItem value="staff">Chỉ Nhân viên</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <Field label="Loại thông báo">
            <Select value={form.type} onValueChange={(v) => set("type", v)} disabled={readOnly}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="system">Hệ thống</SelectItem>
                <SelectItem value="promotion">Khuyến mãi</SelectItem>
                <SelectItem value="order">Đơn hàng</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>

        <Field label="Nội dung thông báo">
          <Textarea rows={4} value={form.content ?? ""} disabled={readOnly} onChange={(e) => set("content", e.target.value)} placeholder="Nhập nội dung chi tiết..." />
        </Field>
      </div>

      {!readOnly && (
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => navigate(ROUTE_PATH.NOTIFICATIONS)}>
            {TEXT.cancel}
          </Button>
          <Button onClick={handleSend} disabled={createMutation.isPending || !form.title.trim() || !form.content.trim()} className="gap-1.5">
            <Send className="size-4" />
            {createMutation.isPending ? "Đang gửi..." : TEXT.save}
          </Button>
        </div>
      )}
    </div>
  );
}
