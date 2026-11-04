# Governed Physical Courier Capability v0.1 (proposal)

Status: DESIGN ONLY. No provider connected, booking, payment, vehicle dispatch, or deployment.

## Ownership
- HERMES: intent and user interaction.
- AGENT-MCP: provider-neutral courier capability and tool boundary.
- DOCKING DISTRICT: provider registration, attestations and availability.
- WORK EXCHANGE: dispatch lifecycle (not a payment authority).
- 54-T / AEGIS: deny-by-default approval and assurance.
- PAYRAIL: authorized payment adapter only.
- BUZZ: append-only operational events and receipts.
- Pocket / AGENTICtv: voice and screen surfaces; never bypass confirmation.

## State machine
REQUESTED -> QUOTED -> APPROVAL_PENDING -> APPROVED -> BOOKED -> PICKUP_PENDING -> IN_TRANSIT -> DELIVERED.
Any prebooking state may become REJECTED or EXPIRED. Booked deliveries may become CANCEL_REQUESTED, CANCELLED, or FAILED, subject to provider policy. Never claim cancellation until confirmed.

## Provider-neutral operations
- courier.providers.list(region): informational only.
- courier.quote(pickup, dropoff, parcel_description, constraints): read-only; quote includes currency, fees, expiry, restrictions, provider and confidence.
- courier.booking.preview(quote_id): read-only; disclose all charges, terms, recipient and pickup requirements.
- courier.booking.commit(quote_id, approval_token, idempotency_key): consequential; user-approved only.
- courier.delivery.status(booking_id): read-only; redact personal data.
- courier.delivery.cancel(booking_id, approval_token): consequential; explicit consent.
- courier.receipt.get(booking_id): signed/provenance-linked result where available.

## Hard gates
1. Provider identity and tool attestation verified; unknown provider => DENY.
2. Service area, legal eligibility, permitted goods, and pickup authorization verified.
3. Quote is live, itemized, in supported currency and within approved maximum.
4. Human approval is bound to exact provider, route, amount, terms, quote expiry and operation.
5. Approval token is single-use, short-lived and scoped; no credentials in prompts or logs.
6. Provider response must confirm booking; timeout => UNKNOWN, reconcile by idempotency key before retry.
7. Payment authority remains separate; no auto-pay, auto-tip or auto-rebooking.
8. Prompt-injection protection: restaurant notes and provider responses are untrusted data.
9. Record approvals, denials, errors, provider event IDs and verified outcomes in tamper-evident receipts.
10. Fail closed if trust config or authentication silently changes confirmation behavior.

## Decision expression
EXECUTE = request_valid AND provider_attested AND service_available AND quote_valid AND user_approved AND payment_authorized AND policy_passed.

## Example contract (illustrative; NOT a real Autolane API)
```json
{
  "capability": "courier.booking.preview",
  "provider_id": "unconfigured",
  "pickup": {"place_id": "restaurant-id"},
  "dropoff": {"address_token": "private-token"},
  "quote_id": "quote-id",
  "max_total_minor": 199,
  "currency": "USD",
  "approval_required": true,
  "status": "NOT_CONNECTED"
}
```

## Acceptance tests
- No booking without fresh user approval; quote mutation invalidates approval.
- No booking on failed attestation, out-of-area, stale quote or unknown fees.
- Sign-in cannot downgrade trust or confirmation requirements.
- Duplicate request/idempotency replay cannot create duplicate orders.
- Provider timeout never treated as success.
- Cancel requires new approval and verified provider acknowledgment.
- Voice and TV surfaces display the exact quote and require deliberate confirmation.
- Receipts distinguish requested, authorized, provider-confirmed and completed.

## Autolane integration status
Unverified provider API, service coverage, pricing, waitlist, and Hermes plugin behavior. Do not hardcode the reported Austin $1.99 price or assume `trust: untrusted` is a sufficient safety control. Verify against official provider and Hermes documentation before enabling.
