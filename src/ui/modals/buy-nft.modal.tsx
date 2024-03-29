import abi from '@/abi/PX.json'
import useTranslation from 'next-translate/useTranslation'
import SyncBackdrop from '@/ui/backdrops/sync.backdrop'
import { FC, useState } from 'react'
import { INftPackage } from '@/components/share/types'
import { BigNumber } from 'ethers'
import { getWei } from '@/utils/helper'
import { toastify } from '@/utils/toastify'
import { doWriteContract } from '@/utils/contract'
import { Card, Modal, Spinner, Tabs } from 'flowbite-react'
import { useAccountContext } from '@/contexts/account/provider'
import { Button, Checkbox, Label, TextInput } from 'flowbite-react';

interface IBuyNftModalProps {
  show: boolean
  onClose: any
  tokenId: string
  nftSize: number
}

const BuyNftModal: FC<IBuyNftModalProps> = ({ show, onClose, tokenId, nftSize }) => {
  const { t } = useTranslation()
  const [getNfts, setGetNfts] = useState<boolean>(false)
  const [openSyncBackdrop, setOpenSyncBackdrop] = useState<boolean>(false)
  const [syncBackdropText, setSyncBackdropText] = useState<string>('')
  const { account } = useAccountContext()
  const [packageQuota, setPackageQuota] = useState('')
  const [price, setPrice] = useState('')
  const [formSubmitted, setFormSubmitted] = useState(false);

  const [nftPackages, setNftPackages] = useState<INftPackage[]>([
    { id: 1, size: 5, price: 0.005, disabled: false, processing: false, done: false },
    { id: 2, size: 10, price: 0.01, disabled: false, processing: false, done: false },
    { id: 3, size: 20, price: 0.02, disabled: false, processing: false, done: false },
    { id: 4, size: 100, price: 0.1, disabled: false, processing: false, done: false }
  ])

  const handleUpgradeStorageOnClick = async (nftPackage: INftPackage): Promise<void> => {
    if (nftSize < nftPackage.size) {
      setOpenSyncBackdrop(true)
      setSyncBackdropText(t('waitingForUserConfirmation'))
      setNftPackages(
        nftPackages.map((nftPackageObj: INftPackage) => ({
          ...nftPackageObj,
          disabled: true,
          processing: nftPackageObj.id === nftPackage.id
        }))
      )
        const upgradeTokenPackageRes = await doWriteContract(
            'upgradeTokenPackage',
            [parseInt(tokenId), nftPackage.id],
            { value: BigNumber.from(getWei(nftPackage.price)), gasLimit: BigNumber.from(4000000) },
            account.nfts[account.defaultNftIndex].contract.address,
            abi
        )
      if (!upgradeTokenPackageRes?.error) {
        setSyncBackdropText(t('waitingForBlockchainConfirmation'))
        await upgradeTokenPackageRes.wait(1)
        setNftPackages(
          nftPackages.map((nftPackageObj: INftPackage) => ({
            ...nftPackageObj,
            disabled: false,
            processing: false,
            done: nftPackageObj.id === nftPackage.id
          }))
        )
      } else {
        setNftPackages(
          nftPackages.map((nftPackageObj: INftPackage) => ({
            ...nftPackageObj,
            disabled: false,
            processing: false,
            done: false
          }))
        )
        toastify(`${upgradeTokenPackageRes.error.message} ${upgradeTokenPackageRes.error?.data?.message || ''}`, 'error')
      }
      setOpenSyncBackdrop(false)
    }
  }

  const handleMintNewStorageOnClick = async (nftPackage: INftPackage): Promise<void> => {
    setOpenSyncBackdrop(true)
    setSyncBackdropText(t('waitingForUserConfirmation'))
    setNftPackages(
      nftPackages.map((nftPackageObj: INftPackage) => ({
        ...nftPackageObj,
        disabled: true,
        processing: nftPackageObj.id === nftPackage.id
      }))
    )
    const mintRes = await doWriteContract('mint', [nftPackage.id], { value: BigNumber.from(getWei(nftPackage.price)) }, account.nfts[account.defaultNftIndex].contract.address, abi)
    if (!mintRes?.error) {
      setSyncBackdropText(t('waitingForBlockchainConfirmation'))
      await mintRes.wait(1)
      setNftPackages(
        nftPackages.map((nftPackageObj: INftPackage) => ({
          ...nftPackageObj,
          disabled: false,
          processing: false,
          done: nftPackageObj.id === nftPackage.id
        }))
      )
      setGetNfts(true)
    } else {
      setNftPackages(
        nftPackages.map((nftPackageObj: INftPackage) => ({
          ...nftPackageObj,
          disabled: false,
          processing: false,
          done: false
        }))
      )
      toastify(`${mintRes.error.message} ${mintRes.error?.data?.message || ''}`, 'error')
    }
    setOpenSyncBackdrop(false)
  }
    const formatValue = (value) => {
        return value.replace(',', '.');
    };

    const handleAddNewPackage = async () => {
        if (price && packageQuota) {
            const formattedPrice = formatValue(price);
            console.log(BigNumber.from(getWei(formattedPrice)))

            setOpenSyncBackdrop(true)
            setSyncBackdropText(t('waitingForUserConfirmation'))

            const addNewRes = await doWriteContract('addNewPackage', [BigNumber.from(getWei(formattedPrice)), packageQuota], "", account.nfts[account.defaultNftIndex].contract.address, abi)
            if (!addNewRes?.error) {
                setSyncBackdropText(t('waitingForBlockchainConfirmation'))
                await addNewRes.wait(1)
                console.log('Addedd:', { packageQuota, price });
                setPackageQuota('');
                setPrice('');
                setOpenSyncBackdrop(false)
                setFormSubmitted(true)
            }

            console.log('Submitted:', { packageQuota, formattedPrice });
        }
    };

  return (
    <>
      <Modal show={show} position='bottom-left' onClose={() => onClose(true, getNfts)}>
        <Modal.Header className='dark:bg-neutral-800 dark:border-gray-700 modalHeader'>{t('pollinationXStorageNft')}</Modal.Header>
        <Modal.Body className='dark:bg-neutral-800'>
          <div className='space-y-6 p-3 overflow-x-scroll '>
            <Tabs.Group style='default' className='tabsItem'>
              <Tabs.Item active={true} title={t('upgradeStorage')}>
                <div className='grid grid-cols-2 gap-2'>
                  {nftPackages.map((nftPackage: INftPackage) => (
                    <Card key={nftPackage.id}>
                      <h5 className='text-2xl font-bold tracking-tight text-gray-900 dark:text-white'>{nftPackage.size} GB</h5>
                      <p className='font-normal text-gray-700 dark:text-gray-400'>
                        {t('price')}: {nftPackage.price} MATIC
                      </p>
                      <p className='font-normal text-gray-700 dark:text-gray-400'>
                        <button
                          disabled={nftPackage.disabled}
                          onClick={() => handleUpgradeStorageOnClick(nftPackage)}
                          type='button'
                          className={`cursor-pointer relative inline-flex items-center justify-center p-0.5 mb-2 mr-2
                                                    overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br
                                                    from-pollinationx-honey to-pollinationx-purple group-hover:from-pollinationx-honey group-hover:to-pollinationx-purple
                                                    hover:text-white dark:text-white focus:outline-none focus:ring-0
                                                    dark:focus:ring-blue-800 ${nftSize >= nftPackage.size ? 'opacity-70 pointer-events-none' : ''}`}
                        >
                          <span className='relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-neutral-900 rounded-md group-hover:bg-opacity-0'>
                            {!nftSize || nftSize < nftPackage.size ? (
                              <>
                                {nftPackage.processing ? <Spinner className='mr-3' /> : ''}{' '}
                                {t(nftPackage.processing ? 'upgrading' : nftPackage.done ? 'upgraded' : 'upgradeStorage')}
                              </>
                            ) : (
                              t('upgraded')
                            )}
                          </span>
                        </button>
                      </p>
                    </Card>
                  ))}
                </div>
              </Tabs.Item>
              <Tabs.Item title={t('mintNewStorageNft')}>
                <div className='grid grid-cols-2 gap-2'>
                  {nftPackages.map((nftPackage: INftPackage) => (
                    <Card key={nftPackage.id}>
                      <h5 className='text-2xl font-bold tracking-tight text-gray-900 dark:text-white'>{nftPackage.size} GB</h5>
                      <p className='font-normal text-gray-700 dark:text-gray-400'>
                        {t('price')}: {nftPackage.price} MATIC
                      </p>
                      <p className='font-normal text-gray-700 dark:text-gray-400'>
                        <button
                          onClick={() => handleMintNewStorageOnClick(nftPackage)}
                          type='button'
                          className='cursor-pointer relative inline-flex items-center justify-center p-0.5 mb-2 mr-2
                                                    overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br
                                                    from-pollinationx-honey to-pollinationx-purple group-hover:from-pollinationx-honey group-hover:to-pollinationx-purple
                                                    hover:text-white dark:text-white focus:outline-none focus:ring-0
                                                    dark:focus:ring-blue-800'
                        >
                          <span className='relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-neutral-900 rounded-md group-hover:bg-opacity-0'>
                            {nftPackage.processing ? <Spinner className='mr-3' /> : ''}{' '}
                            {t(nftPackage.processing ? 'minting' : nftPackage.done ? 'minted' : 'mintNew')}
                          </span>
                        </button>
                      </p>
                    </Card>
                  ))}
                </div>
              </Tabs.Item>
                {account.address == account.contractOwner ? (
              <Tabs.Item title={t('addNewPackage')}>
                  {formSubmitted ? (
                      <div>
                          <p className='text-gray-900 dark:text-white'>Form submitted successfully!</p>
                      </div>
                  ) : null}
                <div className='grid grid-cols-2 gap-2'>
                    <form className="flex max-w-md flex-col gap-4">
                        <div>
                            <div className="mb-2 block">
                                <Label
                                    htmlFor="price1"
                                    value="Price"
                                />
                            </div>
                            <TextInput
                                id="price1"
                                required
                                onBlur={(e) => setPrice(e.target.value)}
                                type="text"
                            />
                        </div>
                        <div>
                            <div className="mb-2 block">
                                <Label
                                    htmlFor="size1"
                                    value="Size"
                                />
                            </div>
                            <TextInput
                                id="size1"
                                required
                                onBlur={(e) => setPackageQuota(e.target.value)}
                                type="text"
                            />
                        </div>
                        <Button
                            onClick={() => handleAddNewPackage()}
                            type='button'
                        >
                            Submit
                        </Button>
                    </form>
                </div>
              </Tabs.Item>
                ) :
                    <Tabs.Item disabled title="">
                    </Tabs.Item>
                }
            </Tabs.Group>
          </div>
        </Modal.Body>
        <Modal.Footer className='dark:bg-neutral-800 dark:border-0'></Modal.Footer>
      </Modal>
      <SyncBackdrop open={openSyncBackdrop} text={syncBackdropText} />
    </>
  )
}

export default BuyNftModal
