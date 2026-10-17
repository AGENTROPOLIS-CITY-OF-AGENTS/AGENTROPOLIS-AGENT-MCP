import contracts from './contracts/v1.json' with { type: 'json' };

// Deliberately bounded validator for the committed schema vocabulary. Unknown
// keywords fail: adding a JSON Schema feature requires implementation and tests.
const keywords = new Set(['$schema', '$id', '$defs', '$ref', 'title', 'description', 'type', 'const', 'enum', 'properties', 'required', 'additionalProperties', 'items', 'minItems', 'maxItems', 'uniqueItems', 'minLength', 'maxLength', 'pattern', 'minimum', 'maximum', 'oneOf']);
function checkSchema(schema) {
  if (!schema || typeof schema !== 'object' || Array.isArray(schema)) throw new Error('SCHEMA_INVALID');
  for (const key of Object.keys(schema)) if (!keywords.has(key)) throw new Error('SCHEMA_KEYWORD_UNSUPPORTED');
  for (const child of Object.values(schema.properties ?? {})) checkSchema(child);
  for (const child of Object.values(schema.$defs ?? {})) checkSchema(child);
  if (schema.items) checkSchema(schema.items);
  for (const child of schema.oneOf ?? []) checkSchema(child);
}
checkSchema(contracts);

function matches(value, schema) {
  if (schema.$ref) {
    const name = schema.$ref.replace('#/$defs/', '');
    if (schema.$ref !== `#/$defs/${name}` || !Object.hasOwn(contracts.$defs, name)) throw new Error('SCHEMA_REFERENCE_INVALID');
    return matches(value, contracts.$defs[name]);
  }
  if (schema.oneOf && schema.oneOf.filter((child) => matches(value, child)).length !== 1) return false;
  if (Object.hasOwn(schema, 'const') && JSON.stringify(value) !== JSON.stringify(schema.const)) return false;
  if (schema.enum && !schema.enum.includes(value)) return false;
  if (schema.type) {
    const type = value === null ? 'null' : Array.isArray(value) ? 'array' : typeof value;
    if (schema.type === 'integer' ? !Number.isSafeInteger(value) : type !== schema.type) return false;
  }
  if (typeof value === 'string') {
    if (value.length < (schema.minLength ?? 0) || value.length > (schema.maxLength ?? Infinity)) return false;
    if (schema.pattern && !new RegExp(schema.pattern, 'u').test(value)) return false;
  }
  if (typeof value === 'number' && (!Number.isFinite(value) || value < (schema.minimum ?? -Infinity) || value > (schema.maximum ?? Infinity))) return false;
  if (Array.isArray(value)) {
    if (value.length < (schema.minItems ?? 0) || value.length > (schema.maxItems ?? Infinity)) return false;
    if (schema.uniqueItems && new Set(value.map((item) => JSON.stringify(item))).size !== value.length) return false;
    if (schema.items && !value.every((item) => matches(item, schema.items))) return false;
  }
  if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
    if ((schema.required ?? []).some((key) => !Object.hasOwn(value, key))) return false;
    if (schema.additionalProperties === false && Object.keys(value).some((key) => !Object.hasOwn(schema.properties ?? {}, key))) return false;
    for (const [key, child] of Object.entries(schema.properties ?? {})) if (Object.hasOwn(value, key) && !matches(value[key], child)) return false;
  }
  return true;
}
export function validateContract(name, value) {
  if (!Object.hasOwn(contracts.$defs, name)) throw new Error('CONTRACT_UNKNOWN');
  return matches(value, contracts.$defs[name]);
}
