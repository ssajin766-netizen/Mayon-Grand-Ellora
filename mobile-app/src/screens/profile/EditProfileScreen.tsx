import React, { useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { saveProfile, fetchProfile } from '../../store/profileSlice';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Snackbar } from 'react-native-paper';

const schema = yup.object().shape({
  firstName: yup.string().required('First name required'),
  lastName: yup.string().required('Last name required'),
  phone: yup.string().matches(/^\+?[0-9]{7,15}$/, 'Invalid phone number').required(),
  email: yup.string().email('Invalid email').required(),
  societyName: yup.string().required(),
  block: yup.string().required(),
  flat: yup.string().required(),
  // role and accountStatus are not editable here
});

type FormData = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  societyName: string;
  block: string;
  flat: string;
};

const EditProfileScreen = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<any>(); // TODO: Replace with strongly typed navigation params after TS stabilization.
  const { data, loading, error } = useAppSelector(state => state.profile);

  const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      firstName: data?.firstName ?? '',
      lastName: data?.lastName ?? '',
      phone: data?.phone ?? '',
      email: data?.email ?? '',
      societyName: data?.societyName ?? '',
      block: data?.block ?? '',
      flat: data?.flat ?? '',
    },
  });

  useEffect(() => {
    if (!data) {
      dispatch(fetchProfile());
    } else {
      reset({
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        email: data.email,
        societyName: data.societyName,
        block: data.block,
        flat: data.flat,
      });
    }
  }, [data, dispatch, reset]);

  const onSubmit = async (formValues: FormData) => {
    try {
      await dispatch(saveProfile(formValues)).unwrap();
      // optimistic update already applied, just show success
      navigation.goBack();
    } catch (e) {
      // error handled via Redux error state
    }
  };

  const onRefresh = useCallback(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  if (loading && !data) {
    return (
      <View style={styles.centered}> <ActivityIndicator size="large" color="#fff" /> </View>
    );
  }

  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={loading} onRefresh={onRefresh} />}>
      <Text style={styles.title}>Edit Profile</Text>
      <View style={styles.field}>
        <Controller
          control={control}
          name="firstName"
          render={({ field: { onChange, value } }) => (
            <TextInput style={styles.input} placeholder="First Name" placeholderTextColor="#aaa" value={value} onChangeText={onChange} />
          )}
        />
        {errors.firstName && <Text style={styles.error}>{errors.firstName.message}</Text>}
      </View>
      <View style={styles.field}>
        <Controller
          control={control}
          name="lastName"
          render={({ field: { onChange, value } }) => (
            <TextInput style={styles.input} placeholder="Last Name" placeholderTextColor="#aaa" value={value} onChangeText={onChange} />
          )}
        />
        {errors.lastName && <Text style={styles.error}>{errors.lastName.message}</Text>}
      </View>
      <View style={styles.field}>
        <Controller
          control={control}
          name="phone"
          render={({ field: { onChange, value } }) => (
            <TextInput style={styles.input} placeholder="Phone" placeholderTextColor="#aaa" keyboardType="phone-pad" value={value} onChangeText={onChange} />
          )}
        />
        {errors.phone && <Text style={styles.error}>{errors.phone.message}</Text>}
      </View>
      <View style={styles.field}>
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, value } }) => (
            <TextInput style={styles.input} placeholder="Email" placeholderTextColor="#aaa" keyboardType="email-address" value={value} onChangeText={onChange} />
          )}
        />
        {errors.email && <Text style={styles.error}>{errors.email.message}</Text>}
      </View>
      <View style={styles.field}>
        <Controller
          control={control}
          name="societyName"
          render={({ field: { onChange, value } }) => (
            <TextInput style={styles.input} placeholder="Society" placeholderTextColor="#aaa" value={value} onChangeText={onChange} />
          )}
        />
        {errors.societyName && <Text style={styles.error}>{errors.societyName.message}</Text>}
      </View>
      <View style={styles.field}>
        <Controller
          control={control}
          name="block"
          render={({ field: { onChange, value } }) => (
            <TextInput style={styles.input} placeholder="Block/Tower" placeholderTextColor="#aaa" value={value} onChangeText={onChange} />
          )}
        />
        {errors.block && <Text style={styles.error}>{errors.block.message}</Text>}
      </View>
      <View style={styles.field}>
        <Controller
          control={control}
          name="flat"
          render={({ field: { onChange, value } }) => (
            <TextInput style={styles.input} placeholder="Flat/Unit" placeholderTextColor="#aaa" value={value} onChangeText={onChange} />
          )}
        />
        {errors.flat && <Text style={styles.error}>{errors.flat.message}</Text>}
      </View>
      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSubmit(onSubmit)} disabled={isSubmitting}>
          {isSubmitting ? <ActivityIndicator color="#fff" /> : <MaterialCommunityIcons name="content-save" size={20} color="#fff" />}
          <Text style={styles.btnText}>Save</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="close-circle" size={20} color="#fff" />
          <Text style={styles.btnText}>Cancel</Text>
        </TouchableOpacity>
      </View>
      <Snackbar visible={!!error} onDismiss={() => {}} duration={3000} style={styles.snack}>
        {error}
      </Snackbar>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#000' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, color: '#fff', marginBottom: 20, textAlign: 'center' },
  field: { marginBottom: 12 },
  input: { backgroundColor: 'rgba(255,255,255,0.1)', color: '#fff', padding: 10, borderRadius: 8 },
  error: { color: '#ff6b6b', marginTop: 4 },
  actionsRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 20 },
  saveBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#00695c', padding: 12, borderRadius: 8, width: 120, justifyContent: 'center' },
  cancelBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#b71c1c', padding: 12, borderRadius: 8, width: 120, justifyContent: 'center' },
  btnText: { color: '#fff', marginLeft: 6 },
  snack: { backgroundColor: '#333' },
});

export default EditProfileScreen;
