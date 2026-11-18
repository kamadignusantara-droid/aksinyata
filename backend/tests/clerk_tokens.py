# Helper: mint short-lived Clerk session JWTs for test users (prints `export X=...` lines). Secret never printed.
import os
import requests
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parents[1] / ".env")
H = {"Authorization": f"Bearer {os.environ['CLERK_SECRET_KEY']}", "User-Agent": "emergent-app"}


def token_for(email):
    u = requests.get("https://api.clerk.com/v1/users", headers=H, params={"email_address": email}, timeout=15).json()[0]
    s = requests.post("https://api.clerk.com/v1/sessions", headers=H, json={"user_id": u["id"]}, timeout=15)
    s.raise_for_status()
    t = requests.post(f"https://api.clerk.com/v1/sessions/{s.json()['id']}/tokens", headers=H, json={"expires_in_seconds": 600}, timeout=15)
    t.raise_for_status()
    return t.json()["jwt"]


print("export ADMIN_TOKEN=" + token_for("aksinyata_admin+clerk_test@example.com"))
print("export MEMBER_TOKEN=" + token_for("warga_biasa+clerk_test@example.com"))
