import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { BookOpen, Loader2, Trash2 } from 'lucide-react';

type Props = {
  open: boolean;
  title: string;
  busy: boolean;
  error?: string | null;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function DeleteBiographyDialog({ open, title, busy, error, onCancel, onConfirm }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const headingId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!open) return;
    const element = dialog.current;
    const previousOverflow = document.body.style.overflow;
    element?.showModal();
    document.body.style.overflow = 'hidden';
    return () => {
      element?.close();
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <dialog
      ref={dialog}
      role="alertdialog"
      aria-labelledby={headingId}
      aria-describedby={descriptionId}
      aria-busy={busy}
      onCancel={(event) => { event.preventDefault(); if (!busy) onCancel(); }}
      className="fixed inset-0 m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-md overflow-y-auto rounded-2xl border border-[#E8DFC9] bg-[#FFFDFA] p-0 font-sans text-[#0A1128] shadow-[0_24px_80px_rgba(10,25,47,0.25)] backdrop:bg-[#0A192F]/60 backdrop:backdrop-blur-sm"
    >
      <div className="h-1 bg-[#FED362]" />
      <div className="p-6 sm:p-8">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#E8DFC9] bg-[#F5EBD5] text-[#9A741E]">
            <Trash2 size={25} aria-hidden="true" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9A741E]">My Biographies</span>
        </div>
        <h2 id={headingId} className="font-serif-display text-3xl font-semibold tracking-tight">Delete biography?</h2>
        <p id={descriptionId} className="mt-2 text-sm leading-6 text-slate-500">
          This biography will be permanently deleted. This action cannot be undone.
        </p>
        <div className="mt-5 flex items-center gap-3 rounded-xl border border-[#E8DFC9] bg-[#F8F3E8] p-4">
          <BookOpen size={20} className="shrink-0 text-[#B18625]" aria-hidden="true" />
          <p className="font-serif-display min-w-0 break-words text-lg font-semibold">{title}</p>
        </div>
        {error && <p role="alert" className="mt-4 rounded-xl border border-rose-100 bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
      </div>
      <div className="flex flex-col-reverse gap-3 border-t border-[#E8DFC9] bg-[#F8F3E8]/60 px-6 py-5 sm:flex-row sm:px-8">
        <button type="button" autoFocus disabled={busy} onClick={onCancel}
          className="min-h-11 flex-1 rounded-xl border border-[#DED5C3] bg-white px-4 py-3 text-sm font-semibold text-[#0A1128] transition hover:bg-[#F5EBD5] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B18625] disabled:opacity-50">
          Cancel
        </button>
        <button type="button" disabled={busy} onClick={onConfirm}
          className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#0A192F] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#172C48] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B18625] disabled:cursor-wait disabled:opacity-60">
          {busy ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <Trash2 size={16} aria-hidden="true" />}
          {busy ? 'Deleting…' : 'Delete biography'}
        </button>
      </div>
    </dialog>, document.body
  );
}
