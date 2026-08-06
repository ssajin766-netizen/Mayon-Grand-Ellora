// src/__tests__/components/QuickActionButton.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { QuickActionButton } from '../../components/QuickActionButton';

describe('QuickActionButton component', () => {
  it('renders with correct testID and calls onPress', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <QuickActionButton type="call" onPress={onPress} />
    );
    const button = getByTestId('quick-action-call');
    expect(button).toBeTruthy();
    fireEvent.press(button);
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
