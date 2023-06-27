import useTranslation from 'next-translate/useTranslation'
import React, { FC, useState } from 'react'
import { useAccountContext } from '@/contexts/account/provider'
import { HiRefresh } from 'react-icons/hi'
import { Tooltip } from 'flowbite-react'
import * as _ from 'lodash'
import { getNftMetadata } from '@/utils/alchemy'
import { useIndexedDBContext } from '@/contexts/indexed-db/provider'

const Main: FC = () => {
  const { t } = useTranslation()
  const { account, setAccount } = useAccountContext()
  const { indexedDB } = useIndexedDBContext()
  const [refreshMetadataProgress, setRefreshMetadataProgress] = useState([])

  const handleRefreshNftMetadataOnClick = async (id): Promise<void> => {
    setRefreshMetadataProgress(prevState => {
      const updatedState = [...prevState]
      updatedState[id] = true
      return updatedState
    })
    const nftMetadataRes = await getNftMetadata(Number(account.nfts[id].id.tokenId))
    if (!nftMetadataRes?.error) {
      account.nfts[id].media = nftMetadataRes.media
      account.nfts[id].metadata.attributes = nftMetadataRes.rawMetadata.attributes
      account.nfts[id].timeLastUpdated = nftMetadataRes.timeLastUpdated
      await indexedDB.put(account)
      setAccount(_.cloneDeep(account))
    }
    setRefreshMetadataProgress(prevState => {
      const updatedState = [...prevState]
      updatedState[id] = false
      return updatedState
    })
  }
  return (
    <div className='h-max pt-14 sm:ml-64 bg-neutral-50 dark:bg-neutral-800 mt-16 p-52'>
      <h1 className='text-4xl font-extrabold dark:text-pollinationx-honey text-center mb-10'>{t('yourPxNftCollection')}</h1>
      <div className='grid grid-cols-3 gap-3'>
        {account.nfts
          .slice()
          .reverse()
          .map((nft, index) => (
            <div className='mb-10' key={nft.id.tokenId}>
              <div className='flex items-center justify-center'>
                <div className='relative bg-neutral-800 p-3 shadow-xl'>
                  <div className='absolute right-4 mt-1'>
                    <Tooltip
                      content={t('refreshMetadata')}
                      animation='duration-300'
                      placement='left'
                      arrow={false}
                      className='mt-3 bg-gradient-to-br from-pollinationx-purple to-gray-700 dark:bg-gradient-to-br opacity-90'
                    >
                      <HiRefresh
                        onClick={() => handleRefreshNftMetadataOnClick(account.nfts.length - index - 1)}
                        className={`text-2xl ml-4 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white float-right cursor-pointer 
                        ${refreshMetadataProgress[account.nfts.length - index - 1] ? 'animate-spin' : ''}`}
                      />
                    </Tooltip>
                  </div>
                  <img src={nft?.media[0]?.raw} className='w-full object-cover object-center' alt='' />
                  <h2 className='text-md font-bold text-pollinationx-honey mt-3'>{nft?.title}</h2>
                  <p className='text-gray-400 text-xs mb-2'>{nft?.description}</p>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  )
}

export default Main
