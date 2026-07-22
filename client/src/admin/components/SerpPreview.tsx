export function SerpPreview({
  title,
  description,
  urlPath = '/',
}: {
  title: string;
  description: string;
  urlPath?: string;
}) {
  const displayTitle = title.slice(0, 60) + (title.length > 60 ? '…' : '');
  const displayDesc = description.slice(0, 160) + (description.length > 160 ? '…' : '');
  const host = 'www.cabinet-conseil.dz';

  return (
    <div className="rounded-md border border-admin-border bg-white p-4">
      <p className="mb-3 text-xs font-medium uppercase tracking-wide text-admin-mute">
        Aperçu Google (SERP)
      </p>
      <div className="max-w-xl font-[Arial,sans-serif]">
        <div className="text-sm text-[#202124]">
          <span className="text-[#202124]">{host}</span>
          <span className="text-[#4d5156]"> › {urlPath.replace(/^\//, '') || 'accueil'}</span>
        </div>
        <a className="mt-1 block text-xl leading-snug text-[#1a0dab] hover:underline">
          {displayTitle || 'Titre de la page'}
        </a>
        <p className="mt-1 text-sm leading-snug text-[#4d5156]">
          {displayDesc || 'Meta description affichée dans les résultats de recherche…'}
        </p>
      </div>
      <div className="mt-3 flex gap-4 text-xs text-admin-mute">
        <span>Title {title.length}/60</span>
        <span>Description {description.length}/160</span>
      </div>
    </div>
  );
}
