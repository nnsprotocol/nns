import React from 'react'
import styled from '@emotion/styled/macro'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import mq from 'mediaQuery'

import AddFavourite from '../AddFavourite/AddFavourite'
import { useAccount } from '../QueryAccount'
import ExpiryDate from './ExpiryDate'
import Loader from '../Loader'
import { humaniseName } from '../../utils/utils'
import Checkbox from '../Forms/Checkbox'
import warningImage from '../../assets/warning.svg'

const CheckBoxContainer = styled('div')`
  margin: 5px;
`

const Container = styled.div`
  &:before {
    content: '';
    background: ${p => {
      if (p.hasInvalidCharacter) return 'black'

      switch (p.state) {
        case 'Yours':
          return '#52E5FF'
        case 'Open':
          return '#42E068'
        case 'Auction':
        case 'Reveal':
          return 'linear-gradient(-180deg, #42E068 0%, #52E5FF 100%)'
        case 'Owned':
          return '#CACACA'
        case 'Forbidden':
          return 'black'
        case 'NotYetAvailable':
          return 'red'
        case 'Reserved':
          return 'red'
        default:
          return 'red'
      }
    }};

    width: 4px;
    height: 100%;
    position: absolute;
    left: 0;
    top: 0;
    z-index: 10;
  }

  position: relative;
  background-color: white;
  border-radius: 6px;
  box-shadow: 3px 4px 20px 0 rgba(144, 171, 191, 0.42);
  padding: ${p => (p.hasInvalidCharacter ? '20' : '0')}px;
  padding-left: 0px;
`

const DomainContainer = styled(Link)`
  padding: 20px;
  color: #2b2b2b;
  overflow: hidden;
  position: relative;
  background: ${({ percentDone }) =>
    percentDone
      ? `
  linear-gradient(to right, rgba(128, 255, 128, 0.1) 0%, rgba(82,229,255, 0.1) ${percentDone}%,#ffffff ${percentDone}%)`
      : 'white'};
  height: 65px;
  display: grid;
  height: auto;
  grid-template-columns: 1fr;
  grid-gap: 10px;
  align-items: center;
  font-size: 22px;
  margin-bottom: 4px;
  transition: 0.2s all;
  border-radius: 6px;

  ${mq.medium`
    grid-template-columns: 1fr minmax(150px,350px) 100px 50px 50px;
    grid-template-rows: 39px;
  `}

  color: #2b2b2b;
  z-index: 1;
  .label-container {
    display: flex;
  }

  &:visited {
    color: #2b2b2b;
  }
`

const RightContainer = styled('div')`
  display: flex;
  align-items: center;
`

const DomainName = styled('h2')`
  font-size: 18px;
  font-weight: 100;
  white-space: nowrap;
  font-family: "Londrina Solid";

  ${mq.medium`
    font-size: 28px;
  `}

  color: ${p => {
    switch (p.state) {
      case 'Yours':
      case 'Owned':
        return '#2b2b2b'
      default:
        return '#2b2b2b'
    }
  }};
`

const LabelContainer = styled('div')`
  margin-right: 20px;
  font-size: 16px;
  color: #ccd4da;
  display: none;
  align-items: center;
`

const LabelText = styled('div')``

const Label = ({ domain, isOwner }) => {
  const { t } = useTranslation()
  let text
  switch (domain.state) {
    case 'Open':
      text = t('singleName.domain.state.available')
      break
    case 'Auction':
      text = t('singleName.domain.state.auction')
      break
    case 'Owned':
      text = t('singleName.domain.state.owned')
      break
    case 'Reserved':
      text = 'Reserved'
      break
    default:
      text = t('singleName.domain.state.default')
  }

  if (isOwner) {
    text = t('singleName.domain.state.owned')
  }

  return (
    <LabelContainer className="label-container">
      <LabelText>{text}</LabelText>
    </LabelContainer>
  )
}

const WarningImg = styled('img')`
  width: 16px;
  height: 16px;
  margin-bottom: 4px;
  margin-right: 4px;
`

const WarningContainer = styled.div`
  font-size: 16px;
  display: flex;
  background-color: white;
  margin-top: -10px;
  margin-left: 2px;
  align-items: center;
  justify-content: flex-start;
  color: black;
  font-weight: 100;
  padding: 10px 0px 10px 20px;

  & a:hover {
    color: black;
  }
`

const Domain = ({
  domain,
  isSubDomain,
  className,
  isFavourite,
  loading,
  checkedBoxes = {},
  setCheckedBoxes,
  setSelectAll,
  hasInvalidCharacter
}) => {
  // if (loading) {
  //   return (
  // <DomainContainer state={'Owned'} className={className} to="">
  //   <Loader />
  // </DomainContainer>
  //   )
  // }
  if (!domain) domain = {}
  const account = useAccount()
  let isOwner = false
  if (!domain.available && domain.owner && parseInt(domain.owner, 16) !== 0) {
    isOwner =
      account &&
      domain.owner &&
      domain.owner.toLowerCase() === account.toLowerCase()
  }
  const percentDone = 0
  let expiryDate = domain.expiryDate
  if (domain.expiryTime) {
    expiryDate = parseInt(domain.expiryTime.getTime() / 1000)
  }

  function containerState() {
    if (isOwner) {
      return 'Yours'
    }
    if (domain.state) {
      return domain.state
    }
    return 'Owned'
  }

  return (
    <Container
      state={containerState()}
      hasInvalidCharacter={hasInvalidCharacter}
    >
      {hasInvalidCharacter && (
        <WarningContainer>
          <WarningImg src={warningImage} onClick={e => e.preventDefault()} />
          <span>
            <span onClick={e => e.preventDefault()}>
              This name is invalid.{' '}
            </span>
            {/* <a href="https://docs.ens.domains/frequently-asked-questions#what-about-foreign-characters-what-about-upper-case-letters-is-any-unicode-character-valid">
              Learn more
            </a> */}
          </span>
        </WarningContainer>
      )}
      <DomainContainer
        to={domain.name ? `/name/${domain.name}` : ''}
        className={className}
        percentDone={percentDone}
        data-testid={`domain-${domain.name}`}
      >
        <DomainName state={containerState()}>
          {humaniseName(domain.name ?? 'Loading...')}
        </DomainName>
        <ExpiryDate expiryDate={expiryDate} name={domain.name} />
        {!hasInvalidCharacter && domain.state && (
          <Label domain={domain} isOwner={isOwner} />
        )}
        <RightContainer>
          {domain.state && (
            <AddFavourite
              domain={domain}
              isSubDomain={isSubDomain}
              isFavourite={isFavourite}
            />
          )}
        </RightContainer>
        {!domain.state && <Loader />}
      </DomainContainer>
    </Container>
  )
}

export default Domain