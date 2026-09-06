interface LocationMapProps {
  address: string;
  className?: string;
}

/**
 * Menampilkan peta Google Maps embed berdasarkan alamat.
 * Tidak memerlukan API key berbayar — menggunakan format embed search query.
 * Hanya dirender jika address tidak kosong.
 */
export function LocationMap({ address, className = "" }: LocationMapProps) {
  if (!address || address.trim() === "") return null;

  const encodedAddress = encodeURIComponent(address.trim());
  const src = `https://www.google.com/maps?q=${encodedAddress}&output=embed`;

  return (
    <div className={`w-full overflow-hidden rounded-2xl border border-stone-200 shadow-sm ${className}`}>
      <iframe
        src={src}
        width="100%"
        height="220"
        style={{ border: 0, display: "block" }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title={`Peta lokasi ${address}`}
        aria-label={`Peta Google Maps untuk ${address}`}
      />
    </div>
  );
}
