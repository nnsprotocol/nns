import { gql, useQuery } from '@apollo/client'
import { Query } from '@apollo/client/react/components'
import styled from '@emotion/styled/macro'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import DomainItem from '../components/DomainItem/DomainItem'

import {
  GET_ERRORS,
  GET_FAVOURITES,
  GET_OWNER,
  GET_SINGLE_NAME,
  GET_SUBDOMAIN_FAVOURITES
} from '../graphql/queries'

import mq from 'mediaQuery'
import moment from 'moment'

import { InvalidCharacterError } from '../components/Error/Errors'
import LargeHeart from '../components/Icons/LargeHeart'
import { H2 as DefaultH2 } from '../components/Typography/Basic'
import { normaliseOrMark } from '../utils/utils'

const SelectAll = styled('div')`
  grid-area: selectall;
  display: flex;
  justify-content: flex-end;
  padding-right: 40px;
  margin: 2em 0;
`

const NoDomainsContainer = styled('div')`
  display: flex;
  padding: 40px;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: white;
  box-shadow: 3px 4px 6px 0 rgba(229, 236, 241, 0.3);
  border-radius: 6px;
  margin-bottom: 40px;

  h2 {
    color: #adbbcd;
    font-weight: 100;
    margin-bottom: 0;
    padding: 0;
    margin-top: 20px;
    text-align: center;
    max-width: 500px;
  }

  p {
    color: #2b2b2b;
    font-size: 18px;
    font-weight: 300;
    margin-top: 20px;
    line-height: 1.3em;
    text-align: center;
    max-width: 400px;
  }
`

const H2 = styled(DefaultH2)`
  margin-top: 50px;
  margin-left: 20px;
  ${mq.medium`
    margin-left: 0;
  `}
`

const NoDomains = () => {
  const { t } = useTranslation()
  return (
    <NoDomainsContainer>
      <LargeHeart />
      <h2>{t('favourites.nofavouritesDomains.title')}</h2>
      <p>{t('favourites.nofavouritesDomains.text')}</p>
    </NoDomainsContainer>
  )
}

function getDomainState(owner, available, reserved) {
  if (reserved) return 'Reserved'
  if (!owner || available) return 'Open'
  return parseInt(owner, 16) === 0 ? 'Open' : 'Owned'
}

const REACT_VAR_LISTENERS = gql`
  query reactiveVarListeners @client {
    isENSReady
  }
`

// export const useResetState = (setYears, setCheckedBoxes, setSelectAll) => {
//   const {
//     data: { networkId }
//   } = useQuery(RESET_STATE_QUERY)
//   useEffect(() => {
//     setYears(1)
//     setCheckedBoxes({})
//     setSelectAll(null)
//   }, [networkId])
// }

