import { IAppConfig, IAuthGuardOptions, INetworkOptions, INftConfig, IPollinationXConfig } from '@/config/types'
import { ThemeCtrlState } from '@web3modal/core/dist/_types/src/types/controllerTypes'

export const themeConfig: ThemeCtrlState = {
  themeMode: 'dark',
  themeVariables: {
    '--w3m-accent-color': '#888888',
    '--w3m-background-color': 'black'
  }
}

export const appConfig: IAppConfig = {
  locale: 'en'
}

export const authGuardOptions: IAuthGuardOptions = {
  publicPaths: ['/']
}
export const networkOptions: INetworkOptions = {
  explorerUrl: 'https://mumbai.polygonscan.com/tx/'
}

export const nftConfig: INftConfig = {
  contract: process.env.NFT_COLLECTION_CONTRACT
}

export const pollinationXConfig: IPollinationXConfig = {
  url: process.env.STORAGE_NODE_URL,
  auth: {
    message: 'This request will check your PollinationX (PX) storage NFTs and it will not trigger a blockchain transaction or cost any gas fees.'
  },
  newNft: {
    message: 'This request will check your PollinationX (PX) storage NFTs and it will not trigger a blockchain transaction or cost any gas fees.'
  }
}
