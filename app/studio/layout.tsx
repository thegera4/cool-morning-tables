export const metadata = {
    title: 'Sanity Studio',
    description: 'Sanity Studio Dashboard para Cool Morning Columpios',
}

export default function RootLayout({children}: {children: React.ReactNode}) {
    return (
        <html lang="es" suppressHydrationWarning>
            <body style={{ margin: 0, padding: 0 }} suppressHydrationWarning>{children}</body>
        </html>
    )
}