"""Loan profile JSON embedded in Firefly liability account notes (WRITE-04)."""

from __future__ import annotations

import json
import re

from firefly_client import FireflyClient

LOAN_PROFILE_MARKER = "<!-- ff3analytics:loan_profile.v1 -->"

_MARKER_PATTERN = re.compile(
    rf"{re.escape(LOAN_PROFILE_MARKER)}\s*(\{{.*\}})",
    re.DOTALL,
)


def parse_loan_profile_from_notes(notes: str) -> dict | None:
    if not notes:
        return None
    match = _MARKER_PATTERN.search(notes)
    if not match:
        return None
    try:
        return json.loads(match.group(1))
    except json.JSONDecodeError:
        return None


def serialize_loan_profile_to_notes(profile: dict, existing_notes: str = "") -> str:
    base = existing_notes or ""
    if LOAN_PROFILE_MARKER in base:
        base = _MARKER_PATTERN.sub("", base).strip()
    profile_json = json.dumps(profile, indent=2)
    block = f"{LOAN_PROFILE_MARKER}\n{profile_json}"
    if base:
        return f"{base}\n\n{block}"
    return block


async def read_loan_profile(client: FireflyClient, account_id: str) -> dict | None:
    account = await client.fetch_account(account_id)
    notes = account.get("attributes", {}).get("notes") or ""
    return parse_loan_profile_from_notes(notes)


async def write_loan_profile(
    client: FireflyClient, account_id: str, profile: dict
) -> dict:
    account = await client.fetch_account(account_id)
    attrs = account.get("attributes", {})
    existing_notes = attrs.get("notes") or ""
    new_notes = serialize_loan_profile_to_notes(profile, existing_notes)
    merged = {**attrs, "notes": new_notes}
    await client.update_account(account_id, merged)
    return profile
