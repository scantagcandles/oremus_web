import { render, screen, fireEvent } from '@testing-library/react'
import PrayerMap from '../components/features/prayer/PrayerMap'

const mockPrayers = [
  {
    id: '1',
    title: 'Ojcze Nasz',
    category: 'Podstawowe',
    duration: 60,
    tags: ['codzienna', 'wieczorna']
  },
  {
    id: '2',
    title: 'Zdrowaś Mario',
    category: 'Podstawowe',
    duration: 45,
    tags: ['maryjna', 'codzienna']
  },
  {
    id: '3',
    title: 'Koronka do Miłosierdzia Bożego',
    category: 'Różaniec',
    duration: 900,
    tags: ['miłosierdzie', 'długa']
  }
]

describe('PrayerMap', () => {
  const onPrayerSelect = jest.fn()

  beforeEach(() => {
    onPrayerSelect.mockClear()
  })

  it('renders all prayers by default', () => {
    render(<PrayerMap prayers={mockPrayers} onPrayerSelect={onPrayerSelect} />)
    expect(screen.getByText('Ojcze Nasz')).toBeInTheDocument()
    expect(screen.getByText('Zdrowaś Mario')).toBeInTheDocument()
    expect(screen.getByText('Koronka do Miłosierdzia Bożego')).toBeInTheDocument()
  })

  it('filters prayers by category', () => {
    render(<PrayerMap prayers={mockPrayers} onPrayerSelect={onPrayerSelect} />)
    
    const categorySelect = screen.getByRole('combobox')
    fireEvent.change(categorySelect, { target: { value: 'Różaniec' } })

    expect(screen.queryByText('Ojcze Nasz')).not.toBeInTheDocument()
    expect(screen.queryByText('Zdrowaś Mario')).not.toBeInTheDocument()
    expect(screen.getByText('Koronka do Miłosierdzia Bożego')).toBeInTheDocument()
  })

  it('filters prayers by search query', () => {
    render(<PrayerMap prayers={mockPrayers} onPrayerSelect={onPrayerSelect} />)
    
    const searchInput = screen.getByPlaceholderText('Szukaj modlitwy...')
    fireEvent.change(searchInput, { target: { value: 'mario' } })

    expect(screen.queryByText('Ojcze Nasz')).not.toBeInTheDocument()
    expect(screen.getByText('Zdrowaś Mario')).toBeInTheDocument()
    expect(screen.queryByText('Koronka do Miłosierdzia Bożego')).not.toBeInTheDocument()
  })

  it('calls onPrayerSelect when prayer is clicked', () => {
    render(<PrayerMap prayers={mockPrayers} onPrayerSelect={onPrayerSelect} />)
    
    fireEvent.click(screen.getByText('Ojcze Nasz'))
    expect(onPrayerSelect).toHaveBeenCalledWith(mockPrayers[0])
  })

  it('shows no results message when no prayers match filters', () => {
    render(<PrayerMap prayers={mockPrayers} onPrayerSelect={onPrayerSelect} />)
    
    const searchInput = screen.getByPlaceholderText('Szukaj modlitwy...')
    fireEvent.change(searchInput, { target: { value: 'xyz' } })

    expect(screen.getByText(/nie znaleziono modlitw/i)).toBeInTheDocument()
  })
})
