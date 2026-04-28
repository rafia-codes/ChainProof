import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWallet } from '../hooks/useWallet'
import { useIssuer } from '../hooks/useIssuer'
import Sidebar from '../components/Sidebar'
import IssuedCerts from '../components/IssuedCerts'
import SavedCerts from '../components/SavedCerts'
import IssueForm from '../components/IssueForm'
import AdminPanel from '../components/AdminPanel'
import { Loader, Wallet } from 'lucide-react'
import api from '../utils/api'

const ADMIN_WALLET = import.meta.env.VITE_ADMIN_WALLET?.toLowerCase()

export default function Dashboard() {
  const navigate = useNavigate();
  const { address, isConnected, connect } = useWallet();
  const { status, loading, refetch } = useIssuer(address);
  const [active, setActive] = useState('issued');
  const [showIssueForm, setShowIssueForm] = useState(false);

  const isAdmin = address?.toLowerCase() === ADMIN_WALLET;

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-center animate-slide-up">
          <Wallet size={48} className="text-accent mx-auto mb-4" />
          <h2 className="font-display font-black text-3xl text-text mb-2">
            Connect Your Wallet
          </h2>
          <p className="font-mono text-text-dim text-sm mb-8">
            Connect MetaMask to access your dashboard
          </p>
          <button
            onClick={connect}
            className="px-8 py-3 bg-accent text-bg font-display font-bold rounded-xl hover:bg-accent-dim transition-all glow"
          >
            Connect MetaMask
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <Loader size={32} className="text-accent animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg flex">
      <div className="grain" />
      <Sidebar
        active={active}
        setActive={(tab) => {
          setActive(tab)
          setShowIssueForm(false)
        }}
        isAdmin={isAdmin}
      />

      {/* Main content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {/* Issuer status banner */}
        {!isAdmin && status === 'none' && (
          <RequestBanner onRequest={refetch} address={address} />
        )}
        {!isAdmin && status === 'pending' && (
          <div className="mb-6 px-4 py-3 border border-warning/30 bg-warning/5 rounded-xl font-mono text-sm text-warning">
            ⏳ Your issuer request is pending admin approval.
          </div>
        )}

        {/* Issue button for approved issuers */}
        {(status === 'approved' || isAdmin) && active === 'issued' && (
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-display font-bold text-2xl text-text">
              Issued Certificates
            </h2>
            <button
              onClick={() => setShowIssueForm(true)}
              className="px-4 py-2 bg-accent text-bg font-display font-bold text-sm rounded-lg hover:bg-accent-dim transition-all"
            >
              + Issue Certificate
            </button>
          </div>
        )}

        {/* Content */}
        {active === 'issued' && <IssuedCerts address={address} />}
        {active === 'saved' && <SavedCerts address={address} />}
        {active === 'admin' && isAdmin && <AdminPanel />}
      </main>

      {/* Issue form modal */}
      {showIssueForm && (
        <IssueForm
          onClose={() => setShowIssueForm(false)}
          onSuccess={() => {
            setShowIssueForm(false)
            refetch()
          }}
        />
      )}
    </div>
  )
}

function RequestBanner({ onRequest, address }) {
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [name, setName] = useState('')
  const [showInput, setShowInput] = useState(false)

  const handleRequest = async () => {
    if (!name.trim()) return
    setLoading(true)
    try {
      await api.post('/issuer/request', { wallet: address, name });
      setDone(true);
      // Delay refetch by 3 seconds so confirmation message is visible
      setTimeout(() => onRequest(), 3000)
    } finally {
      setLoading(false)
    }
  }

  if (done) return (
    <div className="mb-6 px-4 py-3 border border-accent/20 bg-accent/5 rounded-xl">
      <p className="font-mono text-sm text-accent">
        ✓ Request submitted. Waiting for admin approval.
      </p>
    </div>
  )

  return (
    <div className="mb-6 px-4 py-4 border border-accent/20 bg-accent/5 rounded-xl">
      <p className="font-mono text-sm text-text-dim mb-3">
        Want to issue certificates?{' '}
        <button
          onClick={() => setShowInput(true)}
          className="text-accent underline"
        >
          Request issuer access
        </button>
      </p>
      {showInput && (
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Your organization name (e.g. IIT Delhi)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 bg-black border border-border rounded-lg px-3 py-2 font-mono text-sm text-text focus:outline-none focus:border-accent"
          />
          <button
            onClick={handleRequest}
            disabled={loading || !name.trim()}
            className="px-4 py-2 bg-accent text-bg font-display font-bold text-sm rounded-lg disabled:opacity-50"
          >
            {loading ? '...' : 'Request'}
          </button>
        </div>
      )}
    </div>
  )
}
