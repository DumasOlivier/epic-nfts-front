import { useEffect, useState } from 'react'
import Head from 'next/head'
import { ethers } from 'ethers'
import myEpicNft from '../utils/MyEpicNFT.json'

const Home = () => {
  const [hasMetamask, setHasMetamask] = useState(false)
  const [currentAccount, setCurrentAccount] = useState('')
  const [isMining, setIsMining] = useState(false)
  const [trxAddress, setTrxAddress] = useState('')

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
      return (
        <div>
          <p className="text-green-500">You are logged in ! 🎉</p>
          {isMining ? (
            <p className="mt-5 text-2xl">
              The transaction is being mined, please wait...
            </p>
          ) : trxAddress.length > 0 ? (
            <div>
              <h2 className="mt-5 text-3xl font-bold">
                Congratulation, your NFT has been mined !
              </h2>
              <p className="mt-5">Check your transaction here :</p>
              <p className="mt-3">
                <a className="text-blue-500" href={trxAddress} target="_blank">
                  {trxAddress}
                </a>
              </p>
            </div>
          ) : (
            <button
              onClick={() => askContractToMintNft()}
              className="mt-5 rounded bg-green-500 py-2 px-4 font-bold text-white hover:bg-green-700"
            >
              Mint a Lorem Ipsum NFT 🔥
            </button>
          )}
        </div>
      )
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

  const askContractToMintNft = async () => {
    const CONTRACT_ADDRESS = '0xB98115d26883Fd4640A931A293B44Bb980b28e9C'

    try {
      const { ethereum } = window

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          myEpicNft.abi,
          signer
        )

        console.log('Going to pop wallet now to pay gas...')
        let nftTxn = await connectedContract.makeAnEpicNFT()

        console.log('Mining...please wait.')
        setIsMining(true)
        await nftTxn.wait()
        setIsMining(false)
        setTrxAddress(`https://rinkeby.etherscan.io/tx/${nftTxn.hash}`)
        console.log(
          `Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`
        )
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error)
    }
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
          NFT project
        </a>
      </footer>
    </div>
  )
}

export default Home
