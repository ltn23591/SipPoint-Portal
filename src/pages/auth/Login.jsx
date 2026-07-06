import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, LogIn, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/useAuth";
import { AuthenticationApi } from "@/apis";
import { CODE_KEY } from "@/constants/application";

const schema = z.object({
  email: z.string().min(1, "Vui lòng nhập email").email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
  remember: z.boolean().optional(),
});

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "", remember: true },
  });

  const onSubmit = async (values) => {
    setLoading(true);
    try {
      const res = await AuthenticationApi.login({
        email: values.email,
        password: values.password,
      });

      if (!res) {
        toast.error("Không thể kết nối máy chủ. Vui lòng thử lại.");
        return;
      }

      const body = res.data;
      if (res.status === CODE_KEY.BAD_REQUEST) {
        toast.error(body?.message || "Thông tin không hợp lệ. Vui lòng kiểm tra lại.");
        return;
      }
      if (res.status === CODE_KEY.UNAUTHORIZED_STATUS) {
        toast.error(body?.message || "Sai email hoặc mật khẩu.");
        return;
      }

      if (body?.success && body?.token) {
        login({ user: body.data, token: body.token });
        toast.success(body.message || "Đăng nhập thành công");
      } else {
        toast.error(body?.message || "Đăng nhập thất bại. Vui lòng thử lại.");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Đăng nhập thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-secondary">Đăng nhập</h2>
        <p className="text-sm text-muted-foreground">
          Nhập thông tin tài khoản để truy cập hệ thống.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <InputGroup className="h-10">
                    <InputGroupAddon align="inline-start">
                      <Mail className="size-4" />
                    </InputGroupAddon>
                    <InputGroupInput
                      placeholder="ban@sippoint.vn"
                      autoComplete="email"
                      {...field}
                    />
                  </InputGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mật khẩu</FormLabel>
                <FormControl>
                  <InputGroup className="h-10">
                    <InputGroupAddon align="inline-start">
                      <Lock className="size-4" />
                    </InputGroupAddon>
                    <InputGroupInput
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      {...field}
                    />
                    <InputGroupAddon align="inline-end">
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </InputGroupAddon>
                  </InputGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex items-center justify-between text-sm">
            <FormField
              control={form.control}
              name="remember"
              render={({ field }) => (
                <label className="flex cursor-pointer items-center gap-2 text-muted-foreground select-none">
                  <Checkbox
                    checked={!!field.value}
                    onCheckedChange={field.onChange}
                  />
                  Ghi nhớ đăng nhập
                </label>
              )}
            />
            <button
              type="button"
              onClick={() => toast.info("Vui lòng liên hệ quản trị viên để đặt lại mật khẩu.")}
              className="font-medium text-primary hover:underline"
            >
              Quên mật khẩu?
            </button>
          </div>

          <Button
            type="submit"
            size="lg"
            className="h-11 w-full text-base"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <LogIn className="size-4" />
            )}
            Đăng nhập
          </Button>
        </form>
      </Form>
    </div>
  );
}
