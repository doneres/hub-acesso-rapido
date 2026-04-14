import React, { useState, useEffect } from 'react';

const BackToTop: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <button
      onClick={scrollToTop}
      className={`
        fixed bottom-6 right-6 z-40
        w-12 h-12 flex items-center justify-center
        bg-ctrl-orange text-white rounded-full
        shadow-lg border-2 border-white/20
        hover:bg-orange-600 hover:scale-110
        transition-all duration-300
        ${visible ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-8 pointer-events-none'}
      `}
      aria-label="Voltar ao topo"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" />
      </svg>
    </button>
  );
};

export default BackToTop;
