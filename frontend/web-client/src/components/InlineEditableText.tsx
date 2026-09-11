import React from 'react';

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
  return <span
    className={`${className} ${editable ? 'cursor-text rounded px-1 outline-none transition hover:bg-amber-100/50 focus:bg-amber-100/70 focus:ring-1 focus:ring-amber-400' : ''}`}
    contentEditable={editable}
    suppressContentEditableWarning
    role={editable ? 'textbox' : undefined}
    aria-label={editable ? label : undefined}
    onFocus={onFocus}
    onBlur={editable ? (event) => onChange(event.currentTarget.textContent || '') : undefined}
    style={multiline ? { display: 'block' } : undefined}
  >{value}</span>;
}
