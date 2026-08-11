import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Pencil, Loader2, Upload, ImagePlus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ROUTE_PATH } from "@/constants/routePaths";
import { CategoryApi, ProductsApi, UploadApi, MaterialApi, RecipeApi } from "@/apis";
import { RecipeEditor } from "./RecipeEditor";
import { TEXT } from "./constants";

const UPLOAD_FOLDER = "products";
const MAX_IMAGE_MB = 5;

const pickImageValue = (data) =>
  data?.secureUrl ||
  data?.secure_url ||
  data?.url ||
  data?.imageUrl ||
  data?.publicId ||
  data?.public_id ||
  "";

const STATUS_OPTIONS = [
  { value: "active", label: "Đang bán" },
  { value: "inactive", label: "Tạm ngưng" },
];

const normalizeStatus = (v) => (v === "active" || v === true ? "active" : "inactive");

const DEFAULT_SIZES = [
  { name: "S", active: false, priceAdjustment: 0 },
  { name: "M", active: false, priceAdjustment: 0 },
  { name: "L", active: false, priceAdjustment: 0 },
  { name: "XL", active: false, priceAdjustment: 0 },
];

const EMPTY = {
  name: "",
  category: "",
  price: "",
  stock: "",
  image: "",
  description: "",
  isActive: "active",
  sizes: JSON.parse(JSON.stringify(DEFAULT_SIZES)),
};

function Field({ label, required, children }) {
  return (
    <div className="space-y-1.5">
      <Label>
        {label}
        {required ? <span className="text-destructive"> *</span> : null}
      </Label>
      {children}
    </div>
  );
}

const inputCls =
  "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50";

