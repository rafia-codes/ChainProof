import { useState, useEffect } from 'react'
import { Loader, ShieldCheck, ShieldX } from 'lucide-react'
import api from '../utils/api'
import CertificateModal from './CertificateModal'

export default function SavedCerts({ address }) {
  const [certs, setCerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    if (!address) return
    setLoading(true)
    api
      .get(`/certificate/saved/${address}`)
      .then(({ data }) => setCerts(data))
      .catch(() => setCerts([]))
      .finally(() => setLoading(false))
  }, [address])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader size={24} className="text-accent animate-spin" />
      </div>
    )
  }

  if (!certs.length) {
    return (
      <div className="flex items-center justify-center h-48 border border-border rounded-xl">
        <p className="font-mono text-sm text-text-dim">No saved certificates yet.</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {certs.map((cert) => (
          <CertCard
            key={cert.certificateId}
            cert={cert}
            onClick={() => setSelected(cert)}
          />
        ))}
      </div>

      {selected && (
        <CertificateModal
          cert={selected}
          onClose={() => setSelected(null)}
          showSave={false}
        />
      )}
    </>
  )
}

function CertCard({ cert, onClick }) {
  const ipfsUrl = cert.cid
    ? `https://gateway.pinata.cloud/ipfs/${cert.cid}`
    : null

  return (
    <button
      onClick={onClick}
      className="group flex flex-col bg-surface border border-border rounded-xl overflow-hidden hover:border-accent/30 transition-all text-left"
    >
      {/* Thumbnail */}
      <div className="w-full h-32 bg-black relative overflow-hidden">
        {ipfsUrl ? (
          <iframe
            src={ipfsUrl}
            className="w-full h-full pointer-events-none scale-75 origin-top-left"
            style={{ width: '133%', height: '133%' }}
            title="cert preview"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="font-mono text-xs text-muted">No preview</span>
          </div>
        )}
        {/* Status badge */}
        <div className="absolute top-2 right-2">
          {cert.isRevoked ? (
            <ShieldX size={14} className="text-danger" />
          ) : (
            <ShieldCheck size={14} className="text-accent" />
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="font-mono text-xs text-text truncate">{cert.certificateId}</p>
        <p className="font-mono text-xs text-text-dim mt-0.5">
          {cert.timestamp
            ? new Date(Number(cert.timestamp) * 1000).toLocaleDateString()
            : '—'}
        </p>
      </div>
    </button>
  )
}
