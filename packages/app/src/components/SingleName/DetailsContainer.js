import React from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import styled from '@emotion/styled'
import mq from '../../mediaQuery'

import SetupName from '../SetupName/SetupName'
import RegistryMigration from './RegistryMigration'
import { DetailsItem, DetailsKey, DetailsValue } from './DetailsItem'
import { ReactComponent as ExternalLinkIcon } from '../Icons/externalLink.svg'
import DetailsItemEditable from './DetailsItemEditable'
import {
  RECLAIM,
  RENEW,
  SET_OWNER,
  SET_REGISTRANT,
  SET_SUBNODE_OWNER
} from '../../graphql/mutations'
import { SingleNameBlockies } from '../Blockies'
import You from '../Icons/You'
import SubmitProof from './SubmitProof'
import Tooltip from '../Tooltip/Tooltip'
import { HR } from '../Typography/Basic'
import { formatDate } from '../../utils/dates'
import ResolverAndRecords from './ResolverAndRecords'
import NameClaimTestDomain from './NameClaimTestDomain'
import DefaultLoader from '../Loader'
import DefaultButton from '../Forms/Button'
import DefaultAddressLink from '../Links/AddressLink'

import { ReactComponent as DefaultOrangeExclamation } from '../Icons/OrangeExclamation.svg'

const Details = styled('section')`
  padding: 20px;
  transition: 0.4s;
  ${mq.small`
    padding: 40px;
  `}
`

const Loader = styled(DefaultLoader)`
  width: 30%;
  margin: auto;
`

const Button = styled(DefaultButton)`
  position: absolute;
  width: 130px;
  background-colore: white;
`

const ButtonContainer = styled('div')`
  margin-top: 20px;
  height: 50px;
  ${mq.small`
    height: 50px;
    width: 50px;
    position: absolute;
    right: 128px;
    -webkit-transform: translate(0, -65%);
    -ms-transform: translate(0, -65%);
    transform: translate(0, -65%);
  `}
`

const ExpirationDetailsValue = styled(DetailsValue)`
  color: ${p => (p.isExpired ? 'red' : null)};
`

const AddressLink = styled(DefaultAddressLink)`
  display: flex;
  align-items: center;
`

const Explainer = styled('div')`
  background: #f0f6fa;
  color: #adbbcd;
  display: flex;
  padding: 1em 0;
  margin-left: 0px;
  ${mq.small`
    margin-left: 180px;
  `}

  margin-bottom: 45px;
  padding-left: 24px;
`

const ErrorExplainer = styled(Explainer)`
  background: #fef7e9;
`

const OutOfSyncExplainer = styled('div')`
  margin-top: 20px;
  background: #fef7e9;
  display: flex;
`

const OutOfSyncExplainerContainer = styled('div')`
  margin-top: 15px;
`

const EtherScanLinkContainer = styled('span')`
  display: inline-block;
  transform: translate(25%, 20%);
`

const LinkToLearnMore = styled('a')`
  margin-right: ${props => (props.outOfSync ? '' : '')};
  font-size: 14px;
  letter-spacing: 0.58px;
  text-align: center;
  margin-left: auto;
  min-width: 130px;
`

const OrangeExclamation = styled(DefaultOrangeExclamation)`
  margin-right: 5px;
  margin-top: 6px;
  width: 20px;
  height: 20px;
`

const DNSOwnerError = styled('span')`
  color: black;
`

const OwnerFields = styled('div')`
  background: ${props => (props.outOfSync ? '#fef7e9' : '')};
  padding: ${props => (props.outOfSync ? '1.5em' : '0')};
  margin-bottom: ${props => (props.outOfSync ? '1.5em' : '0')};
`

const DomainOwnerAddress = styled('span')`
  color: ${props => (props.outOfSync ? '#CACACA' : '')};
`

