import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html className="h-full bg-white">
      <Head />
        <link rel='icon' href='/img/favicon.png' />
      <body className="h-full bgImage">
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
