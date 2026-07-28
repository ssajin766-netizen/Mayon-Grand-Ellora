import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';

export default function ComplaintsScreen({ navigation }) {
  const [complaints, setComplaints] = useState([
    {
      id: 'CMP-101',
      subject: 'Lift malfunction on 3rd Floor',
      category: 'Maintenance',
      status: 'In Progress',
      date: '27 Jul 2026',
    }
  ]);

  const [showForm, setShowForm] = useState(false);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');

  const handleRaiseComplaint = () => {
    if (!subject.trim() || !description.trim()) {
      Alert.alert('Required', 'Please fill in both subject and description.');
      return;
    }

    const newTicket = {
      id: `CMP-${Math.floor(100 + Math.random() * 900)}`,
      subject: subject.trim(),
      category: 'General',
      status: 'Open',
      date: 'Today',
    };

    setComplaints([newTicket, ...complaints]);
    setSubject('');
    setDescription('');
    setShowForm(false);
    Alert.alert('Success', 'Complaint ticket submitted successfully to society admin.');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Complaints & Helpdesk</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity
          style={styles.raiseBtn}
          onPress={() => setShowForm(!showForm)}
        >
          <Ionicons name={showForm ? 'close' : 'add-circle-outline'} size={20} color={COLORS.white} style={{ marginRight: 8 }} />
          <Text style={styles.raiseBtnText}>{showForm ? 'Cancel Form' : 'Raise New Complaint'}</Text>
        </TouchableOpacity>

        {showForm && (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>New Complaint Ticket</Text>
            
            <Text style={styles.label}>Subject</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Plumbing leakage in Flat 402"
              placeholderTextColor="#9CA3AF"
              value={subject}
              onChangeText={setSubject}
            />

            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, { height: 90, textAlignVertical: 'top', paddingTop: 12 }]}
              placeholder="Detailed description of the issue..."
              placeholderTextColor="#9CA3AF"
              multiline
              value={description}
              onChangeText={setDescription}
            />

            <TouchableOpacity style={styles.submitBtn} onPress={handleRaiseComplaint}>
              <Text style={styles.submitBtnText}>Submit Complaint</Text>
            </TouchableOpacity>
          </View>
        )}

        <Text style={styles.sectionTitle}>Your Complaint Tickets</Text>
        {complaints.map((item) => (
          <View key={item.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.ticketId}>{item.id}</Text>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>{item.status}</Text>
              </View>
            </View>
            <Text style={styles.ticketSubject}>{item.subject}</Text>
            <Text style={styles.ticketDate}>Raised on {item.date}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
    gap: 14,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  content: {
    padding: 20,
    gap: 14,
  },
  raiseBtn: {
    height: 48,
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  raiseBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.white,
  },
  formCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 6,
    marginTop: 8,
  },
  input: {
    height: 46,
    borderWidth: 1.5,
    borderColor: COLORS.gray200,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 14,
    color: COLORS.text,
  },
  submitBtn: {
    height: 44,
    backgroundColor: COLORS.primaryDark,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.white,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 8,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ticketId: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  statusBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D97706',
  },
  ticketSubject: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 6,
  },
  ticketDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});
