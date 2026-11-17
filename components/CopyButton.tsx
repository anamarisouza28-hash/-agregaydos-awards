'use client';
import { useState } from 'react';

/** Copia um link do site (o caminho é completado com o endereço atual). */
export function CopyLink({ path, label = 'Copiar link', className = 'btn small' }: { path: string; label?: string; className?: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button
      type="button"
      className={className}
      onClick={async () => {
        const url = window.location.origin + path;
        try {
          await navigator.clipboard.writeText(url);
        } catch {
          window.prompt('Copie o link:', url);
        }
        setOk(true);
        setTimeout(() => setOk(false), 1800);
      }}
    >
      {ok ? 'Copiado ✓' : `🔗 ${label}`}
    </button>
  );
}

/** Abre o WhatsApp com a mensagem-convite e o link da pessoa. */
export function WhatsAppLink({ path, name }: { path: string; name: string }) {
  return (
    <button
      type="button"
      className="btn small"
      onClick={() => {
        const url = window.location.origin + path;
        const text = `Oi, ${name}! ✨ Seu convite para o *Agregaydos Awards 2026* chegou.\n\nEsse link é só seu (não passe para ninguém): ${url}\n\nLá você vota nos prêmios e descobre seu amigo oculto 🎁`;
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
      }}
    >
      💬 WhatsApp
    </button>
  );
}

/** Copia todos os links de uma vez, um por linha. */
export function CopyAllLinks({ items }: { items: { name: string; path: string }[] }) {
  const [ok, setOk] = useState(false);
  return (
    <button
      type="button"
      className="btn small"
      onClick={async () => {
        const text = items.map((i) => `${i.name}: ${window.location.origin}${i.path}`).join('\n');
        try {
          await navigator.clipboard.writeText(text);
        } catch {
          window.prompt('Copie:', text);
        }
        setOk(true);
        setTimeout(() => setOk(false), 1800);
      }}
    >
      {ok ? 'Copiado ✓' : '📋 Copiar todos os links'}
    </button>
  );
}
