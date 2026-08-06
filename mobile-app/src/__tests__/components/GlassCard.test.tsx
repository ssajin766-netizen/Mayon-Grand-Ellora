// src/__tests__/components/GlassCard.test.tsx
import React from 'react';
import { Text } from 'react-native';
import { render } from '@testing-library/react-native';
jest.mock('../../theme', () => ({ useTheme: () => ({ colors: { card: '#fff', cardLight: '#fff' }, radii: { md: 8 }, elevation: { md: 4 } }) }));
import GlassCard from '../../components/GlassCard';

describe('GlassCard component', () => {
  it('renders children and has testID', () => {
    const { getByTestId, getByText } = render(
      <GlassCard style={{}}>
        <Text>Inside Card</Text>
      </GlassCard>
    );
    expect(getByTestId('glass-card')).toBeTruthy();
    expect(getByText('Inside Card')).toBeTruthy();
  });
});
