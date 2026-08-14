import { useEffect, useMemo, useState } from "react";
import {
  distribution, nearestEstimate, phaseDistance, phaseFromEnergy, seededMeasure, Stage, stages
} from "./engine";
import LessonList from "./LessonList";
import type { LessonSetup } from "./lessons";

const systems = [
  { name: "Two-level atom", energy: Math.PI / 4, levels: [0, Math.PI / 4], note: "The cleanest phase clock" },
  { name: "Spin in a field", energy: 1.93, levels: [-1.93, 1.93], note: "A symmetric energy pair" },
  { name: "Molecular modes", energy: 2.41, levels: [0.32, 1.12, 2.41, 3.08], note: "A richer four-level system" }
];

const stageCopy: Record<Stage, { eyebrow: string; title: string; body: string; equation: string }> = {
  prepare: {
    eyebrow: "Start with certainty",
    title: "Prepare one energy eigenstate.",
    body: "Forward evolution uses e⁻ⁱᴱᵗ. PhaseDial selects its adjoint U₊ = e⁺ⁱᴴᵗ so positive energy turns the dial in the positive direction.",
    equation: "U_fwd|E⟩ = e⁻ⁱᴱᵗ|E⟩"
  },
  superposition: {
    eyebrow: "Open every clock",
    title: "Create a uniform control register.",
    body: "Hadamard gates place the ancillas in every time label at once. Each branch is ready to sample a different evolution duration.",
    equation: "|+⟩ⁿ = 1/√2ⁿ  Σₓ |x⟩"
  },
  kickback: {
    eyebrow: "Hide a frequency in phase",
    title: "Let controlled powers tick.",
    body: "Controlled powers of U₊ leave the target eigenstate unchanged while its positive eigenphase is kicked into the control register.",
    equation: "U₊|E⟩ = e²πⁱφ|E⟩"
  },
  qft: {
    eyebrow: "Refocus the signal",
    title: "Turn rotation into position.",
    body: "The inverse quantum Fourier transform makes amplitudes interfere. Most probability gathers at the integer nearest to 2ⁿφ.",
    equation: "QFT⁻¹ : phase pattern → basis peak"
  },
  measure: {
    eyebrow: "Read the invisible dial",
    title: "Measure a finite-bit answer.",
    body: "Measurement returns a bitstring. It is an estimate, not an infinitely precise phase—the resolution is set by the ancilla count.",
    equation: "φ̃ = m / 2ⁿ"
  }
};

function PhaseDial({ phase, estimate }: { phase: number; estimate: number }) {
  const angle = phase * 360 - 90;
  const estimateAngle = estimate * 360 - 90;
  const point = (deg: number, radius: number) => {
    const rad = deg * Math.PI / 180;
    return { x: 150 + Math.cos(rad) * radius, y: 150 + Math.sin(rad) * radius };
  };
  const tip = point(angle, 104);
  const estimateTip = point(estimateAngle, 90);
  return (
    <svg className="dial" viewBox="0 0 300 300" role="img" aria-label={`Phase dial at ${phase.toFixed(3)} turns`}>
      <defs>
        <radialGradient id="dialGlow"><stop stopColor="#142d35" /><stop offset="1" stopColor="#081018" /></radialGradient>
        <filter id="glow"><feGaussianBlur stdDeviation="4" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
      </defs>
      <circle cx="150" cy="150" r="126" fill="url(#dialGlow)" stroke="#28404a" />
      {Array.from({ length: 32 }, (_, i) => {
        const a = i * 11.25 - 90; const p1 = point(a, i % 4 === 0 ? 110 : 116); const p2 = point(a, 122);
        return <line key={i} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke={i % 4 === 0 ? "#b5c8c9" : "#435961"} strokeWidth={i % 4 === 0 ? 2 : 1} />;
      })}
      <path d={`M150 150 L${estimateTip.x} ${estimateTip.y}`} stroke="#f6b86a" strokeWidth="2" strokeDasharray="5 6" opacity=".75" />
      <path d={`M150 150 L${tip.x} ${tip.y}`} stroke="#6ef0ce" strokeWidth="4" strokeLinecap="round" filter="url(#glow)" />
      <circle cx="150" cy="150" r="9" fill="#6ef0ce" />
      <text x="150" y="187" textAnchor="middle" className="dial-value">{phase.toFixed(3)}</text>
      <text x="150" y="207" textAnchor="middle" className="dial-unit">PHASE TURNS</text>
      <text x="150" y="43" textAnchor="middle" className="dial-label">0</text>
      <text x="255" y="155" textAnchor="middle" className="dial-label">¼</text>
      <text x="150" y="267" textAnchor="middle" className="dial-label">½</text>
      <text x="45" y="155" textAnchor="middle" className="dial-label">¾</text>
    </svg>
  );
}

