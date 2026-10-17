import { useRef, useState, type ReactNode } from "react"

import {
  ArrowLeft,
  ArrowRight,
  CircleAlert,
  Eye,
  EyeOff,
  Info,
  ShieldCheck,
  X,
} from "lucide-react"

import { Button, Chip, Field } from "./DesignSystem"

import { login, register, requestPasswordReset, type User } from "./api"

export type DemoUser = User

export const emailLooksValid = (value: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())

export const phoneLooksValid = (value: string) =>
  /^(?:0|\+?62)8\d{8,11}$/.test(value.replace(/[\s()-]/g, ""))

export function isTechnicianRoute(route: string) {
  return /^(?:dashboard-tukang(?:\?|$)|pesanan-tukang\/)/.test(route)
}

export function isProtectedRoute(route: string) {
  return /^(?:pesan\/|lacak\/|pesanan-saya(?:\?|$)|profil(?:\?|$)|dashboard-tukang(?:\?|$)|pesanan-tukang\/)/.test(
    route,
  )
}

export function safeReturnRoute(value: string | null) {
  if (!value) return "pesanan-saya"

  if (
    /^(?:pesan\/\d+|lacak\/[A-Za-z0-9-]+|pesanan-saya|profil|dashboard-tukang|pesanan-tukang\/[A-Za-z0-9-]+|untuk-tukang|daftar-tukang)$/.test(
      value,
    )
  ) {
    return value
  }

  return "pesanan-saya"
}

export function validateLogin(identity: string, password: string) {
  return {
    identity: !identity.trim()
      ? "Email atau nomor HP belum diisi."
      : !emailLooksValid(identity) && !phoneLooksValid(identity)
        ? "Tulis email atau nomor HP yang benar ya."
        : "",
    password: password.length < 8 ? "Kata sandi minimal 8 karakter." : "",
  }
}

export type RegisterValues = {
  name: string
  email: string
  phone: string
  password: string
  agreed: boolean
}

export function validateRegister(values: RegisterValues) {
  return {
    name: !values.name.trim() ? "Nama lengkap belum diisi." : "",

    email: !values.email.trim()
      ? "Email belum diisi."
      : !emailLooksValid(values.email)
        ? "Tulis email yang benar ya."
        : "",

    phone: !values.phone.trim()
      ? "Nomor HP belum diisi."
      : !phoneLooksValid(values.phone)
        ? "Tulis nomor HP yang benar ya."
        : "",

    password:
      values.password.length < 8 ? "Kata sandi minimal 8 karakter." : "",

    agreed: !values.agreed ? "Setujui Syarat & Ketentuan dulu ya." : "",
  }
}

function AuthCard({
  title,
  subtitle,
  info,
  children,
}: {
  title: string
  subtitle: string
  info?: string
  children: ReactNode
}) {
  return (
    <main className="container auth-page">
      <section className="auth-card">
        {info && (
          <div className="auth-info" role="status">
            <Info size={20} />
            <p>{info}</p>
          </div>
        )}
        <a
          href="#beranda"
          className="auth-logo"
          aria-label="Ke beranda barangku"
        >
          <img src="/logo-barangku.png" alt="Logo asli Barangku" />
        </a>
        <h2>{title}</h2>
        <p className="auth-subtitle">{subtitle}</p>
        {children}
        <div className="auth-demo-note">
          <ShieldCheck size={16} />
          <p>
            Ini akun demo. Pakai data contoh ya.
            <br />
            Kata sandi kamu tidak disimpan.
          </p>
        </div>
      </section>
    </main>
  )
}

function PasswordField({
  value,
  onChange,
  error,
  register = false,
}: {
  value: string
  onChange: (value: string) => void
  error?: string
  register?: boolean
}) {
  const [visible, setVisible] = useState(false)

  return (
    <Field
      name="password"
      label="Kata sandi"
      type={visible ? "text" : "password"}
      placeholder="Minimal 8 karakter"
      autoComplete={register ? "new-password" : "current-password"}
      value={value}
      onValueChange={onChange}
      error={error}
      suffix={
        <Button
          type="button"
          variant="ghost"
          aria-label={
            visible ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"
          }
          aria-pressed={visible}
          onClick={() => setVisible(!visible)}
        >
          {visible ? <EyeOff size={20} /> : <Eye size={20} />}
        </Button>
      }
    />
  )
}

function focusError() {
  requestAnimationFrame(() =>
    document
      .querySelector<HTMLElement>('.auth-card [aria-invalid="true"]')
      ?.focus(),
  )
}

