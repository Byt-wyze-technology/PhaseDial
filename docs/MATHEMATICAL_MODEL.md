# Mathematical Model

This document specifies the model implemented by the current PhaseDial engine.
It is descriptive, not a promise that unimplemented quantum operations exist.

## Scalar domains

- Ancilla count: $n\in\{2,\ldots,8\}$ in the interface.
- Energy: $E\in\mathbb R$.
- Evolution time: $t\in[0,8]$ in the interface.
- Phase: $\phi\in[0,1)$.
- Register size: $N=2^n$.
- Measurement outcome: $m\in\{0,\ldots,N-1\}$.

## Sign and unit convention

PhaseDial uses natural units with $\hbar=1$, so $Et$ is dimensionless. Standard
forward Schrödinger evolution is

$$
U_{\mathrm{fwd}}(t)=e^{-iHt}
$$

and therefore

$$
U_{\mathrm{fwd}}(t)|E\rangle=e^{-iEt}|E\rangle.
$$

PhaseDial deliberately uses the adjoint, positive-orientation unitary

$$
U_+(t)=U_{\mathrm{fwd}}^\dagger(t)=e^{+iHt}.
$$

Under the QPE convention

$$
U|\psi\rangle=e^{2\pi i\phi}|\psi\rangle,
$$

the eigenphase of $U_+$ is

$$
\phi=\frac{Et}{2\pi}\pmod 1.
$$

This positive value is the phase displayed and estimated by PhaseDial. It is
not the eigenphase of $U_{\mathrm{fwd}}$, which would be
$-Et/(2\pi)\pmod 1$.

## Phase from energy

`phaseFromEnergy` implements the selected $U_+$ convention:

$$
\operatorname{phaseFromEnergy}(E,t)
=
\frac{Et}{2\pi}\pmod 1.
$$

`clampPhase` maps any finite phase to the half-open interval $[0,1)$.

## Finite-precision estimate

The nearest $n$-bit phase estimate is

$$
m_{\mathrm{near}}
=
\operatorname{round}(N\phi)\pmod N
$$

and

$$
\widetilde\phi=\frac{m_{\mathrm{near}}}{N}.
$$

The displayed bitstring is the base-two representation of
$m_{\mathrm{near}}$, left-padded to $n$ bits.

## Circular phase error

Because phase is periodic, the displayed estimate error is the shortest
distance around the unit circle:

$$
d(a,b)=\min\left(|a-b|, 1-|a-b|\right),
$$

after both inputs are wrapped into $[0,1)$. For example, phases $0.99$ and
$0.00$ are $0.01$ turns apart, not $0.99$ turns apart.

## Ideal QPE distribution

For an eigenphase $\phi$, ideal QPE assigns outcome $m$ probability

$$
P(m)
=
\left|
\frac{1}{N}
\sum_{x=0}^{N-1}
e^{2\pi i x(\phi-m/N)}
\right|^2.
$$

For a phase that is not exactly on the $N$-point grid, the engine evaluates

$$
P(m)
=
\left[
\frac{\sin\left(\pi N(\phi-m/N)\right)}
{N\sin\left(\pi(\phi-m/N)\right)}
\right]^2.
$$

When $\phi=m/N$, the expression has a removable singularity. The engine
returns $P(m)=1$ directly.

Here and throughout the distribution calculation, $\phi$ is the eigenphase of
$U_+$ selected above.

## Sampling

`seededMeasure` selects one outcome from the calculated distribution using a
deterministic pseudo-random value derived from an integer interaction seed.
This makes repeated UI measurements varied but reproducible for a given state
and seed. It is not a cryptographic random-number generator.

## Invariants

The implemented model is expected to maintain:

1. $0\le\phi<1$;
2. $0\le P(m)\le1$ up to floating-point tolerance;
3. $\sum_m P(m)=1$ up to floating-point tolerance;
4. $m$ remains inside the declared register outcome set;
5. the bitstring length equals $n$.

The deterministic automated suite verifies phase conversion, phase wrapping,
circular phase-distance properties, nearest-estimate error bounds, exact-grid
concentration, finite and bounded probabilities, normalization across every UI
ancilla size, valid outcome metadata, and reproducible seeded sampling. A
Chromium regression also verifies the rendered estimate and error across the
zero-one boundary.

The default conversion test uses $E=\pi/4$ and $t=3.2$, which gives
$\phi=0.4$ under the $U_+$ convention. This non-half-turn case is intentionally
sign-sensitive: the forward-evolution eigenphase would instead be $0.6$.

## Pedagogical versus calculated views

The phase dial and probability chart visualize calculated values.

The stage timeline, rotating qubit arrows, energy-spectrum bars, and live
equation cards are pedagogical illustrations. They do not constitute a complete
gate-by-gate state-vector simulation.

## Numerical limitations

Calculations use JavaScript double-precision floating-point numbers. The engine
includes a small exact-grid tolerance to avoid numerical division by zero.
Tests use floating-point closeness rather than symbolic equality for
normalization.

## Not implemented

The engine does not currently implement:

- matrices or complex-vector types;
- Hermitian matrix validation;
- Hamiltonian diagonalization;
- matrix exponentiation;
- full control/target tensor-product state;
- inverse-QFT amplitude transformation;
- noisy channels;
- superposition-of-eigenstates output mixtures.

Contributions that add these features should declare their types and add
invariant tests before the documentation describes them as active behavior.

## Convention references

- [IBM Quantum: the phase-estimation problem](https://quantum.cloud.ibm.com/learning/en/courses/fundamentals-of-quantum-algorithms/phase-estimation-and-factoring/phase-estimation-problem)
  defines QPE through $U|\psi\rangle=e^{2\pi i\phi}|\psi\rangle$.
- [IBM Quantum: time evolution](https://quantum.cloud.ibm.com/learning/courses/quantum-diagonalization-algorithms/krylov)
  uses standard forward evolution $e^{-iHt}$ in natural units.
