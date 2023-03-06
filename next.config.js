/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    env: {
      NFT_COLLECTION_CONTRACT: process.env.NFT_COLLECTION_CONTRACT,
      GOERLI_ALCHEMY_API_URL: process.env.GOERLI_ALCHEMY_API_URL,
      API_ENDPOINT: process.env.API_ENDPOINT,
      MINIMUM_STORAGE: process.env.MINIMUM_STORAGE,
      STORAGE_PRICE: process.env.STORAGE_PRICE,
      NFT_COLLECTION_URL: process.env.NFT_COLLECTION_URL
    },
    future: {
      webpack5: true
    },
    webpack(config) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false
      }

      return config
    }
  }

  module.exports = nextConfig
