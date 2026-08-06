import { baseApi } from './api';
import { API } from '../constants/api';
import { Resident } from '../types/resident';

export const residentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /** Fetch the list of residents */
    getResidents: builder.query<Resident[], void>({
      query: () => ({ url: API.RESIDENTS.LIST, method: 'GET' }),
      providesTags: ['Resident'],
    }),
    /** Fetch a single resident by ID */
    getResident: builder.query<Resident, string>({
      query: (id) => ({ url: API.RESIDENTS.DETAIL(id), method: 'GET' }),
      providesTags: ['Resident'],
    }),
    /** Create a new resident */
    createResident: builder.mutation<Resident, Partial<Resident>>({
      query: (payload) => ({
        url: API.RESIDENTS.CREATE,
        method: 'POST',
        data: payload,
      }),
      invalidatesTags: ['Resident'],
    }),
    /** Update an existing resident */
    updateResident: builder.mutation<Resident, { id: string; data: Partial<Resident> }>({
      query: ({ id, data }) => ({
        url: API.RESIDENTS.UPDATE(id),
        method: 'PUT',
        data,
      }),
      invalidatesTags: ['Resident'],
    }),
    /** Delete a resident */
    deleteResident: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: API.RESIDENTS.DELETE(id),
        method: 'DELETE',
      }),
      invalidatesTags: ['Resident'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetResidentsQuery,
  useGetResidentQuery,
  useCreateResidentMutation,
  useUpdateResidentMutation,
  useDeleteResidentMutation,
} = residentApi;
