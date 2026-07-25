

# PhaseDial Explorer

## Formal Mathematical Specification

### Version 1.0 (Audit Edition)

---

# 1. Purpose

This document defines the mathematical model implemented by PhaseDial Explorer.

Its objectives are to:

* define all mathematical types;
* define every state variable;
* define all transition operators;
* declare all invariants;
* define exact and analytical execution domains;
* provide a complete audit ledger.

The implementation SHALL conform to this specification.

---

# 2. Mathematical Universe

## 2.1 Scalar Domains

[
\mathbb N
]

natural numbers

[
\mathbb Z
]

integers

[
\mathbb R
]

real numbers

[
\mathbb C
]

complex numbers

---

## 2.2 Hilbert Space

For dimension

[
d\in\mathbb N
]

define

[
\mathcal H_d=\mathbb C^d
]

with inner product

[
\langle x,y\rangle
==================

x^\dagger y
]

---

## 2.3 State Vectors

Quantum states are

[
|\psi\rangle\in\mathcal H_d
]

subject to

[
\boxed{
\langle\psi|\psi\rangle=1
}
]

---

## 2.4 Hamiltonians

Hamiltonians satisfy

[
H\in\mathbb C^{d\times d}
]

with

[
\boxed{
H=H^\dagger
}
]

---

## 2.5 Unitary Operators

[
U\in\mathbb C^{d\times d}
]

must satisfy

[
\boxed{
U^\dagger U=I
}
]

---

# 3. System State

The complete simulator state is

[
S=
(H,
\psi,
n,
t,
M,
h,
v)
]

where

* (H) is the Hamiltonian
* (\psi) is the current quantum state
* (n) is ancilla count
* (t) is simulation time
* (M) is measurement history
* (h) is operation history
* (v) is visualisation state

---

# 4. State Space

The simulator transition function is

[
F:S\rightarrow S
]

Every transition SHALL satisfy

[
F(S)\subseteq S
]

Violation:

STATE_SPACE_VIOLATION

---

# 5. Eigenstructure

Eigenpairs satisfy

[
H|E_i\rangle
============

E_i|E_i\rangle
]

with

[
E_i\in\mathbb R
]

and

[
\langle E_i|E_j\rangle=\delta_{ij}
]

---

# 6. Time Evolution

Exact evolution is

[
U(t)
====

e^{-iHt}
]

Transition

[
T_t:\mathcal H_d
\rightarrow
\mathcal H_d
]

defined by

[
|\psi(t)\rangle
===============

U(t)|\psi(0)\rangle
]

---

# 7. Controlled Evolution

For ancilla basis state

[
|x\rangle
]

define

[
C_U
:
|x\rangle|\psi\rangle
\mapsto
|x\rangle U^x|\psi\rangle
]

where

[
x
\in
{0,\ldots,2^n-1}
]

---

# 8. Phase Kickback

If

[
U|\psi\rangle
=============

e^{2\pi i\phi}
|\psi\rangle
]

then

[
|x\rangle|\psi\rangle
\rightarrow
e^{2\pi i\phi x}
|x\rangle|\psi\rangle
]

The target state is invariant.

Only the control amplitudes acquire phase.

---

# 9. Inverse Quantum Fourier Transform

Define

[
QFT^{-1}
:
\mathbb C^{2^n}
\rightarrow
\mathbb C^{2^n}
]

by

[
|k\rangle
\mapsto
\frac1{\sqrt N}
\sum_{x=0}^{N-1}
e^{-2\pi i kx/N}
|x\rangle
]

---

# 10. Measurement

Measurement operator

[
Measure
:
\mathbb C^{2^n}
\rightarrow
{0,\ldots,2^n-1}
]

returns

[
m
]

with probability

[
P(m)
====

|\langle m|\psi\rangle|^2
]

---

# 11. Classical Analogue

Classical signal

[
f(t)
====

e^{iEt}
]

Sampling operator

[
Sample
:
\mathbb R
\rightarrow
\mathbb C
]

Discrete Fourier Transform