export default function MenuDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const qc = useQueryClient();

  const isCreate = id === "new";
  const [mode, setMode] = useState(
    isCreate ? "create" : location.state?.mode ?? "view"
  );
  const readOnly = mode === "view";

  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Công thức (định mức nguyên liệu) của món
  const [recipeItems, setRecipeItems] = useState([]);
  const hadRecipeRef = useRef(false);

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await CategoryApi.getAll();
      return res?.data?.success ? res.data.data || [] : [];
    },
    staleTime: 5 * 60_000,
  });

  const {
    data: product,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["product", id],
    enabled: !isCreate,
    queryFn: async () => {
      const res = await ProductsApi.getById(id);
      if (!res?.data?.success) {
        throw new Error(res?.data?.message || TEXT.notFound);
      }
      return res.data.data;
    },
  });

  // Danh sách nguyên liệu để chọn trong công thức
  const { data: materials = [] } = useQuery({
    queryKey: ["materials", "all-for-recipe"],
    queryFn: async () => {
      const res = await MaterialApi.getAll({ page: 1, limit: 500 });
      return res?.data?.success ? res.data.data?.materials || [] : [];
    },
    staleTime: 5 * 60_000,
  });

  // Công thức hiện có của món (khi xem/sửa)
  const { data: recipe } = useQuery({
    queryKey: ["recipe", id],
    enabled: !isCreate,
    queryFn: async () => {
      const res = await RecipeApi.getByProduct(id);
      return res?.data?.success ? res.data.data : null;
    },
  });

  // Khả năng phục vụ hiện tại theo tồn nguyên liệu - chỉ có ý nghĩa với món đã có công thức
  const { data: availability } = useQuery({
    queryKey: ["product-availability", id],
    enabled: !isCreate && recipeItems.length > 0,
    queryFn: async () => {
      const res = await RecipeApi.availability([id]);
      return res?.data?.success ? (res.data.data || [])[0] : null;
    },
  });

  useEffect(() => {
    if (isCreate) {
      setRecipeItems([]);
      hadRecipeRef.current = false;
      return;
    }
    if (recipe?.items) {
      setRecipeItems(
        recipe.items.map((it) => ({
          materialId: it.materialId?._id || it.materialId,
          quantity: it.quantity,
        }))
      );
      hadRecipeRef.current = recipe.items.length > 0;
    }
  }, [isCreate, recipe]);

  useEffect(() => {
    if (isCreate) {
      setForm(JSON.parse(JSON.stringify(EMPTY)));
      return;
    }
    if (product) {
      const productSizes = product.variants?.filter(v => v.variantType === 'size') || [];
      const mergedSizes = DEFAULT_SIZES.map(def => {
        const found = productSizes.find(p => p.name === def.name);
        if (found) {
          return { name: def.name, active: true, priceAdjustment: found.priceAdjustment };
        }
        return { ...def };
      });
      productSizes.forEach(ps => {
         if (!mergedSizes.find(m => m.name === ps.name)) {
             mergedSizes.push({ name: ps.name, active: true, priceAdjustment: ps.priceAdjustment });
         }
      });

      setForm({
        name: product.name ?? "",
        category: product.category?._id ?? product.category ?? "",
        price: product.price ?? "",
        stock: product.stock ?? "",
        image: product.image ?? "",
        description: product.description ?? "",
        isActive: normalizeStatus(product.isActive),
        sizes: mergedSizes,
      });
    }
  }, [isCreate, product]);

  const set = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (error) setError("");
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const variants = (form.sizes || [])
        .filter(s => s.active)
        .map(s => ({ variantType: "size", name: s.name, priceAdjustment: Number(s.priceAdjustment) || 0 }));

      // Món có công thức: tồn kho do hệ thống tự tính theo nguyên liệu (xem Kho & Nguyên
      // liệu), không gửi field stock để tránh ghi đè giá trị đang được hệ thống quản lý.
      const hasRecipe = recipeItems.length > 0;
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        image: form.image.trim(),
        category: form.category,
        isActive: form.isActive,
        variants: variants,
        ...(!hasRecipe && form.stock !== "" ? { stock: Number(form.stock) } : {}),
      };
      const res = isCreate
        ? await ProductsApi.create(payload)
        : await ProductsApi.update(id, payload);
      if (!res?.data?.success) {
        throw new Error(res?.data?.message || "Lưu món thất bại.");
      }

      // Đồng bộ công thức nguyên liệu sau khi lưu món
      const productId = isCreate ? res.data.data?._id : id;
      const cleanItems = (recipeItems || [])
        .filter((r) => r.materialId && Number(r.quantity) > 0)
        .map((r) => ({ materialId: r.materialId, quantity: Number(r.quantity) }));

      if (productId) {
        if (cleanItems.length > 0) {
          const rRes = await RecipeApi.upsert(productId, { items: cleanItems });
          if (!rRes?.data?.success) {
            throw new Error(rRes?.data?.message || "Lưu công thức thất bại.");
          }
        } else if (hadRecipeRef.current) {
          // Trước có công thức, nay xoá hết -> gỡ công thức
          await RecipeApi.remove(productId);
        }
      }

      return res.data;
    },
    onSuccess: (res) => {
      toast.success(res?.message || (isCreate ? "Đã thêm món." : "Đã cập nhật món."));
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["product", id] });
      qc.invalidateQueries({ queryKey: ["recipe", id] });
      navigate(ROUTE_PATH.MENU);
    },
    onError: (err) => toast.error(err.message),
  });

  const handleUpload = async (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn tệp ảnh.");
      return;
    }
    if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
      toast.error(`Ảnh tối đa ${MAX_IMAGE_MB}MB.`);
      return;
    }
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", UPLOAD_FOLDER);
    setUploading(true);
    try {
      const res = await UploadApi.cloudinaryFile(fd);
      if (!res?.data?.success) {
        throw new Error(res?.data?.message || "Tải ảnh lên thất bại.");
      }
      const value = pickImageValue(res.data.data);
      if (!value) throw new Error("Không nhận được đường dẫn ảnh từ máy chủ.");
      set("image", value);
      toast.success("Đã tải ảnh lên.");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = () => {
    if (!form.name.trim()) return setError("Vui lòng nhập tên món.");
    if (!form.category) return setError("Vui lòng chọn danh mục.");
    if (form.price === "" || Number(form.price) < 0)
      return setError("Vui lòng nhập giá bán hợp lệ.");
    if (!form.image) return setError("Vui lòng tải lên ảnh món.");
    saveMutation.mutate();
  };

  if (!isCreate && isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="mr-2 size-5 animate-spin" />
        Đang tải...
      </div>
    );
  }

  if (!isCreate && (isError || !product)) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <p>{TEXT.notFound}</p>
        <Button variant="link" onClick={() => navigate(ROUTE_PATH.MENU)}>
          {TEXT.back}
        </Button>
      </div>
    );
  }

  const title = isCreate
    ? TEXT.createTitle
    : readOnly
    ? TEXT.detailTitle
    : TEXT.editTitle;

  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">
            {TEXT.pageTitle} / {title}
          </p>
          <h1 className="text-2xl font-semibold">{title}</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(ROUTE_PATH.MENU)}>
            <ArrowLeft className="size-4" /> {TEXT.back}
          </Button>
          {readOnly && (
            <Button onClick={() => setMode("edit")}>
              <Pencil className="size-4" /> {TEXT.edit}
            </Button>
          )}
        </div>
      </div>

      {error ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      {/* Thông tin chung + Hình ảnh */}
      <div className="grid gap-6 rounded-xl border border-border bg-card p-6 lg:grid-cols-2">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Thông tin chung</h2>
          <Field label={TEXT.fieldName} required>
            <input
              type="text"
              value={form.name}
              disabled={readOnly}
              onChange={(e) => set("name", e.target.value)}
              className={inputCls}
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label={TEXT.fieldCategory} required>
              <Select
                value={form.category || ""}
                onValueChange={(v) => set("category", v)}
                disabled={readOnly}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Chọn danh mục" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c._id} value={c._id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label={TEXT.fieldPrice} required>
              <input
                type="number"
                value={form.price}
                disabled={readOnly}
                onChange={(e) => set("price", e.target.value)}
                className={inputCls}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label={TEXT.fieldStock}>
              {recipeItems.length > 0 ? (
                <div className="flex h-9 items-center rounded-md border border-dashed border-border bg-muted/30 px-3 text-sm text-muted-foreground">
                  {isCreate
                    ? "Tự động tính theo nguyên liệu sau khi lưu"
                    : availability
                    ? `Còn làm được ${availability.makeable ?? 0} phần (theo nguyên liệu)`
                    : "Tự động tính theo nguyên liệu"}
                </div>
              ) : (
                <input
                  type="number"
                  value={form.stock}
                  disabled={readOnly}
                  onChange={(e) => set("stock", e.target.value)}
                  className={inputCls}
                />
              )}
            </Field>

            <Field label={TEXT.fieldStatus}>
              {readOnly ? (
                <div className="pt-1">
                  {form.isActive === "active" ? (
                    <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      Đang bán
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Tạm ngưng</Badge>
                  )}
                </div>
              ) : (
                <Select
                  value={form.isActive}
                  onValueChange={(v) => set("isActive", v)}
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </Field>
          </div>

          <Field label={TEXT.fieldDescription} required>
            <textarea
              value={form.description}
              disabled={readOnly}
              onChange={(e) => set("description", e.target.value)}
              rows={3}
              className="flex w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            />
          </Field>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Hình ảnh</h2>
          <div className="space-y-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                handleUpload(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
            <button
              type="button"
              disabled={readOnly || uploading}
              onClick={() => fileInputRef.current?.click()}
              className="group relative flex h-40 w-full items-center justify-center overflow-hidden rounded-xl border border-dashed border-border bg-muted/30 text-sm text-muted-foreground transition-colors enabled:hover:border-primary/60 enabled:hover:bg-muted/50 disabled:cursor-default"
            >
              {typeof form.image === "string" && form.image.startsWith("http") ? (
                <img
                  src={form.image}
                  alt={form.name}
                  className="h-full w-full object-contain"
                />
              ) : (
                <span className="flex flex-col items-center gap-1.5">
                  <ImagePlus className="size-6" />
                  {readOnly ? "Ảnh món (chưa có)" : "Bấm để chọn ảnh"}
                </span>
              )}
              {uploading && (
                <span className="absolute inset-0 flex items-center justify-center gap-2 bg-background/70 text-foreground">
                  <Loader2 className="size-4 animate-spin" />
                  Đang tải ảnh...
                </span>
              )}
            </button>
            {!readOnly && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="mr-1.5 size-3.5" />
                {form.image ? "Đổi ảnh khác" : "Tải ảnh lên"}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Tuỳ chọn Size */}
      <div className="space-y-3 rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold">Tuỳ chọn Size</h2>
        <div className="flex flex-wrap gap-4">
          {form.sizes?.map((size, idx) => (
            <div key={size.name} className="flex items-center gap-2">
              <Button
                type="button"
                variant={size.active ? "default" : "outline"}
                size="sm"
                disabled={readOnly}
                className={`h-8 rounded-full px-4 ${size.active ? 'bg-primary' : ''}`}
                onClick={() => {
                  const newSizes = [...form.sizes];
                  newSizes[idx].active = !newSizes[idx].active;
                  set("sizes", newSizes);
                }}
              >
                {size.name}
              </Button>
              {size.active && (
                <div className="flex items-center gap-1">
                  <span className="text-xs text-muted-foreground">+</span>
                  <input
                    type="number"
                    placeholder="Giá cộng thêm"
                    disabled={readOnly}
                    value={size.priceAdjustment}
                    onChange={(e) => {
                      const newSizes = [...form.sizes];
                      newSizes[idx].priceAdjustment = e.target.value;
                      set("sizes", newSizes);
                    }}
                    className="h-8 w-24 rounded-md border border-input bg-background px-2 py-1 text-xs shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                  <span className="text-xs text-muted-foreground">đ</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Công thức */}
      <div className="space-y-3 rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold">Công thức (định mức nguyên liệu)</h2>
        <RecipeEditor
          value={recipeItems}
          onChange={setRecipeItems}
          readOnly={readOnly}
          materials={materials}
        />
      </div>

      {/* Footer buttons */}
      {!readOnly && (
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            disabled={saveMutation.isPending}
            onClick={() =>
              isCreate ? navigate(ROUTE_PATH.MENU) : setMode("view")
            }
          >
            {TEXT.cancel}
          </Button>
          <Button onClick={handleSave} disabled={saveMutation.isPending}>
            {saveMutation.isPending ? (
              <Loader2 className="mr-1.5 size-4 animate-spin" />
            ) : null}
            {isCreate ? TEXT.create : TEXT.save}
          </Button>
        </div>
      )}
    </div>
  );
}
