import { useState, useEffect } from 'react'
import { Loader, ExternalLink } from 'lucide-react'
import api from '../utils/api'
import CertificateModal from './CertificateModal'
import { useWriteContract } from 'wagmi'
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../wagmi'

export default function IssuedCerts({ address }) {
  const [certs, setCerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const { writeContractAsync } = useWriteContract()

  const fetchCerts = async () => {
    if (!address) return
    setLoading(true)
    try {
      const { data } = await api.get(`/certificate/issued/${address}`)
      setCerts(data)
    } catch {
      setCerts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCerts()
  }, [address])

  const handleRevoke = async (certificateId) => {
    try {
      await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'revokeCertificate',
        args: [certificateId],
      })
      setSelected(null)
      fetchCerts()
    } catch (err) {
      console.error('Revoke failed:', err)
    }
  }

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
        <p className="font-mono text-sm text-text-dim">No certificates issued yet.</p>
      </div>
    )
  }

  return (
    <>
      <div className="border border-border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-surface">
              <th className="px-4 py-3 text-left font-mono text-xs text-text-dim uppercase tracking-wider">
                Certificate ID
              </th>
              <th className="px-4 py-3 text-left font-mono text-xs text-text-dim uppercase tracking-wider">
                Student
              </th>
              <th className="px-4 py-3 text-left font-mono text-xs text-text-dim uppercase tracking-wider">
                Date
              </th>
              <th className="px-4 py-3 text-left font-mono text-xs text-text-dim uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left font-mono text-xs text-text-dim uppercase tracking-wider">
                Txn
              </th>
            </tr>
          </thead>
          <tbody>
            {certs.map((cert, i) => (
              <tr
                key={cert.certificateId}
                onClick={() => setSelected(cert)}
                className={`border-b border-border cursor-pointer hover:bg-white/5 transition-colors ${
                  i % 2 === 0 ? 'bg-black/20' : ''
                }`}
              >
                <td className="px-4 py-3 font-mono text-sm text-text">
                  {cert.certificateId}
                </td>
                <td className="px-4 py-3 font-mono text-sm text-text-dim">
                  {cert.studentName}
                </td>
                <td className="px-4 py-3 font-mono text-sm text-text-dim">
                  {new Date(cert.issuedAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`font-mono text-xs px-2 py-1 rounded-full ${
                      cert.isRevoked
                        ? 'bg-danger/10 text-danger'
                        : 'bg-accent/10 text-accent'
                    }`}
                  >
                    {cert.isRevoked ? 'Revoked' : 'Valid'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {cert.txnHash && (
                    <a
                      href={`https://amoy.polygonscan.com/tx/${cert.txnHash}`}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-text-dim hover:text-accent transition-colors"
                    >
                      <ExternalLink size={14} />
                    </a>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <CertificateModal
          cert={selected}
          onClose={() => setSelected(null)}
          onRevoke={handleRevoke}
        />
      )}
    </>
  )
}
