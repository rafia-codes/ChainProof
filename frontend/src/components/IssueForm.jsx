import { useState } from 'react'
import { X, Upload, Loader } from 'lucide-react'
import { useWallet } from '../hooks/useWallet'
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../wagmi'
import api from '../utils/api'
import { ethers } from 'ethers'

export default function IssueForm({ onClose, onSuccess }) {
  const { address, getSignedAuth } = useWallet()
  const [step, setStep] = useState('form') // form | signing | uploading | blockchain | done
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    certificateId: '',
    studentName: '',
    file: null,
  })

  const { writeContractAsync } = useWriteContract()

  const handleFile = (e) => {
    const f = e.target.files[0]
    if (!f) return
    const allowed = ['application/pdf', 'image/jpeg', 'image/png']
    if (!allowed.includes(f.type)) {
      setError('Only PDF, JPG or PNG allowed.')
      return
    }
    setError('')
    setForm((p) => ({ ...p, file: f }))
  }

  const handleSubmit = async () => {
    if (!form.certificateId || !form.studentName || !form.file) {
      setError('All fields are required.')
      return
    }
    setError('')

    try {
      // Step 1 — Sign
      setStep('signing')
      const { signature, nonce } = await getSignedAuth()
      console.log(signature+"rafia"+nonce);
      // Step 2 — Upload to backend (OCR + IPFS)
      setStep('uploading')
      const formData = new FormData()
      formData.append('file', form.file)
      formData.append('certificateID', form.certificateId)
      formData.append('studentname', form.studentName)
      formData.append('signature', signature)
      formData.append('nonce', nonce)

      console.log("FORM DATA CHECK:");
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }

      const { data } = await api.post('/certificate/issue', formData);

      if (!data.success) {
        console.log(data);
        setError(
          data.reason ||
            `OCR mismatch on: ${(data.mismatches || []).join(', ') || 'unknown fields'}`
        )
        setStep('form')
        return
      }

      const { hash, cid } = data

      // Step 3 — Call blockchain from frontend with issuer's wallet
      setStep('blockchain')
      const hashBytes = '0x' + hash
      const txnHash = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'issueCertificate',
        args: [form.certificateId, hashBytes, cid],
      })

      // Step 4 — Confirm to backend for dashboard
      await api.post('/certificate/confirm', {
        certificateId: form.certificateId,
        txnHash,
        studentName: form.studentName,
        issuerWallet: address,
      })

      setStep('done')
      setTimeout(() => {
        onSuccess()
      }, 1500)
    } catch (err) {
      console.error(err)
      setError(err.message || 'Something went wrong.')
      setStep('form')
    }
  }

  const stepLabel = {
    form: null,
    signing: 'Waiting for MetaMask signature...',
    uploading: 'Validating & uploading to IPFS...',
    blockchain: 'Confirming on blockchain...',
    done: 'Certificate issued successfully!',
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg mx-4 bg-surface border border-border rounded-2xl overflow-hidden animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <span className="font-display font-bold text-sm tracking-widest uppercase text-text-dim">
            Issue Certificate
          </span>
          <button onClick={onClose} className="text-text-dim hover:text-text">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {step !== 'form' && step !== 'done' && (
            <div className="flex items-center gap-3 px-4 py-3 bg-accent/5 border border-accent/20 rounded-lg">
              <Loader size={16} className="text-accent animate-spin" />
              <span className="font-mono text-sm text-accent">
                {stepLabel[step]}
              </span>
            </div>
          )}

          {step === 'done' && (
            <div className="flex items-center gap-3 px-4 py-3 bg-accent/10 border border-accent/30 rounded-lg">
              <span className="font-mono text-sm text-accent">
                ✓ {stepLabel.done}
              </span>
            </div>
          )}

          <Field label="Certificate ID">
            <input
              type="text"
              placeholder="e.g. CERT-2024-001"
              value={form.certificateId}
              onChange={(e) =>
                setForm((p) => ({ ...p, certificateId: e.target.value }))
              }
              disabled={step !== 'form'}
              className="w-full bg-black border border-border rounded-lg px-4 py-3 font-mono text-sm text-text placeholder-muted focus:outline-none focus:border-accent transition-colors disabled:opacity-50"
            />
          </Field>

          <Field label="Student Name">
            <input
              type="text"
              placeholder="Full name as on certificate"
              value={form.studentName}
              onChange={(e) =>
                setForm((p) => ({ ...p, studentName: e.target.value }))
              }
              disabled={step !== 'form'}
              className="w-full bg-black border border-border rounded-lg px-4 py-3 font-mono text-sm text-text placeholder-muted focus:outline-none focus:border-accent transition-colors disabled:opacity-50"
            />
          </Field>

          <Field label="Certificate File (PDF, JPG, PNG)">
            <label className="flex items-center gap-3 w-full bg-black border border-border rounded-lg px-4 py-3 cursor-pointer hover:border-accent transition-colors">
              <Upload size={16} className="text-text-dim" />
              <span className="font-mono text-sm text-text-dim">
                {form.file ? form.file.name : 'Click to upload'}
              </span>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFile}
                className="hidden"
                disabled={step !== 'form'}
              />
            </label>
          </Field>

          {error && (
            <p className="font-mono text-xs text-danger">{error}</p>
          )}

          <button
            onClick={handleSubmit}
            disabled={step !== 'form'}
            className="w-full py-3 bg-accent text-bg font-display font-bold rounded-xl hover:bg-accent-dim transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Issue Certificate
          </button>
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label className="font-mono text-xs text-text-dim uppercase tracking-wider mb-1.5 block">
        {label}
      </label>
      {children}
    </div>
  )
}
