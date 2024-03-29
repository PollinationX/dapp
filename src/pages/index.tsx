import type { NextPage } from 'next'
import Index from '@/components/index'
import Head from 'next/head'

const IndexPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>PollinationX Developers</title>
        <meta name='description' content='Enabling decentralized, private & safe file transfer.' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <meta http-equiv='Content-Security-Policy' content='upgrade-insecure-requests' />
      </Head>
      <Index />
    </>
  )
}

export default IndexPage
