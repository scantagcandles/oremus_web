import { render, screen, fireEvent, act } from '@testing-library/react'
import VirtualCandle from '../components/features/candle/VirtualCandle'

jest.useFakeTimers()

describe('VirtualCandle', () => {
  it('renders with intention', () => {
    render(<VirtualCandle intention="Test intention" duration={1} />)
    expect(screen.getByText(/test intention/i)).toBeInTheDocument()
  })

  it('starts unlit and lights up on click', () => {
    render(<VirtualCandle duration={1} />)
    
    const candle = screen.getByRole('button')
    expect(screen.queryByText(/pozostało/i)).not.toBeInTheDocument()
    
    fireEvent.click(candle)
    expect(screen.getByText(/pozostało/i)).toBeInTheDocument()
  })

  it('shows correct time remaining', () => {
    render(<VirtualCandle duration={1} />)
    
    const candle = screen.getByRole('button')
    fireEvent.click(candle)
    
    expect(screen.getByText('Pozostało: 1h 0m')).toBeInTheDocument()
    
    // Advance time by 30 minutes
    act(() => {
      jest.advanceTimersByTime(30 * 60 * 1000)
    })
    
    expect(screen.getByText('Pozostało: 0h 30m')).toBeInTheDocument()
  })

  it('calls onComplete when time runs out', () => {
    const onComplete = jest.fn()
    render(<VirtualCandle duration={1} onComplete={onComplete} />)
    
    const candle = screen.getByRole('button')
    fireEvent.click(candle)
    
    // Advance time by full duration
    act(() => {
      jest.advanceTimersByTime(60 * 60 * 1000)
    })
    
    expect(onComplete).toHaveBeenCalled()
  })
})
