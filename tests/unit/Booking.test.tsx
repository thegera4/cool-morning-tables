import { render, screen, waitFor, act, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Booking } from '@/components/Booking';
import { client } from '@/sanity/lib/client';

// Mock child components
// Mock child components
const MockBookingCalendar = vi.fn(({ setDate }: any) => (
  <div data-testid="booking-calendar">
    <button onClick={() => setDate(new Date('2024-01-14'))}>Set Weekday</button>
    <button onClick={() => setDate(new Date('2024-01-14T00:00:00'))}>Set Sunday</button>
  </div>
));

vi.mock('@/components/BookingCalendar', () => ({
  BookingCalendar: (props: any) => <MockBookingCalendar {...props} />,
}));
vi.mock('@/components/ContactForm', () => ({
  ContactForm: () => <div data-testid="contact-form">ContactForm</div>,
}));
vi.mock('@/components/PaymentForm', () => ({
  PaymentForm: () => <div data-testid="payment-form">PaymentForm</div>,
}));
vi.mock('@/components/ExtrasSelector', () => ({
  ExtrasSelector: ({ onUpdateExtra }: any) => (
    <div data-testid="extras-selector">
      <button onClick={() => onUpdateExtra('ext1', 1)}>Add Extra</button>
      <button onClick={() => onUpdateExtra('ext1', 0)}>Remove Extra</button>
      <button onClick={() => onUpdateExtra('invalid-id', 1)}>Add Invalid Extra</button>
    </div>
  ),
}));
vi.mock('@/components/OrderSummary', () => ({
  OrderSummary: () => <div data-testid="order-summary">OrderSummary</div>,
}));
vi.mock('@/components/StripeWrapper', () => ({
  StripeWrapper: ({ children }: any) => <div data-testid="stripe-wrapper">{children}</div>,
}));

// Mock Clerk
const mockUseUser = vi.fn();
vi.mock('@clerk/nextjs', () => ({
  useUser: () => mockUseUser(),
  SignedIn: ({ children }: any) => {
    const { user } = mockUseUser();
    return user ? <>{children}</> : null;
  },
  SignedOut: ({ children }: any) => {
    const { user } = mockUseUser();
    return !user ? <>{children}</> : null;
  },
  SignInButton: ({ children }: any) => <div>{children}</div>,
}));

// Mock Sanity client
vi.mock('@/sanity/lib/client', () => ({
  client: {
    fetch: vi.fn(),
  },
}));

// Mock Fetch
global.fetch = vi.fn();

// Mock Data
const mockLocation = {
  _id: 'loc1',
  id: 'loc1',
  imageUrl: '/test.jpg',
  name: 'Terraza Privada',
  price: 2000,
  images: [],
  description: 'Desc',
  features: [],
  slug: { current: 'terraza-privada' },
};

const mockExtras = [
  { _id: 'ext1', name: 'Rosas', price: 500, description: 'Rosas rojas' },
];

