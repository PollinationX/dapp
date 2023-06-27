import { fetchSigner, Signer } from '@wagmi/core'

export let signer: Signer

export const setSigner = async (): Promise<void> => {
  signer = await fetchSigner()
}