function Favourites() {
  const { t } = useTranslation()
  useEffect(() => {
    document.title = 'NNS Favourites'
  }, [])

  // let [years, setYears] = useState(1)
  // let [checkedBoxes, setCheckedBoxes] = useState({})
  // const [selectAll, setSelectAll] = useState(false)
  // const account = useAccount()

  // useResetState(setYears, setCheckedBoxes, setSelectAll)

  const { data: { favourites: favouritesWithUnnormalised } = [] } = useQuery(
    GET_FAVOURITES
  )
  const { data: { subDomainFavourites } = [] } = useQuery(
    GET_SUBDOMAIN_FAVOURITES
  )
  const {
    data: { isENSReady }
  } = useQuery(REACT_VAR_LISTENERS)
  const {
    data: { globalError }
  } = useQuery(GET_ERRORS)
  let favourites = normaliseOrMark(favouritesWithUnnormalised, 'name')
  if (globalError.invalidCharacter || !favourites) {
    return <InvalidCharacterError message={globalError.invalidCharacter} />
  }
  if (!isENSReady) {
    return ''
  }

  // const ids = favourites?.map(f => {
  //       try {
  //         return getNamehash(f.name)
  //       } catch (e) {
  //         console.error('Error getting favourite ids: ', e)
  //         return null
  //       }
  //     })?.filter(x => x) || [];

  // const { data: { registrations } = [], refetch } = useQuery(
  //   GET_REGISTRATIONS_BY_IDS_SUBGRAPH,
  //   {
  //     variables: { ids },
  //     fetchPolicy: 'no-cache',
  //     nextFetchPolicy: 'no-cache',
  //     context: {
  //       queryDeduplication: false
  //     }
  //   }
  // )

  if (!favourites || favourites.length === 0) {
    return <NoDomains />
  }
  // if (favourites.length > 0) {
  //   if (registrations && registrations.length > 0) {
  //     favouritesList = favourites.map(f => {
  //       try {
  //         let r = registrations.filter(
  //           a => a.domain.id === getNamehash(f.name)
  //         )[0]
  //         return {
  //           name: f.name,
  //           owner: r && r.registrant.id,
  //           available: getAvailable(r && r.expiryDate),
  //           expiryDate: r && r.expiryDate,
  //           hasInvalidCharacter: f.hasInvalidCharacter
  //         }
  //       } catch (e) {
  //         return {
  //           name: f.name,
  //           hasInvalidCharacter: true,
  //           available: false,
  //           expiryDate: false
  //         }
  //       }
  //     })
  //   } else {
  //     // Fallback when subgraph is not returning result
  //     favouritesList = favourites.map(f => {
  //       return {
  //         name: f.name,
  //         hasInvalidCharacter: f.hasInvalidCharacter
  //       }
  //     })
  //   }
  // }

  const hasFavourites =
    favourites?.length > 0 || subDomainFavourites?.length > 0
  if (!hasFavourites) {
    return (
      <FavouritesContainer data-testid="favourites-container">
        <H2>{t('favourites.favouriteTitle')}</H2>
        <NoDomains>
          <LargeHeart />
          <h2>{t('favourites.nofavouritesDomains.title')}</h2>
          <p>{t('favourites.nofavouritesDomains.text')}</p>
        </NoDomains>
      </FavouritesContainer>
    )
  }

  // const selectedNames = Object.entries(checkedBoxes)
  //   .filter(([key, value]) => value)
  //   .map(([key]) => key)

  // const allNames = favouritesList.map(f => f.name)
  // const selectAllNames = () => {
  //   const obj = favouritesList.reduce((acc, f) => {
  //     if (f.expiryDate) {
  //       acc[f.name] = true
  //     }
  //     return acc
  //   }, {})
  //   setCheckedBoxes(obj)
  // }
  // let data = []
  // const checkedOtherOwner =
  //   favouritesList.filter(
  //     f =>
  //       f.expiryDate &&
  //       f.owner !== account?.toLowerCase() &&
  //       checkedBoxes[f.name]
  //   ).length > 0
  // const canRenew = favouritesList.filter(f => f.expiryDate).length > 0
  return (
    <FavouritesContainer data-testid="favourites-container">
      <H2>{t('favourites.favouriteTitle')}</H2>
      {favourites &&
        favourites.map(domain => {
          return (
            <Query
              query={GET_SINGLE_NAME}
              variables={{ name: domain.name }}
              key={domain.name}
            >
              {({ loading, error, data }) => {
                console.log('data', domain.name, data, loading, error)
                if (error) {
                  return (
                    <div>{(console.log(error), JSON.stringify(error))}</div>
                  )
                }
                const isLoading = loading || !data.singleName?.name
                const d = isLoading ? { name: domain.name } : data.singleName
                return (
                  <DomainItem
                    loading={isLoading}
                    domain={d}
                    isSubDomain={true}
                    isFavourite={true}
                  />
                )
              }}
            </Query>
          )
          return (
            <DomainItem
              domain={{
                ...domain,
                state: getDomainState(
                  domain.owner,
                  domain.available,
                  domain.reserved
                ),
                owner: domain.owner
              }}
              isFavourite={true}
              checkedBoxes={checkedBoxes}
              setCheckedBoxes={setCheckedBoxes}
              setSelectAll={setSelectAll}
              key={domain.name}
              hasInvalidCharacter={domain.hasInvalidCharacter}
            />
          )
        })}
      {subDomainFavourites &&
        subDomainFavourites.map(domain => (
          <Query
            query={GET_OWNER}
            variables={{ name: domain.name }}
            key={domain.name}
          >
            {({ loading, error, data }) => {
              if (error)
                return <div>{(console.log(error), JSON.stringify(error))}</div>
              return (
                <DomainItem
                  loading={loading}
                  domain={{
                    ...domain,
                    state: getDomainState(data?.getOwner, false),
                    owner: data?.getOwner
                  }}
                  isSubDomain={true}
                  isFavourite={true}
                />
              )
            }}
          </Query>
        ))}
    </FavouritesContainer>
  )
}

const FavouritesContainer = styled('div')`
  padding-bottom: 60px;
`

export default Favourites