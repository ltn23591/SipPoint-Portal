import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Send, Pencil } from "lucide-react";
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
import { NotificationApi, CustomerSegmentApi } from "@/apis";
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
  segmentId: "",
  type: "system",
  status: "active",
};

export default function NotificationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const qc = useQueryClient();
  const isCreate = id === "new";
  const [pMode, setPMode] = useState(location.state?.mode ?? (isCreate ? "create" : "view"));
  const readOnly = pMode === "view";

  const [form, setForm] = useState(EMPTY);

  // Lấy danh sách Nhóm khách hàng (Segments)
  const { data: segmentsData = [] } = useQuery({
    queryKey: ["customerSegmentsList"],
    queryFn: async () => {
      const res = await CustomerSegmentApi.getAll();
      const list = res?.data?.data || res?.data || [];
      return Array.isArray(list) ? list : (list.segments || []);
    },
  });

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
        segmentId: detailData.segmentId?._id || detailData.segmentId || "",
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
      toast.success("Gửi thông báo thành công");
      qc.invalidateQueries({ queryKey: ["notifications"] });
      navigate(ROUTE_PATH.NOTIFICATIONS);
    },
    onError: (err) => toast.error(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await NotificationApi.update({ id, ...payload });
      if (!res?.data?.success) {
        throw new Error(res?.data?.message || "Cập nhật thông báo thất bại");
      }
      return res.data;
    },
    onSuccess: () => {
      toast.success("Cập nhật thông báo thành công");
      qc.invalidateQueries({ queryKey: ["notifications"] });
      qc.invalidateQueries({ queryKey: ["notification", id] });
      navigate(ROUTE_PATH.NOTIFICATIONS);
    },
    onError: (err) => toast.error(err.message),
  });

  const handleSend = () => {
    if (!form.title.trim() || !form.content.trim()) return;
    const payload = {
      title: form.title.trim(),
      content: form.content.trim(),
      recipientType: form.recipientType,
      type: form.type,
      status: form.status,
    };
    if (form.recipientType === "segment" && form.segmentId) {
      payload.segmentId = form.segmentId;
    }

    if (isCreate) {
      createMutation.mutate(payload);
    } else {
      updateMutation.mutate(payload);
    }
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
                <SelectItem value="customer">Tất cả Khách hàng</SelectItem>
                <SelectItem value="segment">Theo Nhóm khách hàng (Segment)</SelectItem>
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
                <SelectItem value="promotion">Khuyến mãi / Marketing</SelectItem>
                <SelectItem value="order">Đơn hàng</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>

        {form.recipientType === "segment" && (
          <Field label="Chọn Nhóm khách hàng mục tiêu">
            <Select value={form.segmentId} onValueChange={(v) => set("segmentId", v)} disabled={readOnly}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn nhóm khách hàng..." />
              </SelectTrigger>
              <SelectContent>
                {Array.isArray(segmentsData) && segmentsData.map((s) => (
                  <SelectItem key={s._id} value={s._id}>
                    {s.name} ({s.memberCount ?? s.memberIds?.length ?? 0} thành viên)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        )}

        <Field label="Nội dung thông báo">
          <Textarea rows={4} value={form.content ?? ""} disabled={readOnly} onChange={(e) => set("content", e.target.value)} placeholder="Nhập nội dung chi tiết..." />
        </Field>
      </div>

      {readOnly ? (
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => navigate(ROUTE_PATH.NOTIFICATIONS)}>
            Quay lại
          </Button>
          <Button onClick={() => setPMode("edit")} className="gap-1.5">
            <Pencil className="size-4" />
            Chỉnh sửa thông báo
          </Button>
        </div>
      ) : (
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => (isCreate ? navigate(ROUTE_PATH.NOTIFICATIONS) : setPMode("view"))}>
            {TEXT.cancel}
          </Button>
          <Button
            onClick={handleSend}
            disabled={createMutation.isPending || updateMutation.isPending || !form.title.trim() || !form.content.trim()}
            className="gap-1.5"
          >
            <Send className="size-4" />
            {createMutation.isPending || updateMutation.isPending ? "Đang lưu..." : isCreate ? "Gửi thông báo" : "Lưu thay đổi"}
          </Button>
        </div>
      )}
    </div>
  );
}



