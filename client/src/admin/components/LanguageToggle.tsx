import clsx from 'clsx';

export function LanguageToggle({
  locale,
  onChange,
}: {
  locale: 'fr' | 'en';
  onChange: (locale: 'fr' | 'en') => void;
}) {
  return (
    <div className="inline-flex rounded-md border border-admin-border bg-admin-bg p-0.5 text-xs font-medium">
      {(['fr', 'en'] as const).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => onChange(l)}
          className={clsx(
            'rounded px-2.5 py-1 uppercase transition',
            locale === l ? 'bg-white text-admin-ink shadow-sm' : 'text-admin-mute hover:text-admin-ink',
          )}
        >
          {l}
        </button>
      ))}
    </div>
  );
}

export function BilingualFields({
  locale,
  fr,
  en,
}: {
  locale: 'fr' | 'en';
  fr: React.ReactNode;
  en: React.ReactNode;
}) {
  return <div className="space-y-3">{locale === 'fr' ? fr : en}</div>;
}
