# Content map — 53 slides

Generated from `src/data/lecture-content.ts` by `node scripts/generate-content-map.ts`. Do not edit by hand.

Source: `Unit2_Part5.pdf` (page n = slide n). Planned speaking time: 90 minutes.

## 01 · Foundations (slides 1–14)

| # | Title in the PDF | Learning objective | Visual approach in the app | Exercise | Notebook | Reveal steps | Min |
|---|---|---|---|---|---|---|---|
| 1 | Unit 2: Linear Algebra & Statistics | Frame the session: statistics and linear algebra describe the same object, a data matrix. | A data table morphs into points: each row is a vector, so a dataset is simultaneously a matrix (linear algebra) and a distribution (statistics). | — | — | — | 0.5 |
| 2 | Part5 Statistics Foundations + Real Dataset | Show the route through the session so students know where the hard parts are. | Lecture route map: seven sections from variable types to PCA, ending on the real Iris dataset. Each stop is clickable. | — | — | — | 0.5 |
| 3 | Objectives | State the eight learning objectives precisely. | The eight objectives as a checklist, each linked to the slides that deliver it. | — | — | — | 1 |
| 4 | Why Statistics Matters in ML | Motivate the session: every ML pipeline begins with statistical decisions. | Three pillars (probability, statistics, linear algebra) under ML, plus four live mini-scenes: a skewed distribution, a flagged outlier, a linear vs curved fit, and feature scaling. | — | — | — | 2 |
| 5 | Types of Variables | Distinguish qualitative from quantitative variables and the four subtypes. | A classification tree. Each leaf carries a small geometric picture of what the values look like: unordered chips (nominal), ordered steps (ordinal), isolated integers (discrete), an unbroken line (continuous). | — | — | — | 2.5 |
| 6 | Quick Challenge | Practise classification before seeing the answers. | Six variable cards. The instructor records the class vote for each card (nominal, ordinal, discrete, continuous); the next slide compares the votes with the answer. | Classify GPA, Car Color, Number of Children, Customer Satisfaction (1–5), House Price, Disease Type as categorical/numeric and nominal/ordinal/discrete/continuous. | — | — | 2 |
| 7 | Solution | Confirm the classification and explain the two tricky rows (GPA, satisfaction). | The lecture's solution table revealed row by row, each row checked against the vote recorded on slide 6. | Solution to the Quick Challenge. | — | 6 | 1.5 |
| 8 | Independent vs Dependent Variables | Map independent/dependent variables onto the ML vocabulary of features and target. | A feature matrix X (blue columns) flows through a model f into a target y (yellow column): y ≈ f(x₁, x₂, …). | — | — | — | 1.5 |
| 9 | Quick Question | Apply the feature/target distinction to a concrete prediction problem. | Four column headers to assign: the instructor taps each one to mark it feature or target. No answer is shown on this slide. | Predict pass/fail from Study Hours, Attendance, Sleep Hours: which are independent, which is dependent? | — | — | 1 |
| 10 | Solution | Confirm: three independent variables, one dependent variable. | Revealed in two steps: the three features, then the target. A small illustrative table shows the shape of the data. | Solution to the pass/fail question. | — | 2 | 1 |
| 11 | Population vs Sample | Define population and sample, and see how each sampling method chooses members. | Interactive population of 400 members in 4 regions and 20 blocks. Choose random, stratified, cluster or systematic sampling and see which members are selected, the sample mean x̄ vs the population mean μ, and each region's share. | — | — | — | 3 |
| 12 | Quick Question | Apply population/sample to a realistic ML training situation. | Proportion grid: 10,000 of 2,000,000 users is 1 cell in 200. | 10,000 users in training data, 2 million users in the company: identify the population and the sample, and explain why the sample must be representative. | — | — | 1 |
| 13 | Solution | Population = 2 million users, sample = 10,000; representativeness drives generalisation. | Answers revealed in three steps, then a bias simulator: a representative sample vs a sample of only the most active users, with their distributions overlaid on the population. | Solution to the 10,000 / 2 million question. | — | 3 | 1.5 |
| 14 | Minute Group Discussion – Sampling Methods | Students explain each sampling method in their own words with an ML use case. | Four group cards with the three prompts and a discussion timer. Each card has an instructor-only reference answer and a miniature of the sampler from slide 11. | Four groups each explain one sampling method: definition, real-life example, use in ML. | — | — | 5 |

