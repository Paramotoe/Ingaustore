export default function MarketplaceLinks({
  links,
}: {
  links: { id: string; marketplaceName: string; url: string }[];
}) {
  if (links.length === 0) return null;

  const label = (name: string) => {
    const map: Record<string, string> = {
      shopee: "Lihat di Shopee",
      tokopedia: "Lihat di Tokopedia",
      whatsapp: "Chat via WhatsApp",
      lazada: "Lihat di Lazada",
      instagram: "Lihat di Instagram",
      facebook: "Lihat di Facebook",
      website: "Kunjungi Website",
    };
    return map[name.toLowerCase()] ?? `Lihat di ${name}`;
  };

  return (
    <div className="mt-6">
      <p className="text-sm font-medium text-foreground">Tersedia di</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {links.map((l) => (
          <a
            key={l.id}
            href={l.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-surface px-4 text-sm font-semibold text-foreground transition-colors hover:bg-surface-elevated"
          >
            {label(l.marketplaceName)}
          </a>
        ))}
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Pembelian dilakukan di platform eksternal (marketplace).
      </p>
    </div>
  );
}