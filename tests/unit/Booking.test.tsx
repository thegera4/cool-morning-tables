import { render, screen, waitFor, act } from '@testing-library/react'; // Add waitFor and act
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Booking } from '@/components/Booking';

// Mock child components
vi.mock('@/components/BookingCalendar', () => ({
  BookingCalendar: () => <div data-testid="booking-calendar">Calendar</div>,
}));
vi.mock('@/components/ContactForm', () => ({
  ContactForm: () => <div data-testid="contact-form">ContactForm</div>,
}));
vi.mock('@/components/PaymentForm', () => ({
  PaymentForm: () => <div data-testid="payment-form">PaymentForm</div>,
}));
vi.mock('@/components/ExtrasSelector', () => ({
  ExtrasSelector: () => <div data-testid="extras-selector">ExtrasSelector</div>,
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
    // Basic simulation: if user exists, render children
    const { user } = mockUseUser();
    return user ? <>{children}</> : null;
  },
  SignedOut: ({ children }: any) => {
    // Basic simulation: if no user, render children
    const { user } = mockUseUser();
    return !user ? <>{children}</> : null;
  },
  SignInButton: ({ children }: any) => <div>{children}</div>,
}));

// Mock Sanity client
vi.mock('@/sanity/lib/client', () => ({
  client: {
    fetch: vi.fn().mockResolvedValue([]),
  },
}));

// Mock Data
const mockLocation = {
  _id: 'loc1',
  id: 'loc1', // Added id
  imageUrl: '/test.jpg', // Added imageUrl
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
    // Mock scrollIntoView which is not implemented in JSDOM
    window.HTMLElement.prototype.scrollIntoView = vi.fn();
  });


  afterEach(() => {
    vi.useRealTimers();
  });


  it('renders sign-in prompt when user is signed out', () => {
    mockUseUser.mockReturnValue({ user: null, isLoaded: true });

    render(<Booking selectedLocationId="loc1" location={mockLocation} extrasData={mockExtras} />);

    expect(screen.getByText('¡Casi listo!')).toBeDefined();
    // Use more specific selector for the button to avoid ambiguity
    expect(screen.getByRole('button', { name: /Inicia sesión/i })).toBeDefined();

    // Advance timers and wait for any effects
    act(() => {
      vi.runAllTimers();
    });


    // Should not render booking components
    expect(screen.queryByTestId('booking-calendar')).toBeNull();
  });

  it('renders booking form when user is signed in', () => {
    mockUseUser.mockReturnValue({
      user: { firstName: 'Test', lastName: 'User', primaryEmailAddress: { emailAddress: 'test@example.com' } },
      isLoaded: true
    });

    render(<Booking selectedLocationId="loc1" location={mockLocation} extrasData={mockExtras} />);

    // Should render booking components wrapped in StripeWrapper
    expect(screen.getByTestId('stripe-wrapper')).toBeDefined();
    expect(screen.getByTestId('booking-calendar')).toBeDefined();
    expect(screen.getByTestId('contact-form')).toBeDefined();
    expect(screen.getByTestId('extras-selector')).toBeDefined();
    expect(screen.getByTestId('order-summary')).toBeDefined();

    // Advance timers and wait for any effects
    act(() => {
      vi.runAllTimers();
    });


  });
});
