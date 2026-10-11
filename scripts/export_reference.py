"""Export the Iris dataset and trusted NumPy/pandas reference values.

Run:  USE_TF=0 python3 scripts/export_reference.py
Writes src/data/iris.json (the dataset bundled with the app) and
tests/unit/reference-values.json (values the TypeScript maths is tested against).
"""
import json
import numpy as np
import pandas as pd
import sklearn
from sklearn.datasets import load_iris

iris = load_iris()
X = iris.data
y = iris.target
features = ["sepal_length", "sepal_width", "petal_length", "petal_width"]

dataset = {
    "source": f"scikit-learn {sklearn.__version__} load_iris() — same data the notebook loads",
    "featureNames": features,
    "featureLabels": list(iris.feature_names),
    "targetNames": list(iris.target_names),
    "rows": [[*map(float, X[i]), int(y[i])] for i in range(len(X))],
}
with open("src/data/iris.json", "w") as f:
    json.dump(dataset, f, separators=(",", ":"))

df = pd.DataFrame(X, columns=features)
w, v = np.linalg.eigh(np.cov(X.T))
order = np.argsort(w)[::-1]
w, v = w[order], v[:, order]
Xc = X - X.mean(axis=0)
proj = Xc @ v[:, :2]

# Same analysis WITH the categorical species column, reproducing the original notebook
df5 = df.copy(); df5["species"] = y
w5 = np.sort(np.linalg.eigvalsh(np.cov(df5.values.T)))[::-1]

def q(a, p): return float(np.percentile(a, p))
lecture = {
    "scores": [75, 80, 85, 90, 95],
    "salaries": [4000, 4500, 5000, 5500, 100000],
    "A1": [10, 12, 14], "B1": [5, 10, 21],
    "A2": [8, 10, 12], "B2": [2, 10, 18],
    "iqr1": [5, 10, 15, 20, 25, 30, 100],
    "iqr2": [2, 4, 6, 8, 10, 12, 50],
}
lect = {}
for k, a in lecture.items():
    a = np.array(a, dtype=float)
    lect[k] = {
        "mean": float(a.mean()), "median": float(np.median(a)),
        "varPop": float(a.var(ddof=0)), "varSample": float(a.var(ddof=1)),
        "stdPop": float(a.std(ddof=0)), "stdSample": float(a.std(ddof=1)),
        "numpyQuartiles": [q(a, 25), q(a, 50), q(a, 75)],
    }

ref = {
    "numpyVersion": np.__version__, "pandasVersion": pd.__version__,
    "lecture": lect,
    "iris": {
        "mean": df.mean().tolist(), "median": df.median().tolist(),
        "varSample": df.var().tolist(), "stdSample": df.std().tolist(),
        "varPop": df.var(ddof=0).tolist(),
        "q1": df.quantile(0.25).tolist(), "q3": df.quantile(0.75).tolist(),
        "cov": np.cov(X.T).tolist(), "corr": np.corrcoef(X.T).tolist(),
        "eigenvalues": w.tolist(), "eigenvectors": v.tolist(),
        "explainedRatio": (w / w.sum()).tolist(),
        "projectionFirst5": proj[:5].tolist(),
        "zFirstRow": ((df.iloc[0] - df.mean()) / df.std()).tolist(),
        "eigenvaluesWithSpecies": w5.tolist(),
    },
}
with open("tests/unit/reference-values.json", "w") as f:
    json.dump(ref, f, indent=1)
print("eigenvalues", w, "explained", w / w.sum())
print("with species (notebook)", w5)
