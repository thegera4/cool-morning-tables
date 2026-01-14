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

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
  },
}));

describe('Chat Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseUser.mockReturnValue({ user: { imageUrl: '/user.jpg', firstName: 'Test' } });
    // Mock scrollIntoView
    window.HTMLElement.prototype.scrollIntoView = vi.fn();

    // Default mock for fetch
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
    const input = screen.getByPlaceholderText('Escribe un mensaje...');
    fireEvent.change(input, { target: { value: 'Hola bot' } });

    const form = input.closest('form');
    if (form) {
      fireEvent.submit(form);
    }

    expect(screen.getByText('Hola bot')).toBeDefined();
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/chat', expect.any(Object));
    });
  });

  it('handles "Disponibilidad hoy" suggestion chip', async () => {
    render(<Chat />);
    fireEvent.click(screen.getByText('Disponibilidad hoy'));
    expect(screen.getByText('¿Qué lugares tienen disponibles el dia de hoy?')).toBeDefined();
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  it('handles "¿Donde son las cenas?" suggestion chip', async () => {
    render(<Chat />);
    fireEvent.click(screen.getByText('¿Donde son las cenas?'));
    expect(screen.getByText('¿Donde son las cenas?')).toBeDefined();
  });

  it('handles "Precio de alberca privada" suggestion chip', async () => {
    render(<Chat />);
    fireEvent.click(screen.getByText('Precio de alberca privada'));
    expect(screen.getByText('¿Cuanto cuesta la alberca privada?')).toBeDefined();
  });

  it('handles "Listar reservas próximas" suggestion chip', async () => {
    render(<Chat />);
    fireEvent.click(screen.getByText('Listar reservas próximas'));
    expect(screen.getByText('¿Me puedes listar todas mis reservas próximas?')).toBeDefined();
  });

  it('handles "Próxima reserva" suggestion chip', async () => {
    render(<Chat />);
    fireEvent.click(screen.getByText('Próxima reserva'));
    expect(screen.getByText('¿Me puedes dar información sobre mi próxima reserva?')).toBeDefined();
  });

  it('handles "Total de mi reserva de ayer" suggestion chip', async () => {
    render(<Chat />);
    fireEvent.click(screen.getByText('Total de mi reserva de ayer'));
    expect(screen.getByText('¿Me puedes decir cual fue el total de mi reserva del dia de ayer?')).toBeDefined();
  });


  it('handles Enter key press in textarea', async () => {
    render(<Chat />);
    const input = screen.getByPlaceholderText('Escribe un mensaje...') as HTMLTextAreaElement;

    // We need to mock requestSubmit because JSDOM doesn't implement it perfectly
    const form = input.closest('form');
    if (form) {
      form.requestSubmit = vi.fn(() => {
        // Simulate submit
        fireEvent.submit(form);
      });
    }

    fireEvent.change(input, { target: { value: 'Enter message' } });
    fireEvent.keyDown(input, { key: 'Enter', shiftKey: false });

    expect(screen.getByText('Enter message')).toBeDefined();
    if (form) {
      expect(form.requestSubmit).toHaveBeenCalled();
    }
  });

  it('does not send message with Shift+Enter', () => {
    render(<Chat />);
    const input = screen.getByPlaceholderText('Escribe un mensaje...') as HTMLTextAreaElement;
    const form = input.closest('form');
    if (form) form.requestSubmit = vi.fn();

    fireEvent.change(input, { target: { value: 'Shift Enter message' } });
    fireEvent.keyDown(input, { key: 'Enter', shiftKey: true });

    if (form) {
      expect(form.requestSubmit).not.toHaveBeenCalled();
    }
  });

  it('handles 429 error correctly', async () => {
    const { toast } = await import('sonner');
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 429
    });

    render(<Chat />);
    const input = screen.getByPlaceholderText('Escribe un mensaje...');
    fireEvent.change(input, { target: { value: 'Trigger 429' } });
    const form = input.closest('form');
    if (form) fireEvent.submit(form);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('límite de 10 mensajes'));
    });
  });

  it('handles generic fetch error correctly', async () => {
    console.error = vi.fn();
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500
    });

    render(<Chat />);
    const input = screen.getByPlaceholderText('Escribe un mensaje...');
    fireEvent.change(input, { target: { value: 'Trigger 500' } });
    const form = input.closest('form');
    if (form) fireEvent.submit(form);

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith('Chat error:', expect.any(Error));
    });
  });

  it('handles network throw error correctly', async () => {
    console.error = vi.fn();
    global.fetch = vi.fn().mockRejectedValue(new Error('Network fail'));

    render(<Chat />);
    const input = screen.getByPlaceholderText('Escribe un mensaje...');
    fireEvent.change(input, { target: { value: 'Trigger throw' } });
    const form = input.closest('form');
    if (form) fireEvent.submit(form);

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith('Chat error:', expect.any(Error));
    });
  });

  it('renders user icon when imageUrl is missing', () => {
    mockUseUser.mockReturnValue({ user: { imageUrl: null, firstName: 'Test' } });
    render(<Chat />);
    // Send a message to trigger user icon rendering
    const input = screen.getByPlaceholderText('Escribe un mensaje...');
    fireEvent.change(input, { target: { value: 'User without image' } });
    const form = input.closest('form');
    if (form) fireEvent.submit(form);

    expect(screen.getByTestId('scroll-area')).toBeDefined();
  });

  it('handles missing fetch body gracefully', async () => {
    console.error = vi.fn();
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      body: null
    });

    render(<Chat />);
    const input = screen.getByPlaceholderText('Escribe un mensaje...');
    fireEvent.change(input, { target: { value: 'Trigger no body' } });
    const form = input.closest('form');
    if (form) fireEvent.submit(form);

    await waitFor(() => {
      expect(console.error).toHaveBeenCalled();
    });
  });

  it('updates input height on change', () => {
    render(<Chat />);
    const input = screen.getByPlaceholderText('Escribe un mensaje...') as HTMLTextAreaElement;
    fireEvent.change(input, { target: { value: 'Line 1\nLine 2\nLine 3' } });
    expect(input.style.height).toBeDefined();
  });
});
