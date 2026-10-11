"""Extract the text of every page of the source PDF into tests/unit/pdf-pages.json.

Run: python3 scripts/export_pdf_text.py   (needs PyMuPDF: pip install pymupdf)
The content test checks that slide n's title in lecture-content.ts is the
beginning of page n's text, i.e. the 53 slides are in the PDF's order.
"""
import json
import fitz

doc = fitz.open("docs/source-Unit2_Part5.pdf")
json.dump([p.get_text() for p in doc], open("tests/unit/pdf-pages.json", "w"), ensure_ascii=False, indent=0)
print(doc.page_count, "pages")
