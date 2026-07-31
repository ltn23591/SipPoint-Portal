import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Image, Link as LinkIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { BannerApi, UploadApi } from "@/apis";

export default function Banners() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, item: null });

  // Form State
  const [title, setTitle] = useState("");
  const [image, setImage] = useState("");
  const [link, setLink] = useState("");
  const [isActive, setIsActive] = useState("active");
  const [isUploading, setIsUploading] = useState(false);

  const { data: banners = [], isLoading } = useQuery({
    queryKey: ["banners"],
    queryFn: async () => {
      const res = await BannerApi.getAll();
      return res?.data?.data || res?.data || [];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (payload) => {
      if (editingBanner) {
        return await BannerApi.update(editingBanner._id, payload);
      }
      return await BannerApi.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["banners"]);
      toast.success(editingBanner ? "Cập nhật banner thành công!" : "Tạo banner mới thành công!");
      handleCloseModal();
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || err?.message || "Lỗi lưu banner.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      return await BannerApi.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["banners"]);
      toast.success("Xóa banner thành công!");
      setDeleteDialog({ open: false, item: null });
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || err?.message || "Lỗi xóa banner.");
    },
  });

  const handleOpenCreate = () => {
    setEditingBanner(null);
    setTitle("");
    setImage("");
    setLink("");
    setIsActive("active");
    setModalOpen(true);
  };

  const handleOpenEdit = (b) => {
    setEditingBanner(b);
    setTitle(b.title || "");
    setImage(b.image || "");
    setLink(b.link || "");
    setIsActive(b.isActive || "active");
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingBanner(null);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "banners");
      const res = await UploadApi.cloudinaryFile(formData);
      const url = res?.data?.data?.secure_url || res?.data?.data?.url || res?.data?.url;
      if (url) {
        setImage(url);
        toast.success("Tải ảnh lên thành công!");
      } else {
        toast.error("Không nhận được URL ảnh từ server.");
      }
    } catch (err) {
      toast.error("Tải ảnh lên thất bại: " + (err?.response?.data?.message || err?.message || ""));
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !image.trim()) {
      toast.warning("Vui lòng nhập tiêu đề và chọn ảnh banner.");
      return;
    }
    saveMutation.mutate({
      title,
      image,
      link,
      isActive,
    });
  };

  const handleToggleActive = (b) => {
    const nextStatus = b.isActive === "active" ? "inactive" : "active";
    BannerApi.update(b._id, { isActive: nextStatus }).then(() => {
      queryClient.invalidateQueries(["banners"]);
      toast.success(`Đã ${nextStatus === "active" ? "bật" : "tắt"} banner "${b.title}"`);
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Banner Quảng cáo"
        description="Quản lý hình ảnh ưu đãi và banner quảng cáo động trên ứng dụng khách hàng."
        actions={
          <Button size="sm" onClick={handleOpenCreate} className="gap-1.5">
            <Plus className="size-4" />
            Thêm Banner mới
          </Button>
        }
      />

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      ) : banners.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Image className="mx-auto size-12 opacity-30 mb-2" />
            <p className="text-base font-semibold">Chưa có Banner quảng cáo nào</p>
            <p className="text-xs text-muted-foreground mt-1">Bấm nút "Thêm Banner mới" để tạo banner hiển thị cho khách hàng.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {banners.map((b) => {
            const enabled = b.isActive === "active";
            return (
              <Card key={b._id} className="overflow-hidden flex flex-col justify-between">
                <div className="relative aspect-[21/9] bg-muted overflow-hidden border-b">
                  {b.image ? (
                    <img src={b.image} alt={b.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      <Image className="size-8 opacity-40" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <Badge variant={enabled ? "success" : "secondary"}>
                      {enabled ? "Đang bật" : "Đã tắt"}
                    </Badge>
                  </div>
                </div>

                <CardContent className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-semibold text-base text-foreground line-clamp-1">{b.title}</h3>
                    {b.link && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1 truncate">
                        <LinkIcon className="size-3 shrink-0" />
                        {b.link}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={enabled}
                        onCheckedChange={() => handleToggleActive(b)}
                      />
                      <span className="text-xs text-muted-foreground">{enabled ? "Bật" : "Tắt"}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleOpenEdit(b)}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => setDeleteDialog({ open: true, item: b })}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingBanner ? "Chỉnh sửa Banner" : "Thêm Banner mới"}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="title">Tiêu đề Banner <span className="text-destructive">*</span></Label>
              <Input
                id="title"
                placeholder="Nhân đôi điểm thưởng tuần này!"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label>Hình ảnh Banner <span className="text-destructive">*</span></Label>
              {image ? (
                <div className="relative aspect-[21/9] rounded-lg overflow-hidden border">
                  <img src={image} alt="Preview" className="w-full h-full object-cover" />
                  <Button
                    type="button"
                    variant="destructive"
                    size="xs"
                    className="absolute top-2 right-2"
                    onClick={() => setImage("")}
                  >
                    Xóa ảnh
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isUploading}
                  />
                  {isUploading && <Loader2 className="size-4 animate-spin text-primary" />}
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="link">Link liên kết (Tùy chọn)</Label>
              <Input
                id="link"
                placeholder="/vouchers hoặc https://..."
                value={link}
                onChange={(e) => setLink(e.target.value)}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={handleCloseModal}>
                Hủy
              </Button>
              <Button type="submit" disabled={saveMutation.isPending || isUploading}>
                {saveMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
                {editingBanner ? "Lưu thay đổi" : "Tạo Banner"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog((s) => ({ ...s, open }))}
        title="Xóa Banner"
        description={deleteDialog.item ? `Bạn có chắc chắn muốn xóa banner "${deleteDialog.item.title}"?` : ""}
        confirmText="Xác nhận xóa"
        cancelText="Hủy"
        variant="destructive"
        loading={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate(deleteDialog.item._id)}
      />
    </div>
  );
}
