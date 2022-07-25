import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import styled from '@emotion/styled/macro'
import mq from 'mediaQuery'

import { H2 as DefaultH2, Title } from '../components/Typography/Basic'
import Anchor from '../components/Icons/Anchor'
import slugify from 'slugify'
import ReverseRecordImageSrc from '../assets/reverseRecordImage.png'
import {
  NonMainPageBannerContainer,
  DAOBannerContent
} from '../components/Banner/DAOBanner'

const H2 = styled(DefaultH2)`
  margin-top: 50px;
  margin-left: 20px;
  color: black;
  font-family: 'Londrina Solid';
  ${mq.medium`
    margin-left: 0;
  `};
`

const Question = styled('h3')`
  font-size: 15px;
  margin-right: 0.5em;
  margin-top: 0.5em;
  display: inline;
`

const Answer = styled('p')``

const AnchorContainer = styled('a')``

const ImageContainer = styled('div')`
  margin: 2em;
`

const ReverseRecordImage = styled('img')`
  width: 100%;
  ${mq.medium`
    width: 600px;
  `}
`

const Section = ({ question, children, anchor }) => {
  let slug
  if (question) {
    slug = slugify(question, {
      lower: true
    })
  }
  return (
    <>
      {question && <Question id={slug}>{question}</Question>}
      {anchor ? (
        <AnchorContainer href={`#${slug}`}>
          <Anchor />
        </AnchorContainer>
      ) : null}

      <Answer>{children}</Answer>
    </>
  )
}

function Faq() {
  const { t } = useTranslation()
  useEffect(() => {
    document.title = 'NNS About'
  }, [])

  return (
    <>
      {/* <NonMainPageBannerContainer>
        <DAOBannerContent />
      </NonMainPageBannerContainer> */}
      <FaqContainer>
        <Title>About</Title>
        <H2>WTF IS THIS</H2>
        <Section>
          NNS is an experimental naming infrastructure to connect the cc0 world
          spreading the nounish culture. Every .⌐◨-◨ name is a natural extension
          of your nounish identity. It will transform the ⌐◨-◨ from a simple
          icon to a fully functional TLD with a growing set of benefits and
          functions, for life.
        </Section>

        <H2>HOW TO USE .⌐◨-◨</H2>
        <Section>
          Your .⌐◨-◨ name is already natively resolved by all the major DAOs and
          projects of the Nouniverse and will constantly expand its integrations
          to external apps, wallets and marketplaces. <br />
          <br />
          After the initial launch, the .⌐◨-◨ TLD will be also integrated with
          the Handshake root zone allowing you to create uncensorable websites
          with DNS and Https support. .⌐◨-◨ names have zero renewal fees and
          once yours, they will stay yours. Forever.
        </Section>

        <H2>LEARN MORE</H2>

        <Section question="How can I claim a .⌐◨-◨ name?">
          To avoid speculation on names, we will launch the NNS with a 60 days
          reservation period for ENS holders. During this time frame, only .eth
          holders will be able to get their nounish counterpart. After the
          reservation period ends, the NNS will be opened to the public and any
          reservation on names will be removed.
          <br />
          <br />
          <strong>Example: </strong>
          During the first 60 days after launch, nouns.⌐◨-◨ will be claimable
          only by the owner of nouns.eth. If the name is not claimed within this
          period it will be made available to everyone.
        </Section>

        <Section question="Why are all the numbers from 0 to 9999 reserved?">
          The numbers will be reserved for an exciting initiative that will be
          revealed soon.
          <br />
          <br />
          The goal of this initiative is to support every single nounish project
          giving a stack in the NNS adventure, exploring at the same time new
          forms of community partecipation.
        </Section>

        <Section question="How can I resolve my .⌐◨-◨ domain in a browser, like a website?">
          This feature is not yet active and will be released at the beginning
          of the public launch (right after the ENS reservation period will
          end). We will also release tutorials and a full documentation to help
          you set up your unstoppable nounish website.
        </Section>

        <Section question="How can I use my .⌐◨-◨ name as my Ethereum wallet?">
          Go on your dashboard and associate your nounish name to the wallet of
          your choice. You will see your name natively resolved on our nounish
          partners platforms.
        </Section>

        <Section question="Are .⌐◨-◨ names NFTs?">
          Yes. NNS domains are issued as ERC-721 tokens. This makes them super
          easy to manage across different wallets and exchanges.
        </Section>

        <Section question="Why should I buy a name?">
          NNS is an ambitious experiment which aims to create a naming
          infrastructure for the nouniverse and the cc0 ecosystem.
          <br />
          There are 2 main reasons why you should join:
          <p>
            <strong>First, identity.</strong>
            <br />
            The more the Nouns and the cc0 culture grow, the more having a cool
            .⌐◨-◨ name will be relevant at an identity and cultural level.
            <br />
            As the ecosystem grows, creators will be able to build their web3
            websites on the .⌐◨-◨ tld and communities will use their .⌐◨-◨ to
            better express who they are and their values.
            <br />
            This will increase the demand of short and effective .⌐◨-◨ names.
          </p>
          <p>
            <strong>Second, benefits.</strong>
            <br />
            NNS will constantly partner with creators who share the same cc0
            vision to bring more benefits to the NNS owners.
            <br />
            Also, the first 10.000 names will be officially classified as Early
            Adopters by our system and this will grant them important benefits
            in the future.
          </p>
        </Section>

        <Section question="How can I become a partner?">
          To become a partner you just need to add our resolver to your
          platform. It’s a simple string of code that will natively resolve NNS
          names and contribute to expand the nounish culture.
          <br />
          All the partners will be featured on our upcoming website and can be
          selected for our Nounish Utility Program to bring new benefits to the
          NNS holders.
          <br />
          With the growth of the NNS we will also support our ecosystem through
          special grants focused on financing special initiatives.
        </Section>
      </FaqContainer>
    </>
  )
}

const FaqContainer = styled('div')`
  margin: 1em;
  padding: 20px 40px;
  background-color: white;
`

export default Faq
