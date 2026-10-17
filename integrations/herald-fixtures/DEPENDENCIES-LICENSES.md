# Dependency and license review

The new fixture adapter has zero third-party dependencies and uses only
`node:crypto`, local JSON and its local validator. Tests additionally use the
Node standard library. No dependency or lockfile was changed; no package
installation, downloaded binary, model, container or live credential was used.

No Herald, Hermes, 54T or AEGIS implementation was vendored, imported or run.
Governance references are commit IDs and links. Synthetic fixtures are authored
for this PoC. The integration code is maintained in the official owner repository;
it does not claim the right to relicense existing repository material.

Herald source at the pinned audit commit is MIT, requiring preservation of its
copyright/permission notice if later copied. No Herald source copy is needed
here. Whole Herald redistribution retains the audit's third-party notice,
license inventory, binary provenance and vulnerability-review blockers.

The owner repository has NOTICE.md but no root LICENSE or package license field
at the pinned revision. GitHub returned no detected license. This is not a reason
to invent a license grant. Owner review of licensing and external redistribution
is BLOCKED. Public draft PR publication was separately authorized by the user.

The Node v24.19.0 runtime was preinstalled. Its binary/SBOM/advisories were not
independently certified. The repository targets Node >=22; remote Node 22 CI is
separate evidence. No claim of CVE-free dependencies or operational certification.
