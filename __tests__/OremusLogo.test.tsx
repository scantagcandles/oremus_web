import { render, screen } from '@testing-library/react'
import OremusLogo from '../components/common/logo/OremusLogo'

describe('OremusLogo', () => {
  it('renders with default props', () => {
    render(<OremusLogo />)
    const logoElement = screen.getByRole('img', { name: /oremus logo/i })
    expect(logoElement).toBeInTheDocument()
  })

  it('applies correct size class', () => {
    render(<OremusLogo size="lg" />)
    const logoElement = screen.getByRole('img', { name: /oremus logo/i })
    expect(logoElement).toHaveClass('w-32', 'h-32')
  })

  it('applies correct variant class', () => {
    render(<OremusLogo variant="glow" />)
    const logoElement = screen.getByRole('img', { name: /oremus logo/i })
    expect(logoElement).toHaveClass('logo-glow')
  })
})
