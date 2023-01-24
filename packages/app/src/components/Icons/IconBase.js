import styled from '@emotion/styled/macro'
import theme from 'theme'

const Icon = styled('svg')`
  path {
    transition: 0.2s;
    fill: ${p =>
      p.color ? p.color : p.active ? theme.colors.accent : '#C7D3E3'};
    width: ${p => p.width}px;
  }

  g {
    fill: ${p =>
      p.color ? p.color : p.active ? theme.colors.accent : '#C7D3E3'};
  }
`

export default Icon
