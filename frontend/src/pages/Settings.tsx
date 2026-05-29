import { useAuthStore } from '../store/auth'
import { useLogout } from '../api/auth'
import { useTheme } from '../context/ThemeContext'
import { 
  User, 
  Moon, 
  Sun, 
  Monitor, 
  Share2, 
  LogOut, 
  Bell, 
  Shield, 
  ChevronRight,
  GraduationCap
} from "lucide-react";

export default function Settings() {
  const user = useAuthStore((s) => s.user)
  const logout = useLogout()
  const { theme, setTheme } = useTheme()

  return (
    <div className="p-4 md:p-8 space-y-7 max-w-4xl">
      {/* Profile Header */}
      <div className="bg-white dark:bg-card rounded-2xl border border-slate-100 dark:border-border p-6 shadow-sm flex flex-col md:flex-row items-center gap-6">
        <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-lg">
          {user?.display_name?.substring(0, 1).toUpperCase() || user?.email[0].toUpperCase()}
        </div>
        <div className="text-center md:text-left flex-1">
          <h2 className="text-xl font-bold text-slate-800 dark:text-foreground">{user?.display_name || 'Kein Anzeigename'}</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{user?.email}</p>
          <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-3">
            <span className="text-[10px] uppercase tracking-wider font-bold bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 px-2 py-1 rounded-md border border-indigo-100 dark:border-indigo-900/30">
              Student
            </span>
            <span className="text-[10px] uppercase tracking-wider font-bold bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 px-2 py-1 rounded-md border border-emerald-100 dark:border-emerald-900/30">
              Verifiziert
            </span>
          </div>
        </div>
        <button className="px-4 py-2 rounded-xl border border-slate-200 dark:border-border text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-accent text-sm font-medium transition-all">
          Profil bearbeiten
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Appearance */}
        <div className="bg-white dark:bg-card rounded-2xl border border-slate-100 dark:border-border shadow-sm p-6">
          <div className="flex items-center gap-2 mb-6">
            <Sun size={18} className="text-amber-500" />
            <h3 className="text-slate-700 dark:text-foreground font-bold">Erscheinungsbild</h3>
          </div>
          <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-muted/50 p-1.5 rounded-2xl">
            {(['light', 'dark', 'system'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={`flex flex-col items-center gap-2 py-3 rounded-xl transition-all ${
                  theme === t
                    ? 'bg-white dark:bg-card text-indigo-600 dark:text-indigo-400 shadow-sm ring-1 ring-slate-100 dark:ring-border'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                }`}
              >
                {t === 'light' && <Sun size={18} />}
                {t === 'dark' && <Moon size={18} />}
                {t === 'system' && <Monitor size={18} />}
                <span className="text-[10px] font-bold uppercase tracking-tighter">
                  {t === 'light' ? 'Hell' : t === 'dark' ? 'Dunkel' : 'System'}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white dark:bg-card rounded-2xl border border-slate-100 dark:border-border shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <Bell size={18} className="text-indigo-500" />
            <h3 className="text-slate-700 dark:text-foreground font-bold">Benachrichtigungen</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-foreground">Lern-Erinnerungen</p>
                <p className="text-xs text-slate-400">Erinnere mich an geplante Sitzungen</p>
              </div>
              <div className="w-10 h-5 bg-indigo-500 rounded-full relative cursor-pointer">
                <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-sm"></div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-foreground">Wochenbericht</p>
                <p className="text-xs text-slate-400">Statistiken per E-Mail erhalten</p>
              </div>
              <div className="w-10 h-5 bg-slate-200 dark:bg-muted rounded-full relative cursor-pointer">
                <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-sm"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Account Settings */}
        <div className="bg-white dark:bg-card rounded-2xl border border-slate-100 dark:border-border shadow-sm overflow-hidden col-span-1 md:col-span-2">
          <div className="p-6 border-b border-slate-50 dark:border-border flex items-center gap-2">
            <Shield size={18} className="text-indigo-500" />
            <h3 className="text-slate-700 dark:text-foreground font-bold">Account & Sicherheit</h3>
          </div>
          <div className="divide-y divide-slate-50 dark:divide-border">
            <button className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-accent transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-muted flex items-center justify-center text-slate-500">
                  <User size={16} />
                </div>
                <span className="text-sm font-medium text-slate-700 dark:text-foreground">E-Mail Adresse ändern</span>
              </div>
              <ChevronRight size={16} className="text-slate-300" />
            </button>
            <button className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-accent transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-muted flex items-center justify-center text-slate-500">
                  <Shield size={16} />
                </div>
                <span className="text-sm font-medium text-slate-700 dark:text-foreground">Passwort ändern</span>
              </div>
              <ChevronRight size={16} className="text-slate-300" />
            </button>
            <button className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-accent transition-colors text-red-500">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/10 flex items-center justify-center text-red-500">
                  <LogOut size={16} />
                </div>
                <span className="text-sm font-medium">Account löschen</span>
              </div>
              <ChevronRight size={16} className="text-red-200" />
            </button>
          </div>
        </div>
      </div>

      <button
        onClick={() => logout.mutate()}
        className="w-full flex items-center justify-center gap-2 bg-white dark:bg-card border border-red-100 dark:border-red-900/20 text-red-500 rounded-2xl py-4 font-bold hover:bg-red-50 dark:hover:bg-red-900/10 transition-all shadow-sm"
      >
        <LogOut size={18} />
        Abmelden
      </button>

      {/* Footer Info */}
      <div className="flex flex-col items-center gap-4 pt-4 pb-8">
        <div className="flex items-center gap-2 opacity-30">
          <GraduationCap size={18} />
          <span className="font-bold text-sm tracking-tighter">LERNZEIT MANAGER</span>
        </div>
        <p className="text-slate-400 text-[10px] uppercase tracking-widest">Version 2.0.0-PRO-2026</p>
      </div>
    </div>
  )
}
