#!/usr/bin/env python3
"""
Consolidate the licensed GATE Mining (MN) previous-year PDFs in ./PYQs into a
single bookmarked PDF: "<year> ▸ Question Paper / Answer Key".

This is a content-agnostic merge utility: it concatenates the source PDFs and
builds an outline (table of contents) from page counts. It does NOT read,
transcribe, or alter any question/answer text — the bytes come straight from
your licensed source files.

Usage:
    python3 scripts/build_pyq_pdf.py

Output:
    PYQs/consolidated/GATE-MN-PYQ-consolidated.pdf

NOTE: Edit MANIFEST below to fix any file→year/role mapping. Files not listed in
MANIFEST are appended under an "Unsorted — confirm mapping" outline so nothing
is silently mis-labelled (e.g. an answer key attached to the wrong year).
"""
from __future__ import annotations

import sys
from pathlib import Path

from pypdf import PdfReader, PdfWriter

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "PYQs"
OUT_DIR = SRC / "consolidated"
OUT = OUT_DIR / "GATE-MN-PYQ-consolidated.pdf"

# Ordered, explicit mapping. `question` and `key` are filenames inside ./PYQs.
# Set a value to None if you don't have that file for the year.
# Leave ambiguous files OUT of here — they'll be appended for you to confirm.
MANIFEST: list[dict] = [
    {"year": "2026", "question": "MN2026.pdf",        "key": "MN_Keys_2026.pdf"},
    {"year": "2025", "question": "MN2025.pdf",        "key": None},
    {"year": "2024", "question": "MN24.pdf",          "key": None},
    {"year": "2023", "question": "mn_2023.pdf",       "key": None},
    {"year": "2022", "question": "mn_2022.pdf",       "key": None},
    {"year": "2021", "question": "GATE2021_QP_MN.pdf","key": None},
    {"year": "2020", "question": "mn_2020.pdf",       "key": None},
    {"year": "2007–2019 (compilation)", "question": "GATE MINING 2007-2019 PAPERS.pdf", "key": None},
]


def add_pdf(writer: PdfWriter, path: Path, title: str, parent=None):
    """Append every page of `path`, then bookmark its first page. Returns the
    created outline item (or None if the file is missing/unreadable)."""
    if not path.exists():
        print(f"  ! missing: {path.name} — skipped")
        return None
    start = len(writer.pages)
    try:
        reader = PdfReader(str(path))
    except Exception as e:  # corrupt/encrypted source
        print(f"  ! could not read {path.name}: {e} — skipped")
        return None
    for page in reader.pages:
        writer.add_page(page)
    print(f"  + {title:<16} <- {path.name} ({len(reader.pages)} pp, starts p.{start + 1})")
    return writer.add_outline_item(title, start, parent=parent)


def main() -> int:
    if not SRC.is_dir():
        print(f"Source folder not found: {SRC}", file=sys.stderr)
        return 1

    writer = PdfWriter()

    # Track which source files we explicitly placed, to detect leftovers.
    placed: set[str] = set()

    for entry in MANIFEST:
        label = f"GATE MN {entry['year']}"
        print(label)
        year_start = len(writer.pages)
        parent = writer.add_outline_item(label, year_start)
        for role, fname in (("Question Paper", entry.get("question")),
                            ("Answer Key", entry.get("key"))):
            if not fname:
                continue
            add_pdf(writer, SRC / fname, role, parent=parent)
            placed.add(fname)

    # Any *.pdf in the folder not referenced above (e.g. ambiguous keys / extra
    # sessions). Append so they're in the consolidated file but clearly flagged.
    leftovers = sorted(
        p.name for p in SRC.glob("*.pdf") if p.name not in placed
    )
    if leftovers:
        print("Unsorted — confirm mapping")
        parent = writer.add_outline_item("Unsorted — confirm mapping", len(writer.pages))
        for fname in leftovers:
            add_pdf(writer, SRC / fname, fname, parent=parent)

    if len(writer.pages) == 0:
        print("No pages were added — check MANIFEST filenames.", file=sys.stderr)
        return 1

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    with open(OUT, "wb") as fh:
        writer.write(fh)

    print(f"\nConsolidated {len(writer.pages)} pages -> {OUT.relative_to(ROOT)}")
    if leftovers:
        print("Review the 'Unsorted' section and move those files into MANIFEST "
              "with the correct year/role, then re-run.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
