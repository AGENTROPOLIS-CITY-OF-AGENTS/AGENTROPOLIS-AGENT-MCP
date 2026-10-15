# Market Intelligence Capability Registration

## Purpose

Register market-intelligence functions as bounded capabilities behind the Agentropolis capability membrane. These tools produce observations/evidence; they do not possess trading authority.

## Proposed Capability IDs

```text
market.fibonacci.detect
market.breakout.detect
market.reversal.detect
market.fvg.detect
market.candlestick.classify
market.heikin_ashi.transform
market.renko.transform
market.harmonics.detect
market.elliott.classify
market.gann.analyze
market.support_resistance.detect
market.dynamic_sr.compute
market.trendline.fit
market.momentum.compute
market.oscillator.compute
market.divergence.detect
market.volume.analyze
market.ma.compute
market.psar.compute
market.confluence.score
market.regime.classify
```

## Registration Requirements

Each capability MUST declare capability ID/version, input/output schemas, supported instruments/venues, deterministic/heuristic/experimental classification, provenance requirements, cost/latency where material, stale-data behavior, authority requirement, evidence/receipt fields, and compatible Execution Envelope major versions.

## Output Boundary

Detector tools return normalized `MarketEvidence`. They MUST NOT return an executable order as their authoritative output.

An execution adapter is a separate capability class and requires its own policy, economic exposure, approval, simulation, signing, and receipt controls.

## Experimental Capabilities

Elliott, Gann, lunar-cycle correlation, and other subjective/experimental methods MUST be marked accordingly and cannot independently satisfy a consequential execution gate.

## Adapter Principle

External trading/execution systems such as Hummingbot or future CEX/DEX adapters are limbs behind the membrane, never the Agentropolis policy authority or strategy brain.
