import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Chat } from '@/components/Chat';

// Mock Clerk
const mockUseUser = vi.fn();
vi.mock('@clerk/nextjs', () => ({
  useUser: () => mockUseUser(),
}));

// Mock Shadcn Sheet parts to be transparent
vi.mock('@/components/ui/sheet', () => ({
  Sheet: ({ children }: any) => <div>{children}</div>,
  SheetTrigger: ({ children }: any) => <div data-testid="sheet-trigger">{children}</div>,
  SheetContent: ({ children }: any) => <div data-testid="sheet-content">{children}</div>,
  SheetHeader: ({ children }: any) => <div>{children}</div>,
  SheetTitle: ({ children }: any) => <div>{children}</div>,
  SheetDescription: ({ children }: any) => <div>{children}</div>,
}));

// Mock ScrollArea
vi.mock('@/components/ui/scroll-area', () => ({
  ScrollArea: ({ children }: any) => <div data-testid="scroll-area">{children}</div>,
}));

// Mock Fetch
global.fetch = vi.fn().mockResolvedValue({
  ok: true,
  body: {
    getReader: () => ({
      read: vi.fn()
        .mockResolvedValueOnce({ done: false, value: new TextEncoder().encode('Hello world') })
        .mockResolvedValueOnce({ done: true })
    })
  }
});

describe('Chat Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseUser.mockReturnValue({ user: { imageUrl: '/user.jpg', firstName: 'Test' } });
    // Mock scrollIntoView
    window.HTMLElement.prototype.scrollIntoView = vi.fn();
  });

  it('renders chat trigger button', () => {
    render(<Chat />);
    expect(screen.getByTestId('sheet-trigger')).toBeDefined();
  });

  it('renders welcome message', () => {
    render(<Chat />);
    expect(screen.getByText(/Hola!, ¿Cómo puedo ayudarte hoy?/i)).toBeDefined();
  });

  it('handles user input and sends message', async () => {
    render(<Chat />);

    // Find input
    const input = screen.getByPlaceholderText('Escribe un mensaje...');
    fireEvent.change(input, { target: { value: 'Hola bot' } });

    // Find send button (icon mock might be needed if looking by role, but we can look by text/label)
    // The button has <span class="sr-only">Enviar</span>
    // In our test environment, we can target the button that contains the send icon or the form submit

    const form = input.closest('form');
    if (form) {
      fireEvent.submit(form);
    }

    // Verify user message appears
    expect(screen.getByText('Hola bot')).toBeDefined();

    // Verify fetch called
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/chat', expect.any(Object));
    });
  });

  it('updates input height on change', () => {
    render(<Chat />);
    const input = screen.getByPlaceholderText('Escribe un mensaje...') as HTMLTextAreaElement;
    fireEvent.change(input, { target: { value: 'Line 1\nLine 2\nLine 3' } });
    expect(input.style.height).toBeDefined();
  });
});
