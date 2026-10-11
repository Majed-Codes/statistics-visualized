/**
 * Typed access to the bundled Iris dataset (150 rows, from scikit-learn's
 * load_iris — the same data the notebook loads).
 *
 * The four measurements are continuous. `species` is a nominal label stored
 * as 0/1/2; it is kept separate and is never used as a numeric feature.
 */
import raw from './iris.json';

export const FEATURES = ['sepal_length', 'sepal_width', 'petal_length', 'petal_width'] as const;
export type Feature = (typeof FEATURES)[number];

export const FEATURE_LABEL: Record<Feature, string> = {
  sepal_length: 'Sepal length',
  sepal_width: 'Sepal width',
  petal_length: 'Petal length',
  petal_width: 'Petal width',
};

/** Column names exactly as pandas prints them in the notebook. */
export const PANDAS_NAME: Record<Feature, string> = {
  sepal_length: 'sepal length (cm)',
  sepal_width: 'sepal width (cm)',
  petal_length: 'petal length (cm)',
  petal_width: 'petal width (cm)',
};

export const SPECIES = raw.targetNames as readonly string[];

export interface IrisRow {
  index: number;
  sepal_length: number;
  sepal_width: number;
  petal_length: number;
  petal_width: number;
  species: number;
}

export const IRIS: IrisRow[] = raw.rows.map((r, index) => ({
  index,
  sepal_length: r[0],
  sepal_width: r[1],
  petal_length: r[2],
  petal_width: r[3],
  species: r[4],
}));

export const COLUMNS: Record<Feature, number[]> = {
  sepal_length: IRIS.map((r) => r.sepal_length),
  sepal_width: IRIS.map((r) => r.sepal_width),
  petal_length: IRIS.map((r) => r.petal_length),
  petal_width: IRIS.map((r) => r.petal_width),
};

export const SPECIES_CODES = IRIS.map((r) => r.species);

export function column(f: Feature): number[] {
  return COLUMNS[f];
}
