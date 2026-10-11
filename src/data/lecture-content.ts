/**
 * The lecture registry: one entry per numbered slide of Unit2_Part5.pdf, in
 * the PDF's order. `sourceTitle` is the slide title exactly as printed in the
 * PDF (tests check the order). Everything the presenter needs that is not
 * drawn on the slide lives here, so the content map (docs/CONTENT_MAP.md) is
 * generated from the same source of truth.
 *
 * Material that is not in the original PDF is listed under `supplemental` and
 * is badged "Added" on screen so students can tell it apart from the lecture.
 */

export type SectionId = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';

export interface Section {
  id: SectionId;
  title: string;
  short: string;
  from: number;
  to: number;
}

export const SECTIONS: Section[] = [
  { id: 'A', title: 'Foundations', short: 'Foundations', from: 1, to: 14 },
  { id: 'B', title: 'Descriptive Statistics', short: 'Central tendency', from: 15, to: 23 },
  { id: 'C', title: 'Measures of Variation', short: 'Variation', from: 24, to: 33 },
  { id: 'D', title: 'IQR and Outliers', short: 'IQR', from: 34, to: 44 },
  { id: 'E', title: 'Z-Score', short: 'Z-score', from: 45, to: 45 },
  { id: 'F', title: 'Covariance, Correlation and PCA', short: 'Covariance & PCA', from: 46, to: 51 },
  { id: 'G', title: 'Practical Python', short: 'Practical', from: 52, to: 53 },
];

export type SlideKind = 'title' | 'concept' | 'question' | 'solution' | 'activity' | 'closing';

export interface PresenterNotes {
  /** The one thing students must leave the slide understanding. */
  objective: string;
  /** What to say, in order. */
  say: string[];
  /** How to drive and explain the visualisation. */
  visual: string;
  /** The misconception students most often bring. */
  misconception: string;
  /** A question to put to the class. */
  question: string;
  /** Planned speaking time in minutes (the 53 entries sum to 90). */
  minutes: number;
}

export interface SlideMeta {
  n: number;
  /** Title exactly as printed on the PDF slide. */
  sourceTitle: string;
  section: SectionId;
  kind: SlideKind;
  /** Number of instructor-controlled reveal steps (0 = nothing hidden). */
  steps: number;
  /** Visual approach used in this app. */
  visual: string;
  /** Exercise or question on the slide, if any. */
  exercise?: string;
  /** Notebook cells this slide connects to (ids from the original .ipynb). */
  notebook?: string[];
  /** Additions that are not in the original PDF (badged "Added" on screen). */
  supplemental?: string[];
  /** Corrections to the source, documented rather than silently applied. */
  corrections?: string[];
  notes: PresenterNotes;
}