Additions (badged “Added” in the app) and corrections:

- Slide 1 · added: Row-as-vector animation linking the two halves of Unit 2.
- Slide 4 · added: Four mini-scenes illustrating each "Statistics helps us" bullet.
- Slide 6 · added: Class-vote recorder carried over to the solution slide.
- Slide 7 · added: Comparison with the recorded class vote.
- Slide 7 · added: Note linking ordinal codes to the Iris species code.
- Slide 8 · added: Caution that "independent variable" does not mean features are statistically independent of each other.
- Slide 10 · added: Illustrative (made-up) rows to show the data layout, clearly labelled.
- Slide 10 · added: Pass/Fail is categorical, so this is classification.
- Slide 11 · added: Simulated population (illustrative values).
- Slide 11 · added: Live comparison of sample vs population composition, showing bias.
- Slide 13 · added: Biased vs representative sample simulation (illustrative data).
- Slide 14 · added: Discussion countdown timer.
- Slide 14 · added: Reference answers for the instructor, hidden until revealed.
- Slide 14 · **correction**: The PDF title reads "Minute Group Discussion" — the number of minutes appears to be missing. The title is kept; the timer defaults to 5 minutes and can be changed.

## 02 · Descriptive Statistics (slides 15–23)

| # | Title in the PDF | Learning objective | Visual approach in the app | Exercise | Notebook | Reveal steps | Min |
|---|---|---|---|---|---|---|---|
| 15 | Descriptive Analysis | Descriptive analysis summarises what happened using tables, plots and summary statistics. | The same small dataset shown three ways — a table, a dot plot and a summary-statistics strip — answering "What happened?". | — | — | — | 1 |
| 16 | Measures of Central Tendency | Define mean, median and mode, each with a geometric picture. | Three geometric definitions: the mean as the balance point of a beam, the median as the middle of the sorted values, the mode as the tallest stack. | — | — | — | 2 |
| 17 | Question 1 – Balanced Data | Compute the three measures on symmetric data. | The five scores on a number line, evenly spaced. | Students' scores 75, 80, 85, 90, 95: compute the mean, median, mode; are mean and median close, and what does that indicate? | — | — | 1 |
| 18 | Solution | Mean = median = 85 signals symmetric, balanced data. | Step-by-step: the sum and division, the median found by sorting, "no mode", then the balance beam showing mean and median coinciding. | Solution: mean 85, median 85, no mode; balanced, no outliers. | — | 4 | 1.5 |
| 19 | Question 2 – Data with Outlier | Predict the effect of an extreme value before computing. | Salaries on a number line: four values crowded on the left, one far to the right. A prediction checkpoint asks where the mean will land. | Monthly salaries 4000, 4500, 5000, 5500, 100000: mean, median, mode; which measure best represents the typical salary? | — | — | 1 |
| 20 | Solution | The mean is pulled towards an outlier; the median is not. | Mean vs median, live. The mean is a fulcrum under a beam; the median is the middle observation. The extreme salary is a draggable number inside the sentence; drag it and both measures update. The deviation bars show why the fulcrum must move. | Solution: mean 23,800, median 5,000, no mode; median represents the typical salary; data are skewed. | — | 4 | 3 |
| 21 | Question 3 – Categorical Data | Recognise which measures exist for categorical data. | The six survey answers as labelled chips with no positions on a number line — there is nothing to add or sort. | Favourite language: Python, Python, Java, Python, C++, Java — mean? median? mode? most appropriate measure? | — | — | 1 |
| 22 | Solution | Only the mode applies to nominal data. | Revealed in steps: the mean is undefined (no arithmetic), the median is undefined (no order), and a frequency bar chart where the tallest bar is the mode. | Solution: mean and median not applicable, mode = Python. | — | 3 | 1.5 |
| 23 | When to Use Mean, Median, and Mode | Choose the right measure from data type and shape. | The lecture's decision table, plus a checkpoint question with realistic scenarios. | — | — | — | 2 |

Additions (badged “Added” in the app) and corrections:

