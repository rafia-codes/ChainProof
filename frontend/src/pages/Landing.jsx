import { useNavigate } from 'react-router-dom'
import { ArrowRight, Shield, Link, Cpu } from 'lucide-react'

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center relative overflow-hidden">
      <div className="grain" />

      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage:
            'linear-gradient(#00ff87 1px, transparent 1px), linear-gradient(90deg, #00ff87 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Glow orb */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 text-center px-6 animate-slide-up">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 border border-accent/30 rounded-full mb-8 bg-accent/5">
          <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          <span className="font-mono text-xs text-accent tracking-widest uppercase">
            Blockchain Verified
          </span>
        </div>

        {/* Headline */}
        <h1 className="font-display font-black text-7xl md:text-8xl text-text leading-none mb-4">
          CHAIN
          <span className="text-accent glow-text">PROOF</span>
        </h1>
        <p className="font-mono text-text-dim text-lg max-w-md mx-auto mb-12 leading-relaxed">
          Tamper-proof certificate verification powered by blockchain and decentralized storage.
        </p>

        {/* CTA */}
        <button
          onClick={() => navigate('/hub')}
          className="group inline-flex items-center gap-3 px-8 py-4 bg-accent text-bg font-display font-bold text-lg rounded-xl hover:bg-accent-dim transition-all glow"
        >
          Get Started
          <ArrowRight
            size={20}
            className="group-hover:translate-x-1 transition-transform"
          />
        </button>

        {/* Features */}
        <div className="grid grid-cols-3 gap-6 mt-20 max-w-2xl mx-auto">
          <Feature icon={<Shield size={20} />} label="Immutable Records" />
          <Feature icon={<Link size={20} />} label="Decentralized Storage" />
          <Feature icon={<Cpu size={20} />} label="OCR Validation" />
        </div>
      </div>
    </div>
  )
}

function Feature({ icon, label }) {
  return (
    <div className="flex flex-col items-center gap-2 p-4 border border-border rounded-xl bg-surface/50">
      <div className="text-accent">{icon}</div>
      <span className="font-mono text-xs text-text-dim text-center">{label}</span>
    </div>
  )
}
