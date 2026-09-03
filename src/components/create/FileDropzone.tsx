'use client';

import { useCallback, useRef, useState } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';

interface UploadItem {
  file: File;
  path: string;
  status: 'uploading' | 'done' | 'error';
  error?: string;
}

interface FileDropzoneProps {
  supabase: SupabaseClient;
  bucket: string;
  pathPrefix: string;
  accept: string;
  multiple?: boolean;
  label: string;
  hint?: string;
  onUploadedPathsChange: (paths: string[]) => void;
}

/**
 * Uploads straight to Supabase Storage from the browser (no server hop —
 * see README for why). The Storage SDK doesn't expose byte-level progress
 * without switching to resumable uploads, so status is honestly binary:
 * uploading → done/error, not a simulated progress bar.
 */
export function FileDropzone({
  supabase,
  bucket,
  pathPrefix,
  accept,
  multiple = false,
  label,
  hint,
  onUploadedPathsChange,
}: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<UploadItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const uploadFiles = useCallback(
    async (files: FileList | File[]) => {
      const list = Array.from(files);
      const newItems: UploadItem[] = list.map((file) => ({
        file,
        path: `${pathPrefix}/${crypto.randomUUID()}-${file.name}`,
        status: 'uploading',
      }));

      setItems((prev) => (multiple ? [...prev, ...newItems] : newItems));

      const results = await Promise.all(
        newItems.map(async (item) => {
          const { error } = await supabase.storage.from(bucket).upload(item.path, item.file, {
            cacheControl: '3600',
            upsert: false,
          });
          return { ...item, status: error ? ('error' as const) : ('done' as const), error: error?.message };
        })
      );

      setItems((prev) => {
        const byPath = new Map(prev.map((p) => [p.path, p]));
        for (const r of results) byPath.set(r.path, r);
        const next = Array.from(byPath.values());
        onUploadedPathsChange(next.filter((n) => n.status === 'done').map((n) => n.path));
        return next;
      });
    },
    [bucket, multiple, onUploadedPathsChange, pathPrefix, supabase]
  );

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (e.dataTransfer.files.length) void uploadFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        role="button"
        tabIndex={0}
        className={`cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition-colors ${
          isDragging ? 'border-[#FFB6C1] bg-[#FFB6C1]/5' : 'border-white/15 hover:border-white/30'
        }`}
      >
        <p className="font-pixel text-[10px] text-white/70">{label}</p>
        {hint && <p className="mt-2 text-xs text-white/40">{hint}</p>}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) void uploadFiles(e.target.files);
            e.target.value = '';
          }}
        />
      </div>

      {items.length > 0 && (
        <ul className="mt-3 space-y-1">
          {items.map((item) => (
            <li key={item.path} className="flex items-center justify-between text-xs text-white/60">
              <span className="truncate">{item.file.name}</span>
              <span
                className={
                  item.status === 'done'
                    ? 'text-emerald-400'
                    : item.status === 'error'
                      ? 'text-red-400'
                      : 'text-white/40'
                }
              >
                {item.status === 'uploading' ? 'uploading…' : item.status === 'done' ? 'uploaded' : (item.error ?? 'failed')}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
