# Cognitive Runtime Adapter Boundary

AGENTROPOLIS-AGENT-MCP may transport descriptors, capability handles, tools, and resources required by an AEGIS-qualified cognitive-runtime profile. It does not grant the profile independent authority.

## Initial candidate

`external.tiger.jspace-v3.6` refers to the third-party J-Space Cognition Suite V3.6. It is not `AGENTROPOLIS::JSPACE`, and ATG remains Atralith.

## Adapter rules

1. External profile packages enter through the Ingest Membrane and quarantine path.
2. Pin source repository, commit/version, checksums, license, and dependency manifest before execution.
3. No automatic installation or execution from an unpinned remote branch.
4. No raw credentials, private keys, seed phrases, provider tokens, or private chain-of-thought may be passed to the profile.
5. The profile receives only scoped capability handles required for the qualified task class.
6. Durable memory writes must pass through the governed Memory Gateway.
7. Network egress remains subject to AEGIS/54-T/IRON GATE policy.
8. The profile cannot expand its own MCP/tool permissions.
9. Every invocation carries the AEGIS qualification receipt and CHAOS RANK routing receipt.
10. Any source/version mismatch invalidates the qualification and falls back to the base runtime.

## Descriptor contract

```json
{
  "profile_id": "external.tiger.jspace-v3.6",
  "source_ref": "pinned-commit-required",
  "source_license": "Apache-2.0",
  "aegis_receipt": "required",
  "routing_receipt": "required",
  "capabilities": [],
  "memory_write": "gateway-only",
  "secret_access": "deny",
  "private_reasoning_capture": false,
  "fallback": "base-runtime"
}
```

## Failure behavior

Adapter errors, invalid receipts, unavailable dependencies, unqualified source changes, or permission mismatches must fail closed for the external profile and return control to the approved base runtime. The adapter must not silently broaden permissions to keep a task running.
