# NFT and XRPL Lane

## Extract

Recover collection identity, description, planned and actual supply, token identifiers, traits, values, rarity rules, mint phases, allowlist logic, utility, access rights, burn or upgrade mechanics, visual prompts, metadata URIs, media references, issuer or contract references, and canon relationships.

## State separation

Never equate concept art, metadata drafts, mint configuration, minted state, or ledger verification.

Use states such as:

- CONCEPT
- TRAIT_DRAFT
- METADATA_READY
- MINT_CONFIGURED
- MINTED_UNVERIFIED
- LEDGER_VERIFIED
- BURNED
- SUPERSEDED

## XRPL verification

When a ledger adapter is available, verify relevant fields such as NFTokenID, NFTokenTaxon, Issuer, URI, TransferFee, Flags, owner, mint transaction, offers, and burn state.

Store ledger evidence separately from repository evidence and link them by stable identifiers.

## Rarity

Do not invent rarity weights. Preserve declared rarity models and separately compute observed distribution metrics when token-level metadata is available.
