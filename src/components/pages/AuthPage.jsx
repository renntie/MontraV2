import { useState } from 'react'
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/atoms/Button'
import { MontraLogo } from '@/components/atoms/MontraLogo'
import { Input } from '@/components/atoms/Input'
import { useAuthStore } from '@/store/authStore'

export const AuthPage = () => {
  const { signInWithEmail, signUpWithEmail, signInWithGoogle, loading, error } = useAuthStore()
  const [mode,         setMode]         = useState('login')
  const [email,        setEmail]        = useState('')
  const [password,     setPassword]     = useState('')
  const [fullName,     setFullName]     = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [localError,   setLocalError]   = useState('')
  const [success,      setSuccess]      = useState('')

  const handleSubmit = async () => {
    setLocalError('')
    setSuccess('')
    try {
      if (mode === 'login') {
        await signInWithEmail(email, password)
      } else {
        if (!fullName.trim()) { setLocalError('Masukkan nama lengkap'); return }
        await signUpWithEmail(email, password, fullName)
        setSuccess('Cek email Anda untuk konfirmasi akun ✓')
      }
    } catch (err) {
      setLocalError(err.message)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSubmit()
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px]
        rounded-full bg-accent-income/3 blur-3xl pointer-events-none -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96
        rounded-full bg-accent-blue/3 blur-3xl pointer-events-none translate-y-1/2 translate-x-1/2" />

      <div className="w-full max-w-sm relative z-10">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8 animate-fade-in-up">
          <div className="relative mb-1">
            <MontraLogo size="xl" showText={false} />
            <Sparkles size={14} className="absolute -top-1 -right-1 text-accent-yellow animate-float" />
          </div>
          <h1 className="text-2xl font-extrabold text-text-primary tracking-tight mt-3">Montra</h1>
          <p className="text-sm text-text-muted mt-1">Kelola keuangan dengan cerdas 💰</p>
        </div>

        {/* Card */}
        <div className="bg-bg-surface border border-border rounded-3xl p-6 space-y-4
          shadow-float animate-fade-in-up" style={{ animationDelay: '80ms' }}>

          {/* Tabs */}
          <div className="flex gap-1 bg-bg-elevated rounded-2xl p-1">
            {[['login', 'Masuk'], ['signup', 'Daftar']].map(([val, label]) => (
              <button
                key={val}
                onClick={() => { setMode(val); setLocalError(''); setSuccess('') }}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-250 ${
                  mode === val
                    ? 'bg-bg-overlay text-text-primary shadow-card scale-[1.02]'
                    : 'text-text-muted hover:text-text-secondary'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Fields */}
          <div className="space-y-3">
            {mode === 'signup' && (
              <div className="animate-fade-in-down">
                <Input
                  label="Nama Lengkap"
                  icon={User}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Nama Anda"
                  autoComplete="name"
                />
              </div>
            )}

            <Input
              label="Email"
              icon={Mail}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="nama@email.com"
              autoComplete="email"
            />

            <Input
              label="Password"
              icon={Lock}
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="••••••••"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              rightIcon={
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-text-muted hover:text-text-primary transition-all duration-150 hover:scale-110"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              }
            />
          </div>

          {/* Error / Success */}
          {(localError || error) && (
            <div className="flex items-start gap-2 text-xs text-accent-expense
              bg-accent-expense/8 border border-accent-expense/15 rounded-xl px-3 py-2.5
              animate-scale-in">
              <span className="mt-0.5 flex-shrink-0">⚠️</span>
              <span>{localError || error}</span>
            </div>
          )}
          {success && (
            <div className="flex items-start gap-2 text-xs text-accent-income
              bg-accent-income/8 border border-accent-income/15 rounded-xl px-3 py-2.5
              animate-scale-in">
              <span className="mt-0.5 flex-shrink-0">✓</span>
              <span>{success}</span>
            </div>
          )}

          {/* Submit */}
          <Button
            onClick={handleSubmit}
            loading={loading}
            className="w-full"
            iconRight={ArrowRight}
          >
            {mode === 'login' ? 'Masuk ke Montra' : 'Buat Akun Gratis'}
          </Button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-text-muted">atau lanjutkan dengan</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Google OAuth */}
          <button
            onClick={signInWithGoogle}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 h-11
              bg-bg-elevated border border-border rounded-2xl text-sm font-medium text-text-primary
              hover:bg-bg-overlay hover:border-border-strong
              transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]
              disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <GoogleIcon />
            Google
          </button>
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-text-muted mt-4 animate-fade-in"
          style={{ animationDelay: '200ms' }}>
          Dengan melanjutkan, kamu menyetujui{' '}
          <span className="text-text-secondary underline cursor-pointer">syarat & ketentuan</span>
        </p>
      </div>
    </div>
  )
}

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 flex-shrink-0">
    <path fill="#4285F4" d="M23.745 12.27c0-.79-.07-1.54-.19-2.27h-11.3v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82Z"/>
    <path fill="#34A853" d="M12.255 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96h-3.98v3.09C3.515 21.3 7.565 24 12.255 24Z"/>
    <path fill="#FBBC05" d="M5.525 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62h-3.98a11.86 11.86 0 0 0 0 10.76l3.98-3.09Z"/>
    <path fill="#EA4335" d="M12.255 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C18.205 1.19 15.495 0 12.255 0c-4.69 0-8.74 2.7-10.71 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96Z"/>
  </svg>
)
