import React from 'react';
import { createPortal } from 'react-dom';

type Props = {
  value: string;
  editable?: boolean;
  onChange: (value: string) => void;
  onFocus?: () => void;
  className?: string;
  multiline?: boolean;
  label?: string;
};

export default function InlineEditableText({ value, editable = false, onChange, onFocus, className = '', multiline = false, label }: Props) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const [toolbar, setToolbar] = React.useState<{ top: number; left: number } | null>(null);

  const updateToolbar = React.useCallback(() => {
    if (!editable || !ref.current) return;
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || !ref.current.contains(selection.anchorNode)) return;
    const rect = selection.getRangeAt(0).getBoundingClientRect();
    if (rect.width > 0) setToolbar({ top: Math.max(8, rect.top - 48), left: Math.max(8, rect.left + rect.width / 2) });
  }, [editable]);

  React.useEffect(() => {
    document.addEventListener('selectionchange', updateToolbar);
    return () => document.removeEventListener('selectionchange', updateToolbar);
  }, [updateToolbar]);

  const command = (name: string, commandValue?: string) => {
    ref.current?.focus();
    document.execCommand(name, false, commandValue);
    onChange(ref.current?.textContent || '');
    updateToolbar();
  };

  const showToolbar = () => {
    onFocus?.();
    const rect = ref.current?.getBoundingClientRect();
    if (editable && rect) {
      setToolbar({ top: Math.max(8, rect.top - 48), left: Math.max(8, rect.left + rect.width / 2) });
    }
  };

  return <>
    <span ref={ref} className={`${className} ${editable ? 'cursor-text rounded px-1 outline-none transition hover:bg-amber-100/50 focus:bg-amber-100/70 focus:ring-1 focus:ring-amber-400' : ''}`} contentEditable={editable} suppressContentEditableWarning role={editable ? 'textbox' : undefined} aria-label={editable ? label : undefined} onFocus={showToolbar} onSelect={() => window.requestAnimationFrame(updateToolbar)} onMouseUp={updateToolbar} onKeyUp={updateToolbar} onBlur={editable ? (event) => { onChange(event.currentTarget.textContent || ''); setToolbar(null); } : undefined} style={multiline ? { display: 'block' } : undefined}>{value}</span>
    {editable && toolbar && createPortal(<div className="fixed z-[2147483647] flex -translate-x-1/2 items-center gap-1 rounded-xl border border-slate-200 bg-white px-2 py-1.5 shadow-[0_8px_24px_rgba(15,23,42,0.2)]" style={{ top: toolbar.top, left: toolbar.left }} onMouseDown={(event) => event.preventDefault()}>
      <button type="button" onClick={() => command('bold')} className="px-2 py-1 text-sm font-bold">B</button>
      <button type="button" onClick={() => command('italic')} className="px-2 py-1 text-sm italic">I</button>
      <button type="button" onClick={() => command('underline')} className="px-2 py-1 text-sm underline">U</button>
      <button type="button" onClick={() => command('insertUnorderedList')} className="px-2 py-1 text-sm">☷</button>
      <button type="button" onClick={() => command('justifyLeft')} className="px-2 py-1 text-sm">≡</button>
      <button type="button" onClick={() => setToolbar(null)} className="ml-1 rounded-lg bg-emerald-500 px-3 py-1 text-xs font-bold text-white">Done</button>
    </div>, document.body)}
  </>;
}
