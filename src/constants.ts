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
    label: '数値ボックス',
    latex: '<<0>>',
    description: 'クリックして入力',
    defaultValues: ['']
  },
  {
    id: 'adv-frac',
    type: 'input',
    label: '数値ボックス (分数)',
    latex: '\\frac{<<0>>}{<<1>>}',
    description: '分数',
    defaultValues: ['', '']
  },
  {
    id: 'adv-power',
    type: 'input',
    label: '数値ボックス (べき乗)',
    latex: '<<0>>^{<<1>>}',
    description: '上付き文字',
    defaultValues: ['', '']
  },
  {
    id: 'adv-sub',
    type: 'input',
    label: '数値ボックス (添字)',
    latex: '<<0>>_{<<1>>}',
    description: '下付き文字',
    defaultValues: ['', '']
  },
  {
    id: 'adv-sqrt',
    type: 'input',
    label: '数値ボックス (ルート)',
    latex: '\\sqrt{<<0>>}',
    description: '平方根',
    defaultValues: ['']
  },
  {
    id: 'adv-sum',
    type: 'input',
    label: '数値ボックス (総和)',
    latex: '\\sum_{i=<<0>>}^{<<1>>}',
    description: 'シグマ',
    defaultValues: ['', '']
  },
  {
    id: 'adv-int',
    type: 'input',
    label: '数値ボックス (積分)',
    latex: '\\int_{<<0>>}^{<<1>>}',
    description: 'インテグラル',
    defaultValues: ['', '']
  },
  {
    id: 'adv-lim',
    type: 'input',
    label: '数値ボックス (極限)',
    latex: '\\lim_{x \\to <<0>>}',
    description: 'リミット',
    defaultValues: ['']
  },
  {
    id: 'adv-log',
    type: 'input',
    label: '数値ボックス (対数)',
    latex: '\\log_{<<0>>}{<<1>>}',
    description: 'ログ',
    defaultValues: ['', '']
  },
  {
    id: 'adv-sin',
    type: 'input',
    label: '数値ボックス (三角関数)',
    latex: '\\sin <<0>>',
    description: 'サイン',
    defaultValues: ['']
  },
  {
    id: 'adv-vec',
    type: 'input',
    label: '数値ボックス (ベクトル)',
    latex: '\\vec{<<0>>}',
    description: 'ベクトル表記',
    defaultValues: ['']
  },
  {
    id: 'adv-matrix',
    type: 'input',
    label: '数値ボックス (行列)',
    latex: '\\begin{pmatrix} <<0>> & <<1>> \\\\ <<2>> & <<3>> \\end{pmatrix}',
    description: '2x2行列',
    defaultValues: ['', '', '', '']
  }
];
