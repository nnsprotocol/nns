import React from 'react'
import styled from '@emotion/styled/macro'
import Years from './NameRegister/Years'
import Price from './NameRegister/Price'
import EthRegistrationGasPrice from './NameRegister/EthRegistrationGasPrice'
import { ReactComponent as DefaultOrangeExclamation } from '../Icons/OrangeExclamation.svg'
import mq from 'mediaQuery'
import { ReactComponent as ChainDefault } from '../Icons/chain.svg'
import { useTranslation } from 'react-i18next'
import theme from 'theme'

const PricingContainer = styled('div')`
  display: grid;
  grid-template-columns: 1fr;
  margin-bottom: 20px;
  ${mq.medium`
    grid-template-columns:
      minmax(min-content, 200px) minmax(min-content, min-content)
      minmax(200px, 1fr);
  `}
`
const Chain = styled(ChainDefault)`
  display: none;

  ${mq.medium`
    display: block;
    margin-top: 20px;
    margin-left: 20px;
    margin-right: 20px;
  `}
`

const ExclamationIcon = styled(DefaultOrangeExclamation)`
  height: 14px;
  width: 14px;
  margin-right: 2px;
  padding-top: 1px;
  path {
    fill: ${theme.colors.accent};
  }
`

const Prompt = styled('div')`
  color: black;
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  color: ${theme.colors.accent};
`

function PricerInner({
  years,
  setYears,
  duration,
  ethUsdPriceLoading,
  ethUsdPrice,
  ethUsdPremiumPrice,
  className,
  loading,
  price,
  premiumOnlyPrice,
  gasPrice,
  reference,
  underPremium,
  displayGas = false
}) {
  const { t } = useTranslation()
  return (
    <>
      <Prompt>
          <ExclamationIcon />
          <div>Your .⌐◨-◨ name is yours forever. Say goodbye to renewal fees!</div>
        </Prompt>
      <PricingContainer className={className} ref={reference}>
        {/* <Years years={years} setYears={setYears} />
        <Chain /> */}
        {/* <Price
          price={price}
          premiumOnlyPrice={premiumOnlyPrice}
          gasPrice={gasPrice}
          loading={loading}
          ethUsdPriceLoading={ethUsdPriceLoading}
          ethUsdPrice={ethUsdPrice}
          ethUsdPremiumPrice={ethUsdPremiumPrice}
          underPremium={underPremium}
        /> */}
      </PricingContainer>
      {displayGas && gasPrice && (
        <div>
          <EthRegistrationGasPrice
            price={price}
            gasPrice={gasPrice}
            loading={loading}
            ethUsdPriceLoading={ethUsdPriceLoading}
            ethUsdPrice={ethUsdPrice}
            ethUsdPremiumPrice={ethUsdPremiumPrice}
            underPremium={underPremium}
          />
        </div>
      )}
    </>
  )
}

export const PricerAll = React.forwardRef((props, reference) => {
  return <PricerInner reference={reference} {...props} />
})

const Pricer = React.forwardRef((props, reference) => {
  return <PricerInner reference={reference} {...props} />
})

export default Pricer