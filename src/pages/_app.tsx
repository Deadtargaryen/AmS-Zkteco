import type { AppProps } from 'next/app'
import { ChakraProvider } from '@chakra-ui/react'
import DefaultLayout from '../../components/defaultLayout'
import { extendTheme } from '@chakra-ui/react'
import '@fontsource/ibm-plex-sans/400.css'
import { SessionProvider } from 'next-auth/react'
import { Session } from 'next-auth'
import { ReactNode, useEffect } from 'react'
import { NextPage } from 'next'
import { Provider, useDispatch } from 'react-redux'
import store from '../../redux/store/store'

type Page<P = {}> = NextPage<P> & {
  authpage?: (page: ReactNode) => ReactNode
}

type MyAppProps<P = {}> = AppProps<P> & {
  Component: Page<P>
}

const colors = {
    brand: {
      900: '#1a365d',
      800: '#153e75',
      700: '#2a69ac',
    },
    primary: '#5b73e8',
    primaryAccent: '#EBF8FF',
    textGray: {
      1: '#7b8190',
      2: '#4A5568',
    },
  },
  fonts = {
    heading: `"IBM Plex Sans", sans-serif`,
    body: `"IBM Plex Sans", sans-serif`,
  }

const theme = extendTheme({ colors, fonts })

function MyApp({ Component, pageProps }: MyAppProps<{ session: Session }>) {


  return (
    <SessionProvider session={pageProps.session}>
      <ChakraProvider theme={theme}>
        <Provider store={store}>
            {Component.authpage ? (
              <Component {...pageProps} />
            ) : (
              <DefaultLayout>
                <Component {...pageProps} />
              </DefaultLayout>
            )}
        </Provider>
      </ChakraProvider>
    </SessionProvider>
  )
}

export default MyApp