const GracePeriodWarningContainer = styled('div')`
  font-family: 'PT Root UI';
  background: ${p => (p.isExpired ? '#ff926f' : '#fef7e9')};
  padding: 10px 20px;
  margin: 5px 0px;
`

const GracePeriodText = styled('span')`
  color: ${p => (p.isExpired ? 'white' : '#cacaca')};
  margin-left: 0.5em;
`

const GracePeriodDate = styled('span')`
  font-weight: bold;
`

const Expiration = styled('span')`
  color: ${p => (p.isExpired ? 'white' : 'black')};
  font-weight: bold;
`

const GracePeriodWarning = ({ date, expiryTime }) => {
  let { t } = useTranslation()
  let isExpired = new Date() > new Date(expiryTime)
  return (
    <GracePeriodWarningContainer isExpired={isExpired}>
      <Expiration isExpired={isExpired}>
        {isExpired
          ? t('singleName.expiry.expired')
          : t('singleName.expiry.expiring')}
      </Expiration>
      <GracePeriodText isExpired={isExpired}>
        {t('singleName.expiry.gracePeriodEnds')}{' '}
        <GracePeriodDate>{formatDate(date)}</GracePeriodDate>
      </GracePeriodText>
    </GracePeriodWarningContainer>
  )
}

function canClaim(domain) {
  if (!domain.name?.match(/\.test$/)) return false
  return parseInt(domain.owner) === 0 || domain.expiryTime < new Date()
}

