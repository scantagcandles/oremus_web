import { render, screen, fireEvent, act } from '@testing-library/react'
import OremusCandle from '../components/features/candle/OremusCandle'

describe('OremusCandle', () => {
  const mockCandle = {
    id: '1',
    nfcId: 'nfc123',
    activationDate: new Date('2025-06-14T10:00:00'),
    expiryDate: new Date('2025-06-21T10:00:00'),
    intention: 'Test intention',
    isActive: true,
    type: 'premium' as const
  }

  const mockOnNfcDetected = jest.fn()
  const mockOnActivate = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders scan button when no candle is provided', () => {
    render(
      <OremusCandle
        onNfcDetected={mockOnNfcDetected}
        onActivate={mockOnActivate}
      />
    )
    expect(screen.getByText('Zeskanuj świecę')).toBeInTheDocument()
  })

  it('renders candle information when candle is provided', () => {
    render(
      <OremusCandle
        candle={mockCandle}
        onNfcDetected={mockOnNfcDetected}
        onActivate={mockOnActivate}
      />
    )
    expect(screen.getByText('Premium')).toBeInTheDocument()
    expect(screen.getByText(/test intention/i)).toBeInTheDocument()
    expect(screen.getByText(/pozostało:/i)).toBeInTheDocument()
  })

  it('handles NFC scan errors gracefully', () => {
    // Mock that NFC is not available
    const originalNDEFReader = window.NDEFReader
    // @ts-ignore
    delete window.NDEFReader

    render(
      <OremusCandle
        onNfcDetected={mockOnNfcDetected}
        onActivate={mockOnActivate}
      />
    )

    fireEvent.click(screen.getByText('Zeskanuj świecę'))
    expect(screen.getByText('Twoje urządzenie nie obsługuje NFC')).toBeInTheDocument()

    // Restore NDEFReader
    // @ts-ignore
    window.NDEFReader = originalNDEFReader
  })

  it('shows remaining time correctly', () => {
    jest.useFakeTimers()
    const now = new Date('2025-06-14T12:00:00')
    jest.setSystemTime(now)

    render(
      <OremusCandle
        candle={mockCandle}
        onNfcDetected={mockOnNfcDetected}
        onActivate={mockOnActivate}
      />
    )

    expect(screen.getByText(/6d 22h/)).toBeInTheDocument()

    // Advance time by 1 day
    act(() => {
      jest.advanceTimersByTime(24 * 60 * 60 * 1000)
    })

    expect(screen.getByText(/5d 22h/)).toBeInTheDocument()

    jest.useRealTimers()
  })
})
