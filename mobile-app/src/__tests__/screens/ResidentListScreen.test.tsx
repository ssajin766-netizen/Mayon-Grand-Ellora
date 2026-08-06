// src/__tests__/screens/ResidentListScreen.test.tsx
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ResidentListScreen from '../../screens/residents/ResidentListScreen';
import { renderWithProviders } from '../../test/render';
import { mockResident } from '../../test/fixtures/resident';
import * as residentApi from '../../store/residentApi';

// Mock the RTK Query hooks
jest.mock('../../store/residentApi', () => {
  const actual = jest.requireActual('../../store/residentApi');
  return {
    ...actual,
    useGetResidentsQuery: jest.fn(),
    useDeleteResidentMutation: jest.fn(() => [jest.fn(), { isLoading: false }]),
  };
});

const mockUseGetResidentsQuery = residentApi.useGetResidentsQuery as jest.Mock;

const renderScreen = (props = {}) =>
  renderWithProviders(<ResidentListScreen {...props} />);

describe('ResidentListScreen', () => {
  it('shows loading skeleton while loading', () => {
    mockUseGetResidentsQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      refetch: jest.fn(),
    });
    const { getByTestId } = renderScreen();
    expect(getByTestId('loading-skeleton')).toBeTruthy();
  });

  it('shows empty state when no residents', () => {
    mockUseGetResidentsQuery.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    });
    const { getByText } = renderScreen();
    expect(getByText(/no residents/i)).toBeTruthy();
  });

  it('renders a list of residents', () => {
    mockUseGetResidentsQuery.mockReturnValue({
      data: [mockResident],
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    });
    const { getByText } = renderScreen();
    expect(getByText('John Doe')).toBeTruthy();
  });

  it('filters residents based on search input', async () => {
    mockUseGetResidentsQuery.mockReturnValue({
      data: [mockResident, { ...mockResident, id: '2', firstName: 'Jane', lastName: 'Smith' }],
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    });
    const { getByPlaceholderText, queryByText } = renderScreen();
    const searchInput = getByPlaceholderText('Search'); // assuming placeholder
    fireEvent.changeText(searchInput, 'Jane');
    await waitFor(() => {
      expect(queryByText('John Doe')).toBeNull();
      expect(queryByText('Jane Smith')).toBeTruthy();
    });
  });

  it('retry button triggers refetch on error', () => {
    const refetchMock = jest.fn();
    mockUseGetResidentsQuery.mockReturnValue({
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
});
