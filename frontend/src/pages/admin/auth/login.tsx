import React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Pill, Activity, ShieldCheck, Lock } from "lucide-react"
import { loginSchema } from "@/validations/admin/loginValidation"
import { useLogin } from "@/hooks/authHook"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Link } from "react-router"
import { cn } from "@/lib/utils"
import { Eye, EyeOff } from "lucide-react"
import { useState } from "react"
export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
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
    <>
      <style>{`
        /* Refined 3D Shatter & Snap Animations */
        @keyframes shatterTopLeft {
          0% { opacity: 0; transform: translate(-150px, -100px) rotate3d(1, 1, 0, -45deg) scale(0.8); filter: blur(12px); }
          100% { opacity: 1; transform: translate(0, 0) rotate3d(0, 0, 0, 0) scale(1); filter: blur(0); }
        }
        @keyframes shatterTopRight {
          0% { opacity: 0; transform: translate(150px, -100px) rotate3d(1, -1, 0, 45deg) scale(0.8); filter: blur(12px); }
          100% { opacity: 1; transform: translate(0, 0) rotate3d(0, 0, 0, 0) scale(1); filter: blur(0); }
        }
        @keyframes shatterBottomLeft {
          0% { opacity: 0; transform: translate(-150px, 100px) rotate3d(-1, 1, 0, 45deg) scale(1.1); filter: blur(12px); }
          100% { opacity: 1; transform: translate(0, 0) rotate3d(0, 0, 0, 0) scale(1); filter: blur(0); }
        }
        @keyframes shatterBottomRight {
          0% { opacity: 0; transform: translate(150px, 100px) rotate3d(-1, -1, 0, -45deg) scale(1.1); filter: blur(12px); }
          100% { opacity: 1; transform: translate(0, 0) rotate3d(0, 0, 0, 0) scale(1); filter: blur(0); }
        }
        @keyframes dropInCenter {
          0% { opacity: 0; transform: scale(1.5) translateY(-20px); filter: blur(15px); }
          100% { opacity: 1; transform: scale(1) translateY(0); filter: blur(0); }
        }
        @keyframes shiftBg {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        /* Ambient Animations */
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }

        /* Animation Classes */
        .animate-shatter-top-left { animation: shatterTopLeft 1s cubic-bezier(0.2, 1.2, 0.4, 1) forwards; opacity: 0; }
        .animate-shatter-top-right { animation: shatterTopRight 1s cubic-bezier(0.2, 1.2, 0.4, 1) forwards; opacity: 0; }
        .animate-shatter-bottom-left { animation: shatterBottomLeft 1s cubic-bezier(0.2, 1.2, 0.4, 1) forwards; opacity: 0; }
        .animate-shatter-bottom-right { animation: shatterBottomRight 1s cubic-bezier(0.2, 1.2, 0.4, 1) forwards; opacity: 0; }
        .animate-drop-in-center { animation: dropInCenter 1s cubic-bezier(0.2, 1.2, 0.4, 1) forwards; opacity: 0; }
        
        .animate-float { animation: float 5s ease-in-out infinite; }
        .animate-blob { animation: blob 12s infinite alternate; }
        .animate-gradient { animation: shiftBg 3s ease infinite; }
        
        /* Staggered Delays */
        .delay-100 { animation-delay: 100ms; }
        .delay-150 { animation-delay: 150ms; }
        .delay-200 { animation-delay: 200ms; }
        .delay-300 { animation-delay: 300ms; }
        .delay-400 { animation-delay: 400ms; }
        .delay-500 { animation-delay: 500ms; }
        .delay-600 { animation-delay: 600ms; }
        .delay-700 { animation-delay: 700ms; }
        .delay-800 { animation-delay: 800ms; }
      `}</style>

      <div className="flex min-h-screen w-full overflow-hidden bg-background font-sans selection:bg-primary/10 selection:text-primary">
        {/* Left Column - Branding / Visual */}
        <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-indigo-900 p-12 lg:flex">
          <div className="pointer-events-none absolute top-0 left-0 h-full w-full opacity-20">
            <div className="animate-blob absolute -top-[10%] -left-[10%] h-[60%] w-[60%] rounded-full bg-indigo-500 mix-blend-screen blur-[100px]" />
            <div
              className="animate-blob absolute top-[40%] -right-[10%] h-[70%] w-[70%] rounded-full bg-violet-600 mix-blend-screen blur-[100px]"
              style={{ animationDelay: "2s" }}
            />
          </div>

          <div className="relative z-10">
            <div className="animate-drop-in-center mb-20 flex items-center gap-3 text-white">
              <img
                src="/logo.png"
                alt="Ojas Pharmacy Logo"
                className="h-24 w-auto rounded-lg bg-white object-contain p-2"
              />
              <span className="text-2xl font-bold tracking-tight"></span>
            </div>

            <div className="max-w-lg space-y-6">
              <h1 className="animate-shatter-top-left bg-gradient-to-r from-white to-indigo-200 bg-clip-text text-5xl leading-[1.15] font-extrabold tracking-tight text-transparent delay-100">
                Welcome back to your pharmacy dashboard.
              </h1>
              <p className="animate-shatter-bottom-left text-lg leading-relaxed font-light text-indigo-200/80 delay-200">
                Sign in to manage your inventory, track sales, and oversee staff
                operations from your secure workspace.
              </p>
            </div>
          </div>

          <div className="relative z-10 mt-12 grid grid-cols-2 gap-6">
            <div className="animate-shatter-bottom-left [&>div]:animate-float flex flex-col gap-3 rounded-2xl border border-white/[0.05] bg-white/[0.03] p-5 backdrop-blur-md transition-colors delay-300 hover:bg-white/[0.05]">
              <div className="w-fit rounded-lg bg-indigo-500/20 p-2">
                <Activity className="h-5 w-5 text-indigo-300" />
              </div>
              <div>
                <h3 className="mb-1 text-sm font-semibold text-white">
                  Performance Tracking
                </h3>
                <p className="text-xs leading-relaxed text-indigo-300/80">
                  Detailed insights into your daily sales and order volume.
                </p>
              </div>
            </div>
            <div className="animate-shatter-bottom-right [&>div]:animate-float flex flex-col gap-3 rounded-2xl border border-white/[0.05] bg-white/[0.03] p-5 backdrop-blur-md transition-colors delay-400 hover:bg-white/[0.05]">
              <div className="w-fit rounded-lg bg-violet-500/20 p-2">
                <ShieldCheck className="h-5 w-5 text-violet-300" />
              </div>
              <div>
                <h3 className="mb-1 text-sm font-semibold text-white">
                  Secure Session
                </h3>
                <p className="text-xs leading-relaxed text-indigo-300/80">
                  Encrypted authentication to keep your data safe.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Form */}
        <div className="relative flex w-full items-center justify-center bg-background p-6 sm:p-12 lg:w-1/2">
          <div className="pointer-events-none absolute top-0 right-0 -z-10 h-full w-full opacity-50">
            <div className="absolute top-[-10%] right-[-5%] h-[40%] w-[40%] rounded-full bg-primary/5 blur-[100px]" />
          </div>

          <div className="w-full max-w-[420px] space-y-8">
            <div className="space-y-3 text-center lg:text-left">
              <div className="animate-drop-in-center mb-8 flex justify-center lg:hidden">
                <img
                  src="/logo.png"
                  alt="Ojas Pharmacy Logo"
                  className="h-14 w-auto rounded-2xl border border-border bg-white object-contain p-2 shadow-sm"
                />
              </div>
              <h2 className="animate-shatter-top-right text-3xl font-extrabold tracking-tight text-foreground delay-150">
                Sign in to Ojas Pharmacy
              </h2>
              <p className="animate-shatter-top-left text-sm text-muted-foreground delay-200">
                Enter your credentials to access your dashboard.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="animate-shatter-top-right space-y-2 delay-300">
                <Label htmlFor="email">Work Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@pharmacy.com"
                  className={cn(
                    "h-12 rounded-xl border-border bg-muted/30 focus:bg-background",
                    errors.email && "border-destructive/50 bg-destructive/5"
                  )}
                  {...register("email")}
                />
                {errors.email && (
                  <p className="mt-1 text-xs font-medium text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="animate-shatter-top-left space-y-2 delay-400">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <a
                    href="#"
                    className="text-xs font-medium text-primary hover:opacity-80"
                  >
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className={cn(
                      "h-12 rounded-xl border-border bg-muted/30 pr-10 focus:bg-background",
                      errors.password &&
                        "border-destructive/50 bg-destructive/5"
                    )}
                    {...register("password")}
                  />

                  {/* Eye Button */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-primary"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>

                {errors.password && (
                  <p className="mt-1 text-xs font-medium text-destructive">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="animate-drop-in-center pt-2 delay-600">
                <Button
                  type="submit"
                  disabled={loginMutation.isPending}
                  className="h-12 w-full rounded-xl bg-primary font-bold text-primary-foreground shadow-md transition-all duration-300 hover:opacity-90 hover:shadow-xl hover:shadow-primary/20 active:scale-[0.98]"
                >
                  {loginMutation.isPending ? (
                    <span className="flex items-center gap-2">
                      <svg
                        className="mr-2 -ml-1 h-4 w-4 animate-spin text-primary-foreground"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Signing in...
                    </span>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </div>
            </form>

            {/* <p className="animate-shatter-bottom-right text-center text-sm font-medium text-muted-foreground delay-700">
              Don't have an account?{" "}
              <Link
                to="/admin/register"
                className="font-bold text-primary transition-colors hover:underline"
              >
                Create an account
              </Link>
            </p> */}
          </div>
        </div>
      </div>
    </>
  )
}