describe('Booking Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    window.HTMLElement.prototype.scrollIntoView = vi.fn();
    (client.fetch as any).mockResolvedValue([]);
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ clientSecret: 'secret_123', paymentIntentId: 'pi_123' }),
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders sign-in prompt when user is signed out', () => {
    mockUseUser.mockReturnValue({ user: null, isLoaded: true });
    render(<Booking selectedLocationId="loc1" location={mockLocation} extrasData={mockExtras} />);
    expect(screen.getByText('¡Casi listo!')).toBeDefined();
    expect(screen.getByRole('button', { name: /Inicia sesión/i })).toBeDefined();
    act(() => { vi.runAllTimers(); });
    expect(screen.queryByTestId('booking-calendar')).toBeNull();
  });

  it('renders booking form and handles date selection (weekday vs sunday)', async () => {
    mockUseUser.mockReturnValue({
      user: { firstName: 'Test', lastName: 'User', primaryEmailAddress: { emailAddress: 'test@example.com' } },
      isLoaded: true
    });

    render(<Booking selectedLocationId="loc1" location={mockLocation} extrasData={mockExtras} />);

    const weekdayBtn = screen.getByText('Set Weekday');
    act(() => {
      fireEvent.click(weekdayBtn);
    });

    act(() => { vi.advanceTimersByTime(1000); });
    expect(global.fetch).toHaveBeenCalledWith('/api/create-payment-intent', expect.any(Object));
  });

  it('handles Sunday time slot', async () => {
    mockUseUser.mockReturnValue({
      user: { firstName: 'Test', lastName: 'User', primaryEmailAddress: { emailAddress: 'test@example.com' } },
      isLoaded: true
    });
    render(<Booking selectedLocationId="loc1" location={mockLocation} extrasData={mockExtras} />);

    const sundayBtn = screen.getByText('Set Sunday');
    act(() => {
      fireEvent.click(sundayBtn);
    });

    act(() => { vi.advanceTimersByTime(1000); });
    expect(global.fetch).toHaveBeenCalled();
  });

  it('handles blocked dates from props', async () => {
    mockUseUser.mockReturnValue({ user: { id: 'u1' }, isLoaded: true });

    const locationWithBlockedDates = {
      ...mockLocation,
      blockedDates: ['2024-01-20', '2024-01-21'],
    };

    render(<Booking selectedLocationId="loc1" location={locationWithBlockedDates} extrasData={mockExtras} />);

    // Verify that the mock was called with the correct props
    const calls = MockBookingCalendar.mock.calls;
    const lastCallProps = calls[calls.length - 1][0];

    expect(lastCallProps).toEqual(expect.objectContaining({
      blockedDates: expect.arrayContaining([expect.any(Date), expect.any(Date)])
    }));

    // Verify concrete date values
    // Verify concrete date values

    expect(lastCallProps.blockedDates).toHaveLength(2);
    expect(lastCallProps.blockedDates[0].toISOString()).toContain('2024-01-20');
  });

  it('handles empty blocked dates', async () => {
    mockUseUser.mockReturnValue({ user: { id: 'u1' }, isLoaded: true });

    const locationWithNoBlockedDates = {
      ...mockLocation,
      blockedDates: [],
    };

    render(<Booking selectedLocationId="loc1" location={locationWithNoBlockedDates} extrasData={mockExtras} />);

    const lastCall = MockBookingCalendar.mock.calls[MockBookingCalendar.mock.calls.length - 1];
    expect(lastCall[0]).toEqual(expect.objectContaining({
      blockedDates: []
    }));
  });

  it('handles adding and removing extras', async () => {
    mockUseUser.mockReturnValue({
      user: { firstName: 'Test', lastName: 'User', primaryEmailAddress: { emailAddress: 'test@example.com' } },
      isLoaded: true
    });
    render(<Booking selectedLocationId="loc1" location={mockLocation} extrasData={mockExtras} />);

    const addBtn = screen.getByText('Add Extra');
    const removeBtn = screen.getByText('Remove Extra');
    const weekdayBtn = screen.getByText('Set Weekday');

    act(() => { fireEvent.click(weekdayBtn); });
    await act(async () => { vi.advanceTimersByTime(1000); });

    act(() => { fireEvent.click(addBtn); });
    await act(async () => { vi.advanceTimersByTime(1000); });
    expect(global.fetch).toHaveBeenCalled();

    (global.fetch as any).mockClear();
    act(() => { fireEvent.click(removeBtn); });
    await act(async () => { vi.advanceTimersByTime(1000); });
    expect(global.fetch).toHaveBeenCalled();
  });

  it('handles payment intent update when already exists', async () => {
    mockUseUser.mockReturnValue({
      user: { firstName: 'Test', lastName: 'User', primaryEmailAddress: { emailAddress: 'test@example.com' } },
      isLoaded: true
    });

    render(<Booking selectedLocationId="loc1" location={mockLocation} extrasData={mockExtras} />);

    const weekdayBtn = screen.getByText('Set Weekday');
    act(() => { fireEvent.click(weekdayBtn); });
    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    const addBtn = screen.getByText('Add Extra');
    act(() => { fireEvent.click(addBtn); });
    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/update-payment-intent', expect.any(Object));
  });

  it('handles missing extra item fallback in payment intent', async () => {
    mockUseUser.mockReturnValue({
      user: { firstName: 'Test', lastName: 'User', primaryEmailAddress: { emailAddress: 'test@example.com' } },
      isLoaded: true
    });

    render(<Booking selectedLocationId="loc1" location={mockLocation} extrasData={mockExtras} />);

    const weekdayBtn = screen.getByText('Set Weekday');
    act(() => { fireEvent.click(weekdayBtn); });
    await act(async () => { vi.advanceTimersByTime(1000); });

    const invalidExtraBtn = screen.getByText('Add Invalid Extra');
    act(() => { fireEvent.click(invalidExtraBtn); });
    await act(async () => { vi.advanceTimersByTime(1000); });

    expect(global.fetch).toHaveBeenCalled();
  });

  it('handles fetch error gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
    (global.fetch as any).mockRejectedValueOnce(new Error('Fetch failed'));
    mockUseUser.mockReturnValue({ user: { id: 'u1' }, isLoaded: true });

    render(<Booking selectedLocationId="loc1" location={mockLocation} extrasData={mockExtras} />);
    const weekdayBtn = screen.getByText('Set Weekday');
    act(() => { fireEvent.click(weekdayBtn); });
    await act(async () => { vi.advanceTimersByTime(1000); });

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
