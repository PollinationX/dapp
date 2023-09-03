export interface IAppConfig {
  locale: string
}

export interface IAuthGuardOptions {
  publicPaths: string[]
}

interface IPollinationXAuthOptions {
  message: string
}

export interface IPollinationXConfig {
  url: string
  auth: IPollinationXAuthOptions
  newNft: IPollinationXAuthOptions
}
