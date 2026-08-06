// src/__tests__/components/EmptyStateView.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import EmptyStateView from '../../components/EmptyStateView';

describe('EmptyStateView component', () => {
  it('renders default title and description with testID', () => {
    const { getByTestId, getByText } = render(<EmptyStateView />);
    expect(getByTestId('empty-state-view')).toBeTruthy();
    expect(getByText('No Contacts Yet')).toBeTruthy();
    expect(getByText('Add a new emergency contact to get started.')).toBeTruthy();
  });

  it('calls onRetry when Retry button is pressed', () => {
    const onRetry = jest.fn();
    const { getByText } = render(<EmptyStateView onRetry={onRetry} />);
    const button = getByText('Retry');
    fireEvent.press(button);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
