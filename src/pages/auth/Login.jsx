import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "react-router";
import { Loader2, LogIn, Mail, Lock } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { ROUTE_PATH } from "@/constants/routePaths";

const schema = z.object({
  email: z
    .string()
    .min(1, "Vui lòng nhập email")
    .email("Email không hợp lệ"),
  password: z
    .string()
    .min(6, "Mật khẩu tối thiểu 6 ký tự"),
  remember: z.boolean().optional(),
});

export default function Login() {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "", remember: true },
  });

  const onSubmit = async (values) => {
    setLoading(true);
    try {
      // TODO: replace with AuthenticationApi.login(values) when backend is available
      await new Promise((resolve) => setTimeout(resolve, 600));
      const mockUser = {
        id: "u-001",
        name: "Admin SipPoint",
        email: values.email,
        role: "admin",
      };
      const mockToken = "demo-token-" + Math.random().toString(36).slice(2);
      login({ user: mockUser, token: mockToken });
      toast.success("Đăng nhập thành công");
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Đăng nhập thất bại. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-secondary">Đăng nhập</h2>
        <p className="text-sm text-muted-foreground">
          Chào mừng quay trở lại! Vui lòng đăng nhập để tiếp tục.
        </p>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4"
          noValidate
        >
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
                      type="password"
                      placeholder="••••••••"
                      autoComplete="current-password"
                      {...field}
                    />
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
                <label className="flex cursor-pointer items-center gap-2 text-muted-foreground">
                  <Checkbox
                    checked={!!field.value}
                    onCheckedChange={field.onChange}
                  />
                  Ghi nhớ đăng nhập
                </label>
              )}
            />
            <a href="#" className="font-medium text-primary hover:underline">
              Quên mật khẩu?
            </a>
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

      <p className="text-center text-sm text-muted-foreground">
        Chưa có tài khoản?{" "}
        <Link
          to={ROUTE_PATH.SIGNUP}
          className="font-semibold text-primary hover:underline"
        >
          Đăng ký ngay
        </Link>
      </p>
    </div>
  );
}
