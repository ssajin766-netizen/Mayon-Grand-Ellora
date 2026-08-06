import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { uploadAvatar, removeAvatar, setUploadProgress, clearAvatarError } from '../../store/profileSlice';
import { useNavigation } from '@react-navigation/native';

const MAX_SIZE_MB = 5;

const ChangePhotoScreen = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<any>(); // TODO: Replace with strongly typed navigation params after TS stabilization.
  const { data, loading, avatarError, uploadProgress } = useAppSelector(state => state.profile);
  const [localUri, setLocalUri] = useState<string | null>(null);

  useEffect(() => {
    if (avatarError) {
      Alert.alert('Upload Error', avatarError, [{ text: 'OK', onPress: () => dispatch(clearAvatarError()) }]);
    }
  }, [avatarError, dispatch]);

  const pickImage = async (fromCamera: boolean) => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission required', 'Please grant media library permissions in settings.');
      return;
    }
    const result = await (fromCamera
      ? ImagePicker.launchCameraAsync({ allowsEditing: false, quality: 1 })
      : ImagePicker.launchImageLibraryAsync({ allowsEditing: false, quality: 1 }));
    if (!result.cancelled) {
      // Check file size (approximation)
      const fileInfo = await fetch(result.uri);
      const blob = await fileInfo.blob();
      const sizeMb = blob.size / (1024 * 1024);
      if (sizeMb > MAX_SIZE_MB) {
        Alert.alert('File Too Large', `Image must be under ${MAX_SIZE_MB} MB.`);
        return;
      }
      // 1:1 crop – force square using ImageManipulator
      const cropResult = await ImageManipulator.manipulateAsync(
        result.uri,
        [{ crop: { originX: 0, originY: 0, width: Math.min(result.width, result.height), height: Math.min(result.width, result.height) } }],
        { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG }
      );
      setLocalUri(cropResult.uri);
    }
  };

  const handleUpload = async () => {
    if (!localUri) return;
    const formData = new FormData();
    // @ts-ignore – React Native expects name, type, uri fields
    formData.append('photo', { uri: localUri, name: 'avatar.jpg', type: 'image/jpeg' } as any);
    try {
      await dispatch(uploadAvatar(formData)).unwrap();
      setLocalUri(null);
      navigation.goBack();
    } catch (e) {
      // error handled via avatarError state
    }
  };

  const handleRemove = async () => {
    Alert.alert('Remove Photo', 'Are you sure you want to remove your profile photo?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            await dispatch(removeAvatar()).unwrap();
            navigation.goBack();
          } catch (e) {
            // error handled via avatarError
          }
        },
      },
    ]);
  };

  const currentAvatar = localUri || data?.avatarUrl;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Change Profile Photo</Text>
      <View style={styles.avatarWrapper}>
        {currentAvatar ? (
          <Image source={{ uri: currentAvatar }} style={styles.avatar} />
        ) : (
          <MaterialCommunityIcons name="account" size={120} color="#fff" />
        )}
      </View>
      {loading && <ActivityIndicator size="large" color="#fff" style={styles.loader} />}
      {uploadProgress && uploadProgress < 100 && (
        <Text style={styles.progress}>Uploading: {uploadProgress}%</Text>
      )}
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => pickImage(true)}>
          <MaterialCommunityIcons name="camera" size={24} color="#fff" />
          <Text style={styles.btnText}>Camera</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => pickImage(false)}>
          <MaterialCommunityIcons name="image" size={24} color="#fff" />
          <Text style={styles.btnText}>Gallery</Text>
        </TouchableOpacity>
        {localUri && (
          <TouchableOpacity style={styles.actionBtn} onPress={handleUpload}>
            <MaterialCommunityIcons name="cloud-upload" size={24} color="#fff" />
            <Text style={styles.btnText}>Upload</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.removeBtn} onPress={handleRemove}>
          <MaterialCommunityIcons name="delete" size={24} color="#fff" />
          <Text style={styles.btnText}>Remove</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#000' },
  title: { fontSize: 22, color: '#fff', textAlign: 'center', marginBottom: 20 },
  avatarWrapper: { alignItems: 'center', marginBottom: 20 },
  avatar: { width: 140, height: 140, borderRadius: 70 },
  loader: { marginVertical: 10 },
  progress: { color: '#0f0', textAlign: 'center', marginBottom: 10 },
  buttonRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-around' },
  actionBtn: { alignItems: 'center', backgroundColor: '#0005', padding: 12, borderRadius: 8, margin: 4 },
  removeBtn: { alignItems: 'center', backgroundColor: '#b00020', padding: 12, borderRadius: 8, margin: 4 },
  btnText: { color: '#fff', marginTop: 4, fontSize: 12 },
});

export default ChangePhotoScreen;
