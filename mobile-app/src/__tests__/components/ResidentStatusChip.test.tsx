// src/__tests__/components/ResidentStatusChip.test.tsx
import React from 'react';
import { render } from '@testing-library/react-native';
import ResidentStatusChip from '../../components/residents/ResidentStatusChip';
import { ThemeProvider } from '../../theme'; // named import

const renderWithTheme = (ui: React.ReactElement) =>
  render(<ThemeProvider>{ui}</ThemeProvider>);

describe('ResidentStatusChip', () => {
  it('renders Active correctly', () => {
    const { getByText } = renderWithTheme(
      <ResidentStatusChip status="active" />,
    );
    expect(getByText('Active')).toBeTruthy();
  });

  it('renders Inactive correctly', () => {
    const { getByText } = renderWithTheme(
      <ResidentStatusChip status="inactive" />,
    );
    expect(getByText('Inactive')).toBeTruthy();
  });
});
