/**
 * Section themes: one bold colour field per section (cobalt, paper, ink blue,
 * lilac, charcoal, lime, deep teal; accents lime and sky blue), ink borders
 * and key-cap shadows.
 *
 * Two kinds of colour live in each theme:
 *  - UI colours (bg, fg, card, border, shadow, `ac` = the section's hero
 *    accent for buttons, numerals and highlights);
 *  - MATHEMATICAL colours, whose meaning never changes between sections:
 *      data   → observations / data points
 *      focus  → the statistic in focus: the mean μ, the answer
 *      median → the median, the sample, the second variable
 *      mode   → the mode, the second principal component
 *      pos    → positive relationships / products
 *      neg    → negative relationships / outliers / flagged values
 *    Only their shade adapts so they stay legible on light or dark fields.
 *
 * The same values drive Tailwind utilities (through CSS variables set on the
 * themed container) and SVG charts (through the mutable `C` palette).
 */
import type { SectionId } from '../data/lecture-content';

export type ThemeId = 'title' | SectionId | 'base';

export interface Theme {
  name: string;
  dark: boolean;
  bg: string;
  fg: string;
  mut: string;
  dim: string;
  card: string;
  card2: string;
  line: string;
  lineSoft: string;
  bd: string;
  sh: string;
  ac: string;
  onac: string;
  data: string;
  focus: string;
  median: string;
  mode: string;
  pos: string;
  neg: string;
  species: [string, string, string];
}

const LIGHT_MATH = {
  data: '#2A57A0',
  focus: '#9A5A00',
  median: '#7A2FB0',
  mode: '#0F7A72',
  pos: '#21804A',
  neg: '#C42B2B',
  species: ['#2A57A0', '#C2701A', '#0F7A72'] as [string, string, string],
};

const DARK_MATH = {
  data: '#9CC4F5',
  focus: '#FFD23F',
  median: '#E0B8FF',
  mode: '#7FE8D6',
  pos: '#8DE8A8',
  neg: '#FF9C80',
  species: ['#9CC4F5', '#FFB86B', '#7FE8D6'] as [string, string, string],
};

/** Cool "graph paper" base. */
const paper = {
  dark: false,
  bg: '#ECEFF3',
  fg: '#121826',
  mut: '#5B6375',
  dim: '#8D95A6',
  card: '#FFFFFF',
  card2: '#DFE4EB',
  line: 'rgba(18,24,38,0.15)',
  lineSoft: 'rgba(18,24,38,0.06)',
  bd: '#121826',
  sh: '#121826',
  onac: '#FFFFFF',
  ...LIGHT_MATH,
};

export const THEMES: Record<ThemeId, Theme> = {
  title: {
    name: 'cobalt',
    dark: true,
    bg: '#2B3FD6',
    fg: '#F4F6FF',
    mut: '#C6CDFF',
    dim: '#9EA9F2',
    card: '#3A4EE2',
    card2: '#4759E8',
    line: 'rgba(244,246,255,0.32)',
    lineSoft: 'rgba(244,246,255,0.14)',
    bd: '#F4F6FF',
    sh: '#141F8C',
    ac: '#D4F23A',
    onac: '#141A33',
    data: '#F4F6FF',
    focus: '#D4F23A',
    median: '#D9CCFF',
    mode: '#9FF2DF',
    pos: '#9FF2DF',
    neg: '#FFB39C',
    species: ['#F4F6FF', '#7DD3FC', '#D4F23A'],
  },
  base: { name: 'paper', ...paper, ac: '#2B3FD6' },
  A: { name: 'paper', ...paper, ac: '#2B3FD6' },
  B: {
    name: 'ink blue',
    dark: true,
    bg: '#1A2780',
    fg: '#F2F4FF',
    mut: '#AEB7EA',
    dim: '#8590CF',
    card: '#24339A',
    card2: '#2C3CA8',
    line: 'rgba(242,244,255,0.22)',
    lineSoft: 'rgba(242,244,255,0.09)',
    bd: 'rgba(242,244,255,0.75)',
    sh: '#0C1356',
    ac: '#D4F23A',
    onac: '#141A33',
    ...DARK_MATH,
    data: '#C4D4FF',
  },
  C: {
    name: 'lilac',
    dark: false,
    bg: '#E8E2F6',
    fg: '#1D1430',
    mut: '#625679',
    dim: '#948AA8',
    card: '#FFFFFF',
    card2: '#DAD1EF',
    line: 'rgba(29,20,48,0.16)',
    lineSoft: 'rgba(29,20,48,0.06)',
    bd: '#1D1430',
    sh: '#1D1430',
    ac: '#0284C7',
    onac: '#FFFFFF',
    ...LIGHT_MATH,
  },
  D: {
    name: 'charcoal',
    dark: true,
    bg: '#15171C',
    fg: '#EDEFF2',
    mut: '#9AA0AB',
    dim: '#6E7480',
    card: '#1F2229',
    card2: '#282C35',
    line: 'rgba(237,239,242,0.18)',
    lineSoft: 'rgba(237,239,242,0.07)',
    bd: 'rgba(237,239,242,0.72)',
    sh: '#000000',
    ac: '#3FE0C5',
    onac: '#0B1F1B',
    ...DARK_MATH,
  },
  E: {
    name: 'lime',
    dark: false,
    bg: '#DCEF6A',
    fg: '#171C0B',
    mut: '#4E5627',
    dim: '#757E44',
    card: '#F8FCE6',
    card2: '#CBE055',
    line: 'rgba(23,28,11,0.18)',
    lineSoft: 'rgba(23,28,11,0.07)',
    bd: '#171C0B',
    sh: '#171C0B',
    ac: '#2B3FD6',
    onac: '#FFFFFF',
    ...LIGHT_MATH,
    focus: '#7A4600',
    data: '#22508C',
  },
  F: {
    name: 'deep teal',
    dark: true,
    bg: '#0E3B42',
    fg: '#EAF6F4',
    mut: '#9CC4BF',
    dim: '#6F9893',
    card: '#154952',
    card2: '#1B555E',
    line: 'rgba(234,246,244,0.2)',
    lineSoft: 'rgba(234,246,244,0.08)',
    bd: 'rgba(234,246,244,0.72)',
    sh: '#051E22',
    ac: '#7DD3FC',
    onac: '#06232E',
    ...DARK_MATH,
    mode: '#C7F26B',
  },
  G: { name: 'paper', ...paper, ac: '#0E7C6B' },
};

/** Code blocks always use a dark "terminal" palette, whatever the section. */
export const CODE_THEME: Theme = { ...THEMES.D, bg: '#0F131B', card: '#171C26', card2: '#1F2531', name: 'code' };

export function themeVars(t: Theme): Record<string, string> {
  return {
    '--color-canvas': t.bg,
    '--color-panel': t.card,
    '--color-panel-2': t.card2,
    '--color-line': t.line,
    '--color-line-soft': t.lineSoft,
    '--color-ink': t.fg,
    '--color-muted': t.mut,
    '--color-dim': t.dim,
    '--color-blue': t.data,
    '--color-cyan': t.median,
    '--color-yellow': t.focus,
    '--color-pos': t.pos,
    '--color-neg': t.neg,
    '--color-mode': t.mode,
    '--color-ac': t.ac,
    '--color-onac': t.onac,
    '--color-bd': t.bd,
    '--color-sh': t.sh,
    '--color-setosa': t.species[0],
    '--color-versicolor': t.species[1],
    '--color-virginica': t.species[2],
  };
}
