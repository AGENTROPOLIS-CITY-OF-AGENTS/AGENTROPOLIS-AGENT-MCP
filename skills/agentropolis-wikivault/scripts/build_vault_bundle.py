#!/usr/bin/env python3
import argparse
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path


def digest(path):
    h = hashlib.sha256()
    with path.open('rb') as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b''):
            h.update(chunk)
    return h.hexdigest()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('output_dir')
    parser.add_argument('--scan-id', required=True)
    args = parser.parse_args()
    root = Path(args.output_dir).resolve()
    root.mkdir(parents=True, exist_ok=True)

    files = []
    for path in sorted(p for p in root.rglob('*') if p.is_file() and p.name not in {'manifest.json', 'checksums.json'}):
        rel = path.relative_to(root).as_posix()
        files.append({'path': rel, 'bytes': path.stat().st_size, 'sha256': digest(path)})

    checksums = {'schema_version': '1.0.0', 'files': files}
    (root / 'checksums.json').write_text(json.dumps(checksums, indent=2, sort_keys=True), encoding='utf-8')
    manifest = {
        'schema_version': '1.0.0',
        'scan_id': args.scan_id,
        'created_at': datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z'),
        'file_count': len(files),
        'checksum_manifest': 'checksums.json',
    }
    (root / 'manifest.json').write_text(json.dumps(manifest, indent=2, sort_keys=True), encoding='utf-8')
    print(json.dumps(manifest))


if __name__ == '__main__':
    main()
