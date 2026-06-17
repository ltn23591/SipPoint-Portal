import { useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router";
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
import { MOCK_NOTIFICATIONS } from "./mockData";
import { CHANNEL, CHANNEL_OPTIONS, TIER_OPTIONS, TEXT } from "./constants";

function Field({ label, children }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}

const EMPTY = { title: "", channel: CHANNEL.PUSH, tier: "ALL", body: "", scheduleAt: null };

export default function NotificationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isCreate = id === "new";

  const original = isCreate ? EMPTY : MOCK_NOTIFICATIONS.find((n) => n._id === id);
  const readOnly = !isCreate && (location.state?.mode ?? "view") === "view";
  const [form, setForm] = useState(original ?? EMPTY);

  if (!original) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <p>Không tìm thấy thông báo này.</p>
        <Button variant="link" onClick={() => navigate(ROUTE_PATH.NOTIFICATIONS)}>
          {TEXT.back}
        </Button>
      </div>
    );
  }

  const set = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSend = () => {
    // Thực tế: POST /notifications/send { channel, segment, ... }
    toast.success("Đã đưa thông báo vào hàng đợi gửi");
    navigate(ROUTE_PATH.NOTIFICATIONS);
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
          {!isCreate && <p className="text-sm text-muted-foreground">{original.title}</p>}
        </div>
      </div>

      <div className="space-y-5 rounded-xl border bg-card p-6 shadow-sm">
        <Field label="Tiêu đề">
          <Input value={form.title ?? ""} disabled={readOnly} onChange={(e) => set("title", e.target.value)} />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Kênh gửi">
            <Select value={form.channel} onValueChange={(v) => set("channel", v)} disabled={readOnly}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CHANNEL_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Phân khúc khách">
            <Select value={form.tier} onValueChange={(v) => set("tier", v)} disabled={readOnly}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIER_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>

        <Field label="Nội dung">
          <Textarea rows={4} value={form.body ?? ""} disabled={readOnly} onChange={(e) => set("body", e.target.value)} />
        </Field>
      </div>

      {!readOnly && (
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => navigate(ROUTE_PATH.NOTIFICATIONS)}>
            {TEXT.cancel}
          </Button>
          <Button onClick={handleSend} disabled={!form.title.trim() || !form.body.trim()} className="gap-1.5">
            <Send className="size-4" />
            {TEXT.save}
          </Button>
        </div>
      )}
    </div>
  );
}
