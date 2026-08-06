import React from 'react';
import {
  StyleSheet, View, Text, TouchableOpacity, SafeAreaView,
  ScrollView, Image, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';

// Dashboard cards matching home.ejs exactly
const DASHBOARD_CARDS = [
  { id: 'residents', title: 'Residents', desc: 'View all residents and apartment owners.', icon: 'people', color: '#0d6efd', screen: 'Residents', image: require('../assets/members.jpg') },
  { id: 'noticeboard', title: 'Noticeboard', desc: 'Read the latest society announcements.', icon: 'megaphone', color: '#ffc107', screen: 'Noticeboard', image: require('../assets/notice.jpg') },
  { id: 'bills', title: 'Maintenance Bills', desc: 'View and pay monthly maintenance bills.', icon: 'receipt', color: '#198754', screen: 'Bill', image: require('../assets/bill.jpg') },
  { id: 'helpdesk', title: 'Helpdesk', desc: 'Raise and manage maintenance complaints.', icon: 'headset', color: '#dc3545', screen: 'Helpdesk', image: require('../assets/helpdesk.jpg') },
  { id: 'emergency', title: 'Emergency', desc: 'Access important emergency contact numbers.', icon: 'call', color: '#0dcaf0', screen: 'Contacts', image: require('../assets/contact.jpg') },
  { id: 'profile', title: 'My Profile', desc: 'View and update your personal information.', icon: 'person-circle', color: '#6c757d', screen: 'Profile', image: require('../assets/profile.jpg') },
];

export default function HomeScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header - matches home.ejs */}
        <View style={styles.header}>
          <Ionicons name="business" size={28} color="#0d6efd" />
          <Text style={styles.headerTitle}>Welcome to Mayon Grand Ellora</Text>
          <Text style={styles.headerSub}>Manage your apartment services quickly and securely.</Text>
        </View>

        {/* Dashboard Cards Grid - matches home.ejs */}
        <View style={styles.grid}>
          {DASHBOARD_CARDS.map((card) => (
            <TouchableOpacity
              key={card.id}
              style={styles.card}
              onPress={() => navigation.navigate(card.screen)}
              activeOpacity={0.85}
            >
              <Image source={card.image} style={styles.cardImage} resizeMode="cover" />
              <View style={styles.cardBody}>
                <View style={[styles.dashIcon, { backgroundColor: card.color }]}>
                  <Ionicons name={card.icon} size={26} color="#fff" />
                </View>
                <Text style={styles.cardTitle}>{card.title}</Text>
                <Text style={styles.cardDesc}>{card.desc}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fb' },
  content: { padding: 16, paddingBottom: 30 },
  header: { alignItems: 'center', marginBottom: 24, marginTop: 8 },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#212529', textAlign: 'center', marginTop: 8 },
  headerSub: { fontSize: 14, color: '#6c757d', textAlign: 'center', marginTop: 4 },
  grid: { gap: 16 },
  card: {
    backgroundColor: '#fff', borderRadius: 20, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08,
    shadowRadius: 12, elevation: 3,
  },
  cardImage: { width: '100%', height: 180 },
  cardBody: { padding: 20, alignItems: 'center' },
  dashIcon: {
    width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center',
    marginTop: -50, borderWidth: 4, borderColor: '#fff',
  },
  cardTitle: { fontSize: 18, fontWeight: '700', color: '#212529', marginTop: 12 },
  cardDesc: { fontSize: 14, color: '#6c757d', textAlign: 'center', marginTop: 4 },
});
