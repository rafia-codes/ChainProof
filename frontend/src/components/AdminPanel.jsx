import { useState, useEffect } from 'react'
import { Loader, CheckCircle, XCircle } from 'lucide-react'
import api from '../utils/api.js'

export default function AdminPanel() {
  const [pending, setPending] = useState([])
  const [approved, setApproved] = useState([])
  const [loading, setLoading] = useState(true)
  const [acting, setActing] = useState(null)

  const fetchIssuers = async () => {
    setLoading(true)
    try {
      const [p, a] = await Promise.all([
        api.get('/issuer/pending'),
        api.get('/issuer/approved'),
      ])
      setPending(p.data);
      setApproved(a.data);
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchIssuers()
  }, [])

  const handleApprove = async (wallet) => {
    setActing(wallet)
    try {
      await api.post('/issuer/approve', { wallet })
      fetchIssuers()
    } finally {
      setActing(null)
    }
  }

  const handleUnapprove = async (wallet) => {
    setActing(wallet)
    try {
      await api.post('/issuer/unapprove', { wallet })
      fetchIssuers()
    } finally {
      setActing(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader size={24} className="text-accent animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <Section title="Pending Requests" count={pending.length}>
        {pending.length === 0 ? (
          <Empty text="No pending requests." />
        ) : (
          pending.map((issuer) => (
            <IssuerRow
              key={issuer.wallet}
              issuer={issuer}
              acting={acting}
              actions={
                <button
                  onClick={() => handleApprove(issuer.wallet)}
                  disabled={acting === issuer.wallet}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-accent/10 border border-accent/30 text-accent font-mono text-xs rounded-lg hover:bg-accent/20 transition-all disabled:opacity-50"
                >
                  <CheckCircle size={14} />
                  Approve
                </button>
              }
            />
          ))
        )}
      </Section>

      <Section title="Approved Issuers" count={approved.length}>
        {approved.length === 0 ? (
          <Empty text="No approved issuers." />
        ) : (
          approved.map((issuer) => (
            <IssuerRow
              key={issuer.wallet}
              issuer={issuer}
              acting={acting}
              actions={
                <button
                  onClick={() => handleUnapprove(issuer.wallet)}
                  disabled={acting === issuer.wallet}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-danger/10 border border-danger/30 text-danger font-mono text-xs rounded-lg hover:bg-danger/20 transition-all disabled:opacity-50"
                >
                  <XCircle size={14} />
                  Revoke Access
                </button>
              }
            />
          ))
        )}
      </Section>
    </div>
  )
}

function Section({ title, count, children }) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <h3 className="font-display font-bold text-xl text-text">{title}</h3>
        <span className="px-2 py-0.5 bg-border rounded-full font-mono text-xs text-text-dim">
          {count}
        </span>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  )
}

function IssuerRow({ issuer, actions }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 bg-surface border border-border rounded-xl">
      <div>
        <p className="font-mono text-sm text-text">{issuer.name}</p>
        <p className="font-mono text-xs text-text-dim truncate max-w-xs">
          {issuer.wallet}
        </p>
      </div>
      {actions}
    </div>
  )
}

function Empty({ text }) {
  return (
    <div className="flex items-center justify-center h-24 border border-border rounded-xl">
      <p className="font-mono text-sm text-text-dim">{text}</p>
    </div>
  )
}
