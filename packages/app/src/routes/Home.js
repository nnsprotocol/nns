import React from 'react'
import { useQuery } from '@apollo/client'
import { Link } from 'react-router-dom'
import styled from '@emotion/styled/macro'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import mq from 'mediaQuery'

import SearchDefault from '../components/SearchName/Search'
import NoAccountsDefault from '../components/NoAccounts/NoAccountsModal'
import bgMobile from '../assets/nns/bg-mobile.jpg'
import bg from '../assets/nns/bg.jpg'
import TextBubbleDefault from '../components/Icons/TextBubble'
import QuestionMarkDefault from '../components/Icons/QuestionMark'
import Alice from '../components/HomePage/Alice'
import HowToUseDefault from '../components/HowToUse/HowToUse'
import { ExternalButtonLink } from '../components/Forms/Button'
import { aboutPageURL } from '../utils/utils'
import { connectProvider, disconnectProvider } from '../utils/providerUtils'
import { gql } from '@apollo/client'

import bgBlue from '../assets/nns/bg-blue.jpg'
import bgYellow from '../assets/nns/bg-yellow.jpg'
import bgPink from '../assets/nns/bg-pink.jpg'
import bgGreen from '../assets/nns/bg-green.jpg'

import imBall from '../components/HomePage/images/nns/ball.svg'
import imMonitor from '../components/HomePage/images/nns/monitor.svg'
import imPig from '../components/HomePage/images/nns/pig.svg'
import imHeart from '../components/HomePage/images/nns/heart.svg'

const HeroTop = styled('div')`
  display: grid;
  padding: 20px;
  position: absolute;
  background-color: white;
  left: 0;
  top: 0;
  width: 100%;
  grid-template-columns: 1fr;
  align-items: center;
  ${mq.small`
     grid-template-columns: 1fr 1fr;
  `}
  font-family: 'Londrina Solid';
`

const NoAccounts = styled(NoAccountsDefault)``

const Network = styled('div')`
  margin-bottom: 5px;
`
const Name = styled('span')`
  margin-left: 5px;
  text-transform: none;
  display: inline-block;
  width: 100px;
  white-space: nowrap;
`

const Title = styled('h1')`
  text-align: center;
  font-size: 2.5rem;
  font-weight: 700;
  font-family: 'Londrina Solid';
  letter-spacing: 1px;
  margin-bottom: 25px;

  ${mq.small`
    font-size: 3rem;
  `}
`

const Credits = styled('p')`
  text-align: center;
  font-size: 1rem;
  font-family: 'PT Root UI';
  margin-top: 25px;

  a {
    font-weight: 700;
  }
`

const NetworkStatus = styled('div')`
  color: black;
  font-weight: 200;
  text-transform: capitalize;
  display: none;
  ${mq.small`
    display: block;
  `}
  ${mq.medium`
    left: 40px;
  `}

  &:before {
    position: absolute;
    right: 100%;
    top: 50%;
    transform: translate(-5px, -50%);
    content: '';
    display: block;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #fff;
  }
`

const Nav = styled('div')`
  display: flex;
  justify-content: center;
  ${mq.small`
    justify-content: flex-end;
  `}
  a {
    font-weight: 300;
    color: black;
  }
`

const NavLink = styled(Link)`
  margin-left: 20px;
  &:first-child {
    margin-left: 0;
  }
`

const MobileOnlyNavLink = styled(NavLink)`
  ${mq.small`
    display: none;
  `}
`

const Hero = styled('section')`
  background: url(${bgMobile});
  background-repeat: repeat-x;
  background-size: contain;
  background-position-y: 30px;
  background-position-x: center;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  @media (min-width: 768px) {
    background: url(${bg});
    background-size: 550px auto;
    background-position: center;
    padding: 120px 20px 0;
  }
`

const SearchContainer = styled('div')`
  margin: 0 auto 0;
  display: flex;
  flex-direction: column;
  min-width: 80%;
  ${mq.medium`
    min-width: 40%;
  `}
  > h2 {
    color: black;
    font-size: 38px;
    font-weight: 100;
    margin-bottom: 10px;
  }

  > h3 {
    color: black;
    font-weight: 100;
    font-size: 24px;
    margin-top: 0;
  }
`

const Search = styled(SearchDefault)`
  min-width: 90%;
  width: 90%;
  margin: auto;
  ${mq.medium`
    min-width: 600px;
  `}

  input {
    width: 100%;
    border-radius: 0px;
    ${mq.medium`
      border-radius: 70px 0 0 70px;
      font-size: 17px;
    `}
  }

  button {
    border-radius: 100px;
  }
`

const Explanation = styled('div')`
  display: grid;
  width: 100%;

  grid-template-columns: 1fr;
  grid-template-rows: auto;
  ${mq.medium`
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto;
  `}
  grid-gap: 0;
`

const H2 = styled('h2')`
  font-size: 30px;
  font-weight: 500;
  font-family: 'Londrina Solid';
`

const Section = styled('section')`
  display: flex;
  justify-content: center;
  align-items: center;
`

