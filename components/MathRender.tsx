import React, { useMemo } from 'react';
import katex from 'katex';

interface MathRenderProps {
  latex: string;
  className?: string;
}

export const MathRender: React.FC<MathRenderProps> = ({ latex, className }) => {
  // Use renderToString instead of render to avoid "KaTeX doesn't work in quirks mode" error.
  // renderToString generates the HTML string without checking document.compatMode.
  const html = useMemo(() => {
    try {
      return katex.renderToString(latex, {
        throwOnError: false,
        displayMode: true, // Center and make it big
      });
    } catch (error) {
      console.error('KaTeX rendering error:', error);
      return '<span style="color: #ef4444; font-size: 0.875rem;">Invalid LaTeX</span>';
    }
  }, [latex]);

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};