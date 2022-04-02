import { useEffect, useState } from 'react'
import Head from 'next/head'
import { ethers } from 'ethers'
import myEpicNft from '../utils/MyEpicNFT.json'

const Home = () => {
  const [hasMetamask, setHasMetamask] = useState(false)
  const [currentAccount, setCurrentAccount] = useState('')
  const [isMining, setIsMining] = useState(false)
  const [trxAddress, setTrxAddress] = useState('')
  const [openSeaNftAddress, setOpenSeaNftAddress] = useState('')
  const [error, setError] = useState('')
  const CONTRACT_ADDRESS = '0x27F66Db115f74dbe351c6a51a3f44281A6Ffe2ea'

  useEffect(() => {
    checkIfWalletIsConnected()
  }, [])

  const checkNetworkId = async () => {
    let chainId = await ethereum.request({ method: 'eth_chainId' })

    // String, hex code of the chainId of the Rinkebey test network
    const rinkebyChainId = '0x4'
    if (chainId !== rinkebyChainId) {
      alert(
        '👮 This app only works with the Rinkeby network, please change your Metamask settings.'
      )
    }
  }

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
        setupEventListener()
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

      if (error.length > 1) {
        setError('')
      }

      const accounts = await ethereum.request({ method: 'eth_requestAccounts' })

      console.log('Connected', accounts[0])
      setCurrentAccount(accounts[0])
      checkNetworkId()

      setupEventListener()
    } catch (error) {
      console.log(error)
      setError(`An error has occured, your NFT could not be created : ${error}`)
    }
  }

  // User have Metamask installed.
  const renderNotConnectedContainer = () => {
    if (currentAccount.length > 0) {
      return (
        <div>
          <p className="mt-10 text-slate-700">You are logged in ! 🎉</p>
          {isMining ? (
            <p className="mt-5 text-2xl">
              {error.length > 1
                ? error
                : 'The transaction is being mined, please wait...'}
            </p>
          ) : trxAddress.length > 0 ? (
            <div>
              <h2 className="mt-5 text-3xl font-bold">
                Congratulation, your NFT has been minted !
              </h2>
              <p className="mt-10 font-bold">Check your transaction here :</p>
              <p className="mt-3">
                <a
                  className="text-blue-500"
                  href={trxAddress}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {trxAddress}
                </a>
              </p>
              {openSeaNftAddress.length > 2 ? (
                <>
                  <p className="mt-10 font-bold">
                    🔥🔥🔥 We've minted your NFT and sent it to your wallet.
                    🔥🔥🔥
                  </p>
                  <p>
                    It may be blank right now, it can take a max of 10 min to
                    show up on OpenSea. Here's the link:
                  </p>
                  <a
                    className="text-blue-500"
                    href={openSeaNftAddress}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {openSeaNftAddress}
                  </a>
                </>
              ) : (
                ''
              )}
            </div>
          ) : (
            <button
              onClick={() => askContractToMintNft()}
              className="mt-5 rounded bg-cyan-900 py-2 px-4 font-bold text-white hover:bg-cyan-700"
            >
              Mint a Lorem Ipsum NFT 🔥
            </button>
          )}
        </div>
      )
    } else {
      return (
        <button
          className="mt-5 rounded border border-slate-500 bg-transparent py-2 px-4 font-semibold text-slate-700 hover:border-transparent hover:bg-slate-500 hover:text-white"
          onClick={() => connectWallet()}
        >
          Connect to Metamask 🦊
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

  const setupEventListener = async () => {
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

        // Listen to the event NewEpicNFTMinted.
        connectedContract.on('NewEpicNFTMinted', (from, tokenId) => {
          console.log(from, tokenId.toNumber())
          setOpenSeaNftAddress(
            `https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`
          )
        })

        console.log('Setup event listener!')
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
        <h1 className="text-4xl font-bold">Lorem Ipsum NFTs</h1>
        <h2 className="mt-3 text-2xl">On the Rinkeby network</h2>

        <p className="text-1xl mt-8 mb-5">
          Each unique. Each beautiful. Discover your NFT today.
        </p>

        <a
          href="https://testnets.opensea.io/collection/loremipsumnft-lu2fc2i7hq"
          target="_blank"
          className="mb-12 rounded bg-slate-900 py-2 px-4 font-bold text-white hover:bg-slate-700"
          rel="noopener noreferrer"
        >
          Check the collection on Opensea
        </a>

        {/* Add your render method here */}
        {hasMetamask ? renderNotConnectedContainer() : renderInstallMetamask()}
      </main>

      <footer className="flex h-24 w-full items-center justify-center border-t">
        <div className="flex items-center justify-center gap-2">
          NFT project
        </div>
      </footer>
    </div>
  )
}

export default Home
