import { useCallback, useState } from 'react';
import clsx from 'clsx';
import { Upload, X } from 'lucide-react';
import { adminApi } from '../../api/admin';
import { AdminButton } from './ui';

export function ImageUpload({
  value,
  onChange,
  label = 'Image',
}: {
  value?: string | null;
  onChange: (url: string | null) => void;
  label?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);

  const handleFile = useCallback(
    async (file: File | undefined) => {
      if (!file) return;
      setError('');
      setUploading(true);
      try {
        const res = await adminApi.upload(file);
        onChange(res.data.url);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Upload échoué');
      } finally {
        setUploading(false);
      }
    },
    [onChange],
  );

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium uppercase tracking-wide text-admin-mute">{label}</p>
      {value ? (
        <div className="relative overflow-hidden rounded-md border border-admin-border bg-admin-bg">
          <img src={value} alt="" className="h-40 w-full object-cover" />
          <AdminButton
            type="button"
            variant="secondary"
            className="absolute right-2 top-2 !px-2 !py-1"
            onClick={() => onChange(null)}
          >
            <X size={14} />
          </AdminButton>
        </div>
      ) : (
        <label
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            void handleFile(e.dataTransfer.files?.[0]);
          }}
          className={clsx(
            'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed px-4 py-8 text-sm transition',
            dragOver
              ? 'border-admin-accent bg-blue-50 text-admin-accent'
              : 'border-admin-border bg-admin-bg text-admin-mute hover:border-admin-accent/50',
          )}
        >
          <Upload size={18} />
          <span>{uploading ? 'Upload…' : 'Glisser une image ou cliquer'}</span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={uploading}
            onChange={(e) => void handleFile(e.target.files?.[0])}
          />
        </label>
      )}
      {error ? <p className="text-xs text-admin-danger">{error}</p> : null}
    </div>
  );
}
