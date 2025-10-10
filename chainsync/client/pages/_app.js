import '../styles/globals.css'
import { Toaster } from 'react-hot-toast'
import { Web3Provider } from '../contexts/Web3Context'
import Head from 'next/head'

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <script src="https://telegram.org/js/telegram-web-app.js" />
      </Head>
      <Web3Provider>
        <Component {...pageProps} />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              theme: {
                primary: '#4aed88',
              },
            },
          }}
        />
      </Web3Provider>
    </>
  )
}