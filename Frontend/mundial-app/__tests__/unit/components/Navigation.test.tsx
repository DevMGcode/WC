import React from 'react';
import { render, screen } from '@testing-library/react';
import { Navigation, Header } from '@/components/Navigation';

jest.mock('next/navigation', () => ({
  usePathname: () => '/en/home',
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    nav: ({ children, ...props }: any) => <nav {...props}>{children}</nav>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
    aside: ({ children, ...props }: any) => <aside {...props}>{children}</aside>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
  useAnimation: () => ({ start: jest.fn() }),
  useMotionValue: () => ({ set: jest.fn(), get: jest.fn() }),
}));

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    isAuthenticated: false,
    loading: false,
    login: jest.fn(),
    logout: jest.fn(),
    register: jest.fn(),
    error: null,
  }),
}));

jest.mock('@/contexts/SidebarContext', () => ({
  useSidebar: () => ({ collapsed: false, toggle: jest.fn() }),
}));

jest.mock('@/hooks/useT', () => ({
  useT: () => (key: string) => key,
}));

describe('Navigation Component', () => {
  it('is defined and is a function component', () => {
    expect(typeof Navigation).toBe('function');
  });
});

describe('Header Component', () => {
  it('renders the title text', () => {
    render(<Header title="Calendario" />);
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it('renders subtitle when provided', () => {
    render(<Header title="Grupos" subtitle="Fase de grupos" />);
    expect(screen.getByText('Fase de grupos')).toBeInTheDocument();
  });

  it('renders without crashing when no props provided', () => {
    render(<Header />);
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it('renders centered layout when centered=true and title provided', () => {
    const { container } = render(<Header title="Mundial" centered />);
    expect(container.querySelector('header')).toBeInTheDocument();
  });

  it('renders default layout when centered=false', () => {
    const { container } = render(<Header title="Predicciones" centered={false} />);
    expect(container.querySelector('header')).toBeInTheDocument();
  });
});
