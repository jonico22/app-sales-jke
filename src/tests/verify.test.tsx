import { describe, it, expect } from 'vitest';
import { render, screen } from './test-utils';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { server } from './setup';

describe('Vitest Setup Verification', () => {
  it('should work with standard matchers', () => {
    expect(1 + 1).toBe(2);
  });

  it('should work with jsdom and testing-library', () => {
    render(React.createElement('div', { id: 'test' }, 'Hello Vitest'));
    const element = screen.getByText('Hello Vitest');
    expect(element).toBeInTheDocument();
    expect(element).toHaveAttribute('id', 'test');
  });

  it('should work with MSW', async () => {
    // Definir un handler temporal para este test
    server.use(
      http.get('https://api.example.com/user', () => {
        return HttpResponse.json({ name: 'John Doe' });
      })
    );

    const response = await fetch('https://api.example.com/user');
    const user = await response.json();

    expect(user.name).toBe('John Doe');
  });

  it('should work with React Query + MSW', async () => {
    // Definir un endpoint mockeado
    server.use(
      http.get('https://api.example.com/status', () => {
        return HttpResponse.json({ status: 'ok' });
      })
    );

    // Componente que usa useQuery
    function StatusComponent() {
      const { data, isLoading } = useQuery({
        queryKey: ['status'],
        queryFn: () => fetch('https://api.example.com/status').then(res => res.json())
      });

      if (isLoading) return <div>Cargando...</div>;
      return <div>Status: {data.status}</div>;
    }

    render(<StatusComponent />);

    // Verificar estado inicial
    expect(screen.getByText('Cargando...')).toBeInTheDocument();

    // Esperar a que el query finalice
    const statusText = await screen.findByText('Status: ok');
    expect(statusText).toBeInTheDocument();
  });
});
