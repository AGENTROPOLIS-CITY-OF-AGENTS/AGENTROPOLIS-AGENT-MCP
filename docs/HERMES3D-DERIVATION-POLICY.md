# HERMES spatial experience — derivation policy

## Decision
AGENTROPOLIS does **not** vendor, copy, skin, or reproduce `iamlukethedev/Hermes3D` verbatim.

The upstream project is MIT licensed, but AGENTROPOLIS uses it only as an architectural/reference signal unless a future adapter is explicitly approved. Any copied or substantially derived upstream code would require preservation of its MIT copyright/license notice and provenance receipt.

## AGENTROPOLIS implementation
The Studio Grid uses an independently authored spatial presentation:

- original procedural WebGL2 renderer in `public/studio3d.js`;
- original signed-distance-field studio geometry;
- cinematic lighting, soft-shadow approximation, specular response, fog, tone mapping, film grain and vignette;
- original Stage 33 / virtual-production art direction;
- district-scoped Bot Mode crew model;
- AGENTROPOLIS identity, mandate, 54-T, execution-corridor and receipt governance.

No upstream Hermes3D source files, assets, UI markup, shaders, scene files, models, textures, namespaced modules, or bundled dependencies are included in this implementation.

## Visual target
The target is **3D hyperrealistic cinematic virtual production**, not pixel art and not a clone of Hermes3D. Browser rendering should prioritize physically suggestive materials, cinematic exposure, depth, reflections/specular response, practical lighting, volumetric/fog cues, camera motion and high-quality spatial composition while degrading safely on unsupported devices.

## Future upstream adapter
If Hermes3D interoperability is added later, it must be isolated behind a governed adapter and pass provenance/license review, Skill Install Assurance, 54-T effective-capability review, permission/egress checks and reversible disablement before production promotion.
