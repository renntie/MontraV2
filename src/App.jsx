import { useEffect } from 'react'
import { AuthPage }    from '@/components/pages/AuthPage'
import { AppShell }    from '@/components/organisms/AppShell'
import { Spinner }     from '@/components/atoms/Spinner'
import { MontraSVGIcon } from '@/components/atoms/MontraLogo'
import { useAuthStore } from '@/store/authStore'

export default function App() {
  const { user, loading, initialize } = useAuthStore()

  useEffect(() => { initialize() }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center gap-5">
        <div className="flex flex-col items-center gap-3 animate-fade-in">
          {/* Logo with orbit ring */}
          <div className="relative">
            <div className="rounded-[28%] overflow-hidden shadow-glow-income animate-glow-pulse"
              style={{ width: 72, height: 72 }}>
              <MontraSVGIcon size={72} />
            </div>
            <div className="absolute inset-[-10px] rounded-full border border-accent-income/20 animate-spin-slow" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">Montra</h1>
            <p className="text-xs text-text-muted mt-0.5">Personal Finance</p>
          </div>
        </div>
        <Spinner size={22} className="text-accent-income/40" />
      </div>
    )
  }

  return user ? <AppShell /> : <AuthPage />
}
