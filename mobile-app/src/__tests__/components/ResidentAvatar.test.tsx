// src/__tests__/components/ResidentAvatar.test.tsx
import React from 'react';
import { render } from '@testing-library/react-native';
import ResidentAvatar from '../../components/residents/ResidentAvatar';
import { ThemeProvider } from '../../theme'; // adjust if needed

const renderWithTheme = (ui: React.ReactElement) =>
  render(<ThemeProvider>{ui}</ThemeProvider>);

describe('ResidentAvatar', () => {
  it('shows image when profilePhotoUrl is provided', () => {
    const { getByTestId } = renderWithTheme(
      <ResidentAvatar
        firstName="John"
        lastName="Doe"
        profilePhotoUrl="https://example.com/photo.jpg"
      />,
    );
    // Assuming avatar image has testID='resident-avatar-image'
    expect(getByTestId('resident-avatar-image')).toBeTruthy();
  });

  it('falls back to initials when no image', () => {
    const { getByText } = renderWithTheme(
      <ResidentAvatar firstName="John" lastName="Doe" />,
    );
    expect(getByText('JD')).toBeTruthy();
  });
});
