import React, { useMemo } from 'react';
import katex from 'katex';

interface MathRenderProps {
  latex: string;
  className?: string;
}

export const MathRender: React.FC<MathRenderProps> = ({ latex, className }) => {
  const html = useMemo(() => {
    try {
      return katex.renderToString(latex, {
        throwOnError: false,
        displayMode: true,
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
