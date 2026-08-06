// src/screens/AddContactScreen.tsx
import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootState } from '../store';
import {
  addEmergencyContact,
  selectEmergencyLoading,
  selectEmergencyError,
  fetchEmergencyCategoriesThunk,
  selectEmergencyCategories,
} from '../store/emergencyContactsSlice';
import { useAuthRole } from '../store/auth';
import GlassCard from '../components/GlassCard';


import { CategoryChip } from '../components/CategoryChip';
import { QuickActionButton } from '../components/QuickActionButton'; // optional reuse for UI
import EmptyStateView from '../components/EmptyStateView';

interface FormValues {
  name: string;
  phone: string;
  email?: string;
  address?: string;
  category: string;
  enabled: boolean;
}

const AddContactScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<NavigationProp<any>>();
  const role = useAuthRole();
  const isAdmin = role === 'admin';
  const loading = useAppSelector(selectEmergencyLoading);
  const error = useAppSelector(selectEmergencyError);
  const categories = useAppSelector(selectEmergencyCategories);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
      defaultValues: {
        name: '',
        phone: '',
        email: '',
        address: '',
        category: '',
        enabled: true,
      },
  });

  // Load categories on mount
  useEffect(() => {
    dispatch(fetchEmergencyCategoriesThunk());
  }, [dispatch]);

  // Navigation is handled after a successful submit.
  // Previously, navigation was triggered on any render when loading was false,
  // which caused immediate navigation on component mount.
  // This effect now only shows error alerts when needed.
  useEffect(() => {
    if (error) {
      Alert.alert('Error', error as string);
    }
  }, [error]);

  const onSubmit = (data: FormValues) => {
    // Build payload without optional empty strings
    const payload: any = {
      name: data.name.trim(),
      phone: data.phone.trim(),
      category: data.category,
      enabled: data.enabled,
    };
    if (data.email?.trim()) payload.email = data.email.trim();
    if (data.address?.trim()) payload.address = data.address.trim();

    dispatch(addEmergencyContact(payload as any));
    // Reset form for future adds (optimistic UI already shows contact)
    reset();
    // Navigate to contact list after adding contact
    navigation.navigate('ContactList');
  };

  if (loading) {
    // Show a spinner while loading
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#fff" testID="ActivityIndicator" />
      </View>
    );
  }

  if (error) {
    return (
      <EmptyStateView
        title="Error"
        description={error}
        onRetry={() => dispatch(fetchEmergencyCategoriesThunk())}
      />
    );
  }

  if (categories.length === 0) {
    return (
      <EmptyStateView
        title="Categories unavailable"
        description="Unable to load emergency categories. Please try again later."
        onRetry={() => dispatch(fetchEmergencyCategoriesThunk())}
      />
    );
  }

  return (
    <View style={styles.container}>
      <GlassCard style={styles.card}>
        <Text style={styles.header}>Add Emergency Contact</Text>
        {/* Name */}
        <Controller
          control={control}
          name="name"
          rules={{ required: 'Name is required' }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[styles.input, errors.name && styles.errorInput]}
              placeholder="Contact name"
              placeholderTextColor="#888"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
        />
        {errors.name && <Text style={styles.errorText}>{errors.name.message}</Text>}
        {/* Phone */}
        <Controller
          control={control}
          name="phone"
          rules={{
            required: 'Phone number is required',
            pattern: { value: /^[+]?\d{7,15}$/, message: 'Invalid phone format' },
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[styles.input, errors.phone && styles.errorInput]}
              placeholder="Phone number"
              placeholderTextColor="#888"
              keyboardType="phone-pad"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
        />
        {errors.phone && <Text style={styles.errorText}>{errors.phone.message}</Text>}
        {/* Email */}
        <Controller
          control={control}
          name="email"
          rules={{
            pattern: { value: /^[^@\s]+@[^@\s]+\.[^@\s]+$/, message: 'Invalid email' },
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[styles.input, errors.email && styles.errorInput]}
              placeholder="Email (optional)"
              placeholderTextColor="#888"
              keyboardType="email-address"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
        />
        {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}
        {/* Address */}
        <Controller
          control={control}
          name="address"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.input}
              placeholder="Address (optional)"
              placeholderTextColor="#888"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
        />
        {/* Category Picker */}
        <Controller
          control={control}
          name="category"
          rules={{ required: 'Category is required' }}
          render={({ field: { onChange, value } }) => (
            <View style={styles.pickerContainer}>
              <Text style={styles.pickerLabel}>Category:</Text>
              {categories.map((cat) => (
                <CategoryChip
                  key={cat}
                  label={cat}
                  selected={value === cat}
                  onPress={() => onChange(cat)}
                />
              ))}
            </View>
          )}
        />
        {errors.category && <Text style={styles.errorText}>{errors.category.message}</Text>}
        {/* Enabled switch – shown only for admins */}
        {isAdmin && (
          <Controller
            control={control}
            name="enabled"
            render={({ field: { onChange, value } }) => (
              <View style={styles.toggleContainer}>
                <Text style={styles.toggleLabel}>Enabled</Text>
                <Switch value={value} onValueChange={onChange} />
              </View>
            )}
          />
        )}
        {/* Submit button */}
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit(onSubmit)} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitText}>Add Contact</Text>
          )}
        </TouchableOpacity>
      </GlassCard>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent', padding: 12 },
  card: { padding: 20 },
  header: { fontSize: 22, fontWeight: '600', color: '#fff', marginBottom: 16, textAlign: 'center' },
  input: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    color: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 12,
  },
  errorInput: { borderColor: '#e74c3c', borderWidth: 1 },
  errorText: { color: '#e74c3c', marginBottom: 8 },
  pickerContainer: { marginBottom: 12 },
  pickerLabel: { color: '#fff', marginBottom: 4 },
  categoryOption: { marginVertical: 4 },
  selectedCategory: { opacity: 0.8 },
  toggleContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  toggleLabel: { color: '#fff', marginRight: 8 },
  submitButton: {
    backgroundColor: '#ff5a5f',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

export default AddContactScreen;
