import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router";
import { Loader2, UserPlus, User, Mail, Phone, Lock } from "lucide-react";
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
import { ROUTE_PATH } from "@/constants/routePaths";
import { isPhoneVN } from "@/helpers/validators";

const schema = z
  .object({
    name: z.string().min(2, "Họ tên tối thiểu 2 ký tự"),
    email: z.string().min(1, "Vui lòng nhập email").email("Email không hợp lệ"),
    phone: z
      .string()
      .min(1, "Vui lòng nhập số điện thoại")
      .refine(isPhoneVN, "Số điện thoại không hợp lệ"),
    password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
    confirm: z.string().min(1, "Vui lòng xác nhận mật khẩu"),
  })
  .refine((data) => data.password === data.confirm, {
    path: ["confirm"],
    message: "Mật khẩu xác nhận không khớp",
  });

export default function Signup() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      confirm: "",
    },
  });

  const onSubmit = async () => {
    setLoading(true);
    try {
      // TODO: replace with AuthenticationApi.signup(values) when backend is available
      await new Promise((resolve) => setTimeout(resolve, 600));
      toast.success("Tạo tài khoản thành công. Vui lòng đăng nhập.");
      navigate(ROUTE_PATH.LOGIN);
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Đăng ký thất bại. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-secondary">Tạo tài khoản</h2>
        <p className="text-sm text-muted-foreground">
          Bắt đầu hành trình quản lý cửa hàng của bạn với SipPoint.
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
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Họ và tên</FormLabel>
                <FormControl>
                  <InputGroup className="h-10">
                    <InputGroupAddon align="inline-start">
                      <User className="size-4" />
                    </InputGroupAddon>
                    <InputGroupInput
                      placeholder="Nguyễn Văn A"
                      autoComplete="name"
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
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Số điện thoại</FormLabel>
                <FormControl>
                  <InputGroup className="h-10">
                    <InputGroupAddon align="inline-start">
                      <Phone className="size-4" />
                    </InputGroupAddon>
                    <InputGroupInput
                      placeholder="0901234567"
                      autoComplete="tel"
                      {...field}
                    />
                  </InputGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                        autoComplete="new-password"
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
              name="confirm"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Xác nhận</FormLabel>
                  <FormControl>
                    <InputGroup className="h-10">
                      <InputGroupAddon align="inline-start">
                        <Lock className="size-4" />
                      </InputGroupAddon>
                      <InputGroupInput
                        type="password"
                        placeholder="••••••••"
                        autoComplete="new-password"
                        {...field}
                      />
                    </InputGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
              <UserPlus className="size-4" />
            )}
            Tạo tài khoản
          </Button>
        </form>
      </Form>

      <p className="text-center text-sm text-muted-foreground">
        Đã có tài khoản?{" "}
        <Link
          to={ROUTE_PATH.LOGIN}
          className="font-semibold text-primary hover:underline"
        >
          Đăng nhập
        </Link>
      </p>
    </div>
  );
}
