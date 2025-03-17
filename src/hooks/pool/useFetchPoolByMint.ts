import { ApiV3PoolInfoItem, FetchPoolParams, PoolFetchType, PoolsApiReturn, solToWSol } from '@gravexio/gravex-sdk'
import { AxiosResponse } from 'axios'
import { useCallback, useMemo } from 'react'
import { KeyedMutator } from 'swr'
import useSWRInfinite, { SWRInfiniteKeyedMutator } from 'swr/infinite'
import shallow from 'zustand/shallow'

import axios from '@/api/axios'
import { useAppStore } from '@/store'
import { MINUTE_MILLISECONDS } from '@/utils/date'

import { formatAprData, formatPoolData } from './formatter'
import { ReturnFormattedPoolType, ReturnPoolType } from './type'

export default function useFetchPoolByMint<T extends PoolFetchType>(
  props: {
    shouldFetch?: boolean
    showFarms?: boolean
    mint1?: string
    mint2?: string
    poolId?: string
    refreshInterval?: number
    type?: T
  } & Omit<FetchPoolParams, 'type'>
): {
  selectedPool?: ReturnPoolType<T>
  data: ReturnPoolType<T>[]
  formattedData: ReturnFormattedPoolType<T>[]
  formattedSelectedPool?: ReturnPoolType<T>
  isLoadEnded: boolean
  loadMore: () => void
  size: number
  //mutate: KeyedMutator<AxiosResponse<PoolsApiReturn, any>[]>
  mutate: SWRInfiniteKeyedMutator<AxiosResponse<PoolsApiReturn, any>[]> // ✅ Use correct SWR Infinite Mutator Type TEW may cause issues
  isValidating: boolean
  isLoading: boolean
} {
  const {
    shouldFetch = true,
    showFarms,
    mint1: propMint1 = '',
    mint2: propMint2 = '',
    type = PoolFetchType.All,
    sort = 'default',
    order = 'desc',
    pageSize = 100,
    refreshInterval = MINUTE_MILLISECONDS,
    poolId
  } = props || {}

  const fetcher = useCallback(
    (url: string) =>
      axios.get<PoolsApiReturn>(url, {
        skipError: true
      }),
    []
  )

  const [mint1, mint2] = [propMint1 ? solToWSol(propMint1).toBase58() : propMint1, propMint2 ? solToWSol(propMint2).toBase58() : propMint2]
  const [host, mintUrl] = useAppStore((s) => [s.urlConfigs.BASE_HOST, s.urlConfigs.POOL_SEARCH_MINT], shallow)
  const [baseMint, quoteMint] = mint2 && mint1 > mint2 ? [mint2, mint1] : [mint1, mint2]
  const url = (!mint1 && !mint2) || !shouldFetch ? null : host + mintUrl

  const { data, setSize, error, ...swrProps } = useSWRInfinite(
    (index) =>
      url
        ? url +
          `?mint1=${baseMint}&mint2=${quoteMint}&poolType=${
            showFarms ? `${type}Farm` : type
          }&poolSortField=${sort}&sortType=${order}&pageSize=${pageSize}&page=${index + 1}`
        : url,
    fetcher,
    {
      dedupingInterval: refreshInterval,
      focusThrottleInterval: refreshInterval,
      refreshInterval
    }
  )

  const loadMore = useCallback(() => setSize((s) => s + 1), [type, sort, order])

  const resData = useMemo(
    () =>
      (data || []).reduce((acc, cur) => acc.concat(cur?.data?.data || []).filter(Boolean), [] as ApiV3PoolInfoItem[]).map(formatAprData),
    [data]
  ) as ReturnPoolType<T>[]
  const formattedData = useMemo(() => resData.map((i) => formatPoolData(i)), [resData]) as ReturnFormattedPoolType<T>[]
  const selectedPool = resData && poolId ? (resData.find((d) => d.id === poolId) as ReturnPoolType<T>) : undefined
  const isLoadEnded = !swrProps.isLoading && (!resData.length || !!error)

  return {
    selectedPool,
    data: resData,
    formattedData,
    formattedSelectedPool: selectedPool ? (formatPoolData(selectedPool as ApiV3PoolInfoItem) as ReturnFormattedPoolType<T>) : undefined,
    isLoadEnded,
    loadMore,
    ...swrProps
  }
}
