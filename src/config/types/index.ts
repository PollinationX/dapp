export interface IAppConfig {
  locale: string
}

export interface IAuthGuardOptions {
  publicPaths: string[]
}

export interface INetworkOptions {
  explorerUrl: string
}

export interface INftConfig {
  contract: string
}

interface IPollinationXAuthOptions {
  message: string
}

export interface IPollinationXConfig {
  url: string
  auth: IPollinationXAuthOptions
  newNft: IPollinationXAuthOptions
}