- Slide 15 · added: Where descriptive analysis sits relative to inferential and predictive analysis.
- Slide 16 · added: Even-n median rule.
- Slide 16 · added: Sample mean notation x̄ alongside the population μ.
- Slide 19 · added: Prediction checkpoint before the calculation.
- Slide 22 · added: Encoded-label trap: the mean of arbitrary codes is computable but meaningless — the same issue as the Iris species code in the notebook.
- Slide 23 · added: Multiple-choice checkpoint with instructor-controlled answer.

## 03 · Measures of Variation (slides 24–33)

| # | Title in the PDF | Learning objective | Visual approach in the app | Exercise | Notebook | Reveal steps | Min |
|---|---|---|---|---|---|---|---|
| 24 | Measures of Variation | Understand variance as the average squared distance from the mean, and σ as its square root. | The geometry of variance: deviations become literal squares. Six steps build σ² = (1/N)Σ(x − μ)² and σ = √σ² — the mean, the deviations, their squares, the total area, the average square, and its side length σ. Toggle ÷N or ÷(n − 1). | — | — | 6 | 3.5 |
| 25 | Activity – Measures of Variation | Practise the full variance calculation by hand. | Datasets A and B on a shared axis, with a prediction checkpoint: which is more spread out? | Dataset A: 10, 12, 14. Dataset B: 5, 10, 21. Compute range, mean, variance, standard deviation; which is more spread out? | — | — | 1.5 |
| 26 | Solution | Walk through every arithmetic step for A. | Worked solution for A synchronised with the squares picture: mean 12, range 4, squared deviations 4 + 0 + 4, variance 8/3 ≈ 2.67, σ ≈ 1.63. | Solution for Dataset A. | — | 4 | 2 |
| 27 | Solution | B has the same mean as A but far more spread. | Worked solution for B with the squares picture: squared deviations 49 + 4 + 81 = 134, variance ≈ 44.67, σ ≈ 6.68. | Solution for Dataset B. | — | 4 | 2 |
| 28 | Why variance and standard deviation matter in machine learning | Connect variance to three everyday ML tools. | Three tiles: standardisation z = (x − μ)/σ; mean squared error drawn as squares on regression residuals (the same squares as variance); outlier detection by distance in σ units. | — | — | — | 2 |
| 29 | Why Standard Deviation Matters in ML | Smaller standard deviation means more predictable values. | Datasets A and B with ±σ bands. A "guess the next value" demo: if you predict the mean, your typical (root-mean-square) error equals σ. | If you were building a model, which dataset is more predictable? | — | 1 | 1.5 |
| 30 | Example | Isolate spread: same centre, different variation. | Datasets A (8, 10, 12) and B (2, 10, 18) on a shared axis, symmetric about 10. | Dataset A: 8, 10, 12. Dataset B: 2, 10, 18. Mean, range, and which is more spread out, and why? | — | — | 1 |
| 31 | Solution | A: mean 10, range 4, tightly clustered. | Dataset A: values close to the mean, tightly clustered. | Solution for Dataset A: mean 10, range 4. | — | 2 | 0.5 |
| 32 | Solution | B: same mean as A, range 16, much more spread out. | Dataset B: same mean, values far from it. | Solution for Dataset B: mean 10, range 16. | — | 2 | 0.5 |
| 33 | Conclusion | The mean gives the centre; the standard deviation gives the spread. | Both datasets overlaid on one axis with the shared mean and their σ brackets, computed live. | — | — | — | 1.5 |

Additions (badged “Added” in the app) and corrections:

