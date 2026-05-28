import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-white dark:bg-slate-950 border-t border-gray-100 dark:border-slate-800 mt-auto py-8 transition-colors duration-300">
      <div className="max-w-[1440px] mx-auto px-4 text-center">
        <p className="text-gray-400 dark:text-slate-500 text-sm mb-3">
          © 2026{" "}
          <a
            href="https://doneres.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-ctrl-blue dark:hover:text-blue-400 transition-colors font-medium"
          >
            Douglas
          </a>
          . Feito com 💜 para os alunos.
        </p>
        <div className="flex justify-center gap-6">
          <a
            href="https://doneres.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 dark:text-slate-500 hover:text-ctrl-blue dark:hover:text-blue-400 text-sm font-medium transition-colors"
          >
            doneres.dev
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
