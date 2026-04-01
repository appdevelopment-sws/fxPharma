import { Link } from "react-router"

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-2xl border bg-white p-8 text-center shadow-sm">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
          Access Restricted
        </p>
        <h1 className="mt-3 text-2xl font-semibold text-slate-900">
          You do not have access to this page
        </h1>
        <p className="mt-3 text-sm text-slate-600">
          Your account is authenticated, but your role does not match this
          section.
        </p>
        <Link
          to="/admin/dashboard"
          className="mt-6 inline-flex rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white"
        >
          Go back to your dashboard
        </Link>
      </div>
    </div>
  )
}
