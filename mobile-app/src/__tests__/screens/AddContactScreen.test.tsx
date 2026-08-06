// src/__tests__/screens/AddContactScreen.test.tsx
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import AddContactScreen from '../../screens/AddContactScreen';

// Mock child components used by AddContactScreen
jest.mock('../../components/GlassCard', () => 'GlassCard');
jest.mock('../../components/CategoryChip', () => {
  const React = require('react');
  const { TouchableOpacity, Text } = require('react-native');
  return (props) => (
    <TouchableOpacity onPress={props.onPress} testID={`category-chip-${props.label}`}>
      <Text>{props.label}</Text>
    </TouchableOpacity>
  );
});
jest.mock('../../components/EmptyStateView', () => {
  const React = require('react');
  const { View } = require('react-native');
  return (props) => (
    <View testID="empty-state-view" {...props} />
  );
});

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({ navigate: mockNavigate }),
  };
});

// No middleware needed for mock store
const mockStore = configureStore([]);

// Mock thunks to return plain actions
jest.mock('../../store/emergencyContactsSlice', () => {
  const actual = jest.requireActual('../../store/emergencyContactsSlice');
  return {
    ...actual,
    fetchEmergencyCategoriesThunk: () => ({ type: 'FETCH_CATEGORIES' }),
    addEmergencyContact: () => ({ type: 'ADD_CONTACT' }),
  };
});

describe('AddContactScreen', () => {
  const baseState = {
    emergency: {
      contacts: [],
      categories: ['Fire', 'Medical'],
      loading: false,
      error: null,
    },
    auth: { role: 'admin' },
  };

  const renderWithStore = (overrides = {}) => {
    const store = mockStore({ ...baseState, ...overrides });
    return render(
      <Provider store={store}>
        <AddContactScreen />
      </Provider>
    );
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('shows validation errors when required fields are empty', async () => {
    const { getByText, getByPlaceholderText } = renderWithStore();
    fireEvent.press(getByText('Add Contact'));
    await waitFor(() => {
      expect(getByText('Name is required')).toBeTruthy();
      expect(getByText('Phone number is required')).toBeTruthy();
      expect(getByText('Category is required')).toBeTruthy();
    });
  });

  it('shows phone format validation error', async () => {
    const { getByPlaceholderText, getByText } = renderWithStore();
    fireEvent.changeText(getByPlaceholderText('Contact name'), 'Alice');
    fireEvent.changeText(getByPlaceholderText('Phone number'), 'abc');
    fireEvent.press(getByText('Add Contact'));
    await waitFor(() => {
      expect(getByText('Invalid phone format')).toBeTruthy();
    });
  });

  it('dispatches addEmergencyContact and navigates on successful submit', async () => {
    const { getByPlaceholderText, getByText, getByTestId } = renderWithStore();
    fireEvent.changeText(getByPlaceholderText('Contact name'), 'Bob');
    fireEvent.changeText(getByPlaceholderText('Phone number'), '+1234567890');
    fireEvent.press(getByTestId('category-chip-Fire'));
    fireEvent.press(getByText('Add Contact'));
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('ContactList');
    });
  });

  it('shows loading indicator when loading', () => {
    const { getByTestId } = renderWithStore({
      emergency: { ...baseState.emergency, loading: true },
    });
    expect(getByTestId('ActivityIndicator')).toBeTruthy();
  });

  it('displays error view when there is an error', () => {
    const { getByTestId } = renderWithStore({
      emergency: { ...baseState.emergency, error: 'Network error' },
    });
    expect(getByTestId('empty-state-view')).toBeTruthy();
  });
});
