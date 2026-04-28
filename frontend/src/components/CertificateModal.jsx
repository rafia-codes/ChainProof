import { X, ExternalLink, ShieldCheck, ShieldX, Plus } from 'lucide-react'
import { useWallet } from '../hooks/useWallet'
import api from '../utils/api'
import { useState } from 'react'

export default function CertificateModal({ cert, onClose, onRevoke, showSave = false }) {
  const { address } = useWallet();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  if (!cert) return null

  const ipfsUrl = cert.cid
    ? `https://gateway.pinata.cloud/ipfs/${cert.cid}`
    : null

  const scanUrl = cert.txnHash
    ? `https://amoy.polygonscan.com/tx/${cert.txnHash}`
    : null

  const isOwner =
    address &&
    cert.issuer &&
    address.toLowerCase() === cert.issuer.toLowerCase()

  const handleSave = async () => {
    if (!address) return
    setSaving(true)
    try {
      await api.post('/certificate/save', {
        certificateId: cert.certificateId,
        viewerWallet: address,
      })
      setSaved(true)
    } catch {
      setSaved(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl mx-4 bg-surface border border-border rounded-2xl overflow-hidden animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            {cert.isRevoked ? (
              <ShieldX size={20} className="text-danger" />
            ) : (
              <ShieldCheck size={20} className="text-accent" />
            )}
            <span className="font-display font-bold text-sm tracking-widest uppercase text-text-dim">
              {cert.isRevoked ? 'Revoked Certificate' : 'Verified Certificate'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-text-dim hover:text-text transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Certificate preview */}
        <div className="p-6">
          {ipfsUrl ? (
            <div className="w-full h-96 bg-black rounded-xl overflow-hidden border border-border mb-6">
              <iframe
                src={ipfsUrl}
                className="w-full h-full"
                title="Certificate"
              />
            </div>
          ) : (
            <div className="w-full h-48 bg-black rounded-xl border border-border mb-6 flex items-center justify-center">
              <span className="text-text-dim font-mono text-sm">No preview available</span>
            </div>
          )}

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <Detail label="Certificate ID" value={cert.certificateId} />
            <Detail label="Issuer" value={cert.issuer ? shortAddr(cert.issuer) : '—'} />
            <Detail
              label="Issued On"
              value={
                cert.timestamp
                  ? new Date(Number(cert.timestamp) * 1000).toLocaleDateString()
                  : '—'
              }
            />
            <Detail
              label="Status"
              value={cert.isRevoked ? 'Revoked' : 'Valid'}
              valueClass={cert.isRevoked ? 'text-danger' : 'text-accent'}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 flex-wrap">
            {ipfsUrl && (
              <a
                href={ipfsUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm font-mono text-text-dim hover:text-text hover:border-accent transition-all"
              >
                <ExternalLink size={14} />
                View on IPFS
              </a>
            )}
            {scanUrl && (
              <a
                href={scanUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm font-mono text-text-dim hover:text-text hover:border-accent transition-all"
              >
                <ExternalLink size={14} />
                View on Explorer
              </a>
            )}
            {showSave && address && !isOwner && (
              <button
                onClick={handleSave}
                disabled={saving || saved}
                className="flex items-center gap-2 px-4 py-2 bg-accent/10 border border-accent/30 rounded-lg text-sm font-mono text-accent hover:bg-accent/20 transition-all disabled:opacity-50"
              >
                <Plus size={14} />
                {saved ? 'Saved!' : saving ? 'Saving...' : 'Add to Dashboard'}
              </button>
            )}
            {isOwner && !cert.isRevoked && onRevoke && (
              <button
                onClick={() => onRevoke(cert.certificateId)}
                className="flex items-center gap-2 px-4 py-2 bg-danger/10 border border-danger/30 rounded-lg text-sm font-mono text-danger hover:bg-danger/20 transition-all ml-auto"
              >
                <ShieldX size={14} />
                Revoke Certificate
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function Detail({ label, value, valueClass = 'text-text' }) {
  return (
    <div className="bg-black/40 rounded-lg p-3 border border-border">
      <p className="text-text-dim font-mono text-xs uppercase tracking-wider mb-1">{label}</p>
      <p className={`font-mono text-sm break-all ${valueClass}`}>{value}</p>
    </div>
  )
}

function shortAddr(addr) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}
