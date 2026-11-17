'use client';
import { useFormStatus } from 'react-dom';

/** Botão de formulário que pede confirmação. Com `typeToConfirm`, a pessoa precisa digitar a palavra. */
export function ConfirmButton({
  children, message, typeToConfirm, className = 'btn', pendingText, disabled = false,
}: {
  disabled?: boolean;
  children: React.ReactNode;
  message?: string;
  typeToConfirm?: string;
  className?: string;
  pendingText?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className={className}
      disabled={pending || disabled}
      onClick={(e) => {
        if (typeToConfirm) {
          const v = window.prompt(`${message ?? ''}\n\nPara confirmar, digite ${typeToConfirm}:`);
          if ((v ?? '').trim().toUpperCase() !== typeToConfirm.toUpperCase()) e.preventDefault();
        } else if (message && !window.confirm(message)) {
          e.preventDefault();
        }
      }}
    >
      {pending ? pendingText ?? 'Aguarde…' : children}
    </button>
  );
}

export function SubmitButton({ children, className = 'btn', pendingText }: {
  children: React.ReactNode; className?: string; pendingText?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={className} disabled={pending}>
      {pending ? pendingText ?? 'Salvando…' : children}
    </button>
  );
}