- Slide 24 · added: Sample variance s² with n − 1 (Bessel's correction) beside the lecture's population formula.
- Slide 27 · added: Sample-variance values (÷ n − 1) for A and B, shown separately.
- Slide 28 · added: Live MSE demo on a small regression with draggable line.
- Slide 29 · added: RMS error of predicting the mean equals σ (population).
- Slide 31 · **correction**: The PDF writes "8 + 10 + 12 ÷ 3 = 30 ÷ 3 = 10". By order of operations 8 + 10 + 12 ÷ 3 = 22; the intended expression is (8 + 10 + 12) ÷ 3. Parentheses are added on screen and the change is flagged.
- Slide 32 · **correction**: Same missing parentheses as slide 31: (2 + 10 + 18) ÷ 3.
- Slide 33 · added: The actual standard deviations (computed with ÷N): A ≈ 1.63, B ≈ 6.53.

## 04 · IQR and Outliers (slides 34–44)

| # | Title in the PDF | Learning objective | Visual approach in the app | Exercise | Notebook | Reveal steps | Min |
|---|---|---|---|---|---|---|---|
| 34 | Interquartile Range (IQR) | IQR = Q3 − Q1 is the width of the middle 50% of the data. | Sorted observations split into four equal-count groups by Q1, Q2, Q3; the middle 50% is shaded. A convention panel compares the lecture's median-of-halves method with NumPy's default interpolation. | — | — | — | 1.5 |
| 35 | Example | Find Q2 and Q1 by the median-of-halves method. | The seven values sorted on a line; the median lights up, then the lower half and its middle value Q1. | Dataset 5, 10, 15, 20, 25, 30, 100: order, median, Q1. | — | 3 | 1.5 |
| 36 | Example | Find Q3 and compute the IQR. | The upper half and Q3, then the IQR bracket spanning Q1 to Q3. | Q3 and IQR for 5, 10, 15, 20, 25, 30, 100. | — | 2 | 1 |
| 37 | Important Observation | IQR is robust to outliers; range is not. | Drag the largest value from 30 to 1,000: the range bar stretches without limit while the IQR bar stays fixed at 20. | — | — | — | 1 |
| 38 | Why is IQR Important in Machine Learning? | IQR is used for outlier detection, data cleaning, boxplots and robust scaling. | Anatomy of a boxplot (box = IQR, line = median, whiskers to the last values inside the fences, flagged points beyond). Robust scaling (x − median)/IQR compared with standardisation on data with an outlier. | — | — | — | 1 |
| 39 | Outlier Detection Rule | Apply the 1.5 × IQR fences. | Interactive boxplot over sorted points: quartiles, shaded IQR, fences at Q1 − 1.5·IQR and Q3 + 1.5·IQR. Drag the extreme value and watch the fences, whiskers and outlier flags update. Choose either lecture dataset. | — | — | — | 2 |
| 40 | IQR Activity | Students run the complete IQR procedure independently. | The activity dataset sorted on a number line. No quartiles are shown until the solution slides. | Dataset 2, 4, 6, 8, 10, 12, 50: Q2, Q1, Q3, IQR, lower and upper bounds; is 50 an outlier? | — | — | 1.5 |
| 41 | Solution | Find the median of the activity data: Q2 = 8. | Steps 1–2 on the boxplot builder: order and median. | Solution steps 1–2: data already ordered; median Q2 = 8. | — | 2 | 0.5 |
| 42 | Solution | Find both quartiles of the activity data: Q1 = 4 and Q3 = 12. | Steps 3–4: the lower half and Q1, the upper half and Q3. | Solution steps 3–4: Q1 = 4, Q3 = 12. | — | 2 | 1 |
| 43 | Solution | Compute the interquartile range of the activity data: IQR = 8. | Step 5: the box between Q1 and Q3 with IQR = 8. | Solution step 5: IQR = 12 − 4 = 8. | — | 1 | 0.5 |
| 44 | Solution | Fences −8 and 24; 50 is flagged. | Steps 6–7: the fences at −8 and 24 appear; 50 lies beyond the upper fence and is flagged. Afterwards the extreme value can be dragged to test the rule. | Solution steps 6–7: lower bound −8, upper bound 24; 50 > 24 so 50 is an outlier. | — | 3 | 1.5 |

Additions (badged “Added” in the app) and corrections:

- Slide 34 · added: Quartile convention comparison (lecture method vs NumPy/pandas default).
- Slide 38 · added: Robust scaling vs standard scaling comparison, as in scikit-learn's RobustScaler.
- Slide 39 · added: Distinction between a statistical outlier flag and a confirmed data error.

## 05 · Z-Score (slides 45–45)

| # | Title in the PDF | Learning objective | Visual approach in the app | Exercise | Notebook | Reveal steps | Min |
|---|---|---|---|---|---|---|---|
| 45 | Z-score | z = (x − μ)/σ measures distance from the mean in standard-deviation units. | A real Iris feature on a number line with a σ ruler. Drag one observation; its distance from μ is measured in σ steps and z updates live. The 68–95–99.7 figure from the lecture can be overlaid, next to the fraction of the actual data within ±1σ, ±2σ, ±3σ. | — | cell-10 | — | 4 |

Additions (badged “Added” in the app) and corrections:

- Slide 45 · added: Empirical vs normal coverage, showing the 68–95–99.7 rule fails for bimodal petal length.

## 06 · Covariance, Correlation and PCA (slides 46–51)

| # | Title in the PDF | Learning objective | Visual approach in the app | Exercise | Notebook | Reveal steps | Min |
|---|---|---|---|---|---|---|---|
| 46 | Covariance | Covariance measures how two variables vary together, through the sign of co-deviations. | The geometry of covariance: each point and the mean (μx, μy) span a rectangle whose signed area is (x − μx)(y − μy). Green rectangles (quadrants I and III) add, orange ones (II and IV) subtract; covariance is the average signed area. Drag ρ in the sentence to change the relationship. | — | cell-12 | — | 2.5 |
| 47 | Covariance Matrix | The covariance matrix collects every pairwise covariance; it is symmetric with variances on the diagonal. | The 4 × 4 covariance matrix of the four Iris measurements as a colour-coded grid. Selecting a cell highlights its mirror cell and draws that feature pair's scatterplot; a diagonal cell shows that feature's spread (its variance). | — | cell-12 | — | 2.5 |
| 48 | Correlation | Correlation is covariance normalised by both standard deviations: unitless, between −1 and 1. | Interactive scatterplot with presets for strong positive, strong negative, weak and approximately zero linear correlation, plus a curved relationship. Pearson's r updates live. A unit switch (cm ↔ mm) shows covariance changing while r does not. | — | — | — | 3 |
| 49 | Why Covariance Matrix Matters | The covariance matrix appears in PCA, multivariate Gaussians, redundancy detection and linear regression. | Four uses, each computed from Iris petal measurements: PCA directions, the multivariate Gaussian ellipse drawn from Σ, feature redundancy (r ≈ 0.96), and the regression slope Cov(X, Y)/Var(X). | — | — | — | 1.5 |
| 50 | Real Dataset Workflow | A repeatable order for analysing any new dataset. | The six-step workflow, each step showing its real Iris result (shape, summary, IQR outliers, covariance) and linking to the matching notebook cell in the Python Lab. | — | cell-1, cell-2, cell-4, cell-8, cell-12 | — | 1 |
| 51 | Statistics + Linear Algebra Connection | Principal components are the eigenvectors of the covariance matrix; eigenvalues are the variances along them. | PCA built in seven steps on a real 2D cloud: centre it; sweep a direction and plot the projected variance; show Σ; draw its eigenvectors; label eigenvalues as the variances along them; project onto PC1; report variance retained and lost. All numbers come from an actual eigen decomposition. | — | cell-16 | 7 | 3.5 |

Additions (badged “Added” in the app) and corrections:

- Slide 46 · added: Covariance formula, population and sample forms.
- Slide 46 · added: Signed-rectangle construction.
- Slide 47 · **correction**: The original notebook includes the categorical species code as a fifth column. This slide uses only the four continuous measurements.
- Slide 48 · added: Non-linear and outlier cases.
- Slide 48 · added: Correlation is not causation.
- Slide 49 · added: Each use computed live from the real data.
- Slide 51 · **correction**: The notebook uses np.linalg.eig, which returns eigenvalues unsorted; np.linalg.eigh is the correct routine for symmetric matrices and returns them sorted.

## 07 · Practical Python (slides 52–53)

| # | Title in the PDF | Learning objective | Visual approach in the app | Exercise | Notebook | Reveal steps | Min |
|---|---|---|---|---|---|---|---|
| 52 | Practical section | Connect every formula from the lecture to one line of pandas or NumPy code. | Gateway to the Python Lab: the notebook's cells mapped to the concepts of the lecture, the corrections applied, and the live PCA result on the four Iris measurements. | — | cell-0, cell-1, cell-2, cell-4, cell-6, cell-8, cell-10, cell-12, cell-14, cell-16 | — | 4 |
| 53 | شكرًا لكم THANK YOU | Close the session and point to revision material. | Closing slide in Arabic and English, with a one-screen formula summary of the session. | — | — | — | 1 |

Additions (badged “Added” in the app) and corrections:

- Slide 53 · added: Formula summary for revision.
