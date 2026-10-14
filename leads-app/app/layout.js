import './globals.css';

export const metadata = { title: 'Leads Isapre', description: 'Gestión de leads' };

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0f1f2e" />
      </head>
      <body>{children}</body>
    </html>
  );
}
