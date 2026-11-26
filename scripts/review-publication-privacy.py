#!/usr/bin/env python3
"""Private pre-publication inventory; report counts only, never raw matches."""
import collections
import json
import os
import re
import struct
import subprocess
import urllib.request
from pathlib import Path

def git(*args):
    return subprocess.check_output(["git", *args])

patterns = {
    "non_noreply_email": re.compile(rb"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b"),
    "local_user_path": re.compile(rb"(?:/Users/|/home/|[A-Za-z]:\\Users\\)[^\s/\\\"'<>]+", re.I),
    "private_key_marker": re.compile(rb"-----BEGIN (?:RSA |EC |OPENSSH |DSA |ENCRYPTED )?PRIVATE KEY-----"),
    "original_source_reference": re.compile(rb"AlphaPhoenixNW/" + rb"nothing\b|INC-001-" + rb"NON-LAUNCH", re.I),
}
def classify(data):
    found = set()
    for label, pattern in patterns.items():
        matches = pattern.findall(data)
        if label == "non_noreply_email":
            matches = [x for x in matches if not re.search(rb"noreply|@example\.(?:com|org|net)$|@localhost$", x, re.I)]
        if matches:
            found.add(label)
    return found

def update(counter, data):
    counter.update(classify(data))

# Scan every unique reachable blob, including deleted/renamed historical files.
objects = {line.split(b" ", 1)[0] for line in git("rev-list", "--objects", "--all").splitlines()}
current = {line.split(b" ", 1)[0] for line in git("ls-tree", "-r", "HEAD", "--object-only").splitlines()}
history_counts, current_counts = collections.Counter(), collections.Counter()
skipped, binary, text_count, blobs = 0, 0, 0, 0
with subprocess.Popen(["git", "cat-file", "--batch"], stdin=subprocess.PIPE, stdout=subprocess.PIPE) as proc:
    for oid in sorted(objects):
        proc.stdin.write(oid + b"\n")
        proc.stdin.flush()
        header = proc.stdout.readline().split()
        if len(header) != 3:
            raise RuntimeError("Could not read a reachable Git object")
        size = int(header[2])
        if size > 4 * 1024 * 1024:
            remaining = size
            while remaining:
                piece = proc.stdout.read(min(remaining, 65536))
                if not piece:
                    raise RuntimeError("Truncated Git object")
                remaining -= len(piece)
            proc.stdout.read(1)
            if header[1] == b"blob":
                skipped += 1
            continue
        data = proc.stdout.read(size)
        if len(data) != size or proc.stdout.read(1) != b"\n":
            raise RuntimeError("Truncated Git object")
        if header[1] != b"blob":
            continue
        blobs += 1
        try:
            data.decode("utf-8")
        except UnicodeDecodeError:
            binary += 1
            continue
        if b"\x00" in data:
            binary += 1
            continue
        text_count += 1
        update(history_counts, data)
        if oid in current:
            update(current_counts, data)
    proc.stdin.close()
    if proc.wait() != 0:
        raise RuntimeError("Git object scan failed")
meta = git("log", "--all", "--format=%ae%x00%ce").splitlines()
emails = [e for line in meta for e in line.split(b"\0")]
messages = git("log", "--all", "--format=%B%x00").split(b"\0")
message_counts = collections.Counter()
for msg in messages:
    update(message_counts, msg)
# WebP container metadata only; visual identity and rights still require owner review.
cover = Path("docs/companion-book/cover-thumbnail.webp").read_bytes()
if cover[:4] != b"RIFF" or cover[8:12] != b"WEBP":
    raise RuntimeError("Unexpected cover format")
chunks = collections.Counter()
pos = 12
while pos + 8 <= len(cover):
    kind = cover[pos:pos+4].decode("ascii", "replace")
    length = struct.unpack_from("<I", cover, pos+4)[0]
    if pos+8+length > len(cover):
        raise RuntimeError("Invalid WebP chunk")
    chunks[kind] += 1
    pos += 8 + length + (length % 2)
result = {
    "scope": "all locally fetched refs; not GitHub-only or unreachable objects",
    "commits": len(meta),
    "author_committer_email_entries": len(emails),
    "non_noreply_author_committer_email_entries": sum(b"noreply" not in e.lower() for e in emails),
    "reachable_blobs_examined": blobs,
    "utf8_blobs": text_count,
    "binary_blobs": binary,
    "oversized_blobs_skipped": skipped,
    "historical_blob_pattern_counts": dict(history_counts),
    "current_blob_pattern_counts": dict(current_counts),
    "commit_message_pattern_counts": dict(message_counts),
    "cover_bytes": len(cover),
    "cover_exif_chunks": chunks["EXIF"],
    "cover_xmp_chunks": chunks["XMP "],
    "cover_icc_chunks": chunks["ICCP"],
}
# Inventory private GitHub surfaces without recording bodies, identities or URLs.
token = os.environ.get("GH_TOKEN")
repo = os.environ.get("GITHUB_REPOSITORY")
if token and repo:
    def pages(endpoint, key=None):
        page = 1
        while True:
            sep = "&" if "?" in endpoint else "?"
            req = urllib.request.Request(
                f"https://api.github.com/repos/{repo}/{endpoint}{sep}per_page=100&page={page}",
                headers={"Authorization": "Bearer " + token, "Accept": "application/vnd.github+json",
                         "X-GitHub-Api-Version": "2022-11-28", "User-Agent": "nothing-privacy-inventory"})
            with urllib.request.urlopen(req, timeout=30) as response:
                payload = json.load(response)
            items = payload[key] if key else payload
            yield from items
            if len(items) < 100:
                break
            page += 1
    for label, endpoint in [("pull_requests","pulls?state=all"),("issue_comments","issues/comments"),("review_comments","pulls/comments"),("issues","issues?state=all")]:
        counts, n = collections.Counter(), 0
        for item in pages(endpoint):
            if label == "issues" and "pull_request" in item:
                continue
            n += 1
            update(counts, ((item.get("title") or "") + "\n" + (item.get("body") or "")).encode())
        result[label] = {"records": n, "pattern_counts": dict(counts)}
    artifacts = list(pages("actions/artifacts", "artifacts"))
    active = [a for a in artifacts if not a.get("expired")]
    result["artifact_inventory"] = {
        "records": len(artifacts), "active": len(active),
        "active_before_artifact_hardening": sum(a["created_at"] < "2026-11-26T07:16:50Z" for a in active),
        "active_bytes": sum(a.get("size_in_bytes", 0) for a in active),
        "contents_reviewed": False,
    }
print(json.dumps(result, indent=2, sort_keys=True))
