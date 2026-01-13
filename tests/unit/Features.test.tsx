import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Features } from '@/components/Features';

// Mock Lucide icons with a Proxy to handle any icon import
vi.mock('lucide-react', () => {
  return new Proxy({}, {
    get: (target, prop) => (props: any) => <svg data-testid={`icon-${String(prop)}`} {...props} />
  });
});

describe('Features Component', () => {
  it('renders default features when no props provided', () => {
    render(<Features />);
    expect(screen.getByText('Personalizado')).toBeDefined();
    expect(screen.getByText('Horarios')).toBeDefined();
    expect(screen.getByTestId('icon-HandHeart')).toBeDefined();
  });

  it('renders custom features when provided', () => {
    const customFeatures = [
      { title: 'Custom 1', description: 'Desc 1', icon: 'Clock8' },
      { title: 'Custom 2', description: 'Desc 2', icon: 'Mail' }
    ];
    render(<Features features={customFeatures} />);

    expect(screen.getByText('Custom 1')).toBeDefined();
    expect(screen.getByText('Desc 1')).toBeDefined();
    expect(screen.getByTestId('icon-Clock8')).toBeDefined();

    expect(screen.getByText('Custom 2')).toBeDefined();
    expect(screen.getByTestId('icon-Mail')).toBeDefined();
  });

  it('uses fallback icon for invalid icon name', () => {
    const customFeatures = [
      { title: 'Invalid Icon', description: 'Desc', icon: 'NonExistentIcon' }
    ];
    render(<Features features={customFeatures} />);

    expect(screen.getByText('Invalid Icon')).toBeDefined();
    // Sparkles is the defined fallback in Features.tsx
    expect(screen.getByTestId('icon-Sparkles')).toBeDefined();
  });
});
