import { MetadataRoute } from 'next';

export default async function manifest(
  { params }: { params: Promise<{ tenant: string }> }
): Promise<MetadataRoute.Manifest> {
  const tenantParams = await params;
  
  return {
    name: 'bukly.id',
    short_name: 'bukly.id',
    description: 'Booking online untuk usaha favorit kamu',
    start_url: `/${tenantParams.tenant}`,
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#4338ca',
    icons: [
      {
        src: '/icon.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
