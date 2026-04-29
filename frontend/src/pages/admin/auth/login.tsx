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

      <div className="flex min-h-screen w-full bg-background font-sans selection:bg-primary/10 selection:text-primary overflow-hidden">
        
        {/* Left Column - Branding / Visual */}
        <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-slate-900 via-indigo-950 to-indigo-900 p-12 flex-col justify-between relative overflow-hidden">
          
          <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
            <div className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] rounded-full bg-indigo-500 mix-blend-screen blur-[100px] animate-blob" />
            <div className="absolute top-[40%] -right-[10%] w-[70%] h-[70%] rounded-full bg-violet-600 mix-blend-screen blur-[100px] animate-blob" style={{ animationDelay: '2s' }} />
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 text-white mb-20 animate-drop-in-center">
              <div className="bg-gradient-to-br from-indigo-500 to-violet-600 p-2.5 rounded-xl shadow-lg shadow-indigo-500/30">
                <Pill className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold tracking-tight">PharmaAdmin</span>
            </div>

            <div className="space-y-6 max-w-lg">
              <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-indigo-200 leading-[1.15] tracking-tight animate-shatter-top-left delay-100">
                Welcome back to your pharmacy dashboard.
              </h1>
              <p className="text-lg text-indigo-200/80 leading-relaxed font-light animate-shatter-bottom-left delay-200">
                Sign in to manage your inventory, track sales, and oversee staff operations from your secure workspace.
              </p>
            </div>
          </div>

          <div className="relative z-10 grid grid-cols-2 gap-6 mt-12">
            <div className="flex flex-col gap-3 p-5 rounded-2xl bg-white/[0.03] border border-white/[0.05] backdrop-blur-md transition-colors hover:bg-white/[0.05] animate-shatter-bottom-left delay-300 [&>div]:animate-float">
              <div className="bg-indigo-500/20 w-fit p-2 rounded-lg">
                <Activity className="w-5 h-5 text-indigo-300" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white mb-1">Performance Tracking</h3>
                <p className="text-xs text-indigo-300/80 leading-relaxed">Detailed insights into your daily sales and order volume.</p>
              </div>
            </div>
            <div className="flex flex-col gap-3 p-5 rounded-2xl bg-white/[0.03] border border-white/[0.05] backdrop-blur-md transition-colors hover:bg-white/[0.05] animate-shatter-bottom-right delay-400 [&>div]:animate-float">
              <div className="bg-violet-500/20 w-fit p-2 rounded-lg">
                <ShieldCheck className="w-5 h-5 text-violet-300" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white mb-1">Secure Session</h3>
                <p className="text-xs text-indigo-300/80 leading-relaxed">Encrypted authentication to keep your data safe.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative bg-background">
          
          <div className="absolute top-0 right-0 -z-10 w-full h-full opacity-50 pointer-events-none">
            <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[100px]" />
          </div>

          <div className="w-full max-w-[420px] space-y-8">
            
            <div className="space-y-3 text-center lg:text-left">
              <div className="lg:hidden flex justify-center mb-8 animate-drop-in-center">
                <div className="bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-950/20 dark:to-violet-950/20 p-4 rounded-2xl shadow-sm border border-border">
                  <Lock className="w-8 h-8 text-primary" />
                </div>
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight text-foreground animate-shatter-top-right delay-150">
                Sign in to PharmaAdmin
              </h2>
              <p className="text-muted-foreground text-sm animate-shatter-top-left delay-200">
                Enter your credentials to access your dashboard.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              
              <div className="space-y-2 animate-shatter-top-right delay-300">
                <Label htmlFor="email">Work Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@pharmacy.com"
                  className={cn("h-12 rounded-xl bg-muted/30 border-border focus:bg-background", errors.email && "border-destructive/50 bg-destructive/5")}
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-xs font-medium text-destructive mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2 animate-shatter-top-left delay-400">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <a href="#" className="text-xs font-medium text-primary hover:opacity-80">
                    Forgot password?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className={cn("h-12 rounded-xl bg-muted/30 border-border focus:bg-background", errors.password && "border-destructive/50 bg-destructive/5")}
                  {...register("password")}
                />
                {errors.password && (
                  <p className="text-xs font-medium text-destructive mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="pt-2 animate-drop-in-center delay-600">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-12 rounded-xl font-bold bg-primary text-primary-foreground hover:opacity-90 shadow-md hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 active:scale-[0.98]"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-primary-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing in...
                    </span>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </div>
            </form>

            <p className="text-center text-sm text-muted-foreground font-medium animate-shatter-bottom-right delay-700">
              Don't have an account?{" "}
              <Link
                to="/admin/register"
                className="text-primary hover:underline transition-colors font-bold"
              >
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
