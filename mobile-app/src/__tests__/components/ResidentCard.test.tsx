// src/__tests__/components/ResidentCard.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ResidentCard from '../../components/residents/ResidentCard';
import { ThemeProvider } from '../../theme'; // adjust import if needed

const renderWithTheme = (ui: React.ReactElement) =>
  render(<ThemeProvider>{ui}</ThemeProvider>);

describe('ResidentCard', () => {
  const mockResident = {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    unitNumber: 'A-101',
    phone: '+1234567890',
    status: 'active' as const,
    // other required fields can be omitted if component uses only subset
  } as any; // cast to any to satisfy props

  it('renders resident information', () => {
    const { getByText } = renderWithTheme(
      <ResidentCard resident={mockResident} onPress={() => {}} />,
    );
    expect(getByText('John Doe')).toBeTruthy();
    expect(getByText('A-101')).toBeTruthy();
    expect(getByText('+1234567890')).toBeTruthy();
  });

  it('calls onPress when tapped', () => {
    const onPressMock = jest.fn();
    const { getByTestId } = renderWithTheme(
      <ResidentCard resident={mockResident} onPress={onPressMock} />,
    );
    // Assuming the pressable container has testID='resident-card-touchable'
    fireEvent.press(getByTestId('resident-card-touchable'));
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });
});
