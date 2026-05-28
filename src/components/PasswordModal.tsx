import React, { useState, useEffect, useRef } from 'react';
import { Lock, X } from 'lucide-react';

// Senha de acesso à área do professor — altere aqui se necessário
const PROFESSOR_PASSWORD = 'ctrlplay';

interface PasswordModalProps {
  onSuccess: () => void;
  onClose: () => void;
}

const PasswordModal: React.FC<PasswordModalProps> = ({ onSuccess, onClose }) => {
  const [value, setValue] = useState('');
  const [error, setError] = useState(false);
  const onCloseRef = useRef(onClose);
  useEffect(() => { onCloseRef.current = onClose; });

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseRef.current();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const submit = () => {
    if (value.trim() === PROFESSOR_PASSWORD) {
      onSuccess();
    } else {
      setError(true);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      <div
        className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-sm p-6 border border-gray-100 dark:border-slate-700"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
          aria-label="Fechar"
        >
          <X className="w-4 h-4 text-gray-400" />
        </button>

        <div className="flex justify-center mb-5">
          <div className="w-16 h-16 flex items-center justify-center rounded-2xl bg-ctrl-orange/10 border-2 border-ctrl-orange/20">
            <Lock className="w-8 h-8 text-ctrl-orange" strokeWidth={1.5} />
          </div>
        </div>

        <h2 className="text-center text-xl font-black text-slate-700 dark:text-slate-100 mb-1">
          Área do Professor
        </h2>
        <p className="text-center text-sm text-slate-400 dark:text-slate-500 mb-6">
          Digite a senha para continuar
        </p>

        <input
          type="password"
          value={value}
          onChange={e => { setValue(e.target.value); setError(false); }}
          onKeyDown={e => e.key === 'Enter' && submit()}
          placeholder="Senha"
          autoFocus
          className={`w-full px-4 py-3 rounded-xl border-2 text-sm font-medium outline-none transition-colors
            ${error
              ? 'border-red-400 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 placeholder:text-red-300'
              : 'border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-slate-700 dark:text-slate-100 placeholder:text-gray-300 dark:placeholder:text-slate-500 focus:border-ctrl-blue dark:focus:border-blue-400'
            }`}
        />

        {error && (
          <p className="text-xs text-red-500 mt-2 text-center font-semibold">
            Senha incorreta. Tente novamente.
          </p>
        )}

        <button
          onClick={submit}
          className="w-full py-3 rounded-xl bg-ctrl-orange text-white font-black text-sm hover:bg-ctrl-orange/90 hover:-translate-y-0.5 active:translate-y-0 transition-all shadow-sm hover:shadow-md mt-4"
        >
          Entrar
        </button>
      </div>
    </div>
  );
};

export default PasswordModal;
