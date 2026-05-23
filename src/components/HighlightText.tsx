import React from 'react';

interface HighlightTextProps {
  text: string;
  query: string;
  className?: string;
}

/**
 * Renderiza `text` com os trechos que coincidem com `query` destacados
 * em laranja (ctrl-orange), sem alterar a estrutura de layout.
 */
const HighlightText: React.FC<HighlightTextProps> = ({ text, query, className }) => {
  const q = query.trim();

  if (!q) return <span className={className}>{text}</span>;

  // Escapa caracteres especiais de regex
  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escaped})`, 'gi'));

  return (
    <span className={className}>
      {parts.map((part, i) =>
        part.toLowerCase() === q.toLowerCase() ? (
          <mark
            key={i}
            className="bg-ctrl-orange/20 text-ctrl-orange rounded px-0.5 not-italic"
            style={{ fontWeight: 'inherit' }}
          >
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
};

export default HighlightText;
