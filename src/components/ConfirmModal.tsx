import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Delete Post',
  cancelText = 'Cancel'
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white border-3 border-black rounded-3xl max-w-md w-full p-6 relative shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 hover:bg-gray-100 rounded-full border-2 border-transparent hover:border-black transition-all"
        >
          <X className="w-5 h-5 text-black" />
        </button>

        <div className="flex items-center gap-3 text-rose-500 mb-4">
          <AlertTriangle className="w-8 h-8 stroke-[2.5]" />
          <h3 className="text-xl font-serif font-black text-black">{title}</h3>
        </div>

        <p className="text-sm text-gray-600 mb-6 font-normal leading-relaxed text-left">
          {message}
        </p>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 border-2 border-black rounded-full text-xs font-black uppercase tracking-wider text-black transition-all"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-5 py-2.5 bg-rose-500 hover:bg-rose-600 active:bg-rose-700 border-2 border-black text-white rounded-full text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          >
            <Trash2 className="w-4 h-4" />
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
