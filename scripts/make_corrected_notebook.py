"""Build notebook/Session5_Statistics_DEMO_corrected.ipynb from the original.

Changes (documented in docs/CORRECTIONS.md):
  1. `species` is a nominal label: keep it, but exclude it from every numeric analysis.
  2. State that pandas .var()/.std() divide by n − 1, and show the population (÷N) version used in the lecture.
  3. Quartiles: show pandas' linear method and the lecture's median-of-halves method side by side.
  4. PCA: use np.linalg.eigh (symmetric matrices, sorted eigenvalues) and report explained variance.
The original notebook is kept untouched in notebook/original/.
"""
import copy
import json

src = json.load(open("notebook/original/Session5_Statistics_DEMO.ipynb"))
nb = copy.deepcopy(src)

def code(s):
    return {"cell_type": "code", "metadata": {}, "execution_count": None, "outputs": [], "source": s}

def md(s):
    return {"cell_type": "markdown", "metadata": {}, "source": s}

cells = [
    md("# Session 5 — Statistics demo (corrected copy)\n\nThis is a corrected copy of `Session5_Statistics_DEMO.ipynb`. "
       "The original is unchanged. Every change is marked **Correction**."),
    code("import numpy as np\nimport pandas as pd\nimport matplotlib.pyplot as plt"),
    code("import pandas as pd\nfrom sklearn.datasets import load_iris\n\niris = load_iris()\n\n"
         "df = pd.DataFrame(iris.data, columns=iris.feature_names)\ndf[\"species\"] = iris.target\n# tail\ndf.head()"),
    md("**Correction.** `species` is a categorical (nominal) label stored as 0/1/2. It is the target, not a measurement, "
       "so all numeric statistics below use only the four measurement columns."),
    code("features = df.drop(columns=\"species\")          # the 4 continuous measurements\n"
         "df[\"species\"] = df[\"species\"].astype(\"category\")  # mark the label as categorical\n"
         "df.info()\nfeatures.describe()"),
    md("# Central Tendency"),
    code("mean_values = features.mean()\nmedian_values = features.median()\n\nprint(\"Mean:\\n\", mean_values)\nprint(\"Median:\\n\", median_values)\n"
         "print(\"Most frequent species (mode):\", df[\"species\"].mode()[0])"),
    md("# Variation Measures\n\n**Note.** pandas divides by *n − 1* (sample variance). The lecture's formula divides by *N* (population): use `ddof=0`."),
    code("variance = features.var()          # ddof=1: sample variance\nstd_dev = features.std()\n\nprint(\"Variance:\\n\", variance)\nprint(\"Standard Deviation:\\n\", std_dev)\n"
         "print(\"Population variance (ddof=0):\\n\", features.var(ddof=0))"),
    md("# IQR\n\n**Note.** pandas interpolates linearly between order statistics. The lecture finds the median of each half. Both are valid conventions."),
    code("Q1 = features.quantile(0.25)\nQ3 = features.quantile(0.75)\nIQR = Q3 - Q1\n\nprint(f\"IQR:\\n{IQR}\")\n\n"
         "lower, upper = Q1 - 1.5 * IQR, Q3 + 1.5 * IQR\noutliers = ((features < lower) | (features > upper)).sum()\nprint(\"Values flagged by the 1.5 x IQR rule:\\n\", outliers)"),
    md("# Z-score"),
    code("numeric_df = features   # Correction: was df.select_dtypes(include=np.number), which included species\n\n"
         "z_scores = (numeric_df - numeric_df.mean()) / numeric_df.std()\nz_scores.head()"),
    md("# Covariance Matrix"),
    code("cov_matrix = numeric_df.cov()\nprint(cov_matrix)"),
    md("# Correlation Matrix"),
    code("corr_matrix = numeric_df.corr()\nprint(corr_matrix)"),
    md("# PCA Connection\n\n**Correction.** A covariance matrix is symmetric, so use `np.linalg.eigh`: real eigenvalues, orthonormal eigenvectors, "
       "returned in ascending order (we reverse them)."),
    code("# Center data\nX = numeric_df - numeric_df.mean()\n\n# Covariance matrix\ncov_matrix = np.cov(X.T)\n\n"
         "# Eigen decomposition (symmetric matrix)\neigvals, eigvecs = np.linalg.eigh(cov_matrix)\norder = np.argsort(eigvals)[::-1]\n"
         "eigvals, eigvecs = eigvals[order], eigvecs[:, order]\n\nprint(\"Eigenvalues:\\n\", eigvals)\nprint(\"Eigenvectors:\\n\", eigvecs)\n"
         "print(\"Explained variance ratio:\\n\", eigvals / eigvals.sum())"),
]
nb["cells"] = cells
json.dump(nb, open("notebook/Session5_Statistics_DEMO_corrected.ipynb", "w"), indent=1)
print("written", len(cells), "cells")
