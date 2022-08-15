import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import styled from '@emotion/styled/macro'
import mq from 'mediaQuery'
import { H2 as DefaultH2, Title } from '../components/Typography/Basic'
import Anchor from '../components/Icons/Anchor'
import slugify from 'slugify'

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
          Example: During the first 60 days after launch, nouns.⌐◨-◨ will be
          claimable only by the owner of nouns.eth. If the name is not claimed
          within this period it will be made available to everyone.
        </Section>

        <Section question="I'm the holder of a .eth but the correspondent .⌐◨-◨ still has the “Reserved” status. Why is that?">
          If you are an ENS holder, the only way to switch your .⌐◨-◨ name from
          “Reserved” to “Available” is to have the correspondent .eth on the
          wallet you are using to claim your .⌐◨-◨ name.
          <br />
          <br />
          If for any reason you are unable to have your .eth on the address used
          to claim your NNS name, DM us on Twitter and we’ll find another way to
          verify your ownership.
        </Section>

        <Section question="Can I set the same address as primary on both NNS and ENS?">
          Yes. There is no conflict between NNS and ENS. Being a new naming
          system, the NNS is currently natively supported only in the
          nouniverse.
          <br />
          <br />
          If you choose to use the same primary address on both, your name will
          be resolved in its nounish version (.⌐◨-◨) inside the nouniverse, but
          it will stay in its classic version (.eth) outside of it.
          <br />
          <br />
          This way, it will be like having an ENS with nounish powers!
          <br />
          <br />
          Example: nouns.eth decides to use the same primary address on both NNS
          and ENS.
          <br />
          If this address bids in a nounish project or makes a proposal on Prop
          House, its name will be natively resolved in nouns.⌐◨-◨.
          <br />
          If this address interacts with metamask, etherscan or other external
          apps outside the nouniverse, its name will keep the nouns.eth form.
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

        <Section question="When was the Main Net launched?">
          The NNS Main Net was launched the 28/7/2022.
        </Section>

        <Section question="Where can I see my .⌐◨-◨ names natively resolved?">
          The NNS is already supported by the major DAOs and auction projects of
          the Nouniverse.
          <br />
          Here is the fully updated list of our ecosystem:
          <ul>
            <li>Nouns DAO (Coming soon)</li>
            <li>Prop House (Coming soon)</li>
            <li>Lil Nouns DAO (Coming soon)</li>
            <li>Gnars DAO (Coming soon)</li>
            <li>Tings DAO (Coming soon)</li>
            <li>Nouns Town (Coming soon)</li>
          </ul>
          Extending the NNS ecosystem is a never ending process and our number 1
          priority.
          <br />
          Our current pipeline of integrations includes a constant stream of new
          nounish projects, CC0 creators and external apps and marketplaces!
          <br />
          <br />
          Do you want to be in the list above? DM us on Twitter!
        </Section>

        <Section question="How much does it cost to register a .⌐◨-◨ name?">
          Prices are currently as follows:
          <ul>
            <li>4+ character .⌐◨-◨ names: $100 in ETH, one-time fee.</li>
            <li>3 character .⌐◨-◨ names: $250 in ETH, one-time fee.</li>
            <li>2 character .⌐◨-◨ names: $500 in ETH, one-time fee.</li>
            <li>1 character .⌐◨-◨ names: $1000 in ETH, one-time fee. </li>
          </ul>
          The premium price for the names with a length below 4 characters has
          been applied to reflect their scarcity.
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
            First, identity.
            <br />
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
            Second, benefits.
            <br />
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
