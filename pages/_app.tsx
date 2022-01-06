import 'styles/globals.css'
import type { AppProps } from 'next/app'
import { ChakraProvider } from '@chakra-ui/react'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import NProgress from 'nprogress'
import Head from 'next/head'

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter()

  useEffect(() => {
    const startLoading = () => NProgress.start()
    const endLoading = () => NProgress.done()

    router.events.on('routeChangeStart', startLoading)
    router.events.on('routeChangeComplete', endLoading)
    router.events.on('routeChangeError', endLoading)

    return () => {
      router.events.off('routeChangeStart', startLoading)
      router.events.off('routeChangeComplete', endLoading)
      router.events.off('routeChangeError', endLoading)
    }
  }, [router.events])

  return (
    <ChakraProvider>
      <Head>
        <title>SARex Toolset</title>
        <meta name="description" content="Created by Hwi Ahn" />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/nprogress/0.2.0/nprogress.min.css"
        />
      </Head>
      <Component {...pageProps} />
    </ChakraProvider>
  )
}
export default MyApp
