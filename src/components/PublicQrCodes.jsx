import { createElement } from 'react';
import { ExternalLink, Instagram, Lightbulb, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

const cleanText = (value) => `${value || ''}`.trim();

export default function PublicQrCodes({ settings, compact = false }) {
  const links = [
    {
      id: 'innovation',
      label: 'Projeto de inovacao',
      detail: 'Conheca a pesquisa, a solucao e o impacto da equipe.',
      url: cleanText(settings?.innovationUrl),
      Icon: Lightbulb,
    },
    {
      id: 'social',
      label: cleanText(settings?.socialLabel) || 'Redes da equipe',
      detail: 'Acompanhe treinos, novidades e bastidores da temporada.',
      url: cleanText(settings?.socialUrl),
      Icon: Instagram,
    },
  ];

  return (
    <div className={`grid gap-4 ${compact ? 'md:grid-cols-2' : 'grid-cols-2'}`}>
      {links.map(({ id, label, detail, url, Icon }) => (
        <article key={id} className="flex min-w-0 flex-col rounded-lg border border-white/12 bg-white/5 p-5 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="newgears-public-accent-panel newgears-public-accent-text-muted flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border">
              {createElement(Icon, { size: 20 })}
            </div>
            <div className="min-w-0">
              <p className="newgears-public-accent-text-muted text-xs font-black uppercase tracking-[0.14em]">{label}</p>
              {!compact && <p className="mt-1 text-sm font-bold leading-relaxed text-slate-300">{detail}</p>}
            </div>
          </div>

          <div className={`mt-5 flex flex-1 items-center gap-4 ${compact ? 'justify-between' : 'justify-center'}`}>
            {url ? (
              <>
                <div className="rounded-lg bg-white p-3 shadow-lg">
                  <QRCodeSVG value={url} size={compact ? 116 : 190} level="M" />
                </div>
                {compact && (
                  <a
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    title={`Abrir ${label}`}
                    className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white hover:bg-white/10"
                  >
                    <ExternalLink size={18} />
                  </a>
                )}
              </>
            ) : (
              <div className="flex min-h-[140px] w-full items-center justify-center rounded-lg border border-dashed border-white/15 bg-black/15 text-center">
                <div>
                  <QrCode size={32} className="mx-auto text-slate-500" />
                  <p className="mt-3 text-xs font-bold leading-relaxed text-slate-400">Link aguardando configuracao no painel.</p>
                </div>
              </div>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}
