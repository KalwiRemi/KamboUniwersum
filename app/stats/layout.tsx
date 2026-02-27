import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Statystyki kanałów',
  description: 'Porównanie średnich wyświetleń kanałów z kambodżańskiego uniwersum.',
  alternates: {
    canonical: '/stats',
  },
  openGraph: {
    title: 'Kambo Uniwersum - statystyki kanałów',
    description: 'Interaktywny wykres średnich wyświetleń kanałów miesiąc po miesiącu.',
    url: '/stats',
    type: 'website',
    locale: 'pl_PL',
  },
};

export default function StatsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
