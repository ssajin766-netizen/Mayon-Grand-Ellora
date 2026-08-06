// src/screens/residents/ResidentFormScreen.tsx
import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { useGetResidentQuery, useCreateResidentMutation, useUpdateResidentMutation } from '../../store/residentApi';
import GlassInput from '../../components/GlassInput';
import GlassButton from '../../components/GlassButton';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import { showSuccess, showError } from '../../services/toast';
import { Resident } from '../../types/resident';

// Route params definition
type ResidentFormParams = {
  mode: 'create' | 'edit';
  residentId?: string;
};

type FormValues = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  unitNumber: string;
  residentType?: 'Owner' | 'Tenant';
  status?: 'Active' | 'Inactive';
  profilePhotoUrl?: string;
  emergencyContact?: string;
};

const ResidentFormScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<Record<string, ResidentFormParams>, string>>();
  const { mode, residentId } = route.params as ResidentFormParams;

  const isEdit = mode === 'edit' && !!residentId;

  // Fetch resident data only in edit mode
  const { data: residentData, isLoading: isResidentLoading, refetch } = useGetResidentQuery(residentId ?? '', {
    skip: !isEdit,
  });

  // Mutations
  const [createResident] = useCreateResidentMutation();
  const [updateResident] = useUpdateResidentMutation();

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty, isValid },
    reset,
  } = useForm<FormValues>({
    mode: 'onChange',
    defaultValues: {
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      unitNumber: '',
      residentType: undefined,
      status: undefined,
      profilePhotoUrl: undefined,
      emergencyContact: undefined,
    },
  });

  // Populate form when resident data arrives in edit mode
  useEffect(() => {
    if (isEdit && residentData?.resident) {
      const r = residentData.resident as Resident;
      reset({
        firstName: r.firstName ?? '',
        lastName: r.lastName ?? '',
        phone: r.phone ?? '',
        email: r.email ?? '',
        unitNumber: r.unitNumber ?? '',
        residentType: (r.type as any) ?? undefined,
        status: (r.status as any) ?? undefined,
        profilePhotoUrl: (r.profilePhotoUrl as any) ?? undefined,
        emergencyContact: (r.emergencyContact as any) ?? undefined,
      });
    }
  }, [isEdit, residentData, reset]);

  const onSubmit = async (values: FormValues) => {
    try {
      if (isEdit && residentId) {
        await updateResident({ id: residentId, data: values }).unwrap();
        showSuccess('Resident updated');
        navigation.goBack(); // back to detail screen
      } else {
        await createResident(values).unwrap();
        showSuccess('Resident created');
        navigation.goBack(); // back to list screen
      }
    } catch (e) {
      showError('Failed to save resident');
    }
  };

  if (isEdit && isResidentLoading) {
    return <LoadingSkeleton type="card" count={1} />;
  }

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.form}>
        {/* First Name */}
        <Controller
          control={control}
          name="firstName"
          rules={{ required: 'First name is required' }}
          render={({ field: { onChange, onBlur, value } }) => (
            <GlassInput
              label="First Name"
              placeholder="John"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              errorMessage={errors.firstName?.message}
            />
          )}
        />
        {/* Last Name */}
        <Controller
          control={control}
          name="lastName"
          rules={{ required: 'Last name is required' }}
          render={({ field: { onChange, onBlur, value } }) => (
            <GlassInput
              label="Last Name"
              placeholder="Doe"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              errorMessage={errors.lastName?.message}
            />
          )}
        />
        {/* Phone */}
        <Controller
          control={control}
          name="phone"
          rules={{
            required: 'Phone number is required',
            pattern: { value: /^[+]?\d{7,15}$/, message: 'Invalid phone number' },
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <GlassInput
              label="Phone"
              placeholder="+1234567890"
              keyboardType="phone-pad"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              errorMessage={errors.phone?.message}
            />
          )}
        />
        {/* Email */}
        <Controller
          control={control}
          name="email"
          rules={{
            required: 'Email is required',
            pattern: { value: /^[^@\s]+@[^@\s]+\.[^@\s]+$/, message: 'Invalid email address' },
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <GlassInput
              label="Email"
              placeholder="john.doe@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              errorMessage={errors.email?.message}
            />
          )}
        />
        {/* Unit / Flat */}
        <Controller
          control={control}
          name="unitNumber"
          rules={{ required: 'Unit/Flat number is required' }}
          render={({ field: { onChange, onBlur, value } }) => (
            <GlassInput
              label="Flat / Unit"
              placeholder="A-101"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              errorMessage={errors.unitNumber?.message}
            />
          )}
        />
        {/* Optional Resident Type */}
        <Controller
          control={control}
          name="residentType"
          render={({ field: { onChange, value } }) => (
            <GlassInput
              label="Resident Type"
              placeholder="Owner or Tenant"
              onChangeText={onChange}
              value={value ?? ''}
            />
          )}
        />
        {/* Optional Status */}
        <Controller
          control={control}
          name="status"
          render={({ field: { onChange, value } }) => (
            <GlassInput
              label="Status"
              placeholder="Active or Inactive"
              onChangeText={onChange}
              value={value ?? ''}
            />
          )}
        />
        {/* Optional Profile Photo URL */}
        <Controller
          control={control}
          name="profilePhotoUrl"
          render={({ field: { onChange, value } }) => (
            <GlassInput
              label="Profile Photo URL"
              placeholder="https://..."
              onChangeText={onChange}
              value={value ?? ''}
            />
          )}
        />
        {/* Optional Emergency Contact */}
        <Controller
          control={control}
          name="emergencyContact"
          render={({ field: { onChange, value } }) => (
            <GlassInput
              label="Emergency Contact"
              placeholder="+1234567890"
              onChangeText={onChange}
              value={value ?? ''}
            />
          )}
        />
        {/* Action Buttons */}
        <View style={styles.actions}>
          <GlassButton
            title="Cancel"
            variant="secondary"
            onPress={() => navigation.goBack()}
            style={styles.actionButton}
          />
          <GlassButton
            title={isEdit ? 'Save Changes' : 'Create Resident'}
            disabled={!isDirty || !isValid}
            onPress={handleSubmit(onSubmit)}
            style={styles.actionButton}
          />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#111',
    padding: 12,
  },
  form: {
    gap: 12,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  actionButton: {
    flex: 0.48,
  },
});

export default ResidentFormScreen;
