import { render, screen } from '@testing-library/react';
import App from './App';

test('renders HomePage heading', () => {
  render(<App />);
  const headingElement = screen.getByText(/Vítejte na úvodní stránce!/i);
  expect(headingElement).toBeInTheDocument();
});
