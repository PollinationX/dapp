import React, {Component} from 'react';
import {observer} from "mobx-react";
import Web3 from 'web3';

const {createAlchemyWeb3} = require("@alch/alchemy-web3");
const {Utils} = require("alchemy-sdk");
import contractABI from '../abi/PX.json';

const alchemyKey = process.env.GOERLI_ALCHEMY_API_URL;
const contractAddress = process.env.NFT_COLLECTION_CONTRACT;
const apiEndpoint = process.env.API_ENDPOINT;
const web3 = createAlchemyWeb3(alchemyKey);
const minimumStorage = process.env.MINIMUM_STORAGE;
const mintPrice = process.env.STORAGE_PRICE;
const collectionUrl = process.env.NFT_COLLECTION_URL;

class NFTLogin extends Component {

    constructor(props) {
        super(props)
        this.state = {
            wallet: "",
            notAgree: true,
            storageSize: 1,
            chain: null,
            connected: false,
            message: "Get PollinationX Credentials / Check Usage",
            copySuccess: [],
            nfts: []
        }

        this.web3utils = new Web3(Web3.givenProvider).utils
    }

    copyToClipBoard = async copyMe => {
        try {
            await navigator.clipboard.writeText(copyMe);
            this.setState({copySuccess: "Copied!"})
        } catch (err) {
            this.setState({copySuccess: "Failed to copy!"})
        }
    };
    scrollTo = () => {
        const divElement = document.getElementById('credentials');
        divElement.scrollIntoView({behavior: 'smooth'});
    }
    checkboxHandler = () => {
        this.setState({
            notAgree: !this.state.notAgree
        })
        console.log("asffsa");
        // if agree === true, it will be set to false
        // if agree === false, it will be set to true
        // this.setState({copySuccess: "Failed to copy!"})
        // Don't miss the exclamation mark
    }
    onHandleChangeNumeric = e => {

        const regex = /^[0-9\b]+$/;
        const value = e.target.value;
        if (value === '' || regex.test(value)) {
            this.setState({[e.target.name]: value});
        }
    };
    handleInputBlur = e => {
        const value = e.target.value;
        if (value === '' || value < minimumStorage) {
            this.setState({[e.target.name]: minimumStorage});
        }
    };

    async componentDidMount() {
        try {
            const chain = await ethereum.request({method: 'eth_chainId'});
            this.setState({chain})
        } catch (e) {
            if (!ethereum) return alert('Please install metamask')
        }
    }

    connectWallet = async () => {
        if (!ethereum) return console.error('Please install metamask')
        try {
            const connected = await ethereum.request({method: 'eth_requestAccounts'})
            if (connected && Array.isArray(connected) && connected.length > 0) {
                this.setState({
                    wallet: connected[0],
                    connected: true
                })
            } else {
                console.error('Login => fail wallet connect ', connected);
            }
        } catch (e) {
            console.error("Login => connect wallet e", e)
        }
    }

    mintNFT = async () => {
        let cost = mintPrice * this.state.storageSize;
        window.contract = await new web3.eth.Contract(contractABI, contractAddress);

        const transactionParameters = {
            to: contractAddress,
            from: window.ethereum.selectedAddress,
            value: Utils.parseEther(cost.toString()).toHexString(),
            data: window.contract.methods.mint(this.state.storageSize).encodeABI()
        };

        try {
            const txHash = await window.ethereum.request({
                method: "eth_sendTransaction",
                params: [transactionParameters]
            });
            return {
                success: true,
                status:
                    "TX: " +
                    txHash,
            };
        } catch (error) {
            return {
                success: false,
                status: "Something went wrong: " + error.message,
            };
        }
    };

    fetchNFTs = async (e) => {
        if (e && e.preventDefault) e.preventDefault()
        const {connected} = this.state
        if (!connected) {
            const connection = await this.connectWallet()
            if (!connection) return console.error('Login => connection to wallet failed')
        }
        const {message, wallet, chain} = this.state
        const web3 = new Web3(Web3.givenProvider);
        const nonce = message
        let signature = await web3.eth.personal.sign(nonce, wallet, "log in")
        let res = await fetch(`${apiEndpoint}/login?${new URLSearchParams({wallet, chain, nonce, signature})}`, {
            method: 'GET',
            headers: {'Content-Type': 'application/json'}
        })
        res = await res.json()
        if (res.success && Array.isArray(res.nfts)) {
            this.setState({nfts: res.nfts, count: res.totalCount})
            if (res.totalCount > 0) {
                setTimeout(() => {
                    this.scrollTo();
                }, 1000);

            }
        }
    }


