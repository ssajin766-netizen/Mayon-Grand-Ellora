// __tests__/components/ContactCard.test.tsx
import React from 'react';
import { render } from '@testing-library/react-native';
import ContactCard from '../../components/ContactCard';

// Mock react-redux hooks
jest.mock('react-redux', () => ({
  useDispatch: () => jest.fn(),
  useSelector: jest.fn(() => false), // loading = false
}));

// Mock CategoryChip to avoid theme dependency
jest.mock('../../components/CategoryChip', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    __esModule: true,
    default: ({ category }: { category: string }) => <Text>{category}</Text>,
  };
});

// Mock GlassCard to simply render its children
jest.mock('../../components/GlassCard', () => {
  return {
    __esModule: true,
    default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

// Mock QuickActionButton to avoid native icons
jest.mock('../../components/QuickActionButton', () => {
  return {
    __esModule: true,
    default: () => null,
  };
});

describe('ContactCard smoke test', () => {
  const mockContact = {
    id: 'test-id',
    name: 'John Doe',
    phone: '+1234567890',
    email: 'john@example.com',
    address: '123 Main St',
    category: 'Family',
    enabled: true,
  };

  it('renders contact name, category and phone', () => {
    const { getByText } = render(
      <ContactCard contact={mockContact} isAdmin={true} />
    );
    // Verify name
    expect(getByText('John Doe')).toBeTruthy();
    // Verify category (CategoryChip mock renders category text)
    expect(getByText('Family')).toBeTruthy();
    // Verify phone
    expect(getByText('+1234567890')).toBeTruthy();
  });
});
