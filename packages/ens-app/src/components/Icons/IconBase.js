import styled from '@emotion/styled/macro'

const Icon = styled('svg')`
  path {
    transition: 0.2s;
    fill: ${p => (p.color ? p.color : p.active ? 'black' : '#C7D3E3')};
    width: ${p => p.width}px;
  }

  g {
    fill: ${p => (p.color ? p.color : p.active ? 'black' : '#C7D3E3')};
  }
`

export default Icon
