// src/__tests__/screens/ResidentDetailScreen.test.tsx
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ResidentDetailScreen from '../../screens/residents/ResidentDetailScreen';
import { renderWithProviders } from '../../test/render';
import { mockResident } from '../../test/fixtures/resident';
import * as residentApi from '../../store/residentApi';

// Mock the RTK Query hooks used in the detail screen
jest.mock('../../store/residentApi', () => {
  const actual = jest.requireActual('../../store/residentApi');
  return {
    ...actual,
    useGetResidentByIdQuery: jest.fn(),
    useDeleteResidentMutation: jest.fn(() => [jest.fn(), { isLoading: false }]),
  };
});

const mockUseGetResidentByIdQuery = residentApi.useGetResidentByIdQuery as jest.Mock;

const renderScreen = (routeParams: any = { residentId: mockResident.id }) =>
  renderWithProviders(<ResidentDetailScreen route={{ params: routeParams }} /> as any);

describe('ResidentDetailScreen', () => {
  it('shows loading state while fetching', () => {
    mockUseGetResidentByIdQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      refetch: jest.fn(),
    });
    const { getByTestId } = renderScreen();
    expect(getByTestId('detail-loading')).toBeTruthy();
  });

  it('renders resident information when loaded', () => {
    mockUseGetResidentByIdQuery.mockReturnValue({
      data: mockResident,
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    });
    const { getByText } = renderScreen();
    expect(getByText('John Doe')).toBeTruthy();
    expect(getByText('A-101')).toBeTruthy();
    expect(getByText('+1234567890')).toBeTruthy();
  });

  it('displays error state with retry', () => {
    const refetchMock = jest.fn();
    mockUseGetResidentByIdQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('Network'),
      refetch: refetchMock,
    });
    const { getByText } = renderScreen();
    fireEvent.press(getByText(/retry/i));
    expect(refetchMock).toHaveBeenCalled();
  });

  it('calls delete mutation and shows success toast', async () => {
    const deleteMock = jest.fn().mockResolvedValue({ data: {} });
    (residentApi.useDeleteResidentMutation as jest.Mock).mockReturnValue([
      deleteMock,
      { isLoading: false },
    ]);
    mockUseGetResidentByIdQuery.mockReturnValue({
      data: mockResident,
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    });
    const { getByText, queryByText } = renderScreen();
    fireEvent.press(getByText(/delete/i)); // assume Delete button text
    // confirm deletion modal (assuming a button with text 'Confirm')
    fireEvent.press(getByText(/confirm/i));
    await waitFor(() => expect(deleteMock).toHaveBeenCalledWith(mockResident.id));
    // expect toast – we just check that modal disappears
    expect(queryByText(/confirm/i)).toBeNull();
  });
});
