import { useNavigate } from 'react-router-dom'
import { Search, Upload, Wallet, ArrowLeft } from 'lucide-react'
import { useWallet } from '../hooks/useWallet'

export default function Hub() {
  const navigate = useNavigate()
  const { isConnected, connect } = useWallet()

  const handleIssue = async () => {
    if (!isConnected) {
      await connect()
    }
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center relative px-6">
      <div className="grain" />

      <button
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 flex items-center gap-2 text-text-dim hover:text-text font-mono text-sm transition-colors"
      >
        <ArrowLeft size={16} />
        Back
      </button>

      <div className="w-full max-w-3xl animate-slide-up">
        <h2 className="font-display font-black text-4xl text-text mb-2 text-center">
          What would you like to do?
        </h2>
        <p className="text-text-dim font-mono text-sm text-center mb-12">
          Choose an action to get started
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <HubCard
            icon={<Search size={32} />}
            title="Verify"
            description="Check if a certificate is authentic and unrevoked"
            accent="text-accent"
            borderHover="hover:border-accent/50"
            onClick={() => navigate('/verify')}
          />
          <HubCard
            icon={<Upload size={32} />}
            title="Issue"
            description="Issue a new tamper-proof certificate on blockchain"
            accent="text-accent"
            borderHover="hover:border-accent/50"
            onClick={handleIssue}
          />
          <HubCard
            icon={<Wallet size={32} />}
            title="Connect Wallet"
            description="Connect your MetaMask to access issuer dashboard"
            accent="text-accent"
            borderHover="hover:border-accent/50"
            onClick={handleIssue}
          />
        </div>
      </div>
    </div>
  )
}

function HubCard({ icon, title, description, accent, borderHover, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`group flex flex-col items-start p-6 bg-surface border border-border ${borderHover} rounded-2xl text-left transition-all hover:bg-white/5`}
    >
      <div className={`${accent} mb-4 group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <h3 className="font-display font-bold text-xl text-text mb-2">{title}</h3>
      <p className="font-mono text-xs text-text-dim leading-relaxed">{description}</p>
    </button>
  )
}
