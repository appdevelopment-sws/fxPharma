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
import {
  registerSchema,
  type RegisterSchema,
} from "@/validations/admin/registerValidation"
import { useRegister } from "@/hooks/authHook"

export default function Register() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
  })

  const registerMutation = useRegister()

  const onSubmit = (data: RegisterSchema) => {
    registerMutation.mutate(data)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create your workspace</CardTitle>
          <CardDescription>
            Set up your pharmacy tenant and admin account
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input id="companyName" {...register("companyName")} />
              {errors.companyName && (
                <p className="text-sm text-destructive">
                  {errors.companyName.message}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="companySlug">Workspace Slug</Label>
              <Input
                id="companySlug"
                placeholder="acme-pharmacy"
                {...register("companySlug")}
              />
              {errors.companySlug && (
                <p className="text-sm text-destructive">
                  {errors.companySlug.message}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" {...register("name")} />
              {errors.name && (
                <p className="text-sm text-destructive">
                  {errors.name.message}
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

            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                {...register("confirmPassword")}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Creating workspace..." : "Create Workspace"}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <a
              href="/admin/login"
              className="underline underline-offset-4 hover:text-foreground"
            >
              Sign in
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
