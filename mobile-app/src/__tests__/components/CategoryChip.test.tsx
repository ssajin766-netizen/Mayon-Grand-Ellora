// src/__tests__/components/CategoryChip.test.tsx
import React from 'react';
import { Text } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import { CategoryChip } from '../../components/CategoryChip';

describe('CategoryChip component', () => {
  it('renders label, has testID, and triggers onPress', () => {
    const onPress = jest.fn();
    const { getByTestId, getByText } = render(
      <CategoryChip label="Family" selected={false} onPress={onPress} />
    );
    const chip = getByTestId('category-chip');
    expect(chip).toBeTruthy();
    expect(getByText('Family')).toBeTruthy();
    fireEvent.press(chip);
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
