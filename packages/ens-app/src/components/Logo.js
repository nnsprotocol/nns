import React from 'react'
import styled from '@emotion/styled/macro'
import { Link } from 'react-router-dom'
import mq from 'mediaQuery'

import imLogo from '../assets/nns/logo.jpg'

const IconLogo = styled('img')`
  width: 30px;
  ${mq.medium`
    width: 34px
  `}
`

const LogoContainer = styled(Link)`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  padding-left: 20px;
  align-items: center;
  width: 50px;
  background-color: transparent;

  ${mq.medium`
    width: 200px;
  `}
`

const H2 = styled('h2')`
  font-size: 30px;
  font-weight: 500;
  font-family: 'Londrina Solid';
  margin-left: 10px;
`

const Logo = ({ color, className, to = '' }) => (
  <LogoContainer className={className} to={to}>
    <IconLogo src={imLogo} />
    <H2>NNS</H2>
    {/* <LogoTyped color={color} /> */}
  </LogoContainer>
)

export default Logo
