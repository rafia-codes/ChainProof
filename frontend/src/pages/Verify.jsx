import { useState } from 'react'
import { ArrowLeft, Search, Loader } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'
import CertificateModal from '../components/CertificateModal'
import { useWallet } from '../hooks/useWallet'

export default function Verify() {
  const navigate = useNavigate()
  const { isConnected } = useWallet()
  const [certId, setCertId] = useState('')
  const [loading, setLoading] = useState(false)
  const [cert, setCert] = useState(null)
  const [error, setError] = useState('')

  const handleVerify = async () => {
    if (!certId.trim()) return
    setLoading(true)
    setError('')
    setCert(null)
    try {
      const { data } = await api.get(`/certificate/verify/${certId.trim()}`)
      if (!data || !data.certificateId) {
        setError('Certificate not found on blockchain.')
      } else {
        setCert(data)
      }
    } catch {
      setError('Certificate not found or invalid ID.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-6 relative">
      <div className="grain" />

      <button
        onClick={() => navigate('/hub')}
        className="absolute top-6 left-6 flex items-center gap-2 text-text-dim hover:text-text font-mono text-sm transition-colors"
      >
        <ArrowLeft size={16} />
        Back
      </button>

      <div className="w-full max-w-md animate-slide-up">
        <h2 className="font-display font-black text-4xl text-text mb-2 text-center">
          Verify Certificate
        </h2>
        <p className="text-text-dim font-mono text-sm text-center mb-10">
          Enter the certificate ID to check its authenticity
        </p>

        {/* Input */}
        <div className="bg-surface border border-border rounded-2xl p-6">
          <label className="font-mono text-xs text-text-dim uppercase tracking-wider mb-2 block">
            Certificate ID
          </label>
          <input
            type="text"
            value={certId}
            onChange={(e) => setCertId(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
            placeholder="e.g. CERT-2024-001"
            className="w-full bg-black border border-border rounded-lg px-4 py-3 font-mono text-sm text-text placeholder-muted focus:outline-none focus:border-accent transition-colors mb-4"
          />

          {error && (
            <p className="font-mono text-xs text-danger mb-4">{error}</p>
          )}

          <button
            onClick={handleVerify}
            disabled={loading || !certId.trim()}
            className="w-full flex items-center justify-center gap-2 py-3 bg-accent text-bg font-display font-bold rounded-xl hover:bg-accent-dim transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader size={18} className="animate-spin" />
            ) : (
              <Search size={18} />
            )}
            {loading ? 'Verifying...' : 'Verify'}
          </button>
        </div>
      </div>

      {/* Certificate Modal */}
      {cert && (
        <CertificateModal
          cert={cert}
          onClose={() => {
            setCert(null)
            setCertId('')
          }}
          showSave={isConnected}
        />
      )}
    </div>
  )
}
