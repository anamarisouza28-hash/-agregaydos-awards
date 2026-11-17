'use client';
import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

/** Reduz a foto no próprio celular antes de enviar (máx. 1000px, JPEG). */
async function compress(file: File, maxSide = 1000, quality = 0.82): Promise<Blob> {
  let source: ImageBitmap | HTMLImageElement;
  try {
    source = await createImageBitmap(file, { imageOrientation: 'from-image' } as ImageBitmapOptions);
  } catch {
    source = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Não consegui abrir essa imagem. Tente outra (JPG ou PNG).'));
      img.src = URL.createObjectURL(file);
    });
  }
  const w0 = source.width;
  const h0 = source.height;
  const scale = Math.min(1, maxSide / Math.max(w0, h0));
  const w = Math.round(w0 * scale);
  const h = Math.round(h0 * scale);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(source, 0, 0, w, h);
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Falha ao comprimir a foto.'))), 'image/jpeg', quality),
  );
}

export function PhotoUpload({
  target, id, label = 'Trocar foto', hasPhoto = false,
}: {
  target: 'participant' | 'category' | 'nominee';
  id: string;
  label?: string;
  hasPhoto?: boolean;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const router = useRouter();

  async function onFile(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setErr('');
    try {
      const blob = await compress(file);
      const fd = new FormData();
      fd.append('target', target);
      fd.append('id', id);
      fd.append('file', blob, 'foto.jpg');
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
      if (!res.ok) throw new Error((await res.text()) || 'Falha no envio');
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Falha no envio');
    } finally {
      setBusy(false);
      if (input.current) input.current.value = '';
    }
  }

  async function remove() {
    if (!window.confirm('Remover esta foto?')) return;
    setBusy(true);
    const fd = new FormData();
    fd.append('target', target);
    fd.append('id', id);
    fd.append('remove', '1');
    await fetch('/api/admin/upload', { method: 'POST', body: fd });
    setBusy(false);
    router.refresh();
  }

  return (
    <span className="row wrap" style={{ gap: 6 }}>
      <input
        ref={input}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => onFile(e.target.files?.[0])}
      />
      <button type="button" className="btn small" disabled={busy} onClick={() => input.current?.click()}>
        {busy ? 'Enviando…' : `📷 ${label}`}
      </button>
      {hasPhoto && !busy && (
        <button type="button" className="btn small ghost" onClick={remove}>Remover foto</button>
      )}
      {err && <span className="small" style={{ color: 'var(--danger)' }}>{err}</span>}
    </span>
  );
}