[
FFT
:
\mathbb C^N
\rightarrow
\mathbb C^N
]

This mapping is pedagogical only.

No computational equivalence is implied.

---

# 12. Exact Execution Domain

Exact simulation SHALL satisfy

[
d
\le
16
]

Entire state vector exists.

Matrix exponential is evaluated exactly within numerical precision.

---

# 13. Analytical Domain

If

[
d>16
]

the simulator SHALL NOT construct a full state vector.

Instead it SHALL compute only

* ideal phase
* expected probability distribution
* finite precision error

No hidden approximation is permitted.

---

# 14. Transition Types

All operators are explicitly typed.

[
Diagonalise
:
\mathbb C^{d\times d}
\rightarrow
(\mathbb R^d,\mathbb C^{d\times d})
]

---

[
TimeEvolution
:
(\mathbb C^{d\times d},
\mathcal H_d,
\mathbb R)
\rightarrow
\mathcal H_d
]

---

[
ControlledU
:
(\mathcal H_{2^n},
\mathcal H_d)
\rightarrow
(\mathcal H_{2^n},
\mathcal H_d)
]

---

[
InverseQFT
:
\mathcal H_{2^n}
\rightarrow
\mathcal H_{2^n}
]

---

[
Measure
:
\mathcal H_{2^n}
\rightarrow
{0,\ldots,2^n-1}
]

---

# 15. Invariants

The following SHALL hold after every transition.

## I1

Normalization

[
\boxed{
|\psi|=1
}
]

---

## I2

Hermiticity

[
\boxed{
H=H^\dagger
}
]

---

## I3

Unitary evolution

[
\boxed{
U^\dagger U=I
}
]

---

## I4

Probability conservation

[
\boxed{
\sum_i P_i=1
}
]

---

## I5

Eigenvalue reality

[
\boxed{
E_i\in\mathbb R
}
]

---

## I6

Orthogonality

[
\boxed{
\langle E_i|E_j\rangle=\delta_{ij}
}
]

---

## I7

State-space preservation

Every operator satisfies

[
F(S)\subseteq S
]

---

## I8

History monotonicity

Operation history is append-only except for explicit undo/reset transitions.

---

# 16. Approximation Boundary

The implementation SHALL expose

[
Mode
\in
{
Exact,
Analytical
}
]

Mode transitions SHALL be explicit.

Silent mode switching is prohibited.

---

# 17. Conservation Ledger

The simulator is an informational system executed on classical hardware.

## Physical Ledger

Electrical host power

[
P_{host}=VI
]

must satisfy

[
P_{in}
======

P_{CPU}
+
P_{GPU}
+
P_{display}
+
P_{loss}
]

No claim of physical energy amplification is made.

---

## Mathematical Ledger

Quantum evolution preserves norm.

[
\boxed{
\frac{d}{dt}
\langle\psi|\psi\rangle
=======================

0
}
]

Probability is conserved.

Expected value evolution satisfies

[
\frac{d}{dt}
\langle A\rangle
================

i
\langle
[H,A]
\rangle
]

for observables (A) without explicit time dependence.

---

## Educational Ledger

Input

* user interactions
* parameter selection

Output

* rendered mathematical state
* explanatory annotations

No claim is made that information content exceeds the implemented mathematical model.

---

# 18. Audit Conditions

A conforming implementation SHALL satisfy:

* No hidden state variables.
* No undeclared approximations.
* No state-space violations.
* No probability leakage.
* No non-unitary exact evolution.
* No analytical mode masquerading as exact simulation.
* All transition operators typed.
* All invariants continuously maintained.

---

# 19. Formal Audit Certificate

If Sections 2–18 are satisfied by implementation and verified through testing, the implementation may be certified:

**Audit Status:** PASS

**Certificate:** *Mathematically Well-Typed, State-Conservative, Invariant-Preserving, Approximation-Explicit.*

This specification addresses the audit gaps identified previously by making the system's mathematical objects, transition functions, invariants, execution modes, and conservation properties explicit while remaining consistent with the uploaded project description. 
