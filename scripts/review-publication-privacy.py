#!/usr/bin/env python3
"""Private pre-publication inventory; report counts only, never raw matches."""
import collections
import io
import zipfile
import urllib.error
import urllib.parse
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
        if label == "local_user_path":
            # The old scanner regex contained a literal /Users/ followed by a pipe.
            # Treat only that exact regex-definition token as a false positive.
            definition = b're.compile(rb"(?:' + b"/Users/" + b"|"
            if definition in data:
                matches = pattern.findall(data.replace(definition, b"regex-definition:", 1))
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
current_flagged_oids = set()
local_path_definition_false_positives = 0
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
        raw_local = patterns["local_user_path"].findall(data)
        labels = classify(data)
        if raw_local and "local_user_path" not in labels:
            local_path_definition_false_positives += 1
        history_counts.update(labels)
        if oid in current:
            current_counts.update(labels)
            if labels:
                current_flagged_oids.add(oid)
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
    "local_path_definition_false_positive_blobs": local_path_definition_false_positives,
    "current_flagged_blob_count": len(current_flagged_oids),
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
    # Download authenticated archives through a separate unsigned request after redirect.
    # Never pass the repository token to an artifact storage host or log signed URLs.
    class NoRedirect(urllib.request.HTTPRedirectHandler):
        def redirect_request(self, req, fp, code, msg, headers, newurl):
            return None

    def archive(endpoint, max_bytes=32*1024*1024):
        req = urllib.request.Request(
            f"https://api.github.com/repos/{repo}/{endpoint}",
            headers={"Authorization": "Bearer " + token, "Accept": "application/vnd.github+json",
                     "X-GitHub-Api-Version": "2022-11-28", "User-Agent": "nothing-privacy-inventory"})
        try:
            with urllib.request.build_opener(NoRedirect()).open(req, timeout=45) as response:
                data = response.read(max_bytes+1)
        except urllib.error.HTTPError as error:
            if error.code not in (301,302,303,307,308):
                raise RuntimeError("Archive API unavailable: HTTP " + str(error.code)) from None
            target = error.headers.get("Location", "")
            if urllib.parse.urlsplit(target).scheme != "https":
                raise RuntimeError("Unexpected archive redirect scheme") from None
            # No Authorization header on the signed storage request.
            try:
                with urllib.request.urlopen(target, timeout=45) as response:
                    data = response.read(max_bytes+1)
            except Exception:
                raise RuntimeError("Signed archive retrieval failed") from None
        if len(data) > max_bytes:
            raise RuntimeError("Archive exceeds review size bound")
        return data

    def review_zip(data):
        counts = collections.Counter()
        members = collections.Counter()
        with zipfile.ZipFile(io.BytesIO(data)) as z:
            if len(z.infolist()) > 10000 or sum(x.file_size for x in z.infolist()) > 96*1024*1024:
                raise RuntimeError("Archive expansion exceeds review bounds")
            for item in z.infolist():
                if item.is_dir():
                    continue
                members["files"] += 1
                if item.filename.endswith("Executive Library.html"):
                    members["editorial_previews"] += 1
                if item.file_size > 8*1024*1024:
                    members["oversized_skipped"] += 1
                    continue
                body = z.read(item)
                try:
                    body.decode("utf-8")
                except UnicodeDecodeError:
                    members["binary"] += 1
                    continue
                if b"\x00" in body:
                    members["binary"] += 1
                    continue
                members["text"] += 1
                # Standard hosted runner paths are not personal filesystem paths.
                clean = body.replace(b"/home/runner/", b"runner-workspace/")
                counts.update(classify(clean))
        return members, counts

    def review_archives(items, endpoint):
        totals, findings = collections.Counter(), collections.Counter()
        failures = 0
        for item in items:
            try:
                members, flags = review_zip(archive(endpoint(item)))
                totals.update(members)
                findings.update(flags)
                totals["archives_reviewed"] += 1
                if flags:
                    totals["archives_with_pattern_matches"] += 1
            except Exception:
                failures += 1  # No URLs, paths, bodies or exception detail in logs.
        return {"requested": len(items), "failed": failures,
                "member_counts": dict(totals), "pattern_counts": dict(findings)}

    result["artifact_content_review"] = review_archives(active, lambda a: f"actions/artifacts/{a['id']}/zip")
    # Review completed runs with retained artifacts; other logs remain a separate task.
    run_ids = sorted({a.get("workflow_run", {}).get("id") for a in active
                      if a.get("workflow_run", {}).get("id")})
    result["artifact_associated_log_review"] = review_archives(run_ids, lambda n: f"actions/runs/{n}/logs")
    result["artifact_inventory"]["contents_reviewed"] = (
        result["artifact_content_review"]["failed"] == 0 and
        result["artifact_content_review"]["member_counts"].get("oversized_skipped", 0) == 0)

print(json.dumps(result, indent=2, sort_keys=True))
