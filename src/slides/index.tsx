/**
 * Slide registry: maps each slide number (1–53, the PDF order) to its
 * component. Titles and notes live in src/data/lecture-content.ts.
 */
import type { ComponentType, ReactNode } from 'react';
import * as A from './foundations';
import * as Bt from './central-tendency';
import * as Cv from './variation';
import * as D from './iqr';
import * as E from './zscore';
import * as F from './covariance';
import * as P from './pca';
import * as G from './practical';

export interface SlideEntry {
  Component: ComponentType;
  subtitle?: ReactNode;
  /** Title slides render their own full layout. */
  bare?: boolean;
}

export const SLIDE_REGISTRY: Record<number, SlideEntry> = {
  1: { Component: A.S01, bare: true },
  2: { Component: A.S02, bare: true },
  3: { Component: A.S03 },
  4: { Component: A.S04 },
  5: { Component: A.S05 },
  6: { Component: A.S06 },
  7: { Component: A.S07, subtitle: 'Quick Challenge — variable types' },
  8: { Component: A.S08 },
  9: { Component: A.S09 },
  10: { Component: A.S10, subtitle: 'Pass / fail prediction' },
  11: { Component: A.S11 },
  12: { Component: A.S12 },
  13: { Component: A.S13, subtitle: '10,000 users vs 2 million users' },
  14: { Component: A.S14 },
  15: { Component: Bt.S15 },
  16: { Component: Bt.S16 },
  17: { Component: Bt.S17 },
  18: { Component: Bt.S18, subtitle: 'Question 1 – Balanced Data' },
  19: { Component: Bt.S19 },
  20: { Component: Bt.S20, subtitle: 'Question 2 – Data with Outlier' },
  21: { Component: Bt.S21 },
  22: { Component: Bt.S22, subtitle: 'Question 3 – Categorical Data' },
  23: { Component: Bt.S23 },
  24: { Component: Cv.S24 },
  25: { Component: Cv.S25 },
  26: { Component: Cv.S26, subtitle: 'Activity — Dataset A' },
  27: { Component: Cv.S27, subtitle: 'Activity — Dataset B' },
  28: { Component: Cv.S28 },
  29: { Component: Cv.S29 },
  30: { Component: Cv.S30 },
  31: { Component: Cv.S31, subtitle: 'Example — Dataset A' },
  32: { Component: Cv.S32, subtitle: 'Example — Dataset B' },
  33: { Component: Cv.S33 },
  34: { Component: D.S34 },
  35: { Component: D.S35, subtitle: 'Steps 1–3' },
  36: { Component: D.S36, subtitle: 'Steps 4–5' },
  37: { Component: D.S37 },
  38: { Component: D.S38 },
  39: { Component: D.S39 },
  40: { Component: D.S40 },
  41: { Component: D.S41, subtitle: 'IQR Activity — steps 1–2' },
  42: { Component: D.S42, subtitle: 'IQR Activity — steps 3–4' },
  43: { Component: D.S43, subtitle: 'IQR Activity — step 5' },
  44: { Component: D.S44, subtitle: 'IQR Activity — steps 6–7' },
  45: { Component: E.S45 },
  46: { Component: F.S46 },
  47: { Component: F.S47 },
  48: { Component: F.S48 },
  49: { Component: F.S49 },
  50: { Component: F.S50 },
  51: { Component: P.S51 },
  52: { Component: G.S52 },
  53: { Component: G.S53, bare: true },
};
