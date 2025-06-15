import { render, screen, fireEvent } from '@testing-library/react'
import PrayerPlayer from '../components/features/prayer/PrayerPlayer'

const mockPrayer = {
  id: '1',
  title: 'Test Prayer',
  audioUrl: '/test-audio.mp3',
  duration: 180,
  thumbnail: '/test-thumbnail.jpg'
}

describe('PrayerPlayer', () => {
  it('renders prayer title', () => {
    render(<PrayerPlayer prayer={mockPrayer} />)
    expect(screen.getByText('Test Prayer')).toBeInTheDocument()
  })

  it('renders thumbnail when provided', () => {
    render(<PrayerPlayer prayer={mockPrayer} />)
    const thumbnail = screen.getByAltText('Test Prayer')
    expect(thumbnail).toBeInTheDocument()
    expect(thumbnail).toHaveAttribute('src', '/test-thumbnail.jpg')
  })

  it('toggles play/pause button', () => {
    render(<PrayerPlayer prayer={mockPrayer} />)
    const playButton = screen.getByRole('button')
    
    // Initial state
    expect(screen.getByText('play_arrow')).toBeInTheDocument()
    
    // Click play
    fireEvent.click(playButton)
    expect(screen.getByText('pause')).toBeInTheDocument()
    
    // Click pause
    fireEvent.click(playButton)
    expect(screen.getByText('play_arrow')).toBeInTheDocument()
  })
})
