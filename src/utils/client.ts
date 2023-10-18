import axios, { AxiosInstance } from 'axios'
import { pollinationXConfig } from '@/config'
import { polygonMumbai } from 'wagmi/chains'
import { configureChains, createClient } from 'wagmi'
import { EthereumClient, w3mConnectors, w3mProvider } from '@web3modal/ethereum'
import { Chain } from 'wagmi'

const artheraTestnet = {
  id: 10243,
  name: 'Arthera Testnet',
  network: 'Arthera Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Arthera Testnet',
    symbol: 'AA'
  },
  rpcUrls: {
    public: { http: ['https://rpc-test.arthera.net/'] },
    default: { http: ['https://rpc-test.arthera.net/'] }
  },
  blockExplorers: {
    etherscan: { name: 'Arthera Testnet', url: 'https://explorer-test.arthera.net' },
    default: { name: 'Arthera Testnet', url: 'https://explorer-test.arthera.net' }
  }
} as const satisfies Chain

const sepolia = {
  id: 11155111,
  name: 'Sepolia',
  network: 'sepolia',
  nativeCurrency: {
    decimals: 18,
    name: 'Sepolia Ether',
    symbol: 'SEP'
  },
  rpcUrls: {
    public: { http: ['https://eth-sepolia.g.alchemy.com/v2/zZVxJK0XZZZIOH1SAOfS9Kz2Q6mqF2OA'] },
    default: { http: ['https://eth-sepolia.g.alchemy.com/v2/zZVxJK0XZZZIOH1SAOfS9Kz2Q6mqF2OA'] }
  },
  blockExplorers: {
    etherscan: { name: 'Etherscan', url: 'https://sepolia.etherscan.io' },
    default: { name: 'Etherscan', url: 'https://sepolia.etherscan.io' }
  }
} as const satisfies Chain

const immu3Testnet = {
  id: 3100,
  name: 'Immu3 EVM TestNet',
  network: 'Immu3 EVM TestNet',
  nativeCurrency: {
    decimals: 18,
    name: 'IMMU',
    symbol: 'IMMU'
  },
  rpcUrls: {
    public: { http: ['https://fraa-dancebox-3043-rpc.a.dancebox.tanssi.network/'] },
    default: { http: ['https://fraa-dancebox-3043-rpc.a.dancebox.tanssi.network/'] }
  },
  blockExplorers: {
    etherscan: { name: 'Immu3 EVM TestNet', url: 'https://polkadot.js.org/apps/?rpc=wss://fraa-dancebox-3043-rpc.a.dancebox.tanssi.network#/explorer' },
    default: { name: 'Immu3 EVM TestNet', url: 'https://polkadot.js.org/apps/?rpc=wss://fraa-dancebox-3043-rpc.a.dancebox.tanssi.network#/explorer' }
  }
} as const satisfies Chain

const projectId = process.env.WALLET_CONNECT_PROJECT_ID
const chains = [polygonMumbai, artheraTestnet, sepolia, immu3Testnet]
const { provider, webSocketProvider } = configureChains(chains, [w3mProvider({ projectId: process.env.WALLET_CONNECT_PROJECT_ID })])

export const client = createClient({
  autoConnect: true,
  connectors: w3mConnectors({
    chains,
    version: 2,
    projectId: projectId
  }),
  provider,
  webSocketProvider
})
export const ethereumClient: EthereumClient = new EthereumClient(client, chains)

export const httpClient: AxiosInstance = axios.create({
  baseURL: pollinationXConfig.url
})
