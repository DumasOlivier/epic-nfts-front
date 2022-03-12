import { useEffect, useState } from 'react'
import Head from 'next/head'

const Home = () => {
  const [hasMetamask, setHasMetamask] = useState(false)
  const [currentAccount, setCurrentAccount] = useState('')

  useEffect(() => {
    checkIfWalletIsConnected()
  }, [])

  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window
    if (!ethereum) {
      console.log('Make sure you have metamask!')
      setHasMetamask(false)
    } else {
      console.log('We have the ethereum object', ethereum)
      setHasMetamask(true)

      const accounts = await ethereum.request({ method: 'eth_accounts' })
      if (accounts.length !== 0) {
        const account = accounts[0]
        console.log('Found an authorized account:', account)
        setCurrentAccount(account)
      } else {
        console.log('No authorized account found')
      }
    }
  }

  const connectWallet = async () => {
    try {
      const { ethereum } = window

      if (!ethereum) {
        alert('Get MetaMask!')
        return
      }

      const accounts = await ethereum.request({ method: 'eth_requestAccounts' })

      console.log('Connected', accounts[0])
      setCurrentAccount(accounts[0])
    } catch (error) {
      console.log(error)
    }
  }

  // User have Metamask installed.
  const renderNotConnectedContainer = () => {
    if (currentAccount.length > 0) {
      return <p className="text-green-500">You are logged in ! 🎉</p>
    } else {
      return (
        <button
          className="mt-5 rounded bg-indigo-500 py-2 px-4 font-bold text-white hover:bg-indigo-700"
          onClick={() => connectWallet()}
        >
          Connect to Wallet
        </button>
      )
    }
  }

  // User doesn't have Metamask.
  const renderInstallMetamask = () => {
    return (
      <div>
        <p className="text-center">
          You need to install Metamask to use this app.
        </p>
        <button className="mt-5 rounded bg-red-500 py-2 px-4 font-bold text-white hover:bg-red-700">
          Install metamask
        </button>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2">
      <Head>
        <title>Epic NFTs</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex w-full flex-1 flex-col items-center justify-center px-20 text-center">
        <h1 className="text-5xl font-bold">Lorem Ipsum NFTs</h1>

        <p className="mt-5 mb-5 text-2xl">
          Each unique. Each beautiful. Discover your NFT today.
        </p>

        {/* Add your render method here */}
        {hasMetamask ? renderNotConnectedContainer() : renderInstallMetamask()}
      </main>

      <footer className="flex h-24 w-full items-center justify-center border-t">
        <a
          className="flex items-center justify-center gap-2"
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Epic NFT project.
        </a>
      </footer>
    </div>
  )
}

export default Home
