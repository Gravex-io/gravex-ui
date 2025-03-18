import { GoogleAnalytics } from '@next/third-parties/google'
import { getCookie } from 'cookies-next'
import Decimal from 'decimal.js'
import type { AppContext, AppProps } from 'next/app'
import App from 'next/app'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useEffect, useMemo } from 'react'

import i18n from '../i18n'
import { isClient } from '../utils/common'

import '@/components/Toast/toast.css'
import '@/components/LandingPage/components/tvl.css'
import '@/components/LandingPage/liquidity.css'
import 'react-day-picker/dist/style.css'

const DynamicProviders = dynamic(() => import('@/provider').then((mod) => mod.Providers))
const DynamicContent = dynamic(() => import('@/components/Content'))
const DynamicAppNavLayout = dynamic(() => import('@/components/AppLayout/AppNavLayout'), { ssr: false })

const CONTENT_ONLY_PATH = ['/', '404', '/moonpay']
const OVERFLOW_HIDDEN_PATH = ['/gravity-coins']

Decimal.set({ precision: 1e3 })

const MyApp = ({ Component, pageProps, ...props }: AppProps) => {
  const { pathname } = useRouter()
  const router = useRouter()

  const [onlyContent, overflowHidden] = useMemo(
    () => [CONTENT_ONLY_PATH.includes(pathname), OVERFLOW_HIDDEN_PATH.includes(pathname)],
    [pathname]
  )

  useEffect(() => {
    console.log('Current Route:', router.pathname)
  }, [router.pathname])

  return (
    <>
      <GoogleAnalytics gaId="G-DR3V6FTKE3" />
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="twitter:image" content="https://img-v1.raydium.io/share/7be7ee6c-56b2-451e-a010-6c21e0db2ee5.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@GravexProtocol" />
        <meta name="twitter:creator" content="@GravexProtocol" />
        <meta name="twitter:title" content="Gravex" />
        <meta name="twitter:description" content="On-chain Gravity Coin(tm) swap platform, the next generation of meme coins" />
        <meta property="og:description" content="On-chain Gravity Coin(tm) swap platform, the next generation of meme coins" />
        <meta property="og:url" content="https://gravex.io/" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://img-v1.raydium.io/share/7be7ee6c-56b2-451e-a010-6c21e0db2ee5.png" />
        <meta property="og:image:alt" content="Gravex" />
        <meta property="og:locale" content="en" />
        <meta property="og:site_name" content="Gravex" />
        <meta property="og:title" content="Swap | Gravex" />
        <title>{pageProps?.title ? `${pageProps.title} Gravex` : 'Gravex'}</title>
      </Head>
      <DynamicProviders>
        <DynamicContent {...props}>
          {onlyContent ? (
            <Component {...pageProps} />
          ) : (
            <DynamicAppNavLayout overflowHidden={overflowHidden}>
              <Component {...pageProps} />
            </DynamicAppNavLayout>
          )}
        </DynamicContent>
      </DynamicProviders>
    </>
  )
}

MyApp.getInitialProps = async (appContext: AppContext) => {
  if (isClient()) return {}
  try {
    const ctx = await App.getInitialProps(appContext)
    let lng = getCookie('i18nextLng', { req: appContext.ctx.req, res: appContext.ctx.res }) as string
    lng = lng || 'en'
    i18n.changeLanguage(lng)

    return ctx
  } catch (err) {
    return {}
  }
}

export default MyApp
