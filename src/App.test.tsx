import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App Component', () => {
  it('renders without crashing', () => {
    render(<App />);
  });

  it('displays login page when not logged in', () => {
    render(<App />);
    const loginTitle = screen.queryByText(/Login/i);
    expect(loginTitle).toBeInTheDocument();
  });
});
