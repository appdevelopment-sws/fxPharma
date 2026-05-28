import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Lock, User, Eye, EyeOff, ArrowRight } from "lucide-react"
import { loginSchema } from "@/validations/admin/loginValidation"
import { useLogin } from "@/hooks/authHook"
import { cn } from "@/lib/utils"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
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
        /* Dynamic Theme Color Codes defined as CSS variables first, then used dynamically */
        .login-page {
          --login-bg: #08080a;
          --login-card-from: #2b1c12;
          --login-card-via: #141110;
          --login-card-to: #0c0c0e;
          --login-primary: #ff7a00;
          --login-primary-hover: #e06c00;
          --login-primary-glow: rgba(255, 122, 0, 0.15);
          --login-text-primary: #ffffff;
          --login-text-muted: #86868b;
          --login-input-bg: #161618;
          --login-input-border: #27272a;
          --login-input-focus: #ff7a00;
          
          font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }

        /* Ambient floating light blob animations for background */
        @keyframes floatBlob1 {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -40px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        @keyframes floatBlob2 {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          50% { transform: translate(-20px, 30px) scale(1.05); }
        }
        @keyframes pulseSlow {
          0%, 100% { opacity: 0.8; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.06); }
        }

        /* Premium entrance animations */
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 4px 20px rgba(255, 122, 0, 0.2); }
          50% { box-shadow: 0 4px 32px rgba(255, 122, 0, 0.4); }
        }

        .animate-blob-1 { animation: floatBlob1 18s infinite alternate ease-in-out; }
        .animate-blob-2 { animation: floatBlob2 22s infinite alternate ease-in-out; }
        .animate-pulse-slow { animation: pulseSlow 8s infinite ease-in-out; }
        
        .animate-slide-left { opacity: 0; animation: slideInLeft 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-slide-right { opacity: 0; animation: slideInRight 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-slide-up { opacity: 0; animation: slideInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-slide-down { opacity: 0; animation: slideInDown 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-pulse-glow { animation: pulseGlow 3s infinite ease-in-out; }

        /* Delays */
        .delay-100 { animation-delay: 100ms; }
        .delay-200 { animation-delay: 200ms; }
        .delay-300 { animation-delay: 300ms; }
        .delay-400 { animation-delay: 400ms; }
        .delay-500 { animation-delay: 500ms; }
        .delay-600 { animation-delay: 600ms; }

        /* Stars & Twinkling Stars */
        @keyframes twinkle {
          0%, 100% { opacity: 0.15; transform: scale(0.8); }
          50% { opacity: 0.85; transform: scale(1.25); }
        }
        .star {
          position: absolute;
          background-color: rgba(255, 255, 255, 0.95);
          border-radius: 50%;
          pointer-events: none;
          z-index: 1;
        }
        .star-sm { width: 1.2px; height: 1.2px; box-shadow: 0 0 3px rgba(255, 255, 255, 0.3); }
        .star-md { width: 2px; height: 2px; box-shadow: 0 0 5px rgba(255, 255, 255, 0.5); }
        .star-lg { width: 3px; height: 3px; box-shadow: 0 0 7px rgba(255, 255, 255, 0.8); }

        .star-twinkle-1 { animation: twinkle 3s infinite ease-in-out; }
        .star-twinkle-2 { animation: twinkle 5s infinite ease-in-out; }
        .star-twinkle-3 { animation: twinkle 7s infinite ease-in-out; }

        /* Shooting Stars (Tuta Tara) */
        .shooting-star {
          position: absolute;
          width: 80px;
          height: 1.5px;
          background: linear-gradient(90deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0) 100%);
          transform-origin: left;
          pointer-events: none;
          opacity: 0;
          z-index: 1;
        }

        @keyframes shoot {
          0% {
            transform: translate(0, 0) rotate(-35deg) scaleX(0);
            opacity: 0;
          }
          1.5% {
            opacity: 0.8;
            transform: translate(-100px, 70px) rotate(-35deg) scaleX(1.2);
          }
          3% {
            transform: translate(-250px, 175px) rotate(-35deg) scaleX(0);
            opacity: 0;
          }
          100% {
            transform: translate(-250px, 175px) rotate(-35deg) scaleX(0);
            opacity: 0;
          }
        }
      `}</style>

      <div className="login-page min-h-screen w-full bg-[var(--login-bg)] text-white flex flex-col lg:flex-row overflow-hidden selection:bg-[var(--login-primary)]/20 selection:text-[var(--login-primary)] relative">
        
        {/* Left Column - Full Height Branding Banner with coppery-orange gradient from the screenshot */}
        <div className="relative hidden lg:flex lg:w-1/2 p-16 flex-col justify-between overflow-hidden border-r border-white/5 bg-gradient-to-br from-[#2b1c12] via-[#141110] to-[#0c0c0e] animate-slide-left">
          
          {/* Twinkling stars on the left banner (increased density & size variations) */}
          <div className="star star-sm star-twinkle-1" style={{ top: "8%", left: "15%" }} />
          <div className="star star-md star-twinkle-2" style={{ top: "25%", left: "45%" }} />
          <div className="star star-lg star-twinkle-3" style={{ top: "72%", left: "12%" }} />
          <div className="star star-sm star-twinkle-1" style={{ top: "60%", left: "38%" }} />
          <div className="star star-md star-twinkle-2" style={{ top: "45%", left: "82%" }} />
          <div className="star star-lg star-twinkle-3" style={{ top: "88%", left: "65%" }} />
          <div className="star star-sm star-twinkle-2" style={{ top: "18%", left: "28%" }} />
          <div className="star star-md star-twinkle-1" style={{ top: "35%", left: "10%" }} />
          <div className="star star-sm star-twinkle-3" style={{ top: "52%", left: "55%" }} />
          <div className="star star-md star-twinkle-2" style={{ top: "80%", left: "30%" }} />
          <div className="star star-lg star-twinkle-1" style={{ top: "15%", left: "75%" }} />
          <div className="star star-sm star-twinkle-3" style={{ top: "68%", left: "88%" }} />
          <div className="star star-md star-twinkle-1" style={{ top: "92%", left: "18%" }} />
          <div className="star star-sm star-twinkle-2" style={{ top: "30%", left: "90%" }} />

          {/* Shooting Stars on the left banner (increased frequency) */}
          <div className="shooting-star" style={{ top: "12%", right: "12%", animation: "shoot 10s infinite ease-in-out", animationDelay: "1s" }} />
          <div className="shooting-star" style={{ top: "32%", right: "20%", animation: "shoot 12s infinite ease-in-out", animationDelay: "4s" }} />
          <div className="shooting-star" style={{ top: "55%", right: "25%", animation: "shoot 14s infinite ease-in-out", animationDelay: "7s" }} />
          <div className="shooting-star" style={{ top: "78%", right: "10%", animation: "shoot 11s infinite ease-in-out", animationDelay: "9s" }} />

          {/* Animated internal warmth glow blob */}
          <div className="absolute top-[-15%] left-[-15%] w-[70%] h-[70%] rounded-full bg-orange-600/10 blur-[95px] animate-pulse-slow pointer-events-none" />
          
          {/* Top Logo / Brand Info */}
          <div className="relative z-10 flex items-center gap-5 animate-slide-down">
            <div className="h-24 w-24 rounded-2xl bg-white border border-neutral-200 flex items-center justify-center p-3 shadow-md">
              <img
                src="/logo.png"
                alt="Ojas Pharmacy Logo"
                className="h-18 w-18 object-contain"
                onError={(e) => {
                  console.error("Logo image failed to load");
                }}
              />
            </div>
            <span className="text-3xl font-extrabold tracking-wider text-white">
              OJAS <span className="text-[var(--login-primary)]">PHARMACY</span>
            </span>
          </div>

          {/* Middle Marketing Copy */}
          <div className="relative z-10 space-y-6 my-auto pt-8 pb-8">
            <div className="animate-slide-left delay-100">
              <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider text-[var(--login-primary)] bg-[var(--login-primary-glow)] border border-[var(--login-primary)]/20 mb-6">
                Enterprise Ready
              </div>
              <h1 className="text-5xl xl:text-6xl font-extrabold leading-tight text-white tracking-tight">
                Intelligence at the <br />
                <span className="text-[var(--login-primary)] relative">
                  Core
                </span>{" "}
                of Pharmacy.
              </h1>
            </div>
            <p className="text-base xl:text-lg leading-relaxed font-light text-[var(--login-text-muted)] max-w-[460px] animate-slide-left delay-200">
              Securely manage inventory, billing, doctor prescriptions, and supplier settlements in one unified cloud ecosystem.
            </p>
          </div>

          {/* Bottom Statistics */}
          <div className="relative z-10 grid grid-cols-2 gap-6 border-t border-white/5 pt-8 animate-slide-up delay-300">
            <div>
              <div className="text-4xl font-bold text-white tracking-tight">500+</div>
              <div className="text-[10px] text-[var(--login-text-muted)] font-bold uppercase tracking-widest mt-1">
                Stores Integrated
              </div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white tracking-tight">1M+</div>
              <div className="text-[10px] text-[var(--login-text-muted)] font-bold uppercase tracking-widest mt-1">
                Prescriptions Monthly
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Full Height Login Form Canvas */}
        <div className="relative w-full lg:w-1/2 min-h-screen flex items-center justify-center p-8 sm:p-12 md:p-16 bg-[#08080a] animate-slide-right delay-100">
          
          {/* Twinkling stars on the right form side (increased density & size variations) */}
          <div className="star star-md star-twinkle-2" style={{ top: "10%", left: "35%" }} />
          <div className="star star-lg star-twinkle-3" style={{ top: "32%", left: "82%" }} />
          <div className="star star-sm star-twinkle-1" style={{ top: "82%", left: "55%" }} />
          <div className="star star-md star-twinkle-2" style={{ top: "90%", left: "75%" }} />
          <div className="star star-lg star-twinkle-3" style={{ top: "48%", left: "88%" }} />
          <div className="star star-sm star-twinkle-1" style={{ top: "68%", left: "22%" }} />
          <div className="star star-sm star-twinkle-2" style={{ top: "5%", left: "15%" }} />
          <div className="star star-md star-twinkle-3" style={{ top: "20%", left: "60%" }} />
          <div className="star star-sm star-twinkle-1" style={{ top: "42%", left: "10%" }} />
          <div className="star star-md star-twinkle-2" style={{ top: "60%", left: "95%" }} />
          <div className="star star-lg star-twinkle-1" style={{ top: "75%", left: "45%" }} />
          <div className="star star-sm star-twinkle-3" style={{ top: "15%", left: "80%" }} />
          <div className="star star-md star-twinkle-1" style={{ top: "55%", left: "68%" }} />
          <div className="star star-sm star-twinkle-2" style={{ top: "85%", left: "32%" }} />

          {/* Shooting Stars on the right form side (increased frequency) */}
          <div className="shooting-star" style={{ top: "8%", right: "18%", animation: "shoot 9s infinite ease-in-out", animationDelay: "2s" }} />
          <div className="shooting-star" style={{ top: "28%", right: "32%", animation: "shoot 11s infinite ease-in-out", animationDelay: "5s" }} />
          <div className="shooting-star" style={{ top: "62%", right: "30%", animation: "shoot 13s infinite ease-in-out", animationDelay: "8s" }} />
          <div className="shooting-star" style={{ top: "80%", right: "15%", animation: "shoot 10s infinite ease-in-out", animationDelay: "11s" }} />

          {/* Subtle Background Glow Blobs on Form Side */}
          <div className="absolute top-[-10%] left-[20%] w-[50%] h-[50%] rounded-full bg-orange-600/[0.015] blur-[120px] pointer-events-none animate-blob-1" />
          <div className="absolute bottom-[-10%] right-[10%] w-[60%] h-[60%] rounded-full bg-violet-600/[0.01] blur-[120px] pointer-events-none animate-blob-2" />
          
          <div className="w-full max-w-[420px] space-y-8 relative z-10">
            
            {/* Header Info */}
            <div className="space-y-2 text-center lg:text-left">
              {/* Mobile-only Logo */}
              <div className="flex justify-center lg:hidden mb-8 animate-slide-down">
                <div className="h-24 w-24 rounded-[24px] bg-white border border-neutral-200 flex items-center justify-center p-3.5 shadow-md">
                  <img
                    src="/logo.png"
                    alt="Ojas Pharmacy Logo"
                    className="h-18 w-18 object-contain"
                  />
                </div>
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight text-white">
                Welcome Back
              </h2>
              <p className="text-sm text-[var(--login-text-muted)] font-light">
                Please enter your credentials to access the pharmacy dashboard.
              </p>
            </div>

            {/* Form container */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              
              {/* Identity Input */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-[10px] font-bold tracking-wider text-[var(--login-text-muted)] uppercase">
                  Identity
                </label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-[var(--login-primary)] transition-colors duration-200">
                    <User className="h-5 w-5" />
                  </span>
                  <input
                    id="email"
                    type="email"
                    placeholder="Email or 10-digit Phone"
                    className={cn(
                      "h-12 w-full pl-12 pr-4 rounded-xl border border-[var(--login-input-border)] bg-[var(--login-input-bg)] text-white placeholder-zinc-600 focus:outline-none focus:border-[var(--login-input-focus)] focus:ring-1 focus:ring-[var(--login-input-focus)] transition-all duration-200",
                      errors.email && "border-red-500/50 focus:border-red-500 focus:ring-red-500"
                    )}
                    {...register("email")}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs font-medium text-red-500 mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Secret Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-[10px] font-bold tracking-wider text-[var(--login-text-muted)] uppercase">
                    Secret
                  </label>
                  <a
                    href="#"
                    className="text-xs font-semibold text-[var(--login-primary)] hover:brightness-110 transition-all"
                  >
                    Forgot Password?
                  </a>
                </div>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-[var(--login-primary)] transition-colors duration-200">
                    <Lock className="h-5 w-5" />
                  </span>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className={cn(
                      "h-12 w-full pl-12 pr-11 rounded-xl border border-[var(--login-input-border)] bg-[var(--login-input-bg)] text-white placeholder-zinc-600 focus:outline-none focus:border-[var(--login-input-focus)] focus:ring-1 focus:ring-[var(--login-input-focus)] transition-all duration-200",
                      errors.password && "border-red-500/50 focus:border-red-500 focus:ring-red-500"
                    )}
                    {...register("password")}
                  />
                  
                  {/* Toggle password visibility */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors duration-200"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs font-medium text-red-500 mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center gap-3 pt-1">
                <div className="relative flex items-center justify-center h-5 w-5">
                  <input
                    type="checkbox"
                    id="remember"
                    className="peer absolute inset-0 rounded border border-[var(--login-input-border)] bg-[var(--login-input-bg)] text-[var(--login-primary)] cursor-pointer appearance-none transition-all duration-200 checked:bg-[var(--login-primary)] checked:border-[var(--login-primary)]"
                  />
                  <svg
                    className="absolute h-3 w-3 text-white pointer-events-none hidden peer-checked:block"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="4"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <label
                  htmlFor="remember"
                  className="text-sm font-medium text-[var(--login-text-muted)] cursor-pointer select-none hover:text-white transition-colors duration-200"
                >
                  Remember my account
                </label>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loginMutation.isPending}
                  className="h-12 w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[var(--login-primary)] to-[#e06c00] text-white font-bold tracking-wide transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer animate-pulse-glow hover:brightness-105 active:scale-[0.98]"
                >
                  {loginMutation.isPending ? (
                    <span className="flex items-center gap-2">
                      <svg
                        className="animate-spin h-5 w-5 text-white"
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
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Signing in...
                    </span>
                  ) : (
                    <>
                      Sign into Dashboard
                      <ArrowRight className="h-4 w-4 stroke-[2.5]" />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Contact Admin Text */}
            <p className="text-center text-xs text-[var(--login-text-muted)] font-medium pt-4 animate-slide-up delay-600">
              Please contact administration for access.
            </p>
          </div>
        </div>

      </div>
    </>
  )
}