function backgroundImage(color) {
  switch (color) {
    case 'yellow':
      return bgYellow
    case 'green':
      return bgGreen
    case 'pink':
      return bgPink
    default:
      return bgBlue
  }
}

const InfoSection = styled(Section)`
  padding: 80px 20px 80px;
  background-image: url(${p => backgroundImage(p.color)});
  background-size: cover;
  flex-direction: column;
  justify-items: center;
  align-items: center;
  text-align: center;
  p {
    font-size: 18px;
  }
`

const Inner = styled('div')`
  flex-direction: column;
  justify-content: center;
  align-items: center;
  max-width: 350px;

  > p {
    font-weight: 300;
    font-size: 20px;
    margin-bottom: 1.5em;
  }
`

const ReadOnly = styled('span')`
  margin-left: 1em;
`
export const HOME_DATA = gql`
  query getHomeData($address: string) @client {
    network
    displayName(address: $address)
    isReadOnly
    isSafeApp
  }
`

export const GET_ACCOUNT = gql`
  query getAccounts @client {
    accounts
  }
`

const animation = {
  initial: {
    scale: 0,
    opacity: 0
  },
  animate: {
    opacity: 1,
    scale: 1
  }
}

const NetworkInfo = ({ isReadOnly, displayName, isLoading, network }) => {
  const { t } = useTranslation()
  if (isLoading) return 'Connect your wallet'
  return (
    <>
      {`${network} ${t('c.network')}`}
      {isReadOnly && <ReadOnly>({t('c.readonly')})</ReadOnly>}
      {!isReadOnly && displayName && <Name>({displayName})</Name>}
    </>
  )
}

export default ({ match }) => {
  const { url } = match
  const { t } = useTranslation()

  const {
    data: { accounts }
  } = useQuery(GET_ACCOUNT)

  const {
    data: { network, displayName, isReadOnly, isSafeApp }
  } = useQuery(HOME_DATA, {
    variables: { address: accounts?.[0] }
  })

  const hasAccounts = accounts?.length > 0
  const isLoading = network === 'Loading'

  return (
    <>
      <Hero>
        <HeroTop>
          <NetworkStatus>
            <Network>
              <NetworkInfo
                {...{ isLoading, network, isReadOnly, displayName }}
              />
            </Network>
            {!isSafeApp && (
              <NoAccounts
                onClick={!hasAccounts ? connectProvider : disconnectProvider}
                buttonText={!hasAccounts ? t('c.connect') : t('c.disconnect')}
              />
            )}
          </NetworkStatus>
          <Nav>
            {accounts?.length > 0 && !isReadOnly ? (
              <NavLink
                active={url === '/address/' + accounts[0]}
                to={'/address/' + accounts[0]}
              >
                {t('c.mynames')}
              </NavLink>
            ) : (
              <MobileOnlyNavLink to={'#'} onClick={connectProvider}>
                Connect
              </MobileOnlyNavLink>
            )}

            <NavLink to="/favourites">{t('c.favourites')}</NavLink>
            <NavLink to="/about">About</NavLink>
          </Nav>
        </HeroTop>
        <SearchContainer>
          <>
            <Title>Nouns Name Service</Title>
            <Search />
            <Credits>
              Background by{' '}
              <a href="https://twitter.com/mattdowney" target="_blank">
                @mattdowney
              </a>
            </Credits>
          </>
        </SearchContainer>
      </Hero>
      {/* <Explanation>
        <InfoSection color="blue">
          <Inner>
            <H2>{t('home.whatisens.title')}</H2>
            <p>
              .forever is a top-level domain on the{' '}
              <a href="https://handshake.org">Handshake blockchain</a>. We have
              forked <a href="https://ens.domains/">ENS</a> to create truly
              decentralized subdomains grounded in a decentralized root zone.
            </p>
            <ExternalButtonLink href={aboutPageURL()}>
              {t('c.learnmore')}
            </ExternalButtonLink>
          </Inner>
        </InfoSection>
        <InfoSection color="green">
          <H2>yourname.⌐◨-◨</H2>
        </InfoSection>
        <InfoSection color="yellow">
          <H2>How to use NNS</H2>
          <p>
            .forever is a top-level domain on the{' '}
            <a href="https://handshake.org">Handshake blockchain</a>. We have
            forked <a href="https://ens.domains/">ENS</a> to create truly
            decentralized subdomains grounded in a decentralized root zone.
          </p>
          <ExternalButtonLink href={aboutPageURL()}>
            {t('c.learnmore')}
          </ExternalButtonLink>
        </InfoSection>
        <InfoSection color="pink">
          <ImageGrid>
            <ImageIcon src={imBall} />
            <ImageIcon src={imMonitor} />
            <ImageIcon src={imHeart} />
            <ImageIcon src={imPig} />
          </ImageGrid>
        </InfoSection>
      </Explanation> */}
    </>
  )
}

const ImageGrid = styled('div')`
  display: grid;
  align-content: center;
  justify-items: center;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto;
  grid-gap: 40px 40px;
`

const ImageIcon = styled('img')`
  height: 80px;
`