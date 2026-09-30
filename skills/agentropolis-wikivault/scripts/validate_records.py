#!/usr/bin/env python3
import argparse
import json
import re
from datetime import datetime
from pathlib import Path

CANON = {'LOCKED_CANON', 'ACTIVE_CANON', 'PROVISIONAL', 'CONCEPT', 'DEPRECATED', 'SUPERSEDED', 'CONTRADICTED', 'UNKNOWN'}
EVIDENCE = {'PLANNED', 'IMPLEMENTED', 'DEPLOYED', 'OBSERVED', 'VERIFIED', 'UNVERIFIED'}
HEX64 = re.compile(r'^[a-fA-F0-9]{64}$')


def valid_time(value):
    if not isinstance(value, str) or not value:
        return False
    try:
        datetime.fromisoformat(value.replace('Z', '+00:00'))
        return True
    except ValueError:
        return False


def validate(record, line_no):
    errors = []
    for field in ('record_id', 'record_type', 'namespace', 'canon_status', 'evidence_state', 'confidence', 'provenance'):
        if field not in record:
            errors.append(f'line {line_no}: missing {field}')
    if record.get('canon_status') not in CANON:
        errors.append(f'line {line_no}: invalid canon_status')
    if record.get('evidence_state') not in EVIDENCE:
        errors.append(f'line {line_no}: invalid evidence_state')
    confidence = record.get('confidence')
    if not isinstance(confidence, (int, float)) or isinstance(confidence, bool) or not 0 <= confidence <= 1:
        errors.append(f'line {line_no}: confidence must be 0..1')
    provenance = record.get('provenance')
    if not isinstance(provenance, dict):
        errors.append(f'line {line_no}: provenance must be object')
    else:
        for field in ('source_type', 'source', 'observed_at'):
            if not provenance.get(field):
                errors.append(f'line {line_no}: provenance missing {field}')
        digest = provenance.get('content_sha256')
        if digest is not None and not HEX64.match(str(digest)):
            errors.append(f'line {line_no}: invalid content_sha256')
        if provenance.get('observed_at') and not valid_time(provenance['observed_at']):
            errors.append(f'line {line_no}: invalid observed_at')
    return errors


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('records')
    args = parser.parse_args()
    path = Path(args.records)
    errors = []
    count = 0
    with path.open('r', encoding='utf-8') as f:
        for line_no, line in enumerate(f, 1):
            if not line.strip():
                continue
            count += 1
            try:
                record = json.loads(line)
            except json.JSONDecodeError as exc:
                errors.append(f'line {line_no}: invalid JSON: {exc.msg}')
                continue
            if not isinstance(record, dict):
                errors.append(f'line {line_no}: record must be object')
                continue
            errors.extend(validate(record, line_no))
    if errors:
        for error in errors:
            print(error)
        raise SystemExit(1)
    print(json.dumps({'status': 'valid', 'records': count, 'path': str(path)}))


if __name__ == '__main__':
    main()