export const SLIDES: SlideMeta[] = [
  // ───────────────────────────── A · Foundations ─────────────────────────────
  {
    n: 1,
    sourceTitle: 'Unit 2: Linear Algebra & Statistics',
    section: 'A',
    kind: 'title',
    steps: 0,
    visual: 'A data table morphs into points: each row is a vector, so a dataset is simultaneously a matrix (linear algebra) and a distribution (statistics).',
    supplemental: ['Row-as-vector animation linking the two halves of Unit 2.'],
    notes: {
      objective: 'Frame the session: statistics and linear algebra describe the same object, a data matrix.',
      say: [
        'Welcome to Unit 2, Part 5. In the previous parts we treated data as vectors and matrices.',
        'Today we ask a different question about the same matrix: what does the cloud of points look like — where is its centre, how wide is it, which directions does it stretch in?',
        'By the end we will close the loop: the covariance matrix is a matrix, its eigenvectors are directions in the cloud, and that is PCA.',
      ],
      visual: 'Press "Rows → points" to animate the four table rows into points. Point out that each row becomes one point — that is the only idea needed for the whole lecture.',
      misconception: 'Students often see statistics and linear algebra as separate subjects; here they are two views of one dataset.',
      question: 'If a dataset has 150 rows and 4 numeric columns, how many points do we plot, and in how many dimensions?',
      minutes: 0.5,
    },
  },
  {
    n: 2,
    sourceTitle: 'Part5 Statistics Foundations + Real Dataset',
    section: 'A',
    kind: 'title',
    steps: 0,
    visual: 'Lecture route map: seven sections from variable types to PCA, ending on the real Iris dataset. Each stop is clickable.',
    notes: {
      objective: 'Show the route through the session so students know where the hard parts are.',
      say: [
        'This part is Statistics Foundations plus a real dataset.',
        'We move from describing one variable — centre, spread, outliers — to describing pairs of variables — covariance and correlation — and finally all variables at once with the covariance matrix and PCA.',
        'The last section applies every formula to the Iris dataset in Python.',
      ],
      visual: 'Hover or tap a stop on the route to show its slide range; clicking jumps there. Use it later to navigate back if a question comes up.',
      misconception: 'None yet — set the expectation that every formula will be computed on real data at the end.',
      question: 'Which of these topics have you already met in another course?',
      minutes: 0.5,
    },
  },
  {
    n: 3,
    sourceTitle: 'Objectives',
    section: 'A',
    kind: 'concept',
    steps: 0,
    visual: 'The eight objectives as a checklist, each linked to the slides that deliver it.',
    notes: {
      objective: 'State the eight learning objectives precisely.',
      say: [
        'By the end of the session you should be able to classify variables, compute descriptive statistics, and choose between mean, median and mode.',
        'You should compute range, variance, standard deviation and IQR by hand, and know when each is the right tool.',
        'Finally you should compute a covariance matrix, read it, and explain why its eigenvectors are the principal components.',
      ],
      visual: 'Each objective shows the slides that deliver it. Tap one to jump; use this again at the end as a self-check.',
      misconception: '"Compute" here means both by hand on small data and in Python on real data — not only calling a library.',
      question: 'Which objective sounds least familiar to you right now?',
      minutes: 1,
    },
  },
  {
    n: 4,
    sourceTitle: 'Why Statistics Matters in ML',
    section: 'A',
    kind: 'concept',
    steps: 0,
    visual: 'Three pillars (probability, statistics, linear algebra) under ML, plus four live mini-scenes: a skewed distribution, a flagged outlier, a linear vs curved fit, and feature scaling.',
    supplemental: ['Four mini-scenes illustrating each "Statistics helps us" bullet.'],
    notes: {
      objective: 'Motivate the session: every ML pipeline begins with statistical decisions.',
      say: [
        'Machine learning rests on three pillars: probability, statistics and linear algebra.',
        'Statistics is how we understand the distribution of the data, detect outliers, choose a model that matches the data, and prepare features — for example by scaling them.',
        'Each of those four jobs gets its own tool today.',
      ],
      visual: 'Select each of the four tiles. Each one previews the slide where the tool is taught (median for skew, IQR fences for outliers, correlation for model choice, z-scores for scaling).',
      misconception: 'That preprocessing is a mechanical step. Choosing to scale, clip or drop data is a statistical decision with consequences.',
      question: 'Have you ever trained a model that did badly because of the data rather than the algorithm?',
      minutes: 2,
    },
  },
  {
    n: 5,
    sourceTitle: 'Types of Variables',
    section: 'A',
    kind: 'concept',
    steps: 0,
    visual: 'A classification tree. Each leaf carries a small geometric picture of what the values look like: unordered chips (nominal), ordered steps (ordinal), isolated integers (discrete), an unbroken line (continuous).',
    notes: {
      objective: 'Distinguish qualitative from quantitative variables and the four subtypes.',
      say: [
        'Variables are either qualitative — categories — or quantitative — numbers that measure something.',
        'Categories are nominal when they have no order, like car colour, and ordinal when they do, like a satisfaction rating.',
        'Numbers are discrete when they are counts with gaps between possible values, and continuous when any value in an interval is possible, like a price or a length.',
        'The type decides which statistics are meaningful — that is the point of this slide.',
      ],
      visual: 'Point at each leaf picture: the gaps between discrete values, the arrow showing order for ordinal, and the absence of order for nominal chips.',
      misconception: 'A number on the page is not always a quantitative variable. A satisfaction score 1–5, a postcode, or the Iris species code 0/1/2 are labels.',
      question: 'Is a postcode quantitative? What would its mean tell you?',
      minutes: 2.5,
    },
  },
  {
    n: 6,
    sourceTitle: 'Quick Challenge',
    section: 'A',
    kind: 'question',
    steps: 0,
    visual: 'Six variable cards. The instructor records the class vote for each card (nominal, ordinal, discrete, continuous); the next slide compares the votes with the answer.',
    exercise: 'Classify GPA, Car Color, Number of Children, Customer Satisfaction (1–5), House Price, Disease Type as categorical/numeric and nominal/ordinal/discrete/continuous.',
    supplemental: ['Class-vote recorder carried over to the solution slide.'],
    notes: {
      objective: 'Practise classification before seeing the answers.',
      say: [
        'Take a minute. For each variable decide: categorical or numeric, and then which of the four subtypes.',
        'Then we vote. I will record what the room says on each card.',
      ],
      visual: 'Tap a subtype on each card to record the majority vote. Nothing is marked right or wrong here — that happens on the next slide.',
      misconception: 'Customer satisfaction 1–5 is usually voted "discrete". It is ordinal: the numbers are ordered labels, and the gap 1→2 need not equal 4→5.',
      question: 'Who chose "discrete" for satisfaction? Why?',
      minutes: 2,
    },
  },
  {
    n: 7,
    sourceTitle: 'Solution',
    section: 'A',
    kind: 'solution',
    steps: 6,
    visual: 'The lecture\'s solution table revealed row by row, each row checked against the vote recorded on slide 6.',
    exercise: 'Solution to the Quick Challenge.',
    supplemental: ['Comparison with the recorded class vote.', 'Note linking ordinal codes to the Iris species code.'],
    notes: {
      objective: 'Confirm the classification and explain the two tricky rows (GPA, satisfaction).',
      say: [
        'GPA is numeric and continuous: it can take any value in an interval, even if it is reported to two decimals.',
        'Car colour and disease type are nominal categories. Number of children is a count — discrete.',
        'Satisfaction is categorical ordinal: ordered labels that happen to be written as digits. House price is continuous.',
      ],
      visual: 'Press → to reveal one row at a time; each row shows whether the class vote matched. Use "Reveal all" if time is short.',
      misconception: 'House price is sometimes called discrete because it is in whole riyals. Measurement precision does not change the underlying continuous nature.',
      question: 'The Iris species is stored as 0, 1, 2. Which type is it?',
      minutes: 1.5,
    },
  },
  {
    n: 8,
    sourceTitle: 'Independent vs Dependent Variables',
    section: 'A',
    kind: 'concept',
    steps: 0,
    visual: 'A feature matrix X (blue columns) flows through a model f into a target y (yellow column): y ≈ f(x₁, x₂, …).',
    supplemental: ['Caution that "independent variable" does not mean features are statistically independent of each other.'],
    notes: {
      objective: 'Map independent/dependent variables onto the ML vocabulary of features and target.',
      say: [
        'The independent variable is the input — the presumed cause. The dependent variable is the output — the effect we want to explain or predict.',
        'In machine learning we call the inputs features and the output the target. The model learns a function from features to target.',
      ],
      visual: 'Colour carries meaning from here on: blue = feature columns, yellow = target. The arrow is the model.',
      misconception: '"Independent" is a role, not a property. Features are usually correlated with each other — we will measure that with the covariance matrix.',
      question: 'Is house price always a target? Could it be a feature in another model?',
      minutes: 1.5,
    },
  },
  {
    n: 9,
    sourceTitle: 'Quick Question',
    section: 'A',
    kind: 'question',
    steps: 0,
    visual: 'Four column headers to assign: the instructor taps each one to mark it feature or target. No answer is shown on this slide.',
    exercise: 'Predict pass/fail from Study Hours, Attendance, Sleep Hours: which are independent, which is dependent?',
    notes: {
      objective: 'Apply the feature/target distinction to a concrete prediction problem.',
      say: ['Read the scenario. Which columns go into the model, and which comes out?'],
      visual: 'Tap each column to toggle Feature ↔ Target as the class answers.',
      misconception: 'Students sometimes call attendance the target because it is "caused" by study habits. The target is defined by what we want to predict.',
      question: 'What kind of variable is Pass/Fail, and what kind of ML task does that make this?',
      minutes: 1,
    },
  },
  {
    n: 10,
    sourceTitle: 'Solution',
    section: 'A',
    kind: 'solution',
    steps: 2,
    visual: 'Revealed in two steps: the three features, then the target. A small illustrative table shows the shape of the data.',
    exercise: 'Solution to the pass/fail question.',
    supplemental: ['Illustrative (made-up) rows to show the data layout, clearly labelled.', 'Pass/Fail is categorical, so this is classification.'],
    notes: {
      objective: 'Confirm: three independent variables, one dependent variable.',
      say: [
        'Independent variables: study hours, attendance, sleep hours.',
        'Dependent variable: pass or fail. Because the target is categorical with two classes, this is a binary classification problem.',
      ],
      visual: 'Press → twice. The table rows are illustrative, not real data — say so.',
      misconception: 'That the target must be numeric. Categorical targets are handled by classifiers.',
      question: 'If we predicted the exam score instead of pass/fail, what would change?',
      minutes: 1,
    },
  },
  {
    n: 11,
    sourceTitle: 'Population vs Sample',
    section: 'A',
    kind: 'concept',
    steps: 0,
    visual: 'Interactive population of 400 members in 4 regions and 20 blocks. Choose random, stratified, cluster or systematic sampling and see which members are selected, the sample mean x̄ vs the population mean μ, and each region\'s share.',
    supplemental: ['Simulated population (illustrative values).', 'Live comparison of sample vs population composition, showing bias.'],
    notes: {
      objective: 'Define population and sample, and see how each sampling method chooses members.',
      say: [
        'The population is every unit we care about; a sample is the subset we actually observe.',
        'A parameter such as μ describes the population; a statistic such as x̄ is computed from a sample and estimates it.',
        'Watch how each method chooses. Random: every member equally likely. Stratified: sample inside each region in proportion. Cluster: take whole blocks. Systematic: every k-th member from a random start.',
      ],
      visual: 'Switch methods and press "New sample" several times. Watch x̄ move around μ. With cluster sampling, x̄ jumps a lot because neighbouring blocks are similar. With systematic sampling at k = 20, the sample is a single column — a periodic list order can bias it.',
      misconception: 'That a bigger sample always fixes bias. A large biased sample is still biased; representativeness is about how members are chosen.',
      question: 'Which method gives the most stable x̄ here, and why?',
      minutes: 3,
    },
  },
  {
    n: 12,
    sourceTitle: 'Quick Question',
    section: 'A',
    kind: 'question',
    steps: 0,
    visual: 'Proportion grid: 10,000 of 2,000,000 users is 1 cell in 200.',
    exercise: '10,000 users in training data, 2 million users in the company: identify the population and the sample, and explain why the sample must be representative.',
    notes: {
      objective: 'Apply population/sample to a realistic ML training situation.',
      say: ['Read the scenario. The grid shows the scale: the sample is half a percent of the population.'],
      visual: 'The single highlighted cell is the training sample. Leave the answers for the next slide.',
      misconception: 'That a 0.5% sample is "too small to be useful". Size matters less than how it was drawn.',
      question: 'What would happen if those 10,000 users were all from one city?',
      minutes: 1,
    },
  },
  {
    n: 13,
    sourceTitle: 'Solution',
    section: 'A',
    kind: 'solution',
    steps: 3,
    visual: 'Answers revealed in three steps, then a bias simulator: a representative sample vs a sample of only the most active users, with their distributions overlaid on the population.',
    exercise: 'Solution to the 10,000 / 2 million question.',
    supplemental: ['Biased vs representative sample simulation (illustrative data).'],
    notes: {
      objective: 'Population = 2 million users, sample = 10,000; representativeness drives generalisation.',
      say: [
        'The population is all 2 million users. The sample is the 10,000 in our training set.',
        'The model only learns the patterns present in its sample. If the sample is representative, those patterns generalise to the population.',
        'Toggle the biased sample: when only the most active users are sampled, the sample distribution sits to the right of the population — the model would be trained on the wrong world.',
      ],
      visual: 'Reveal the three answers, then switch between "Representative" and "Only most-active users".',
      misconception: 'That good test accuracy proves the sample was representative. If the test set is drawn the same biased way, it hides the problem.',
      question: 'Name a real ML system where the training sample was not representative of its users.',
      minutes: 1.5,
    },
  },
  {
    n: 14,
    sourceTitle: 'Minute Group Discussion – Sampling Methods',
    section: 'A',
    kind: 'activity',
    steps: 0,
    visual: 'Four group cards with the three prompts and a discussion timer. Each card has an instructor-only reference answer and a miniature of the sampler from slide 11.',
    exercise: 'Four groups each explain one sampling method: definition, real-life example, use in ML.',
    supplemental: ['Discussion countdown timer.', 'Reference answers for the instructor, hidden until revealed.'],
    corrections: ['The PDF title reads "Minute Group Discussion" — the number of minutes appears to be missing. The title is kept; the timer defaults to 5 minutes and can be changed.'],
    notes: {
      objective: 'Students explain each sampling method in their own words with an ML use case.',
      say: [
        'Four groups, one method each. You have the timer on screen.',
        'Each group answers three things: what it is in simple words, a real-life example, and when you would use it in machine learning.',
      ],
      visual: 'Start the timer. When a group presents, open its reference answer only after they finish, to fill gaps.',
      misconception: 'Stratified and cluster are often confused. Stratified samples within every group; cluster samples whole groups and ignores the rest.',
      question: 'Which method does scikit-learn\'s train_test_split(stratify=y) implement?',
      minutes: 5,
    },
  },

  // ─────────────────────── B · Descriptive Statistics ───────────────────────
  {
    n: 15,
    sourceTitle: 'Descriptive Analysis',
    section: 'B',
    kind: 'concept',
    steps: 0,
    visual: 'The same small dataset shown three ways — a table, a dot plot and a summary-statistics strip — answering "What happened?".',
    supplemental: ['Where descriptive analysis sits relative to inferential and predictive analysis.'],
    notes: {
      objective: 'Descriptive analysis summarises what happened using tables, plots and summary statistics.',
      say: [
        'Descriptive analysis answers one question: what happened?',
        'It uses three tools: tables, plots and summary statistics. The same five numbers are shown here in all three forms.',
        'It does not explain why, and it does not predict. Those are the jobs of inferential statistics and of the models we build later.',
      ],
      visual: 'Toggle between table, plot and summary. Ask which view makes the centre and spread easiest to see.',
      misconception: 'That a summary statistic can replace looking at the data. Very different datasets can share the same mean.',
      question: 'Which of the three views would you show a manager, and which would you use to spot an error?',
      minutes: 1,
    },
  },
  {
    n: 16,
    sourceTitle: 'Measures of Central Tendency',
    section: 'B',
    kind: 'concept',
    steps: 0,
    visual: 'Three geometric definitions: the mean as the balance point of a beam, the median as the middle of the sorted values, the mode as the tallest stack.',
    supplemental: ['Even-n median rule.', 'Sample mean notation x̄ alongside the population μ.'],
    notes: {
      objective: 'Define mean, median and mode, each with a geometric picture.',
      say: [
        'The mean is the sum divided by the count: μ = Σx / N. Physically it is the balance point: put equal weights at each value and the beam balances at the mean.',
        'The median is the middle value once the data are sorted. With an even count, it is the average of the two middle values.',
        'The mode is the most frequent value — the tallest stack.',
      ],
      visual: 'Drag the right-most weight. The beam\'s fulcrum (mean) moves; the median only moves when the order changes.',
      misconception: 'That the mean is "the middle". The mean balances distances; the median balances counts.',
      question: 'Why does the balance point equal Σx/N? (Hint: the deviations from it sum to zero.)',
      minutes: 2,
    },
  },
  {
    n: 17,
    sourceTitle: 'Question 1 – Balanced Data',
    section: 'B',
    kind: 'question',
    steps: 0,
    visual: 'The five scores on a number line, evenly spaced.',
    exercise: "Students' scores 75, 80, 85, 90, 95: compute the mean, median, mode; are mean and median close, and what does that indicate?",
    notes: {
      objective: 'Compute the three measures on symmetric data.',
      say: ['Compute the mean, median and mode. Then compare the mean and the median.'],
      visual: 'Leave the dot plot on screen; the even spacing is a hint.',
      misconception: 'Some students write "mode = 75" (the first value) when no value repeats.',
      question: 'Before computing: where do you expect the balance point to be?',
      minutes: 1,
    },
  },
  {
    n: 18,
    sourceTitle: 'Solution',
    section: 'B',
    kind: 'solution',
    steps: 4,
    visual: 'Step-by-step: the sum and division, the median found by sorting, "no mode", then the balance beam showing mean and median coinciding.',
    exercise: 'Solution: mean 85, median 85, no mode; balanced, no outliers.',
    notes: {
      objective: 'Mean = median = 85 signals symmetric, balanced data.',
      say: [
        'Mean: 75 + 80 + 85 + 90 + 95 = 425, and 425 ÷ 5 = 85.',
        'Median: the data are already sorted; the middle (third) value is 85.',
        'Mode: no value repeats, so there is no mode.',
        'Mean ≈ median: the data are balanced around the centre with no outliers.',
      ],
      visual: 'Press → for each line. On the last step the two markers land on the same point.',
      misconception: 'Mean = median does not prove symmetry in general, but it is a useful first check.',
      question: 'Change one score to make the mean larger than the median. Which score and how?',
      minutes: 1.5,
    },
  },
  {
    n: 19,
    sourceTitle: 'Question 2 – Data with Outlier',
    section: 'B',
    kind: 'question',
    steps: 0,
    visual: 'Salaries on a number line: four values crowded on the left, one far to the right. A prediction checkpoint asks where the mean will land.',
    exercise: 'Monthly salaries 4000, 4500, 5000, 5500, 100000: mean, median, mode; which measure best represents the typical salary?',
    supplemental: ['Prediction checkpoint before the calculation.'],
    notes: {
      objective: 'Predict the effect of an extreme value before computing.',
      say: ['Look at the picture first. Before calculating, where will the balance point be?'],
      visual: 'Ask for a show of hands on the checkpoint, then reveal the result. The full calculation is on the next slide.',
      misconception: 'That the mean will be "somewhere around 5,000 because most values are there".',
      question: 'If you were negotiating a salary, which average would you quote, and which would the employer quote?',
      minutes: 1,
    },
  },
  {
    n: 20,
    sourceTitle: 'Solution',
    section: 'B',
    kind: 'solution',
    steps: 4,
    visual: 'Mean vs median, live. The mean is a fulcrum under a beam; the median is the middle observation. The extreme salary is a draggable number inside the sentence; drag it and both measures update. The deviation bars show why the fulcrum must move.',
    exercise: 'Solution: mean 23,800, median 5,000, no mode; median represents the typical salary; data are skewed.',
    notes: {
      objective: 'The mean is pulled towards an outlier; the median is not.',
      say: [
        'Sum: 4,000 + 4,500 + 5,000 + 5,500 + 100,000 = 119,000. Mean = 119,000 ÷ 5 = 23,800.',
        'Median: the middle of the sorted values is 5,000. No value repeats, so no mode.',
        'Four of the five people earn less than a quarter of the mean. The mean is not typical of anyone; the median is.',
        'One huge value makes the distribution right-skewed. In skewed data, report the median.',
      ],
      visual: 'After the four steps, drag the extreme salary from 6,000 up to 200,000. The median stays at 5,000 while the mean travels. Turn on "deviations": the bars left of the mean always balance the bar on the right.',
      misconception: 'That the outlier should simply be deleted. It may be a real CEO salary — the right response is a robust measure, not deletion.',
      question: 'How large must the fifth salary be for the mean to exceed every other salary?',
      minutes: 3,
    },
  },
  {
    n: 21,
    sourceTitle: 'Question 3 – Categorical Data',
    section: 'B',
    kind: 'question',
    steps: 0,
    visual: 'The six survey answers as labelled chips with no positions on a number line — there is nothing to add or sort.',
    exercise: 'Favourite language: Python, Python, Java, Python, C++, Java — mean? median? mode? most appropriate measure?',
    notes: {
      objective: 'Recognise which measures exist for categorical data.',
      say: ['Can you add "Python" to "Java"? Can you sort them meaningfully? Decide which measures exist.'],
      visual: 'The chips float without an axis on purpose — there is no number line for categories.',
      misconception: 'Alphabetical order is not a meaningful order for computing a median.',
      question: 'If we coded Python = 1, Java = 2, C++ = 3, would the mean become meaningful?',
      minutes: 1,
    },
  },
  {
    n: 22,
    sourceTitle: 'Solution',
    section: 'B',
    kind: 'solution',
    steps: 3,
    visual: 'Revealed in steps: the mean is undefined (no arithmetic), the median is undefined (no order), and a frequency bar chart where the tallest bar is the mode.',
    exercise: 'Solution: mean and median not applicable, mode = Python.',
    supplemental: ['Encoded-label trap: the mean of arbitrary codes is computable but meaningless — the same issue as the Iris species code in the notebook.'],
    notes: {
      objective: 'Only the mode applies to nominal data.',
      say: [
        'Mean: not applicable — categories cannot be added.',
        'Median: not applicable — nominal categories have no order.',
        'Mode: Python appears 3 times, Java 2, C++ 1. The mode is Python, and the mode is the appropriate measure for categorical data.',
      ],
      visual: 'After the reveal, press "Encode as numbers" to show that a mean of codes can be computed but changes when the codes are reassigned — proof it is meaningless.',
      misconception: 'That software output is meaningful because it runs. pandas will happily average a label column — the original notebook does this with species.',
      question: 'For ordinal data like satisfaction 1–5, is the median applicable?',
      minutes: 1.5,
    },
  },
  {
    n: 23,
    sourceTitle: 'When to Use Mean, Median, and Mode',
    section: 'B',
    kind: 'concept',
    steps: 0,
    visual: 'The lecture\'s decision table, plus a checkpoint question with realistic scenarios.',
    supplemental: ['Multiple-choice checkpoint with instructor-controlled answer.'],
    notes: {
      objective: 'Choose the right measure from data type and shape.',
      say: [
        'Mean: symmetric, balanced numeric data. Sensitive to outliers; not for categories.',
        'Median: skewed data or data with outliers. Much less sensitive; still needs order.',
        'Mode: categorical data, or the most frequent value. Not sensitive to outliers; works with categories.',
      ],
      visual: 'Run the checkpoint: students choose, then reveal. The relevant table row highlights.',
      misconception: '"Median for ordinal data" is fine, and the table\'s "No" for median and categorical refers to nominal categories.',
      question: 'Riyadh house prices are strongly right-skewed. Which measure goes in the report?',
      minutes: 2,
    },
  },

  // ──────────────────────── C · Measures of Variation ────────────────────────
  {
    n: 24,
    sourceTitle: 'Measures of Variation',
    section: 'C',
    kind: 'concept',
    steps: 6,
    visual: 'The geometry of variance: deviations become literal squares. Six steps build σ² = (1/N)Σ(x − μ)² and σ = √σ² — the mean, the deviations, their squares, the total area, the average square, and its side length σ. Toggle ÷N or ÷(n − 1).',
    supplemental: ['Sample variance s² with n − 1 (Bessel\'s correction) beside the lecture\'s population formula.'],
    notes: {
      objective: 'Understand variance as the average squared distance from the mean, and σ as its square root.',
      say: [
        'Range is max − min: simple, but it uses only two values.',
        'Variance uses every value. Step 1: find the mean. Step 2: measure each value\'s deviation from it.',
        'Step 3: square each deviation — literally draw a square with that side. Squaring removes signs and penalises large deviations more.',
        'Step 4: add the areas. Step 5: divide by N to get the average square — that area is the variance σ².',
        'Step 6: its side length is the standard deviation σ, back in the original units.',
      ],
      visual: 'Press → through the six steps; the formula grows with the picture. Switch dataset A/B and switch ÷N vs ÷(n − 1). Explain: with a sample, deviations are measured from x̄, which is closer to the data than μ, so dividing by n − 1 corrects the underestimate.',
      misconception: 'That variance is in the same units as the data. It is in squared units — that is why we take the square root.',
      question: 'Why not just average the deviations without squaring them?',
      minutes: 3.5,
    },
  },
  {
    n: 25,
    sourceTitle: 'Activity – Measures of Variation',
    section: 'C',
    kind: 'question',
    steps: 0,
    visual: 'Datasets A and B on a shared axis, with a prediction checkpoint: which is more spread out?',
    exercise: 'Dataset A: 10, 12, 14. Dataset B: 5, 10, 21. Compute range, mean, variance, standard deviation; which is more spread out?',
    notes: {
      objective: 'Practise the full variance calculation by hand.',
      say: ['Work in pairs: range, mean, variance and standard deviation for both datasets. Use the lecture\'s formula, dividing by N.'],
      visual: 'Put the checkpoint up first, then give about 90 seconds.',
      misconception: 'Forgetting to square before summing — the deviations always sum to zero.',
      question: 'Both have mean 12. What does that tell you about using the mean alone?',
      minutes: 1.5,
    },
  },
  {
    n: 26,
    sourceTitle: 'Solution',
    section: 'C',
    kind: 'solution',
    steps: 4,
    visual: 'Worked solution for A synchronised with the squares picture: mean 12, range 4, squared deviations 4 + 0 + 4, variance 8/3 ≈ 2.67, σ ≈ 1.63.',
    exercise: 'Solution for Dataset A.',
    notes: {
      objective: 'Walk through every arithmetic step for A.',
      say: [
        'Mean: (10 + 12 + 14) ÷ 3 = 36 ÷ 3 = 12. Range: 14 − 10 = 4.',
        'Squared deviations: (10 − 12)² = 4, (12 − 12)² = 0, (14 − 12)² = 4.',
        'Variance: (4 + 0 + 4) ÷ 3 = 8 ÷ 3 ≈ 2.67.',
        'Standard deviation: √2.67 ≈ 1.63.',
      ],
      visual: 'Each → reveals one line and the matching part of the picture.',
      misconception: 'Rounding the variance to 2.67 before taking the square root gives 1.634 — fine here, but keep full precision in code.',
      question: 'If these three values were a sample, what would s² be?',
      minutes: 2,
    },
  },
  {
    n: 27,
    sourceTitle: 'Solution',
    section: 'C',
    kind: 'solution',
    steps: 4,
    visual: 'Worked solution for B with the squares picture: squared deviations 49 + 4 + 81 = 134, variance ≈ 44.67, σ ≈ 6.68.',
    exercise: 'Solution for Dataset B.',
    supplemental: ['Sample-variance values (÷ n − 1) for A and B, shown separately.'],
    notes: {
      objective: 'B has the same mean as A but far more spread.',
      say: [
        'Mean: (5 + 10 + 21) ÷ 3 = 12. Range: 21 − 5 = 16.',
        'Squared deviations: 49, 4 and 81. One value, 21, contributes 81 of the 134 total.',
        'Variance: 134 ÷ 3 ≈ 44.67; standard deviation √44.67 ≈ 6.68. B is more spread out.',
      ],
      visual: 'Compare the squares with slide 26: the area for 21 alone is bigger than all of A\'s.',
      misconception: 'That variance grows linearly with distance. Doubling a deviation quadruples its square.',
      question: 'Which single value would you move to reduce B\'s variance the most?',
      minutes: 2,
    },
  },
  {
    n: 28,
    sourceTitle: 'Why variance and standard deviation matter in machine learning',
    section: 'C',
    kind: 'concept',
    steps: 0,
    visual: 'Three tiles: standardisation z = (x − μ)/σ; mean squared error drawn as squares on regression residuals (the same squares as variance); outlier detection by distance in σ units.',
    supplemental: ['Live MSE demo on a small regression with draggable line.'],
    notes: {
      objective: 'Connect variance to three everyday ML tools.',
      say: [
        'Preprocessing: standardisation subtracts the mean and divides by the standard deviation, so features are on comparable scales.',
        'Mean squared error is a variance-like quantity: the average squared distance between predictions and truth. The squares in this picture are the same squares as on slide 24.',
        'Outlier detection: a value many standard deviations from the mean is unusual.',
      ],
      visual: 'In the MSE tile, change the slope of the line; the squares and the MSE update. The best line minimises the total square area.',
      misconception: 'That standardisation makes data normally distributed. It only shifts and rescales; the shape is unchanged.',
      question: 'If you predict the mean for every point, what is your MSE equal to?',
      minutes: 2,
    },
  },
  {
    n: 29,
    sourceTitle: 'Why Standard Deviation Matters in ML',
    section: 'C',
    kind: 'question',
    steps: 1,
    visual: 'Datasets A and B with ±σ bands. A "guess the next value" demo: if you predict the mean, your typical (root-mean-square) error equals σ.',
    exercise: 'If you were building a model, which dataset is more predictable?',
    supplemental: ['RMS error of predicting the mean equals σ (population).'],
    notes: {
      objective: 'Smaller standard deviation means more predictable values.',
      say: [
        'Which dataset is more predictable? Commit before I reveal.',
        'Dataset A. If you always predict the mean, your typical error is exactly the standard deviation — 1.63 for A versus 6.68 for B.',
      ],
      visual: 'Press → to reveal the answer. The ±σ bands make the typical error visible.',
      misconception: 'That a low standard deviation means a good model. It means the target is easy; a model must still beat "predict the mean".',
      question: 'What is the simplest baseline any regression model should beat?',
      minutes: 1.5,
    },
  },
  {
    n: 30,
    sourceTitle: 'Example',
    section: 'C',
    kind: 'question',
    steps: 0,
    visual: 'Datasets A (8, 10, 12) and B (2, 10, 18) on a shared axis, symmetric about 10.',
    exercise: 'Dataset A: 8, 10, 12. Dataset B: 2, 10, 18. Mean, range, and which is more spread out, and why?',
    notes: {
      objective: 'Isolate spread: same centre, different variation.',
      say: ['Compute the mean and the range of each dataset. Which is more spread out?'],
      visual: 'Both are symmetric about 10 — point it out after students answer.',
      misconception: 'That the same mean implies similar data.',
      question: 'Without calculating, what is the mean of each?',
      minutes: 1,
    },
  },
  {
    n: 31,
    sourceTitle: 'Solution',
    section: 'C',
    kind: 'solution',
    steps: 2,
    visual: 'Dataset A: values close to the mean, tightly clustered.',
    exercise: 'Solution for Dataset A: mean 10, range 4.',
    corrections: ['The PDF writes "8 + 10 + 12 ÷ 3 = 30 ÷ 3 = 10". By order of operations 8 + 10 + 12 ÷ 3 = 22; the intended expression is (8 + 10 + 12) ÷ 3. Parentheses are added on screen and the change is flagged.'],
    notes: {
      objective: 'A: mean 10, range 4, tightly clustered.',
      say: [
        'Mean: (8 + 10 + 12) ÷ 3 = 30 ÷ 3 = 10. Note the parentheses — the slide in the PDF omits them.',
        'Range: 12 − 8 = 4. Values are close to the mean: tightly clustered.',
      ],
      visual: 'The correction badge is visible on purpose; use it to remind students that order of operations matters in code too.',
      misconception: 'Writing 8 + 10 + 12 / 3 in Python returns 22.0.',
      question: 'What does Python return for 8 + 10 + 12 / 3?',
      minutes: 0.5,
    },
  },
  {
    n: 32,
    sourceTitle: 'Solution',
    section: 'C',
    kind: 'solution',
    steps: 2,
    visual: 'Dataset B: same mean, values far from it.',
    exercise: 'Solution for Dataset B: mean 10, range 16.',
    corrections: ['Same missing parentheses as slide 31: (2 + 10 + 18) ÷ 3.'],
    notes: {
      objective: 'B: same mean as A, range 16, much more spread out.',
      say: [
        'Mean: (2 + 10 + 18) ÷ 3 = 30 ÷ 3 = 10 — the same as A.',
        'Range: 18 − 2 = 16. The values are far from the mean, so B is more spread out.',
      ],
      visual: 'Press →; the two datasets are overlaid with the shared mean.',
      misconception: 'That range alone is enough. Range uses only two values; the next slide uses all of them.',
      question: 'Add a fourth value to B so that its range stays 16 but its spread looks smaller. Is that possible?',
      minutes: 0.5,
    },
  },
  {
    n: 33,
    sourceTitle: 'Conclusion',
    section: 'C',
    kind: 'concept',
    steps: 0,
    visual: 'Both datasets overlaid on one axis with the shared mean and their σ brackets, computed live.',
    supplemental: ['The actual standard deviations (computed with ÷N): A ≈ 1.63, B ≈ 6.53.'],
    notes: {
      objective: 'The mean gives the centre; the standard deviation gives the spread.',
      say: [
        'Both datasets have mean 10. Dataset B has much larger spread, so a larger standard deviation — about 6.53 versus 1.63.',
        'The mean tells us the centre; the standard deviation tells us how spread out the data are. You always need both.',
      ],
      visual: 'Point at the two σ brackets around the single shared mean line.',
      misconception: 'That SD is the "average distance" from the mean. It is the root-mean-square distance, which weights large deviations more.',
      question: 'Compute the mean absolute deviation of B. Is it equal to σ?',
      minutes: 1.5,
    },
  },

  // ─────────────────────────── D · IQR and Outliers ───────────────────────────
  {
    n: 34,
    sourceTitle: 'Interquartile Range (IQR)',
    section: 'D',
    kind: 'concept',
    steps: 0,
    visual: 'Sorted observations split into four equal-count groups by Q1, Q2, Q3; the middle 50% is shaded. A convention panel compares the lecture\'s median-of-halves method with NumPy\'s default interpolation.',
    supplemental: ['Quartile convention comparison (lecture method vs NumPy/pandas default).'],
    notes: {
      objective: 'IQR = Q3 − Q1 is the width of the middle 50% of the data.',
      say: [
        'Quartiles cut the sorted data into four groups with equal counts. Q2 is the median.',
        'The IQR is Q3 − Q1: the width of the middle half of the data.',
        'Because it ignores the lowest and highest quarters, extreme values cannot stretch it — it is robust to outliers.',
      ],
      visual: 'Show the convention panel: our lecture splits the data at the median and takes the median of each half. NumPy interpolates and gives different quartiles on small data. Neither is wrong; state your method.',
      misconception: 'That quartiles have a single universal definition. Software packages implement at least nine.',
      question: 'Why might pandas give a slightly different Q1 from your hand calculation?',
      minutes: 1.5,
    },
  },
  {
    n: 35,
    sourceTitle: 'Example',
    section: 'D',
    kind: 'solution',
    steps: 3,
    visual: 'The seven values sorted on a line; the median lights up, then the lower half and its middle value Q1.',
    exercise: 'Dataset 5, 10, 15, 20, 25, 30, 100: order, median, Q1.',
    notes: {
      objective: 'Find Q2 and Q1 by the median-of-halves method.',
      say: [
        'Step 1: order the data — already ordered.',
        'Step 2: the median is the 4th of 7 values: 20.',
        'Step 3: the lower half is the three values below the median: 5, 10, 15. Its middle value is Q1 = 10.',
      ],
      visual: 'Each → highlights one step on the number line.',
      misconception: 'Including the median in both halves. With odd n, the lecture excludes it.',
      question: 'What would Q1 be if we included 20 in the lower half?',
      minutes: 1.5,
    },
  },
  {
    n: 36,
    sourceTitle: 'Example',
    section: 'D',
    kind: 'solution',
    steps: 2,
    visual: 'The upper half and Q3, then the IQR bracket spanning Q1 to Q3.',
    exercise: 'Q3 and IQR for 5, 10, 15, 20, 25, 30, 100.',
    notes: {
      objective: 'Find Q3 and compute the IQR.',
      say: [
        'Step 4: the upper half is 25, 30, 100; its middle value is Q3 = 30.',
        'Step 5: IQR = 30 − 10 = 20.',
      ],
      visual: 'The shaded box is the middle 50%: it contains 15, 20, 25 and its edges are Q1 and Q3.',
      misconception: 'That 100 makes Q3 large. Q3 is the middle of the upper half — 100 only counts as "one value at the top".',
      question: 'Replace 100 with 1,000. What happens to Q3?',
      minutes: 1,
    },
  },
  {
    n: 37,
    sourceTitle: 'Important Observation',
    section: 'D',
    kind: 'concept',
    steps: 0,
    visual: 'Drag the largest value from 30 to 1,000: the range bar stretches without limit while the IQR bar stays fixed at 20.',
    notes: {
      objective: 'IQR is robust to outliers; range is not.',
      say: [
        'Even though 100 is a large outlier, the IQR stays at 20.',
        'Compare: range = 100 − 5 = 95, IQR = 20. The range is dominated by one value; the IQR describes the bulk of the data.',
      ],
      visual: 'Drag the dashed number slowly (or focus it and use the arrow keys). Stop at 100 to match the slide, then go to 1,000. The IQR never changes as long as the value stays at the top.',
      misconception: 'That robust means "always unchanged". If many values were extreme — more than a quarter — the IQR would move too.',
      question: 'How many values would you need to change to move the IQR?',
      minutes: 1,
    },
  },
  {
    n: 38,
    sourceTitle: 'Why is IQR Important in Machine Learning?',
    section: 'D',
    kind: 'concept',
    steps: 0,
    visual: 'Anatomy of a boxplot (box = IQR, line = median, whiskers to the last values inside the fences, flagged points beyond). Robust scaling (x − median)/IQR compared with standardisation on data with an outlier.',
    supplemental: ['Robust scaling vs standard scaling comparison, as in scikit-learn\'s RobustScaler.'],
    notes: {
      objective: 'IQR is used for outlier detection, data cleaning, boxplots and robust scaling.',
      say: [
        'We use the IQR to detect outliers and clean data, it is the box in every boxplot, and it is the scale in robust scaling.',
        'Robust scaling subtracts the median and divides by the IQR. Unlike standardisation, one extreme value cannot squash all the other values together.',
      ],
      visual: 'Toggle Standard vs Robust scaling: with standard scaling the outlier inflates σ and the normal values collapse together; with robust scaling they keep their spread.',
      misconception: 'That data cleaning means deleting every flagged point. Flagged points must be investigated.',
      question: 'You see a flagged value of 250 cm in a human-height column. What do you do?',
      minutes: 1,
    },
  },
  {
    n: 39,
    sourceTitle: 'Outlier Detection Rule',
    section: 'D',
    kind: 'concept',
    steps: 0,
    visual: 'Interactive boxplot over sorted points: quartiles, shaded IQR, fences at Q1 − 1.5·IQR and Q3 + 1.5·IQR. Drag the extreme value and watch the fences, whiskers and outlier flags update. Choose either lecture dataset.',
    supplemental: ['Distinction between a statistical outlier flag and a confirmed data error.'],
    notes: {
      objective: 'Apply the 1.5 × IQR fences.',
      say: [
        'Lower bound: Q1 − 1.5 × IQR. Upper bound: Q3 + 1.5 × IQR.',
        'Any value outside this range is flagged as an outlier.',
        'A flag is a statistical signal, not a verdict. It may be a typo, a sensor fault, or a genuine rare case — only domain knowledge decides.',
      ],
      visual: 'Drag the extreme value inward. The point turns from orange (flagged) to blue at the exact moment it crosses the upper fence.',
      misconception: 'That 1.5 is a law of nature. It is Tukey\'s convention; 3 × IQR is sometimes used for "far out" values.',
      question: 'For 5, 10, 15, 20, 25, 30, 100, what are the fences, and is 100 flagged?',
      minutes: 2,
    },
  },
  {
    n: 40,
    sourceTitle: 'IQR Activity',
    section: 'D',
    kind: 'question',
    steps: 0,
    visual: 'The activity dataset sorted on a number line. No quartiles are shown until the solution slides.',
    exercise: 'Dataset 2, 4, 6, 8, 10, 12, 50: Q2, Q1, Q3, IQR, lower and upper bounds; is 50 an outlier?',
    notes: {
      objective: 'Students run the complete IQR procedure independently.',
      say: ['Work through all six tasks. Use the same method as the example: median of each half, excluding the median.'],
      visual: 'Leave the bare number line up for about two minutes.',
      misconception: 'Forgetting the factor 1.5 or applying it to Q1 instead of to the IQR.',
      question: 'Before computing: does 50 look like an outlier to you?',
      minutes: 1.5,
    },
  },
  {
    n: 41,
    sourceTitle: 'Solution',
    section: 'D',
    kind: 'solution',
    steps: 2,
    visual: 'Steps 1–2 on the boxplot builder: order and median.',
    exercise: 'Solution steps 1–2: data already ordered; median Q2 = 8.',
    notes: {
      objective: 'Find the median of the activity data: Q2 = 8.',
      say: ['Step 1: already ordered. Step 2: the median is the 4th of 7 values: 8.'],
      visual: 'Press → twice.',
      misconception: 'None specific — move quickly.',
      question: 'Which position is the median for n = 7? For n = 8?',
      minutes: 0.5,
    },
  },
  {
    n: 42,
    sourceTitle: 'Solution',
    section: 'D',
    kind: 'solution',
    steps: 2,
    visual: 'Steps 3–4: the lower half and Q1, the upper half and Q3.',
    exercise: 'Solution steps 3–4: Q1 = 4, Q3 = 12.',
    notes: {
      objective: 'Find both quartiles of the activity data: Q1 = 4 and Q3 = 12.',
      say: [
        'Step 3: lower half 2, 4, 6 → Q1 = 4.',
        'Step 4: upper half 10, 12, 50 → Q3 = 12.',
      ],
      visual: 'Each half lights up, then its middle.',
      misconception: 'That 50 pulls Q3 upwards. Q3 = 12 regardless of how large the last value is.',
      question: 'What would NumPy\'s default give for Q1 and Q3 here? (5 and 11 — a different convention.)',
      minutes: 1,
    },
  },
  {
    n: 43,
    sourceTitle: 'Solution',
    section: 'D',
    kind: 'solution',
    steps: 1,
    visual: 'Step 5: the box between Q1 and Q3 with IQR = 8.',
    exercise: 'Solution step 5: IQR = 12 − 4 = 8.',
    notes: {
      objective: 'Compute the interquartile range of the activity data: IQR = 8.',
      say: ['Step 5: IQR = Q3 − Q1 = 12 − 4 = 8.'],
      visual: 'Press → to draw the box.',
      misconception: 'None specific.',
      question: 'What fraction of the data lies inside the box?',
      minutes: 0.5,
    },
  },
  {
    n: 44,
    sourceTitle: 'Solution',
    section: 'D',
    kind: 'solution',
    steps: 3,
    visual: 'Steps 6–7: the fences at −8 and 24 appear; 50 lies beyond the upper fence and is flagged. Afterwards the extreme value can be dragged to test the rule.',
    exercise: 'Solution steps 6–7: lower bound −8, upper bound 24; 50 > 24 so 50 is an outlier.',
    notes: {
      objective: 'Fences −8 and 24; 50 is flagged.',
      say: [
        'Lower bound: Q1 − 1.5 × IQR = 4 − 1.5 × 8 = 4 − 12 = −8.',
        'Upper bound: Q3 + 1.5 × IQR = 12 + 12 = 24.',
        'Step 7: 50 > 24, so 50 is an outlier by this rule.',
      ],
      visual: 'After the three steps, drag 50 down: it stops being flagged below 24.',
      misconception: 'That a negative lower fence is an error. It just means no low value can be flagged here.',
      question: 'What is the largest value the last observation could take without being flagged?',
      minutes: 1.5,
    },
  },

  // ─────────────────────────────── E · Z-score ───────────────────────────────
  {
    n: 45,
    sourceTitle: 'Z-score',
    section: 'E',
    kind: 'concept',
    steps: 0,
    visual: 'A real Iris feature on a number line with a σ ruler. Drag one observation; its distance from μ is measured in σ steps and z updates live. The 68–95–99.7 figure from the lecture can be overlaid, next to the fraction of the actual data within ±1σ, ±2σ, ±3σ.',
    notebook: ['cell-10'],
    supplemental: ['Empirical vs normal coverage, showing the 68–95–99.7 rule fails for bimodal petal length.'],
    notes: {
      objective: 'z = (x − μ)/σ measures distance from the mean in standard-deviation units.',
      say: [
        'The z-score answers: how many standard deviations is this value from the mean? z = (X − μ) / σ.',
        'Positive z: above the mean. Negative z: below. |z| near 0: typical.',
        'We use it to detect unusual observations — a common rule flags |z| > 3 — and to standardise features.',
        'The 68–95–99.7 picture on the slide is true only for normal data. Check the actual percentages for petal length: they are not 68 and 95.',
      ],
      visual: 'Drag the yellow observation. Then switch to petal length and turn on the normal overlay: the data are bimodal, so the normal coverage is wrong. Finish at the bottom: show the notebook cell, then press Run on the self-contained cell — real pandas in the browser computes the same z-scores.',
      misconception: 'That z-scores make data normal, or that |z| > 3 is automatically an error. The scale changes, the shape does not.',
      question: 'A z-score of −2 on sepal width means what, in centimetres?',
      minutes: 4,
    },
  },

  // ──────────────────── F · Covariance, Correlation and PCA ────────────────────
  {
    n: 46,
    sourceTitle: 'Covariance',
    section: 'F',
    kind: 'concept',
    steps: 0,
    visual: 'The geometry of covariance: each point and the mean (μx, μy) span a rectangle whose signed area is (x − μx)(y − μy). Green rectangles (quadrants I and III) add, orange ones (II and IV) subtract; covariance is the average signed area. Drag ρ in the sentence to change the relationship.',
    notebook: ['cell-12'],
    supplemental: ['Covariance formula, population and sample forms.', 'Signed-rectangle construction.'],
    notes: {
      objective: 'Covariance measures how two variables vary together, through the sign of co-deviations.',
      say: [
        'Covariance measures how two variables vary together: Cov(X, Y) = (1/N) Σ (x − μx)(y − μy).',
        'Draw the cross at the means. A point up-and-right or down-and-left gives a positive product — a green rectangle. Up-left or down-right gives a negative one — red.',
        'Covariance is the average signed area. Positive: they move together. Negative: they move opposite. Near zero: no linear relationship.',
      ],
      visual: 'Use the presets: strong negative, near zero, strong positive — matching the three panels in the PDF. Then drag ρ in the sentence through zero and watch green and orange areas trade places.',
      misconception: 'Zero covariance does not mean independence. A perfect parabola can have zero covariance.',
      question: 'If we measure X in millimetres instead of centimetres, what happens to the covariance?',
      minutes: 2.5,
    },
  },
  {
    n: 47,
    sourceTitle: 'Covariance Matrix',
    section: 'F',
    kind: 'concept',
    steps: 0,
    visual: 'The 4 × 4 covariance matrix of the four Iris measurements as a colour-coded grid. Selecting a cell highlights its mirror cell and draws that feature pair\'s scatterplot; a diagonal cell shows that feature\'s spread (its variance).',
    notebook: ['cell-12'],
    corrections: ['The original notebook includes the categorical species code as a fifth column. This slide uses only the four continuous measurements.'],
    notes: {
      objective: 'The covariance matrix collects every pairwise covariance; it is symmetric with variances on the diagonal.',
      say: [
        'For two variables, Σ = [[Var(X), Cov(X, Y)], [Cov(Y, X), Var(Y)]].',
        'It is symmetric because Cov(X, Y) = Cov(Y, X) — the product (x − μx)(y − μy) does not care about order.',
        'The diagonal holds the variances, because Cov(X, X) = Var(X).',
        'For Iris we have four measurements, so a 4 × 4 matrix.',
      ],
      visual: 'Click an off-diagonal cell: both mirror cells light up and the scatterplot appears. Click a diagonal cell: the histogram of that feature appears — its variance is the number in the cell.',
      misconception: 'That large covariance means strong relationship. Petal length has large variance, so its covariances are large too. Correlation removes this scale effect.',
      question: 'Which pair has the largest covariance? Is it also the strongest relationship?',
      minutes: 2.5,
    },
  },
  {
    n: 48,
    sourceTitle: 'Correlation',
    section: 'F',
    kind: 'concept',
    steps: 0,
    visual: 'Interactive scatterplot with presets for strong positive, strong negative, weak and approximately zero linear correlation, plus a curved relationship. Pearson\'s r updates live. A unit switch (cm ↔ mm) shows covariance changing while r does not.',
    supplemental: ['Non-linear and outlier cases.', 'Correlation is not causation.'],
    notes: {
      objective: 'Correlation is covariance normalised by both standard deviations: unitless, between −1 and 1.',
      say: [
        'ρ = Cov(X, Y) / (σX σY). Dividing by both standard deviations removes the units.',
        'It always lies between −1 and 1. ±1 means the points lie exactly on a line.',
        'It is scale independent: change centimetres to millimetres and r does not move.',
        'It measures linear association only, and never by itself proves causation.',
      ],
      visual: 'Step through the presets. Then choose "Curved": a strong relationship with r ≈ 0. Finally toggle the unit switch and compare Cov and r.',
      misconception: 'That r = 0 means "no relationship" and that high r means "X causes Y".',
      question: 'Ice cream sales and drowning incidents are positively correlated. Why?',
      minutes: 3,
    },
  },
  {
    n: 49,
    sourceTitle: 'Why Covariance Matrix Matters',
    section: 'F',
    kind: 'concept',
    steps: 0,
    visual: 'Four uses, each computed from Iris petal measurements: PCA directions, the multivariate Gaussian ellipse drawn from Σ, feature redundancy (r ≈ 0.96), and the regression slope Cov(X, Y)/Var(X).',
    supplemental: ['Each use computed live from the real data.'],
    notes: {
      objective: 'The covariance matrix appears in PCA, multivariate Gaussians, redundancy detection and linear regression.',
      say: [
        'PCA: the eigenvectors of Σ are the principal directions.',
        'Multivariate Gaussian: Σ sets the shape and orientation of the probability ellipse.',
        'Feature redundancy: petal length and petal width have correlation 0.96 — they carry almost the same information.',
        'Linear regression: the least-squares slope is Cov(X, Y) / Var(X).',
      ],
      visual: 'Tap each of the four tiles. The ellipse and the regression line are both drawn from the same matrix entries.',
      misconception: 'That redundant features are harmless. They can make linear-model coefficients unstable.',
      question: 'If two features are perfectly correlated, what is the determinant of their 2 × 2 covariance matrix?',
      minutes: 1.5,
    },
  },
  {
    n: 50,
    sourceTitle: 'Real Dataset Workflow',
    section: 'F',
    kind: 'concept',
    steps: 0,
    visual: 'The six-step workflow, each step showing its real Iris result (shape, summary, IQR outliers, covariance) and linking to the matching notebook cell in the Python Lab.',
    notebook: ['cell-1', 'cell-2', 'cell-4', 'cell-8', 'cell-12'],
    notes: {
      objective: 'A repeatable order for analysing any new dataset.',
      say: [
        'Load the dataset. Inspect the variables and their types. Compute summary statistics.',
        'Detect outliers. Compute the covariance matrix. Interpret the results.',
        'Each step here shows the real result for Iris, and links to the notebook code.',
      ],
      visual: 'Tap a step to see its output. "Open in Python Lab" jumps to that cell.',
      misconception: 'Skipping "inspect variables": that is exactly where the species code should have been identified as categorical.',
      question: 'At which step should we have noticed that species is not a measurement?',
      minutes: 1,
    },
  },
  {
    n: 51,
    sourceTitle: 'Statistics + Linear Algebra Connection',
    section: 'F',
    kind: 'concept',
    steps: 7,
    visual: 'PCA built in seven steps on a real 2D cloud: centre it; sweep a direction and plot the projected variance; show Σ; draw its eigenvectors; label eigenvalues as the variances along them; project onto PC1; report variance retained and lost. All numbers come from an actual eigen decomposition.',
    notebook: ['cell-16'],
    corrections: ['The notebook uses np.linalg.eig, which returns eigenvalues unsorted; np.linalg.eigh is the correct routine for symmetric matrices and returns them sorted.'],
    notes: {
      objective: 'Principal components are the eigenvectors of the covariance matrix; eigenvalues are the variances along them.',
      say: [
        'Step 1: centre the data, so the cloud sits at the origin.',
        'Step 2: pick any direction and project the points onto it. The variance of the projections depends on the direction. PCA asks: which direction gives the most?',
        'Step 3: the covariance matrix Σ. Step 4: its eigenvectors are exactly the directions of maximum and minimum variance.',
        'Step 5: each eigenvalue is the variance along its eigenvector. Step 6: project onto PC1 — two numbers become one.',
        'Step 7: the fraction λ₁ / (λ₁ + λ₂) of the variance is kept; λ₂ is what we lose. Statistics plus linear algebra equals PCA.',
      ],
      visual: 'At step 2 drag the direction dial: the variance curve peaks at the eigenvector. At step 6 the points slide onto the line. Change the dataset to compare a strongly correlated pair (petals) with a weak one (sepals).',
      misconception: 'That PCA picks features. It builds new axes — combinations of all features — and it is sensitive to scale, so features in different units are usually standardised first.',
      question: 'If two features were uncorrelated with equal variance, which direction would PCA choose?',
      minutes: 3.5,
    },
  },

  // ─────────────────────────── G · Practical Python ───────────────────────────
  {
    n: 52,
    sourceTitle: 'Practical section',
    section: 'G',
    kind: 'activity',
    steps: 0,
    visual: 'Gateway to the Python Lab: the notebook\'s cells mapped to the concepts of the lecture, the corrections applied, and the live PCA result on the four Iris measurements.',
    notebook: ['cell-0', 'cell-1', 'cell-2', 'cell-4', 'cell-6', 'cell-8', 'cell-10', 'cell-12', 'cell-14', 'cell-16'],
    notes: {
      objective: 'Connect every formula from the lecture to one line of pandas or NumPy code.',
      say: [
        'Now the code. Every statistic we computed by hand is one pandas call.',
        'Open the Python Lab: for each cell you see the original code, its original output, what it means, and which slide it implements.',
        'Two corrections: species is a label and must be excluded from numeric analysis, and pandas uses n − 1, not N.',
      ],
      visual: 'Click "Open Python Lab". If time is short, show the PCA cell and the species correction, and assign the rest.',
      misconception: 'That the notebook\'s 5 × 5 covariance matrix is correct because it ran without errors.',
      question: 'Which pandas methods divide by n − 1 by default?',
      minutes: 4,
    },
  },
  {
    n: 53,
    sourceTitle: 'شكرًا لكم THANK YOU',
    section: 'G',
    kind: 'closing',
    steps: 0,
    visual: 'Closing slide in Arabic and English, with a one-screen formula summary of the session.',
    supplemental: ['Formula summary for revision.'],
    notes: {
      objective: 'Close the session and point to revision material.',
      say: [
        'Thank you — شكرًا لكم.',
        'The summary lists every formula from today. The Python Lab and the Iris Explorer stay available for revision.',
      ],
      visual: 'Leave the summary visible while taking questions.',
      misconception: 'None.',
      question: 'Which concept from today would you most like to see again?',
      minutes: 1,
    },
  },
];

export const TOTAL_SLIDES = SLIDES.length;
export const PLANNED_MINUTES = SLIDES.reduce((s, x) => s + x.notes.minutes, 0);

export function sectionOf(n: number): Section {
  return SECTIONS.find((s) => n >= s.from && n <= s.to) ?? SECTIONS[0];
}

/** Minutes planned before slide n starts (used for the pace indicator). */
export function plannedStartMinute(n: number): number {
  return SLIDES.slice(0, n - 1).reduce((s, x) => s + x.notes.minutes, 0);
}
