import { LayoutGrid, List, LogOut, Shield } from 'lucide-react'
import { useWallet } from '../hooks/useWallet'

export default function Sidebar({ active, setActive, isAdmin = false }) {
  const { address, disconnect } = useWallet()

  return (
    <aside className="w-64 min-h-screen bg-surface border-r border-border flex flex-col">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-border">
        <span className="font-display font-black text-xl text-accent glow-text">
          CHAIN<span className="text-text">PROOF</span>
        </span>
        <p className="text-text-dim font-mono text-xs mt-1 truncate">{address}</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <NavItem
          icon={<List size={16} />}
          label="Issued Certificates"
          active={active === 'issued'}
          onClick={() => setActive('issued')}
        />
        <NavItem
          icon={<LayoutGrid size={16} />}
          label="Saved Certificates"
          active={active === 'saved'}
          onClick={() => setActive('saved')}
        />
        {isAdmin && (
          <NavItem
            icon={<Shield size={16} />}
            label="Admin Panel"
            active={active === 'admin'}
            onClick={() => setActive('admin')}
          />
        )}
      </nav>

      {/* Disconnect */}
      <div className="px-3 py-4 border-t border-border">
        <button
          onClick={disconnect}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-text-dim hover:text-danger hover:bg-danger/10 transition-all font-mono text-sm"
        >
          <LogOut size={16} />
          Disconnect
        </button>
      </div>
    </aside>
  )
}

function NavItem({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-mono text-sm transition-all ${
        active
          ? 'bg-accent/10 text-accent border border-accent/20'
          : 'text-text-dim hover:text-text hover:bg-white/5'
      }`}
    >
      {icon}
      {label}
    </button>
  )
}
