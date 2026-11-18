# Helper: ensure Clerk dev test users exist (admin + non-admin). Secret loaded from backend/.env, never printed.
import os
import requests
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parents[1] / ".env")
SK = os.environ["CLERK_SECRET_KEY"]
H = {"Authorization": f"Bearer {SK}", "User-Agent": "emergent-app"}
USERS = ["aksinyata_admin+clerk_test@example.com", "warga_biasa+clerk_test@example.com"]

for email in USERS:
    r = requests.get("https://api.clerk.com/v1/users", headers=H, params={"email_address": email}, timeout=15)
    r.raise_for_status()
    if r.json():
        u = r.json()[0]
        print(email, "exists", u["id"], [e["verification"]["status"] for e in u["email_addresses"]])
        continue
    c = requests.post("https://api.clerk.com/v1/users", headers=H, timeout=15, json={
        "email_address": [email], "password": "Aksinyata#Test2026", "skip_password_checks": True,
    })
    print(email, "create", c.status_code, c.json().get("id") if c.ok else c.text[:300])
