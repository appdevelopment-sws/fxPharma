"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { loginSchema } from "@/validations/admin/loginValidation"
import { useLogin } from "@/hooks/authHook"

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<loginSchema>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
  })

  const loginMutation = useLogin()

  const onSubmit = (data: loginSchema) => {
    loginMutation.mutate(data)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>
            Enter your workspace and credentials to sign in
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="tenantSlug">Workspace</Label>
              <Input
                id="tenantSlug"
                placeholder="acme-pharmacy"
                {...register("tenantSlug")}
              />
              {errors.tenantSlug && (
                <p className="text-sm text-destructive">
                  {errors.tenantSlug.message}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register("email")} />
              {errors.email && (
                <p className="text-sm text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" {...register("password")} />
              {errors.password && (
                <p className="text-sm text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Logging in..." : "Login"}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            Don’t have an account?{" "}
            <a
              href="/admin/register"
              className="underline underline-offset-4 hover:text-foreground"
            >
              Sign up
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