function DetailsContainer({
  isMigratedToNewRegistry,
  isDeedOwner,
  isRegistrant,
  showExplainer,
  canSubmit,
  outOfSync,
  loading,
  setLoading,
  isOwnerOfParent,
  isOwner,
  refetch,
  domain,
  dnssecmode,
  account,
  loadingIsMigrated,
  refetchIsMigrated,
  isParentMigratedToNewRegistry,
  loadingIsParentMigrated,
  readOnly = false
}) {
  const { t } = useTranslation()
  const domainOwner =
    domain.available || domain.owner === '0x0' ? null : domain.owner
  const registrant =
    domain.available || domain.registrant === '0x0' ? null : domain.registrant

  const domainParent =
    domain.name === '[root]' ? null : domain.parent ? domain.parent : '[root]'

  const is2ld = domain.name?.split('.').length === 2
  const showUnclaimableWarning =
    is2ld &&
    parseInt(domain.owner) === 0 &&
    domain.parent !== '⌐◨-◨' && // FIXME
    !domain.isDNSRegistrar

  return (
    <Details data-testid="name-details">
      {isOwner && <SetupName initialState={showExplainer} />}
      {/* {parseInt(domain.owner, 16) !== 0 &&
        !loadingIsMigrated &&
        !isMigratedToNewRegistry && (
          <RegistryMigration
            account={account}
            domain={domain}
            dnssecmode={dnssecmode}
            refetchIsMigrated={refetchIsMigrated}
            isParentMigratedToNewRegistry={isParentMigratedToNewRegistry}
            loadingIsParentMigrated={loadingIsParentMigrated}
            readOnly={readOnly}
          />
        )} */}
      {domainParent ? (
        <DetailsItem uneditable>
          <DetailsKey>{t('c.parent')}</DetailsKey>
          <DetailsValue>
            <Link to={`/name/${domainParent}`} aria-label={t('c.parent')}>
              {domainParent}
            </Link>
          </DetailsValue>
        </DetailsItem>
      ) : (
        ''
      )}
      {showUnclaimableWarning && (
        <GracePeriodWarningContainer>
          <DetailsItem>
            {t('c.cannotclaimDns', { name: domainParent })}
            <LinkToLearnMore
              href="https://docs.ens.domains/dns-registrar-guide"
              target="_blank"
            >
              {t('c.learnmore')}{' '}
              <EtherScanLinkContainer>
                <ExternalLinkIcon />
              </EtherScanLinkContainer>
            </LinkToLearnMore>
          </DetailsItem>
        </GracePeriodWarningContainer>
      )}
      <OwnerFields outOfSync={outOfSync}>
        {domain.parent === '⌐◨-◨' ? ( // FIX ME
          <>
            <DetailsItemEditable
              domain={domain}
              keyName="registrant"
              value={registrant}
              canEdit={isRegistrant && !readOnly}
              isExpiredRegistrant={false}
              type="address"
              editButton={t('c.transfer')}
              mutationButton={t('c.transfer')}
              mutation={SET_REGISTRANT}
              refetch={refetch}
              confirm={true}
              copyToClipboard={true}
            />
            <DetailsItemEditable
              domain={domain}
              keyName="Controller"
              value={domainOwner}
              canEdit={
                !readOnly &&
                (isRegistrant || (isOwner && isMigratedToNewRegistry))
              }
              deedOwner={domain.deedOwner}
              isDeedOwner={isDeedOwner}
              type="address"
              editButton={isRegistrant ? t('c.set') : t('c.transfer')}
              mutationButton={isRegistrant ? t('c.set') : t('c.transfer')}
              mutation={isRegistrant ? RECLAIM : SET_OWNER}
              refetch={refetch}
              confirm={true}
              copyToClipboard={true}
            />
          </>
        ) : (
          // Either subdomain, or .test
          <DetailsItemEditable
            domain={domain}
            keyName="Controller"
            value={domain.owner}
            canEdit={
              !readOnly &&
              ((isOwner || isOwnerOfParent))
            }
            deedOwner={domain.deedOwner}
            isDeedOwner={isDeedOwner}
            outOfSync={outOfSync}
            type="address"
            editButton={isOwnerOfParent ? t('c.set') : t('c.transfer')}
            mutationButton={isOwnerOfParent ? t('c.set') : t('c.transfer')}
            mutation={isOwnerOfParent ? SET_SUBNODE_OWNER : SET_OWNER}
            refetch={refetch}
            confirm={true}
            copyToClipboard={true}
          />
        )}
        {/* To be replaced with a logic a function to detect dnsregistrar */}

        {domain.registrationDate ? (
          <DetailsItem uneditable>
            <DetailsKey>{t('c.registrationDate')}</DetailsKey>
            <DetailsValue>{formatDate(domain.registrationDate)}</DetailsValue>
          </DetailsItem>
        ) : (
          ''
        )}
        {/* {!domain.available ? (
          domain.isNewRegistrar || domain.gracePeriodEndDate ? (
            <>
              <DetailsItemEditable
                domain={domain}
                keyName="Expiration Date"
                value={domain.expiryTime}
                canEdit={!readOnly && parseInt(account, 16) !== 0}
                type="date"
                editButton={t('c.renew')}
                mutationButton={t('c.renew')}
                mutation={RENEW}
                refetch={refetch}
                confirm={true}
              />
              {domain.gracePeriodEndDate ? (
                <GracePeriodWarning
                  expiryTime={domain.expiryTime}
                  date={domain.gracePeriodEndDate}
                />
              ) : (
                ''
              )}
            </>
          ) : domain.expiryTime ? (
            <DetailsItem uneditable>
              <DetailsKey>{t("c['Expiration Date']")}</DetailsKey>
              <ExpirationDetailsValue isExpired={isExpired}>
                {formatDate(domain.expiryTime)}
              </ExpirationDetailsValue>
            </DetailsItem>
          ) : (
            ''
          )
        ) : (
          ''
        )} */}
      </OwnerFields>
      <HR />
      <ResolverAndRecords
        domain={domain}
        isOwner={isOwner}
        refetch={refetch}
        account={account}
        isMigratedToNewRegistry={isMigratedToNewRegistry}
        readOnly={readOnly}
      />
      {canClaim(domain) ? (
        <NameClaimTestDomain domain={domain} refetch={refetch} />
      ) : null}
    </Details>
  )
}

export default DetailsContainer