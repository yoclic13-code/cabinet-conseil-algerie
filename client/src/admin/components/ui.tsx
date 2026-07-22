import clsx from 'clsx';
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react';

export function AdminButton({
  variant = 'primary',
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
}) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center gap-2 rounded-md px-3.5 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50',
        variant === 'primary' && 'bg-admin-accent text-white hover:bg-admin-accentHover',
        variant === 'secondary' &&
          'border border-admin-border bg-white text-admin-ink hover:bg-admin-bg',
        variant === 'danger' && 'bg-admin-danger text-white hover:bg-red-700',
        variant === 'ghost' && 'text-admin-mute hover:bg-admin-bg hover:text-admin-ink',
        className,
      )}
      {...props}
    />
  );
}

export function AdminInput({
  label,
  hint,
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label?: string; hint?: string }) {
  return (
    <label className="block space-y-1.5">
      {label ? <span className="text-xs font-medium uppercase tracking-wide text-admin-mute">{label}</span> : null}
      <input
        className={clsx(
          'w-full rounded-md border border-admin-border bg-white px-3 py-2 text-sm text-admin-ink outline-none focus:border-admin-accent focus:ring-2 focus:ring-admin-accent/20',
          className,
        )}
        {...props}
      />
      {hint ? <span className="text-xs text-admin-mute">{hint}</span> : null}
    </label>
  );
}

export function AdminTextarea({
  label,
  hint,
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string; hint?: string }) {
  return (
    <label className="block space-y-1.5">
      {label ? <span className="text-xs font-medium uppercase tracking-wide text-admin-mute">{label}</span> : null}
      <textarea
        className={clsx(
          'w-full rounded-md border border-admin-border bg-white px-3 py-2 text-sm text-admin-ink outline-none focus:border-admin-accent focus:ring-2 focus:ring-admin-accent/20',
          className,
        )}
        {...props}
      />
      {hint ? <span className="text-xs text-admin-mute">{hint}</span> : null}
    </label>
  );
}

export function AdminSelect({
  label,
  children,
  className,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string; children: ReactNode }) {
  return (
    <label className="block space-y-1.5">
      {label ? <span className="text-xs font-medium uppercase tracking-wide text-admin-mute">{label}</span> : null}
      <select
        className={clsx(
          'w-full rounded-md border border-admin-border bg-white px-3 py-2 text-sm text-admin-ink outline-none focus:border-admin-accent focus:ring-2 focus:ring-admin-accent/20',
          className,
        )}
        {...props}
      >
        {children}
      </select>
    </label>
  );
}

export function AdminCard({
  title,
  actions,
  children,
  className,
}: {
  title?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={clsx('rounded-lg border border-admin-border bg-admin-panel shadow-sm', className)}>
      {(title || actions) && (
        <header className="flex items-center justify-between gap-3 border-b border-admin-border px-4 py-3">
          {title ? <h2 className="text-sm font-semibold text-admin-ink">{title}</h2> : <span />}
          {actions}
        </header>
      )}
      <div className="p-4">{children}</div>
    </section>
  );
}

export function StatusBadge({
  status,
}: {
  status: string;
}) {
  const map: Record<string, string> = {
    publie: 'bg-emerald-50 text-admin-success',
    brouillon: 'bg-gray-100 text-admin-mute',
    programme: 'bg-amber-50 text-admin-warn',
    nouveau: 'bg-blue-50 text-admin-accent',
    traite: 'bg-emerald-50 text-admin-success',
    a_venir: 'bg-blue-50 text-admin-accent',
    passe: 'bg-gray-100 text-admin-mute',
    annule: 'bg-red-50 text-admin-danger',
  };
  return (
    <span
      className={clsx(
        'inline-flex rounded px-2 py-0.5 text-xs font-medium capitalize',
        map[status] || 'bg-gray-100 text-admin-mute',
      )}
    >
      {status.replace('_', ' ')}
    </span>
  );
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-admin-ink">{title}</h1>
        {description ? <p className="mt-1 text-sm text-admin-mute">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-md border border-dashed border-admin-border bg-admin-bg px-4 py-10 text-center text-sm text-admin-mute">
      {message}
    </div>
  );
}

export function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-admin-danger">
      {message}
    </div>
  );
}

export function SuccessBanner({ message }: { message: string }) {
  return (
    <div className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-admin-success">
      {message}
    </div>
  );
}
