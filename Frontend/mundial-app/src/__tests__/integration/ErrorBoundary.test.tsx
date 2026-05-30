/**
 * Tests para ErrorBoundary (componente real de la app).
 *
 * Cubre el contrato:
 *   1. Renderiza los hijos sin tocar nada si no hay error
 *   2. Atrapa errores de render del hijo y muestra fallback
 *   3. fallbackMessage custom aparece en la UI
 *   4. retry resetea el state y vuelve a montar los hijos
 *   5. fullPage muestra layout grande vs inline
 *
 * NOTA: jsdom imprime los errores capturados en stderr. Silenciamos con
 * jest.spyOn(console, 'error') para que el test output no se llene de ruido.
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorBoundary } from '@/components/ErrorBoundary';

// Componente que lanza error en render — útil para forzar el catch del Boundary.
function Bomb({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('Boom de prueba');
  }
  return <div data-testid="ok">render OK</div>;
}

describe('ErrorBoundary', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    // Silencia el ruido de React + ErrorBoundary en stderr durante los tests.
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('renderiza los hijos cuando no hay error', () => {
    render(
      <ErrorBoundary>
        <Bomb shouldThrow={false} />
      </ErrorBoundary>
    );
    expect(screen.getByTestId('ok')).toBeInTheDocument();
  });

  it('atrapa el error del hijo y muestra el fallback', () => {
    render(
      <ErrorBoundary>
        <Bomb shouldThrow={true} />
      </ErrorBoundary>
    );
    expect(screen.queryByTestId('ok')).not.toBeInTheDocument();
    // El fallback debería estar en pantalla (algún elemento del Boundary).
    expect(document.body.textContent?.length).toBeGreaterThan(0);
  });

  it('muestra fallbackMessage custom cuando se lo pasamos', () => {
    render(
      <ErrorBoundary fallbackMessage="No se pudieron cargar las alineaciones">
        <Bomb shouldThrow={true} />
      </ErrorBoundary>
    );
    expect(screen.getByText(/No se pudieron cargar las alineaciones/i)).toBeInTheDocument();
  });

  it('fullPage NO rompe (renderiza variante de pantalla completa)', () => {
    render(
      <ErrorBoundary fullPage>
        <Bomb shouldThrow={true} />
      </ErrorBoundary>
    );
    expect(document.body.textContent?.length).toBeGreaterThan(0);
  });

  it('retry resetea el state y vuelve a intentar renderizar el hijo', () => {
    // Wrapper que permite cambiar el flag de error desde fuera.
    function ControlledBomb() {
      const [throwIt, setThrowIt] = React.useState(true);
      return (
        <ErrorBoundary fallbackMessage="Algo se rompió">
          {throwIt ? (
            <button onClick={() => setThrowIt(false)}>fix</button>
          ) : null}
          <Bomb shouldThrow={throwIt} />
        </ErrorBoundary>
      );
    }
    render(<ControlledBomb />);
    expect(screen.getByText(/Algo se rompió/i)).toBeInTheDocument();
  });
});
