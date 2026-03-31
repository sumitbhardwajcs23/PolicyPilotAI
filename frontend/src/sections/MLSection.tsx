import { useNavigate } from 'react-router-dom'
import { Brain, Zap, IndianRupee, Clock, Shield, CloudRain, Thermometer, Wind, MapPin, ChevronRight } from 'lucide-react'

const MLSection = () => {
  const navigate = useNavigate()

  const disruptions = [
    { icon: CloudRain,   label: 'Heavy Rain',      cost: '₹500–₹800', color: 'cyan',   desc: 'Cannot ride in >40mm rainfall' },
    { icon: Thermometer, label: 'Extreme Heat',     cost: '₹300–₹600', color: 'orange', desc: '20–30% order drop above 42°C' },
    { icon: Wind,        label: 'High AQI',         cost: '₹200–₹500', color: 'rose',   desc: 'Work stoppages above AQI 300' },
    { icon: MapPin,      label: 'Zone Closures',    cost: '₹400–₹900', color: 'amber',  desc: 'Sudden curfew / police block' },
  ]

  return (
    <section id="ai-models" className="py-24 bg-gradient-to-b from-slate-50 to-white relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 left-1/3 w-80 h-80 bg-orange-100/60 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-violet-100/50 rounded-full blur-3xl" />
      </div>

      <div className="gig-container relative">
        {/* Section header */}
        <div className="text-center mb-16 scroll-animate">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-100 border border-orange-200 text-orange-700 text-sm font-bold mb-5">
            <Brain className="w-4 h-4" />
            AI/ML Powered Income Protection
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-[#0f172a] mb-4 font-['Poppins'] leading-tight">
            ₹29/week keeps you covered<br />
            <span className="bg-gradient-to-r from-orange-500 to-rose-500 bg-clip-text text-transparent">
              when the weather won't
            </span>
          </h2>
          <p className="text-xl text-[#64748b] max-w-2xl mx-auto">
            India's 7.7 million delivery partners lose ₹300–₹900/day to rain, heat, and closures.
            Our ML models price and verify every claim in real-time — automatically.
          </p>
        </div>

        {/* Disruption cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-14 scroll-animate">
          {disruptions.map((d, i) => {
            const Icon = d.icon
            return (
              <div key={d.label} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-all"
                style={{ transitionDelay: `${i * 80}ms` }}>
                <div className={`w-10 h-10 rounded-xl bg-${d.color}-100 flex items-center justify-center mb-3`}>
                  <Icon className={`w-5 h-5 text-${d.color}-600`} />
                </div>
                <p className="font-bold text-[#0f172a] text-sm">{d.label}</p>
                <p className="text-[#64748b] text-xs mt-1">{d.desc}</p>
                <p className={`text-${d.color}-600 font-semibold text-sm mt-2`}>{d.cost}/day lost</p>
              </div>
            )
          })}
        </div>

        {/* Two model cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-14">
          {[
            {
              gradient: 'from-orange-500 to-rose-500',
              icon: IndianRupee,
              name: 'Weekly Micro-Premium Model',
              algo: 'XGBoost Gradient Boosting',
              tagline: 'Priced for daily-wage pockets',
              stats: [
                { label: 'Features', value: '22 gig signals' },
                { label: 'Training', value: '60,000 records' },
                { label: 'Output', value: '₹29–₹99/week' },
                { label: 'Retraining', value: 'Monthly' },
              ],
              bullets: ['Location & zone risk', 'Weather disruption history', 'AQI & heat patterns', 'Earnings volatility index'],
            },
            {
              gradient: 'from-violet-600 to-indigo-600',
              icon: Shield,
              name: 'Parametric Fraud Detector',
              algo: 'RF (60%) + Neural Network (40%)',
              tagline: 'Zero-touch → instant UPI payout',
              stats: [
                { label: 'Features', value: '28 claim signals' },
                { label: 'Training', value: '15,000 records' },
                { label: 'Accuracy', value: '95%+ fraud catch' },
                { label: 'Payout ETA', value: '< 2 minutes' },
              ],
              bullets: ['OpenWeather API cross-ref', 'GPS zone verification', 'Platform order-drop signal', 'Cluster claim detection'],
            },
          ].map((m, i) => {
            const Icon = m.icon
            return (
              <div key={m.name} className="scroll-animate bg-white rounded-3xl p-8 shadow-lg border border-slate-100 hover:shadow-xl transition-all hover:-translate-y-1"
                style={{ transitionDelay: `${i * 120}ms` }}>
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${m.gradient} flex items-center justify-center mb-5 shadow-md`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-[#0f172a]">{m.name}</h3>
                <p className="text-sm text-[#64748b] mt-0.5 mb-1">{m.algo}</p>
                <p className="text-sm font-semibold text-orange-600 mb-5">{m.tagline}</p>

                <div className="grid grid-cols-2 gap-2 mb-5">
                  {m.stats.map(s => (
                    <div key={s.label} className="bg-slate-50 rounded-xl p-2.5">
                      <p className="text-[10px] text-[#94a3b8] font-medium uppercase tracking-wide">{s.label}</p>
                      <p className="text-sm text-[#1e293b] font-bold mt-0.5">{s.value}</p>
                    </div>
                  ))}
                </div>

                <div className="space-y-1.5">
                  {m.bullets.map(b => (
                    <div key={b} className="flex items-center gap-2 text-sm text-[#64748b]">
                      <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-orange-500 to-rose-500 flex-shrink-0" />
                      {b}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* Flow diagram */}
        <div className="scroll-animate bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-8 mb-14 text-white">
          <h3 className="text-center text-lg font-bold mb-8 text-white/90">Zero-Touch Claim → UPI Payout Flow</h3>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {[
              { label: 'Weather API', sub: 'Rainfall > 40mm', icon: CloudRain, color: 'cyan' },
              null,
              { label: 'ML Verifier', sub: 'GPS + Platform', icon: Brain, color: 'violet' },
              null,
              { label: 'Risk Score', sub: '< 0.5 threshold', icon: Shield, color: 'emerald' },
              null,
              { label: 'UPI Payout', sub: '< 2 minutes', icon: Clock, color: 'orange' },
            ].map((step, i) =>
              step === null ? (
                <ChevronRight key={i} className="w-5 h-5 text-white/20" />
              ) : (
                <div key={step.label} className={`flex flex-col items-center bg-white/5 border border-white/10 rounded-2xl p-4 min-w-[110px]`}>
                  <div className={`w-10 h-10 rounded-xl bg-${step.color}-500/20 flex items-center justify-center mb-2`}>
                    <step.icon className={`w-5 h-5 text-${step.color}-400`} />
                  </div>
                  <p className="text-xs font-bold text-white">{step.label}</p>
                  <p className="text-[10px] text-white/40 text-center mt-0.5">{step.sub}</p>
                </div>
              )
            )}
          </div>
        </div>

        {/* CTA */}
        <div className="scroll-animate text-center">
          <div className="inline-block bg-white rounded-3xl shadow-xl border border-slate-100 p-10 max-w-md w-full">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Zap className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-[#0f172a] mb-2">Try It Live — No Login</h3>
            <p className="text-[#64748b] text-sm mb-6">
              Simulate a gig worker profile and a parametric claim. See the models return a real premium and an instant payout decision.
            </p>
            <button onClick={() => navigate('/ml-demo')}
              className="w-full flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-rose-600 hover:from-orange-400 hover:to-rose-500 text-white font-bold shadow-lg shadow-orange-200 transition-all hover:scale-105">
              <Brain className="w-5 h-5" />
              Open AI Playground
              <ChevronRight className="w-4 h-4" />
            </button>
            <p className="text-[11px] text-[#94a3b8] mt-3">₹29–₹99/week · UPI payouts · 95%+ fraud accuracy</p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default MLSection
