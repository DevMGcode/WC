import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/Button';

describe('Button Component', () => {
  describe('Rendering', () => {
    it('should render button with text content', () => {
      render(<Button>Click Me</Button>);
      expect(screen.getByText('Click Me')).toBeInTheDocument();
    });

    it('should render button as button element', () => {
      render(<Button>Test</Button>);
      const button = screen.getByRole('button');
      expect(button.tagName).toBe('BUTTON');
    });

    it('should render disabled button', () => {
      render(<Button disabled>Disabled</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('should render loading state with spinner', () => {
      const { container } = render(<Button loading>Loading</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      // Should have opacity-50 class
      expect(button.className).toContain('opacity-50');
      // Should have SVG spinner
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('should show children text during loading', () => {
      render(<Button loading>Processing</Button>);
      expect(screen.getByText('Processing')).toBeInTheDocument();
    });
  });

  describe('Interactivity', () => {
    it('should call onClick handler when clicked', () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Click</Button>);
      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should not call onClick when disabled', () => {
      const handleClick = jest.fn();
      render(
        <Button disabled onClick={handleClick}>
          Disabled
        </Button>
      );
      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('should not call onClick when loading', () => {
      const handleClick = jest.fn();
      render(
        <Button loading onClick={handleClick}>
          Loading
        </Button>
      );
      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('should support type attribute', () => {
      render(<Button type="submit">Submit</Button>);
      const button = screen.getByRole('button') as HTMLButtonElement;
      expect(button.type).toBe('submit');
    });
  });

  describe('Styling', () => {
    it('should apply primary variant by default', () => {
      const { container } = render(<Button>Primary</Button>);
      const button = container.querySelector('button');
      expect(button?.className).toContain('from-emerald-500');
      expect(button?.className).toContain('to-cyan-500');
    });

    it('should apply secondary variant', () => {
      const { container } = render(<Button variant="secondary">Secondary</Button>);
      const button = container.querySelector('button');
      expect(button?.className).toContain('from-slate-700');
      expect(button?.className).toContain('to-slate-800');
    });

    it('should apply outline variant', () => {
      const { container } = render(<Button variant="outline">Outline</Button>);
      const button = container.querySelector('button');
      expect(button?.className).toContain('border-cyan-400');
    });

    it('should apply danger variant', () => {
      const { container } = render(<Button variant="danger">Delete</Button>);
      const button = container.querySelector('button');
      expect(button?.className).toContain('from-rose-600');
    });

    it('should apply sm size', () => {
      const { container } = render(<Button size="sm">Small</Button>);
      const button = container.querySelector('button');
      expect(button?.className).toContain('px-3');
      expect(button?.className).toContain('py-1.5');
    });

    it('should apply md size by default', () => {
      const { container } = render(<Button>Medium</Button>);
      const button = container.querySelector('button');
      expect(button?.className).toContain('px-6');
      expect(button?.className).toContain('py-2.5');
    });

    it('should apply lg size', () => {
      const { container } = render(<Button size="lg">Large</Button>);
      const button = container.querySelector('button');
      expect(button?.className).toContain('px-8');
      expect(button?.className).toContain('py-3.5');
    });

    it('should apply custom className', () => {
      const { container } = render(<Button className="custom-class">Custom</Button>);
      const button = container.querySelector('button');
      expect(button?.className).toContain('custom-class');
    });
  });

  describe('Disabled State', () => {
    it('should apply opacity-50 when disabled', () => {
      const { container } = render(<Button disabled>Disabled</Button>);
      const button = container.querySelector('button');
      expect(button?.className).toContain('opacity-50');
      expect(button?.className).toContain('cursor-not-allowed');
    });

    it('should apply opacity-50 when loading', () => {
      const { container } = render(<Button loading>Loading</Button>);
      const button = container.querySelector('button');
      expect(button?.className).toContain('opacity-50');
      expect(button?.className).toContain('cursor-not-allowed');
    });
  });

  describe('Accessibility', () => {
    it('should have button role', () => {
      render(<Button>Accessible</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should support aria-label', () => {
      render(<Button aria-label="Close Modal">×</Button>);
      expect(screen.getByLabelText('Close Modal')).toBeInTheDocument();
    });

    it('should indicate disabled state', () => {
      render(<Button disabled>Disabled</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('should support aria-pressed', () => {
      render(<Button aria-pressed="false">Toggle</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-pressed', 'false');
    });
  });
});
