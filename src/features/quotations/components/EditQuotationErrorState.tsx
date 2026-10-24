'use client';

interface EditQuotationErrorStateProps {
  message: string;
}

export function EditQuotationErrorState({ message }: EditQuotationErrorStateProps) {
  return (
    <p role="alert" className="rounded-lg bg-rose-500/10 border border-rose-500/20 px-4 py-3 text-xs font-semibold text-rose-500">
      {message}
    </p>
  );
}