    render() {
        const {chain, wallet, nfts, count} = this.state
        return (
            <div className="isolate">
                <div className="px-6 pt-6 lg:px-8">
                    <nav className="flex items-center justify-between" aria-label="Global">
                        <div className="flex lg:flex-1">
                            <a href="#" className="-m-1.5 p-1.5">
                                <span className="sr-only">PollinationX</span>
                                <img className="h-14" src="/img/pollinationxAsset_1.png" alt="PollinationX Logo"/>
                            </a>
                        </div>
                    </nav>
                </div>
                <main>
                    <div className="relative px-6 lg:px-8">
                        <div className="mx-auto max-w-2xl py-32">
                            <div className="text-center p-40 pt-20 bg-black-pollinationx/95" style={{borderRadius: 10}}>
                                {!wallet && (
                                    <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
                                        PollinationX
                                    </h1>)}
                                {wallet && (
                                    <div>
                                        <a target="_blank" href="https://wiki.pollinationx.io"
                                           className="text-sm mb-5 font-semibold leading-6 text-honey-pollinationx">
                                            Learn more <span aria-hidden="true">→</span>
                                        </a>
                                        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-4xl">
                                            Mint Storage dNFT
                                        </h1>
                                    </div>
                                )}
                                {!wallet && (
                                    <div className="w-full text-center">
                                        <p className="mt-6 text-lg leading-8 text-honey-pollinationx">
                                            DECENTRALIZED STORAGE ON DEMAND<br/>
                                            <label className="text-white text-sm">Live Beta on Polygon (Mumbai) Testnet</label>
                                        </p>
                                    </div>
                                )}
                                {wallet && (
                                    <p className="mt-6 text-lg leading-8 text-honey-pollinationx">
                                        Pricing: 1GB = {mintPrice} MATIC
                                    </p>
                                )}
                                {wallet && (
                                    <div>
                                        <p className="mt-6 text-lg leading-8 text-white text-xs">
                                            How much storage in GB do you want to mint?
                                        </p>
                                        <div className="w-full">
                                            <input
                                                type="text"
                                                name="storageSize"
                                                id="storageSize"
                                                value={this.state.storageSize}
                                                onChange={this.onHandleChangeNumeric}
                                                onBlur={this.handleInputBlur}
                                                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                            />
                                        </div>
                                        <div>
                                            <button
                                                type="button"
                                                onClick={this.mintNFT}
                                                className="mt-10 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-black-pollinationx bg-honey-pollinationx hover:bg-white hover:text-black-pollinationx focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                            >
                                                Mint storage NFT
                                            </button>
                                        </div>
                                    </div>
                                )}
                                <div className="mt-10 flex items-center justify-center gap-x-6">
                                    {!wallet && (
                                        <div>
                                            <p>
                                                <input onChange={this.checkboxHandler} id="agree-checkbox" type="checkbox" value=""
                                                       className="w-4 h-4 text-honey-pollinationx bg-gray-100 border-gray-300 rounded focus:ring-honey-pollinationx dark:focus:ring-honey-pollinationx dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"/>
                                                    <label htmlFor="agree-checkbox"
                                                           className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"> I agree to <a className="text-honey-pollinationx" target="_blank" href="https://github.com/immu3-io/static-assets/raw/main/pdf/2023-02-20_CR_Systems_Privacy_Policy.pdf">Privacy Policy</a> and <a className="text-honey-pollinationx" target="_blank" href="https://github.com/immu3-io/static-assets/raw/main/pdf/2023-02-20_CR_Systems_Website_Terms.pdf">Software Terms</a></label>
                                            </p>
                                            <button
                                                disabled={this.state.notAgree}
                                                type="button"
                                                onClick={this.connectWallet}
                                                className="mt-5 disabled:opacity-25 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-black-pollinationx bg-white hover:bg-honey-pollinationx hover:text-black-pollinationx focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                            >
                                                Connect Wallet
                                            </button>
                                            <a target="_blank" href="https://wiki.pollinationx.io"
                                               className="ml-4 text-sm font-semibold leading-6 text-honey-pollinationx">
                                                Learn more <span aria-hidden="true">→</span>
                                            </a>
                                        </div>
                                    )}
                                    {wallet && (
                                        <button
                                            type="button"
                                            onClick={this.fetchNFTs}
                                            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-black-pollinationx bg-white hover:bg-honey-pollinationx hover:text-black-pollinationx focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                        >
                                            Get Credentials / Check Usage
                                        </button>
                                    )}

                                </div>
                            </div>
                        </div>
                    </div>
                    <div id="credentials" className="bg-black-pollinationx">
                        {nfts.length > 0 && nfts.slice(0).reverse().map(nft => (
                            <div key={`${nft.contract.address}-${nft.id.tokenId}`} className="pt-0">
                                <div
                                    className="mx-auto max-w-2xl px-4 pt-10 sm:px-6 lg:grid lg:max-w-7xl lg:grid-cols-3 lg:grid-rows-[auto,auto,1fr]">
                                    <div className="lg:col-span-2 lg:border-r lg:border-gray-400 lg:pr-8">
                                        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                                            {nft.title} ({this.web3utils?.hexToNumber(nft.id.tokenId)})
                                        </h1>
                                        <div className="py-10 lg:col-span-2 lg:col-start-1 lg:pt-6 lg:pb-16 lg:pr-8">
                                            <div>
                                                <div className="space-y-6">
                                                    <p className="text-base text-white">API endpoint: {nft.endpoint}</p>
                                                </div>
                                            </div>

                                            <div className="mt-10">
                                                <h3 className="text-sm font-medium text-white">

                                                    AUTH token (Click to copy)

                                                    <textarea onClick={() => this.copyToClipBoard(nft.jwt)}
                                                              className="
                      form-control
                      block
                      w-full
                      px-3
                      py-1.5
                      text-base
                      font-normal
                      text-honey-pollinationx
                      bg-black-pollinationx bg-clip-padding
                      rounded
                      transition
                      ease-in-out
                      m-0
                      mt-10
                      focus:border-blue-600 focus:outline-none"
                                                              id="exampleFormControlTextarea1"
                                                              rows="10"
                                                              defaultValue={nft.jwt}
                                                              placeholder="AUTH token"
                                                    ></textarea>
                                                </h3>

                                                <div className="mt-4">
                                                    <ul role="list" className="list-disc space-y-2 pl-4 text-sm">

                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </div>


                                    <div class="flex items-center justify-center">
                                        <div class="my-10 w-72 bg-gray-800 p-5 rounded-md shadow-xl">
                                            {nft?.media?.length > 0 && nft.media.map(m => (
                                                <img key={m.raw} src={m.gateway}
                                                     className="h-full w-full object-cover object-center"/>))}
                                            <h2 class="text-md font-bold text-honey-pollinationx mt-3">{nft.title} ({this.web3utils?.hexToNumber(nft.id.tokenId)})</h2>
                                            <p class="text-gray-400 text-sm mb-2">
                                                {nft.description}
                                            </p>
                                            <div class="flex justify-between items-center text-sm">
                                                <p class="text-white font-bold">
                                                    {nft.metadata.attributes[1].trait_type}: {nft.metadata.attributes[1].value}
                                                </p>
                                                <p class="text-white">
                                                    {nft.metadata.attributes[0].trait_type}: {nft.metadata.attributes[0].value}%
                                                </p>
                                            </div>
                                            <p class="bg-gray-600 h-[0.5px] w-full my-2"></p>
                                            <div class="flex items-center">
                                                <img src="/img/favicon.png" alt="PollinationX"
                                                     className="h-8 w-8 rounded-full mr-2"/>
                                                <p class="text-gray-400 text-[12px]">
                                                    Created by <a href={collectionUrl} target="_black"
                                                                  rel="no-opener"
                                                                  className="text-white font-bold">PollinationX</a>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </main>


            </div>

        )
    }
}

export default observer(NFTLogin);
