"""Copy notebook cells and their saved outputs verbatim into src/data/notebook.json.

Run: python3 scripts/export_notebook.py   (after make_corrected_notebook.py + nbconvert --execute)
Both notebooks' outputs are real Python outputs saved in the .ipynb files; the
Python Lab labels them "precomputed" — nothing is executed in the browser.
"""
import json

def cells_of(path):
    nb = json.load(open(path))
    out = []
    for i, c in enumerate(nb["cells"]):
        outs = []
        for o in c.get("outputs", []):
            if o.get("output_type") == "stream":
                outs.append("".join(o.get("text", "")))
            elif "data" in o and "text/plain" in o["data"]:
                outs.append("".join(o["data"]["text/plain"]))
        out.append({"id": c.get("id") or f"cell-{i}", "index": i, "type": c["cell_type"], "source": "".join(c["source"]), "outputs": outs})
    return out

json.dump(
    {"original": cells_of("notebook/original/Session5_Statistics_DEMO.ipynb"),
     "corrected": cells_of("notebook/Session5_Statistics_DEMO_corrected.ipynb")},
    open("src/data/notebook.json", "w"), indent=1, ensure_ascii=False)
print("ok")
