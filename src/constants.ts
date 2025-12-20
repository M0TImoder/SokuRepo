import type { PaletteItem } from './types';

export const GRID_SIZE = 20;
export const MAJOR_GRID_SIZE = 100;

export const INITIAL_PALETTE_ITEMS: PaletteItem[] = [
  {
    id: 'quadratic',
    label: '解の公式',
    latex: 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}',
    description: '二次方程式の解'
  },
  {
    id: 'pythagorean',
    label: 'ピタゴラスの定理',
    latex: 'a^2 + b^2 = c^2',
    description: '直角三角形の辺の関係'
  },
  {
    id: 'integral',
    label: '定積分',
    latex: '\\int_{a}^{b} f(x) dx',
    description: '曲線の下の面積'
  },
  {
    id: 'matrix',
    label: '2x2 行列',
    latex: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}',
    description: '線形代数の基本'
  },
  {
    id: 'summation',
    label: '総和 (シグマ)',
    latex: '\\sum_{i=0}^{n} i^2 = \\frac{(n^2+n)(2n+1)}{6}',
    description: '数列の和'
  },
  {
    id: 'limit',
    label: '極限',
    latex: '\\lim_{x \\to \\infty} \\frac{1}{x} = 0',
    description: '関数の極限'
  },
  {
    id: 'maxwell',
    label: 'マクスウェル方程式',
    latex: '\\nabla \\cdot E = \\frac{\\rho}{\\epsilon_0}',
    description: 'ガウスの法則'
  }
];

export const ADVANCED_PALETTE_ITEMS: PaletteItem[] = [
  {
    id: 'adv-basic',
    type: 'input',
    label: '数値ボックス (空)',
    latex: '',
    description: 'クリックして入力'
  },
  {
    id: 'adv-frac',
    type: 'input',
    label: '数値ボックス (分数)',
    latex: '\\frac{a}{b}',
    description: '分数'
  },
  {
    id: 'adv-power',
    type: 'input',
    label: '数値ボックス (べき乗)',
    latex: 'x^{n}',
    description: '上付き文字'
  },
  {
    id: 'adv-sub',
    type: 'input',
    label: '数値ボックス (添字)',
    latex: 'x_{i}',
    description: '下付き文字'
  },
  {
    id: 'adv-sqrt',
    type: 'input',
    label: '数値ボックス (ルート)',
    latex: '\\sqrt{x}',
    description: '平方根'
  },
  {
    id: 'adv-sum',
    type: 'input',
    label: '数値ボックス (総和)',
    latex: '\\sum_{i=0}^{n}',
    description: 'シグマ'
  },
  {
    id: 'adv-int',
    type: 'input',
    label: '数値ボックス (積分)',
    latex: '\\int_{a}^{b}',
    description: 'インテグラル'
  },
  {
    id: 'adv-lim',
    type: 'input',
    label: '数値ボックス (極限)',
    latex: '\\lim_{x \\to \\infty}',
    description: 'リミット'
  },
  {
    id: 'adv-log',
    type: 'input',
    label: '数値ボックス (対数)',
    latex: '\\log_{a}{b}',
    description: 'ログ'
  },
  {
    id: 'adv-sin',
    type: 'input',
    label: '数値ボックス (三角関数)',
    latex: '\\sin \\theta',
    description: 'サイン'
  },
  {
    id: 'adv-vec',
    type: 'input',
    label: '数値ボックス (ベクトル)',
    latex: '\\vec{v}',
    description: 'ベクトル表記'
  },
  {
    id: 'adv-matrix',
    type: 'input',
    label: '数値ボックス (行列)',
    latex: '\\begin{pmatrix} 1 & 0 \\\\ 0 & 1 \\end{pmatrix}',
    description: '2x2行列'
  }
];
