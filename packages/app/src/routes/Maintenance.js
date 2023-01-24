import React from 'react'
import mq from 'mediaQuery'
import styled from '@emotion/styled/macro'
import bgMobile from '../assets/nns/bg-mobile.jpg'
import bg from '../assets/nns/bg.jpg'

import SearchDefault from '../components/SearchName/Search'


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

const Message = styled('h2')`
  text-align: center;
  font-size: 2.5rem;
  font-weight: 700;
  font-family: 'Londrina Solid';
  letter-spacing: 1px;
  margin-bottom: 25px;
  background-color: white;
  padding: 20px;
  border-radius: 70px;

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

export default () => {
  return (
    <Hero>
      <SearchContainer>
        <>
          <Title>Nouns Name Service</Title>
          <Message>
            We will be back soon...
          </Message>
          <Credits>
            Background by{' '}
            <a href="https://twitter.com/mattdowney" target="_blank">
              @mattdowney
            </a>
          </Credits>
        </>
      </SearchContainer>
    </Hero>
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
