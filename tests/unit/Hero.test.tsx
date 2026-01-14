import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Hero } from '@/components/Hero';

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

// Mock Image
vi.mock('next/image', () => ({
  default: ({ fill, priority, ...props }: any) => (
    <img
      {...props}
      data-fill={fill?.toString()}
      loading={priority ? 'eager' : 'lazy'}
    />
  ),
}));

describe('Hero Component', () => {
  it('renders default content when no props provided', () => {
    mockUseUser.mockReturnValue({ user: null });
    render(<Hero />);

    expect(screen.getByText('Experiencias Únicas')).toBeDefined();
    expect(screen.getByText('Cool Morning es tu aliado perfecto para esas ocasiones especiales con tus seres queridos.')).toBeDefined();
    const bgImage = screen.getByAltText('Romantic Dinner');
    expect(bgImage.getAttribute('src')).toBe('/hero-bg.png');
  });

  it('renders dynamic content when props provided', () => {
    mockUseUser.mockReturnValue({ user: null });
    const props = {
      title: 'Custom Title',
      description: 'Custom Description',
      imageUrl: '/custom.jpg'
    };
    render(<Hero {...props} />);

    expect(screen.getByText('Custom Title')).toBeDefined();
    expect(screen.getByText('Custom Description')).toBeDefined();
    const bgImage = screen.getByAltText('Romantic Dinner');
    expect(bgImage.getAttribute('src')).toBe('/custom.jpg');
  });

  it('renders sign in button when signed out', () => {
    mockUseUser.mockReturnValue({ user: null });
    render(<Hero />);
    expect(screen.getByText('Inicia Sesión')).toBeDefined();
    expect(screen.queryByText('Mis Reservas')).toBeNull();
  });

  it('renders mis reservas button when signed in', () => {
    mockUseUser.mockReturnValue({ user: { id: 'user1' } });
    render(<Hero />);
    expect(screen.queryByText('Inicia Sesión')).toBeNull();
    expect(screen.getByText('Mis Reservas')).toBeDefined();
  });
});
