// src/__tests__/screens/ResidentFormScreen.test.tsx
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ResidentFormScreen from '../../screens/residents/ResidentFormScreen';
import { renderWithProviders } from '../../test/render';
import { mockResident } from '../../test/fixtures/resident';
import * as residentApi from '../../store/residentApi';

// Mock RTK Query mutations used in the form screen
jest.mock('../../store/residentApi', () => {
  const actual = jest.requireActual('../../store/residentApi');
  return {
    ...actual,
    useCreateResidentMutation: jest.fn(() => [jest.fn().mockResolvedValue({ data: {} }), { isLoading: false }]),
    useUpdateResidentMutation: jest.fn(() => [jest.fn().mockResolvedValue({ data: {} }), { isLoading: false }]),
    useGetResidentByIdQuery: jest.fn(), // used when editing
  };
});

const renderScreen = (mode: 'create' | 'edit' = 'create', resident = null) => {
  const route = mode === 'edit' ? { params: { mode, residentId: mockResident.id } } : { params: { mode } };
  // Mock fetching resident for edit mode
  if (mode === 'edit') {
    (residentApi.useGetResidentByIdQuery as jest.Mock).mockReturnValue({
      data: mockResident,
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    });
  }
  return renderWithProviders(<ResidentFormScreen route={route as any} /> as any);
};

describe('ResidentFormScreen', () => {
  it('validates required fields in create mode', async () => {
    const { getByPlaceholderText, getByText } = renderScreen('create');
    // Assuming inputs have placeholder texts
    const saveButton = getByText(/save/i);
    fireEvent.press(saveButton);
    await waitFor(() => {
      expect(getByText(/first name is required/i)).toBeTruthy();
    });
  });

  it('submits create mutation when valid', async () => {
    const createMock = jest.fn().mockResolvedValue({ data: {} });
    (residentApi.useCreateResidentMutation as jest.Mock).mockReturnValue([createMock, { isLoading: false }]);
    const { getByPlaceholderText, getByText } = renderScreen('create');
    fireEvent.changeText(getByPlaceholderText('First Name'), 'John');
    fireEvent.changeText(getByPlaceholderText('Last Name'), 'Doe');
    fireEvent.changeText(getByPlaceholderText('Phone'), '+1234567890');
    fireEvent.press(getByText(/save/i));
    await waitFor(() => expect(createMock).toHaveBeenCalled());
  });

  it('loads existing resident in edit mode and updates', async () => {
    const updateMock = jest.fn().mockResolvedValue({ data: {} });
    (residentApi.useUpdateResidentMutation as jest.Mock).mockReturnValue([updateMock, { isLoading: false }]);
    const { getByPlaceholderText, getByText } = renderScreen('edit');
    // Verify pre-filled values
    expect((getByPlaceholderText('First Name') as any).props.value).toBe('John');
    fireEvent.changeText(getByPlaceholderText('Phone'), '+1987654321');
    fireEvent.press(getByText(/save/i));
    await waitFor(() => expect(updateMock).toHaveBeenCalledWith({
      ...mockResident,
      phone: '+1987654321',
    }));
  });
});
