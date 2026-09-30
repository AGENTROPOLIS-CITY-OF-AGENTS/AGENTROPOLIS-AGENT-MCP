#!/usr/bin/env python3
import argparse
import hashlib
import json
import os
from pathlib import Path

SKIP_DIRS = {'.git', 'node_modules', 'vendor', 'dist', 'build', '.next', 'coverage', '__pycache__', '.venv', 'venv'}
SECRET_NAMES = {'.env', '.env.local', '.env.production', 'id_rsa', 'id_ed25519', 'credentials.json', 'service-account.json', '.npmrc', '.pypirc'}
SENSITIVE_SUFFIXES = ('.pem', '.key', '.p12', '.pfx')


def sha256(path):
    h = hashlib.sha256()
    with path.open('rb') as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b''):
            h.update(chunk)
    return h.hexdigest()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('source')
    parser.add_argument('--output', required=True)
    parser.add_argument('--max-bytes', type=int, default=10_000_000)
    args = parser.parse_args()

    root = Path(args.source).resolve()
    if not root.is_dir():
        raise SystemExit('source must be a directory')
    out = Path(args.output)
    out.mkdir(parents=True, exist_ok=True)
    records = []

    for base, dirs, files in os.walk(root, followlinks=False):
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS and not (Path(base) / d).is_symlink()]
        for name in files:
            path = Path(base) / name
            rel = path.relative_to(root).as_posix()
            if path.is_symlink():
                records.append({'path': rel, 'quarantined': True, 'reason': 'symlink'})
                continue
            try:
                size = path.stat().st_size
            except OSError:
                records.append({'path': rel, 'quarantined': True, 'reason': 'unreadable'})
                continue

            lower = name.lower()
            sensitive = lower in SECRET_NAMES or lower.startswith('.env.') or lower.endswith(SENSITIVE_SUFFIXES)
            oversized = size > args.max_bytes
            quarantine = sensitive or oversized
            reason = 'secret_or_sensitive_name' if sensitive else ('oversized' if oversized else None)
            record = {'path': rel, 'size': size, 'quarantined': quarantine, 'reason': reason}
            if not quarantine:
                try:
                    record['sha256'] = sha256(path)
                except OSError:
                    record['quarantined'] = True
                    record['reason'] = 'unreadable'
            records.append(record)

    records.sort(key=lambda item: item['path'])
    payload = {
        'schema_version': '1.0.0',
        'root': str(root),
        'count': len(records),
        'quarantined': sum(1 for r in records if r.get('quarantined')),
        'files': records,
    }
    target = out / 'inventory.json'
    target.write_text(json.dumps(payload, indent=2, sort_keys=True), encoding='utf-8')
    print(json.dumps({'count': payload['count'], 'quarantined': payload['quarantined'], 'output': str(target)}))


if __name__ == '__main__':
    main()