export default function App() {
  const [systemIndex, setSystemIndex] = useState(0);
  const [bits, setBits] = useState(4);
  const [time, setTime] = useState(3.2);
  const [stageIndex, setStageIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [measureSeed, setMeasureSeed] = useState(3);
  const system = systems[systemIndex];
  const phase = phaseFromEnergy(system.energy, time);
  const estimate = nearestEstimate(phase, bits);
  const data = useMemo(() => distribution(phase, bits), [phase, bits]);
  const measured = seededMeasure(phase, bits, measureSeed);
  const activeStage = stages[stageIndex].id;
  const copy = stageCopy[activeStage];

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => {
      setTime(value => (value + 0.035) % 8);
    }, 40);
    return () => window.clearInterval(timer);
  }, [playing]);

  const next = () => setStageIndex(value => Math.min(stages.length - 1, value + 1));
  const norm = useMemo(() => data.reduce((sum, item) => sum + item.probability, 0), [data]);
  const maxProbability = Math.max(...data.map(item => item.probability));

  const applyLesson = (setup: LessonSetup) => {
    if (setup.systemIndex !== undefined) setSystemIndex(setup.systemIndex);
    if (setup.bits !== undefined) setBits(setup.bits);
    if (setup.time !== undefined) {
      setPlaying(false);
      setTime(setup.time);
    }
    if (setup.stageIndex !== undefined) setStageIndex(setup.stageIndex);
    document.getElementById(setup.scrollTo ?? "lab")?.scrollIntoView({ behavior: "smooth" });
  };

  const visibleDistribution = bits <= 6 ? data : data.filter((_, i) => i % (2 ** (bits - 6)) === 0 || Math.abs(i - estimate.index) < 3);

  return (
    <main>
      <header className="topbar">
        <a className="brand" href="#top" aria-label="PhaseDial home">
          <span className="brand-mark"><i /></span>
          <span><b>PhaseDial</b><small>QUANTUM EXPLORER</small></span>
        </a>
        <nav><a href="#lab">Lab</a><a href="#bridge">The bridge</a><a href="#learn">Learn</a></nav>
        <div className="header-status"><span className="status-dot" /> Ideal QPE model <span className="shortcut">?</span></div>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="kicker">INTERACTIVE QUANTUM PHYSICS</p>
          <h1>See energy<br />become a <em>phase.</em></h1>
          <p className="lede">Follow one hidden frequency through quantum phase estimation—one rotation, one gate, one bit at a time.</p>
          <a className="primary-link" href="#lab">Enter the lab <span>↓</span></a>
        </div>
        <div className="hero-visual">
          <div className="orbit orbit-one" /><div className="orbit orbit-two" />
          <PhaseDial phase={phase} estimate={estimate.phase} />
          <div className="float-label energy"><small>EIGENENERGY</small><b>E = {system.energy.toFixed(3)}</b></div>
          <div className="float-label resolution"><small>RESOLUTION</small><b>1 / {2 ** bits}</b></div>
        </div>
        <div className="hero-foot">
          <span>01 / 10 &nbsp; THE HIDDEN CLOCK</span>
          <p>Energy levels are frequencies in disguise.</p>
          <span className="scroll">SCROLL TO EXPLORE ↓</span>
        </div>
      </section>

      <section className="lab-section" id="lab">
        <div className="section-heading">
          <div><p className="kicker">THE PHASE LAB</p><h2>Turn the dial. Watch the math respond.</h2></div>
          <p>Every view below reads from the same quantum snapshot, so the story and the numbers never drift apart.</p>
        </div>

        <div className="lab-shell">
          <aside className="controls">
            <div className="control-group">
              <label>SYSTEM</label>
              <div className="select-wrap">
                <select value={systemIndex} onChange={e => setSystemIndex(Number(e.target.value))}>
                  {systems.map((item, i) => <option value={i} key={item.name}>{item.name}</option>)}
                </select>
              </div>
              <p>{system.note}</p>
            </div>
            <div className="spectrum-mini">
              <label>ENERGY SPECTRUM</label>
              {system.levels.map((level, i) => (
                <div className="level" key={i}><span>E{i}</span><i style={{ width: `${28 + ((level - Math.min(...system.levels)) / (Math.max(...system.levels) - Math.min(...system.levels) || 1)) * 62}%` }} /><b>{level.toFixed(2)}</b></div>
              ))}
            </div>
            <div className="control-group">
              <div className="label-row"><label>ANCILLA QUBITS</label><output>{bits}</output></div>
              <input type="range" min="2" max="8" value={bits} onChange={e => setBits(Number(e.target.value))} aria-label="Ancilla qubits" />
              <div className="range-notes"><span>2</span><span>resolution 1/{2 ** bits}</span><span>8</span></div>
            </div>
            <div className="control-group">
              <div className="label-row"><label>EVOLUTION TIME</label><output>{time.toFixed(2)}</output></div>
              <input type="range" min="0" max="8" step=".01" value={time} onChange={e => setTime(Number(e.target.value))} aria-label="Evolution time" />
              <div className="transport">
                <button onClick={() => setTime(0)} aria-label="Reset time">↺</button>
                <button className="play" onClick={() => setPlaying(v => !v)} aria-label={playing ? "Pause" : "Play"}>{playing ? "Ⅱ" : "▶"}</button>
                <button onClick={() => setTime(v => Math.min(8, v + .25))} aria-label="Step time">→</button>
              </div>
            </div>
            <div className="mode-note"><span className="status-dot" /><div><b>Analytical mode</b><small>Ideal distribution calculated</small></div></div>
          </aside>

          <div className="workspace">
            <div className="workspace-head">
              <div><span className="step-number">{stages[stageIndex].short}</span><div><small>{copy.eyebrow}</small><h3>{copy.title}</h3></div></div>
              <span className="invariant" title="Total probability across every register outcome, summed live.">
                NORM = {norm.toFixed(3)} {Math.abs(norm - 1) < 1e-9 ? "✓" : "✗"}
              </span>
            </div>
            <div className="visual-grid">
              <div className="dial-panel">
                <PhaseDial phase={phase} estimate={estimate.phase} />
                <div className="phase-readout"><span>φ₊ = Et / 2π</span><b>{phase.toFixed(4)} turns</b></div>
              </div>
              <div className="register-panel">
                <div className="panel-title"><span>CONTROL REGISTER</span><small>{2 ** bits} states</small></div>
                <div className="qubits">
                  {Array.from({ length: bits }, (_, i) => (
                    <div className={`qubit ${stageIndex > 0 ? "active" : ""}`} key={i}><span>q{i}</span><i>{stageIndex === 0 ? "0" : "+"}</i><em style={{ transform: `rotate(${stageIndex > 1 ? phase * 360 * 2 ** i : 0}deg)` }}>↑</em></div>
                  ))}
                </div>
                <div className="equation-card"><small>LIVE EQUATION</small><strong>{copy.equation}</strong><p>{copy.body}</p></div>
              </div>
            </div>
            <div className="timeline">
              {stages.map((item, i) => (
                <button key={item.id} className={i === stageIndex ? "current" : i < stageIndex ? "done" : ""} onClick={() => setStageIndex(i)}>
                  <span>{i < stageIndex ? "✓" : item.short}</span><b>{item.label}</b>
                </button>
              ))}
            </div>
            <div className="workspace-actions">
              <button className="secondary" onClick={() => setStageIndex(v => Math.max(0, v - 1))} disabled={stageIndex === 0}>← Back</button>
              {stageIndex < 4
                ? <button className="primary" onClick={next}>Next operation <span>→</span></button>
                : <button className="primary" onClick={() => setMeasureSeed(v => v + 1)}>Measure again <span>⌁</span></button>}
            </div>
          </div>
        </div>
      </section>

      <section className="result-section">
        <div className="result-head">
          <div><p className="kicker">THE READOUT</p><h2>A phase becomes a bitstring.</h2></div>
          <div className="measurement"><small>LATEST MEASUREMENT</small><b>{measured.bits}</b><span>decimal {measured.outcome} · {(measured.probability * 100).toFixed(1)}% likelihood</span></div>
        </div>
        <div className="chart-card">
          <div className="chart-meta"><span>MEASUREMENT PROBABILITY</span><span><i className="legend-target" /> true φ₊&nbsp;&nbsp; <i className="legend-estimate" /> nearest estimate</span></div>
          <div className="bars">
            {visibleDistribution.map(item => (
              <div className={`bar-wrap ${item.outcome === measured.outcome ? "measured" : ""}`} key={item.outcome}>
                <div className="bar" style={{ height: `${Math.max(1, item.probability / maxProbability * 100)}%` }}><span>{item.probability > .08 ? `${Math.round(item.probability * 100)}%` : ""}</span></div>
                <small>{bits <= 5 ? item.bits : item.outcome}</small>
              </div>
            ))}
          </div>
          <div className="precision-row">
            <div><small>TRUE PHASE</small><b>{phase.toFixed(6)}</b></div>
            <span>→</span>
            <div><small>{bits}-BIT ESTIMATE</small><b>{estimate.phase.toFixed(6)}</b></div>
            <span>→</span>
            <div><small>PHASE ERROR</small><b>{phaseDistance(phase, estimate.phase).toFixed(6)}</b></div>
          </div>
        </div>
      </section>

      <section className="bridge" id="bridge">
        <p className="kicker">THE BRIDGE</p>
        <h2>Same hidden frequency.<br /><em>Two ways to find it.</em></h2>
        <div className="bridge-grid">
          <article><span className="bridge-icon">∿</span><small>CLASSICAL</small><h3>Sample a rotating signal.</h3><p>Observe a complex wave at many times, then use a Fourier transform to reveal its dominant frequency.</p><code>f(t) = eⁱᴱᵗ</code><footer><span>time samples</span><b>FFT → peak</b></footer></article>
          <div className="versus"><span>↔</span><small>SAME<br />DANCE</small></div>
          <article><span className="bridge-icon quantum">ψ</span><small>QUANTUM</small><h3>Interfere evolution histories.</h3><p>Query controlled powers of the selected adjoint U₊ in superposition, then use an inverse QFT to focus probability on its positive eigenphase.</p><code>U₊|E⟩ = e²πⁱφ|E⟩</code><footer><span>controlled powers</span><b>QFT⁻¹ → bits</b></footer></article>
        </div>
        <p className="bridge-boundary">The analogy explains the signal structure—not a classical speed-up. Quantum advantage only matters when the underlying system no longer fits in classical memory.</p>
      </section>

      <section className="learn" id="learn">
        <div>
          <p className="kicker">KEEP EXPLORING</p>
          <h2>One idea.<br />Ten experiments.</h2>
          <p className="learn-lede">Each lesson sets the lab up to show exactly what it describes. Every number quoted is one the simulator produces.</p>
        </div>
        <LessonList onApply={applyLesson} />
      </section>

      <footer className="footer">
        <div className="brand"><span className="brand-mark"><i /></span><span><b>PhaseDial</b><small>QUANTUM EXPLORER</small></span></div>
        <p>See energy become a phase.<br />Read the invisible dial.</p>
        <small>Teaching simulator · Analytical ideal-QPE model · No hardware connection</small>
      </footer>
    </main>
  );
}
