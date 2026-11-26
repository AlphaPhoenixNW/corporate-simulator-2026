#!/usr/bin/env python3
"""Read-only verification of an explicitly identified Cloudflare Pages deployment."""
import sys
import urllib.parse
import urllib.request
from pathlib import Path

base = urllib.parse.urlsplit(sys.argv[1])
host = base.hostname or ""
if (base.scheme != "https" or base.username or base.password or base.port or
        base.path not in ("", "/") or base.query or base.fragment or
        not (host == "corporate-simulator-2026.pages.dev" or
             host.endswith(".corporate-simulator-2026.pages.dev"))):
    raise SystemExit("Expected an explicitly identified HTTPS project deployment root")
root = "https://" + host + "/"
lines = Path("public/_headers").read_text().splitlines()
global_rules = {}
for line in lines[lines.index("/*")+1:]:
    if line.startswith("  ") and ":" in line:
        key, value = line.strip().split(":", 1)
        global_rules[key] = value.strip()
assert len(global_rules) == 5

class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None

opener = urllib.request.build_opener(NoRedirect())
def check(path, marker):
    req = urllib.request.Request(root + path, headers={"User-Agent":"nothing-release-header-review"})
    with opener.open(req, timeout=25) as response:
        assert response.status == 200, "Unexpected response status"
        for key, expected in global_rules.items():
            values = response.headers.get_all(key, [])
            assert len(values) == 1 and values[0].strip() == expected, "Missing or mismatched " + key
        body = response.read(2*1024*1024 + 1)
        assert len(body) <= 2*1024*1024 and marker in body, "Unexpected response body"
        if path == "sw.js":
            assert response.headers.get("Service-Worker-Allowed") == "/", "Worker scope mismatch"
        print("LIVE_HEADER_PASS", path or "/", "status", response.status)

check("", b"Corporate Simulator 2026")
check("sw.js", b"nothing-sim-app-v2-")
check("LICENSES.txt", b"All rights reserved")
print("LIVE_DEPLOYMENT_HEADERS_VERIFIED", host)