export default function Auth({
  mode,
  next,
  protectedInfo,
  onLogin,
  navigate,
}: {
  mode: "masuk" | "daftar"
  next?: string
  protectedInfo?: boolean
  onLogin: (user: User, destination: string) => void
  navigate: (path: string) => void
}) {
  const [identity, setIdentity] = useState("")

  const [password, setPassword] = useState("")

  const [loginErrors, setLoginErrors] = useState({ identity: "", password: "" })

  const isTechnicianTarget =
    !!next &&
    (next.includes("dashboard-tukang") ||
      next.includes("pesanan-tukang") ||
      next.includes("tukang"))

  const [loginRole, setLoginRole] = useState<"pelanggan" | "tukang">(
    isTechnicianTarget ? "tukang" : "pelanggan",
  )

  const [role, setRole] = useState<"pelanggan" | "tukang">("pelanggan")

  const [values, setValues] = useState<RegisterValues>({
    name: "",
    email: "",
    phone: "",
    password: "",
    agreed: false,
  })

  const [errors, setErrors] =
    useState<Partial<Record<keyof RegisterValues, string>>>({})

  const [loading, setLoading] = useState(false)

  const [apiError, setApiError] = useState("")

  const terms = useRef<HTMLDialogElement>(null)

  const destination = safeReturnRoute(next ?? null)

  const target = (path: string) =>
    `${path}${next ? `?next=${encodeURIComponent(next)}` : ""}`

  const registerField = (key: "name" | "email" | "phone") => ({
    name: key,
    value: values[key],
    error: errors[key],
    onValueChange: (value: string) => {
      setValues((prev) => ({ ...prev, [key]: value }))
      setErrors((prev) => ({ ...prev, [key]: undefined }))
    },
  })

  const submitLogin = async () => {
    const invalid = validateLogin(identity, password)
    setLoginErrors(invalid)

    if (Object.values(invalid).some(Boolean)) {
      focusError()
      return
    }

    setLoading(true)

    setApiError("")

    try {
      const loggedUser = await login(identity, password, loginRole)

      const dest = next
        ? destination
        : loginRole === "tukang"
          ? "dashboard-tukang"
          : "pesanan-saya"

      onLogin(loggedUser, dest)
    } catch {
      setApiError("Ada yang salah. Coba lagi ya.")
    } finally {
      setLoading(false)
    }
  }

  const submitRegister = async () => {
    const invalid = validateRegister(values)
    setErrors(invalid)

    if (Object.values(invalid).some(Boolean)) {
      focusError()
      return
    }

    setLoading(true)

    setApiError("")

    try {
      const newUser = await register({
        name: values.name,

        email: values.email,

        phone: values.phone,

        role,

        password: values.password,

        agreed: values.agreed,
      })

      onLogin(newUser, role === "tukang" ? "daftar-tukang" : destination)
    } catch {
      setApiError("Ada yang salah. Coba lagi ya.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthCard
      title={mode === "masuk" ? "Masuk ke barangku" : "Daftar akun barangku"}
      subtitle={
        mode === "masuk"
          ? "Masuk dulu biar bisa lanjut ya."
          : "Biar barang kamu punya kesempatan kedua."
      }
      info={
        protectedInfo
          ? "Masuk dulu ya, biar akun dan datamu terhubung."
          : undefined
      }
    >
      {mode === "masuk" ? (
        <>
          <div className="auth-role chips">
            <Chip
              label="Aku pelanggan"
              selected={loginRole === "pelanggan"}
              onClick={() => setLoginRole("pelanggan")}
            />
            <Chip
              label="Aku tukang"
              selected={loginRole === "tukang"}
              onClick={() => setLoginRole("tukang")}
            />
          </div>
          <form
            className="auth-form"
            noValidate
            onSubmit={(e) => {
              e.preventDefault()
              submitLogin()
            }}
          >
            <Field
              name="identity"
              label="Email atau nomor HP"
              placeholder="Contoh: rina@email.com atau 0812-0000-0000"
              autoComplete="username"
              value={identity}
              onValueChange={(v) => {
                setIdentity(v)
                setLoginErrors((prev) => ({ ...prev, identity: "" }))
                setApiError("")
              }}
              error={loginErrors.identity}
            />
            <PasswordField
              value={password}
              onChange={(v) => {
                setPassword(v)
                setLoginErrors((prev) => ({ ...prev, password: "" }))
                setApiError("")
              }}
              error={loginErrors.password}
            />
            <a className="forgot-link" href={`#${target("lupa-sandi")}`}>
              Lupa kata sandi?
            </a>
            {apiError && (
              <p className="error-text" role="alert">
                <CircleAlert size={14} />
                {apiError}
              </p>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                "Memuat..."
              ) : (
                <>
                  Masuk <ArrowRight size={18} />
                </>
              )}
            </Button>
            <p className="auth-switch">
              Belum punya akun? <a href={`#${target("daftar")}`}>Daftar</a>
            </p>
          </form>
        </>
      ) : (
        <>
          <div className="auth-role chips">
            <Chip
              label="Aku pelanggan"
              selected={role === "pelanggan"}
              onClick={() => setRole("pelanggan")}
            />
            <Chip
              label="Aku tukang"
              selected={role === "tukang"}
              onClick={() => setRole("tukang")}
            />
          </div>
          <form
            className="auth-form"
            noValidate
            onSubmit={(e) => {
              e.preventDefault()
              submitRegister()
            }}
          >
            <Field
              label="Nama lengkap"
              placeholder="Contoh: Rina Ayu"
              autoComplete="name"
              {...registerField("name")}
            />
            <Field
              label="Email"
              type="email"
              placeholder="Contoh: rina@email.com"
              autoComplete="email"
              {...registerField("email")}
            />
            <Field
              label="Nomor HP"
              type="tel"
              placeholder="Contoh: 0812-0000-0000"
              autoComplete="tel"
              {...registerField("phone")}
            />
            <PasswordField
              register
              value={values.password}
              onChange={(v) => {
                setValues((prev) => ({ ...prev, password: v }))
                setErrors((prev) => ({ ...prev, password: undefined }))
                setApiError("")
              }}
              error={errors.password}
            />
            <div className="terms-field">
              <div className="terms-checkbox">
                <input
                  id="agree-terms"
                  type="checkbox"
                  checked={values.agreed}
                  aria-invalid={!!errors.agreed}
                  aria-describedby={errors.agreed ? "terms-error" : undefined}
                  onChange={(e) => {
                    setValues((prev) => ({ ...prev, agreed: e.target.checked }))
                    setErrors((prev) => ({ ...prev, agreed: undefined }))
                    setApiError("")
                  }}
                />
                <label htmlFor="agree-terms">Aku setuju dengan</label>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => terms.current?.showModal()}
                >
                  Syarat & Ketentuan
                </Button>
              </div>
              {errors.agreed && (
                <p id="terms-error" className="terms-error">
                  <CircleAlert size={14} />
                  {errors.agreed}
                </p>
              )}
            </div>
            {apiError && (
              <p className="error-text" role="alert">
                <CircleAlert size={14} />
                {apiError}
              </p>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                "Memuat..."
              ) : (
                <>
                  {role === "tukang" ? "Lanjut daftar jadi tukang" : "Daftar"}
                  <ArrowRight size={18} />
                </>
              )}
            </Button>
            <p className="auth-switch">
              Sudah punya akun? <a href={`#${target("masuk")}`}>Masuk</a>
            </p>
          </form>
        </>
      )}
      <dialog
        ref={terms}
        className="contact-dialog"
        aria-labelledby="terms-title"
      >
        <div className="contact-heading">
          <h2 id="terms-title">Syarat & Ketentuan</h2>
          <Button
            autoFocus
            variant="ghost"
            aria-label="Tutup syarat dan ketentuan"
            onClick={() => terms.current?.close()}
          >
            <X size={20} />
          </Button>
        </div>
        <p>
          Ini prototipe barangku. Akun, pesanan, dan kontak hanya contoh; belum
          ada layanan atau pembayaran sungguhan.
        </p>
        <p className="terms-dialog-note">
          Kamu tidak perlu memasukkan data pribadi atau kata sandi asli. Biaya
          servis nantinya disepakati langsung dengan tukang sebelum perbaikan.
        </p>
      </dialog>
    </AuthCard>
  )
}

export function ForgotPassword({ next }: { next?: string }) {
  const [identity, setIdentity] = useState("")

  const [error, setError] = useState("")

  const [loading, setLoading] = useState(false)

  const [apiError, setApiError] = useState("")

  const [done, setDone] = useState(false)

  const submitForgot = async (e: React.FormEvent) => {
    e.preventDefault()

    const invalid = validateLogin(identity, "contoh123").identity

    setError(invalid)

    if (invalid) {
      focusError()
      return
    }

    setLoading(true)

    setApiError("")

    try {
      await requestPasswordReset(identity)

      setDone(true)
    } catch {
      setApiError("Ada yang salah. Coba lagi ya.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthCard
      title="Lupa kata sandi?"
      subtitle="Tenang, kamu bisa coba alurnya di sini."
    >
      {done ? (
        <div className="auth-info" role="status">
          <Info size={20} />
          <p>
            Permintaan contoh kamu sudah dicatat. Di prototipe ini belum ada
            email atau SMS yang dikirim.
          </p>
        </div>
      ) : (
        <form className="auth-form" noValidate onSubmit={submitForgot}>
          <Field
            label="Email atau nomor HP"
            value={identity}
            onValueChange={(value) => {
              setIdentity(value)
              setError("")
              setApiError("")
            }}
            error={error}
            placeholder="Email atau nomor HP kamu"
          />
          {apiError && (
            <p className="error-text" role="alert">
              <CircleAlert size={14} />
              {apiError}
            </p>
          )}
          <Button className="w-full" type="submit" disabled={loading}>
            {loading ? "Memuat..." : "Coba pulihkan akun"}
          </Button>
        </form>
      )}
      <a
        className="auth-back-link"
        href={`#masuk${next ? `?next=${encodeURIComponent(next)}` : ""}`}
      >
        <ArrowLeft size={16} /> Kembali ke Masuk
      </a>
    </AuthCard>
  )
}
