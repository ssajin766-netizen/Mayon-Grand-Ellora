import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';

export default function BillsScreen({ navigation }) {
  const bills = [
    {
      id: 'INV-2026-07',
      period: 'July 2026',
      amount: '₹ 2,500',
      dueDate: '10 Aug 2026',
      status: 'UNPAID',
    },
    {
      id: 'INV-2026-06',
      period: 'June 2026',
      amount: '₹ 2,500',
      dueDate: '10 Jul 2026',
      status: 'PAID',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Maintenance Bills</Text>
      </View>

      <ScrollView contentContainerStyle={styles.listContent}>
        {bills.map((bill) => (
          <View key={bill.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.invoiceNo}>{bill.id}</Text>
                <Text style={styles.periodText}>{bill.period}</Text>
              </View>
              <View style={[styles.statusBadge, bill.status === 'PAID' ? styles.paidBadge : styles.unpaidBadge]}>
                <Text style={[styles.statusText, bill.status === 'PAID' ? styles.paidText : styles.unpaidText]}>
                  {bill.status}
                </Text>
              </View>
            </View>

            <View style={styles.amountRow}>
              <Text style={styles.amountLabel}>Total Due:</Text>
              <Text style={styles.amountValue}>{bill.amount}</Text>
            </View>

            <Text style={styles.dueDateText}>Due Date: {bill.dueDate}</Text>

            {bill.status === 'UNPAID' && (
              <TouchableOpacity style={styles.payBtn}>
                <Ionicons name="card-outline" size={18} color={COLORS.white} style={{ marginRight: 8 }} />
                <Text style={styles.payBtnText}>Pay Bill Online</Text>
              </TouchableOpacity>
            )}
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
  listContent: {
    padding: 20,
    gap: 14,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  invoiceNo: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  periodText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  paidBadge: {
    backgroundColor: '#D1E7DD',
  },
  unpaidBadge: {
    backgroundColor: '#F8D7DA',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  paidText: {
    color: '#0F5132',
  },
  unpaidText: {
    color: '#842029',
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginVertical: 4,
  },
  amountLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  amountValue: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.primary,
  },
  dueDateText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  payBtn: {
    height: 44,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
  },
  payBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.white,
  },
});
