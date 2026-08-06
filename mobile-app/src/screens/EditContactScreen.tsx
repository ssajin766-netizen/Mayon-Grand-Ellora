// src/screens/EditContactScreen.tsx
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
import { useNavigation, useRoute, RouteProp, NavigationProp } from '@react-navigation/native';
import { RootState } from '../store';
import {
  updateEmergencyContact,
  selectContactById,
  selectEmergencyLoading,
  selectEmergencyError,
  selectEmergencyCategories,
  fetchEmergencyCategoriesThunk,
  toggleContactEnabled,
  deleteEmergencyContact,
} from '../store/emergencyContactsSlice';
import { useAuthRole } from '../store/auth';
import GlassCard from '../components/GlassCard';
import { CategoryChip } from '../components/CategoryChip';
import EmptyStateView from '../components/EmptyStateView';

interface FormValues {
  name: string;
  phone: string;
  email?: string;
  address?: string;
  category: string;
  enabled: boolean;
}

type EditRouteParams = {
  EditContact: { contactId: string };
};

type EditRouteProp = RouteProp<EditRouteParams, 'EditContact'>;

const EditContactScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<NavigationProp<any>>();
  const route = useRoute<EditRouteProp>();
  const { contactId } = route.params;

  const role = useAuthRole();
  const isAdmin = role === 'admin';

  const contact = useAppSelector((state: RootState) => selectContactById(state, contactId));
  const loading = useAppSelector(selectEmergencyLoading);
  const error = useAppSelector(selectEmergencyError);
  const categories = useAppSelector(selectEmergencyCategories);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
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

  // Load categories if not present
  useEffect(() => {
    if (categories.length === 0) {
      dispatch(fetchEmergencyCategoriesThunk());
    }
  }, [dispatch, categories.length]);

  // Populate form when contact loads
  useEffect(() => {
    if (contact) {
      reset({
        name: contact.name ?? '',
        phone: contact.phone ?? '',
        email: contact.email ?? '',
        address: contact.address ?? '',
        category: contact.category ?? (categories[0] || ''),
        enabled: contact.enabled ?? true,
      });
    }
  }, [contact, categories, reset]);

  // Navigate back on successful update (loading becomes false without error)
  useEffect(() => {
    if (!loading && !error && contact) {
      // Assuming optimistic thunk clears loading on fulfilled
      navigation.navigate('ContactList');
    }
    if (!loading && error) {
      Alert.alert('Error', error as string);
    }
  }, [loading, error, navigation, contact]);

  const onSubmit = (data: FormValues) => {
    if (!contact) return;
    const updated = {
      id: contact.id,
      name: data.name.trim(),
      phone: data.phone.trim(),
      category: data.category,
      enabled: data.enabled,
    } as any;
    if (data.email?.trim()) updated.email = data.email.trim();
    if (data.address?.trim()) updated.address = data.address.trim();
    dispatch(updateEmergencyContact(updated));
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Contact',
      'Are you sure you want to delete this contact? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            if (contact) {
              dispatch(deleteEmergencyContact(contact.id));
              navigation.navigate('ContactList');
            }
          },
        },
      ],
      { cancelable: true },
    );
  };

  const handleToggleEnabled = () => {
    if (contact) {
      dispatch(toggleContactEnabled({ id: contact.id, enabled: !contact.enabled }));
    }
  };

  if (loading && !contact) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  if (error && !contact) {
    return (
      <EmptyStateView
        title="Unable to load contact"
        description={error as string}
        onRetry={() => navigation.navigate('ContactList')}
      />
    );
  }

  if (!contact) {
    return (
      <EmptyStateView title="Contact not found" description="The requested contact does not exist." />
    );
  }

  if (categories.length === 0) {
    return (
      <EmptyStateView
        title="Categories unavailable"
        description="Unable to load categories for editing."
        onRetry={() => dispatch(fetchEmergencyCategoriesThunk())}
      />
    );
  }

  return (
    <View style={styles.container}>
      <GlassCard style={styles.card}>
        <Text style={styles.header}>Edit Emergency Contact</Text>
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
                <TouchableOpacity
                  key={cat}
                  style={[styles.categoryOption, value === cat && styles.selectedCategory]}
                  onPress={() => onChange(cat)}
                >
                  <CategoryChip category={cat} />
                </TouchableOpacity>
              ))}
            </View>
          )}
        />
        {errors.category && <Text style={styles.errorText}>{errors.category.message}</Text>}
        {/* Enabled toggle for admin */}
        {isAdmin && (
          <View style={styles.toggleContainer}>
            <Text style={styles.toggleLabel}>Enabled</Text>
            <Switch
              value={control._formValues?.enabled ?? contact.enabled}
              onValueChange={(val) => control.setValue('enabled', val)}
            />
          </View>
        )}
        {/* Submit button */}
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit(onSubmit)} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitText}>Save Changes</Text>
          )}
        </TouchableOpacity>
        {/* Delete button for admin */}
        {isAdmin && (
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete} disabled={loading}>
            <Text style={styles.deleteText}>Delete Contact</Text>
          </TouchableOpacity>
        )}
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
    marginTop: 12,
  },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  deleteButton: {
    backgroundColor: '#e74c3c',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  deleteText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

export default EditContactScreen;
