import React, { useEffect, useState } from 'react';

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';

import {
  Card,
  Button,
  Chip,
  Avatar,
  Divider,
} from 'react-native-paper';

import {
  useRoute,
  useNavigation,
} from '@react-navigation/native';

import api from '../services/api';

import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import RazorpayCheckout from 'react-native-razorpay';


// ==================================================
// TYPES
// ==================================================

interface ChargeItem {
  description: string;
  amount: number;
}

interface BillDetail {
  id: string;
  billNumber: string;
  invoiceNumber?: string;

  residentName: string;
  unitNumber: string;

  period: string;
  dueDate: string;

  societyName: string;
  societyAddress: string;

  logoUrl?: string;

  charges: ChargeItem[];

  totalAmount: number;

  status: 'Paid' | 'Unpaid' | 'Pending';

  paymentDate?: string;
  transactionId?: string;
}


// ==================================================
// RAZORPAY TYPES
// ==================================================

interface RazorpayOrder {
  id: string;
  entity?: string;
  amount: number;
  amount_paid?: number;
  amount_due?: number;
  currency: string;
  receipt?: string;
  status?: string;
}

interface CreateOrderResponse {
  success: boolean;
  message?: string;
  key: string;
  order: RazorpayOrder;
}

interface PaymentSuccessResponse {
  success: boolean;
  message?: string;
  invoice?: string;
  amount?: number;

  payment?: {
    date: string;
    amount: number;
    invoice: string;
  };

  razorpay?: {
    orderId: string;
    paymentId: string;
  };
}


// ==================================================
// SCREEN
// ==================================================

const BillDetailScreen = () => {

  const route = useRoute<any>();

  const navigation =
    useNavigation<any>();

  const { billId } = route.params;

  const [bill, setBill] =
    useState<BillDetail | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [paying, setPaying] =
    useState(false);


  // ==================================================
  // FETCH BILL
  // ==================================================

  const fetchBill = async () => {

    setLoading(true);

    try {

      const response =
        await api.get(`/bills/${billId}`);

      console.log(
        'BILL RESPONSE:',
        response.data
      );

      setBill(response.data);

    }

    catch (error: any) {

      console.error(
        'BILL FETCH ERROR:',
        error?.response?.data ||
        error?.message ||
        error
      );

      Alert.alert(
        'Error',
        'Failed to load bill details.'
      );

    }

    finally {

      setLoading(false);

    }

  };


  useEffect(() => {

    fetchBill();

  }, [billId]);


  // ==================================================
  // PAY BILL
  // ==================================================

  const handlePay = async () => {

    if (!bill || paying) {
      return;
    }

    setPaying(true);

    try {

      console.log('========================================');
      console.log('MOBILE RAZORPAY PAYMENT');
      console.log('Bill:', bill.billNumber);
      console.log('Bill Total:', bill.totalAmount);
      console.log('========================================');


      // ==================================================
      // 1. CREATE RAZORPAY ORDER
      // ==================================================

      console.log(
        'CREATING RAZORPAY ORDER'
      );

      const orderResponse =
        await api.post<CreateOrderResponse>(
          '/api/payment/create-order'
        );

      console.log(
        'RAZORPAY ORDER RESPONSE:',
        orderResponse.data
      );

      const orderData =
        orderResponse.data;


      if (!orderData.success) {

        throw new Error(
          orderData.message ||
          'Unable to create payment order.'
        );

      }


      if (!orderData.key) {

        throw new Error(
          'Razorpay key was not returned by server.'
        );

      }


      if (!orderData.order) {

        throw new Error(
          'Razorpay order was not returned by server.'
        );

      }


      const order =
        orderData.order;


      // ==================================================
      // 2. VALIDATE ORDER
      // ==================================================

      if (
        !order.id ||
        !order.amount ||
        order.amount <= 0
      ) {

        throw new Error(
          'Invalid Razorpay order received.'
        );

      }


      console.log('========================================');
      console.log('RAZORPAY ORDER');
      console.log('Order ID:', order.id);
      console.log('Amount Paise:', order.amount);
      console.log('Amount INR:', order.amount / 100);
      console.log('Currency:', order.currency);
      console.log('========================================');


      // ==================================================
      // 3. OPEN RAZORPAY CHECKOUT
      // ==================================================

      const options: any = {

        key:
          orderData.key,

        amount:
          String(order.amount),

        currency:
          order.currency || 'INR',

        name:
          bill.societyName,

        description:
          `Maintenance Bill #${bill.billNumber}`,

        order_id:
          order.id,

        prefill: {

          name:
            bill.residentName,

        },

        theme: {

          color:
            '#ff8c00',

        },

      };


      if (bill.logoUrl) {

        options.image =
          bill.logoUrl;

      }


      console.log('========================================');
      console.log('OPENING RAZORPAY CHECKOUT');
      console.log(
        'Amount Paise:',
        options.amount
      );
      console.log(
        'Amount INR:',
        Number(options.amount) / 100
      );
      console.log(
        'Order ID:',
        options.order_id
      );
      console.log('========================================');


      const paymentData =
        await RazorpayCheckout.open(
          options
        );


      console.log('========================================');
      console.log('RAZORPAY PAYMENT RESPONSE');
      console.log(paymentData);
      console.log('========================================');


      // ==================================================
      // 4. VALIDATE PAYMENT RESPONSE
      // ==================================================

      if (
        !paymentData ||
        !paymentData.razorpay_order_id ||
        !paymentData.razorpay_payment_id ||
        !paymentData.razorpay_signature
      ) {

        throw new Error(
          'Incomplete Razorpay payment response.'
        );

      }


      // ==================================================
      // 5. VERIFY PAYMENT
      // ==================================================

      console.log(
        'VERIFYING RAZORPAY PAYMENT'
      );


      const verifyResponse =
        await api.post<PaymentSuccessResponse>(
          '/api/payment/payment-success',
          {

            razorpay_order_id:
              paymentData.razorpay_order_id,

            razorpay_payment_id:
              paymentData.razorpay_payment_id,

            razorpay_signature:
              paymentData.razorpay_signature,

          }
        );


      console.log(
        'PAYMENT VERIFICATION RESPONSE:',
        verifyResponse.data
      );


      const verifyData =
        verifyResponse.data;


      if (!verifyData.success) {

        throw new Error(
          verifyData.message ||
          'Payment verification failed.'
        );

      }


      // ==================================================
      // 6. PAYMENT SUCCESS
      // ==================================================

      Alert.alert(
        'Payment Successful',

        `₹${
          verifyData.amount ??
          order.amount / 100
        }\n\nInvoice: ${
          verifyData.invoice ||
          'Generated'
        }`,

        [
          {
            text: 'OK',

            onPress: () => {

              fetchBill();

            },

          },

        ]

      );

    }

    catch (error: any) {

      console.error(
        '========================================'
      );

      console.error(
        'MOBILE PAYMENT ERROR'
      );

      console.error(
        'ERROR:',
        error
      );

      console.error(
        'RESPONSE:',
        error?.response?.data
      );

      console.error(
        'STATUS:',
        error?.response?.status
      );

      console.error(
        '========================================'
      );


      // ==================================================
      // RAZORPAY CANCELLED
      // ==================================================

      if (
        error?.code === 0 ||
        error?.code === '0' ||
        error?.description ===
          'Payment cancelled'
      ) {

        Alert.alert(
          'Payment Cancelled',
          'You cancelled the payment.'
        );

        return;

      }


      // ==================================================
      // SESSION ERROR
      // ==================================================

      if (
        error?.response?.status === 401 ||
        error?.response?.status === 403
      ) {

        Alert.alert(
          'Session Expired',
          'Please login again.'
        );

        navigation.navigate(
          'PhoneLogin'
        );

        return;

      }


      // ==================================================
      // SERVER ERROR
      // ==================================================

      const serverMessage =
        error?.response?.data?.message;


      Alert.alert(
        'Payment Failed',

        serverMessage ||
        error?.message ||
        'Unable to complete payment.'
      );

    }

    finally {

      setPaying(false);

    }

  };


  // ==================================================
  // DOWNLOAD
  // ==================================================

  const downloadFile = async (
    url: string,
    filename: string
  ) => {

    try {

      console.log(
        'DOWNLOAD:',
        url
      );

      const downloadRes =
        await FileSystem.downloadAsync(
          url,
          FileSystem.documentDirectory +
            filename
        );


      if (
        downloadRes.status === 200
      ) {

        const canShare =
          await Sharing.isAvailableAsync();


        if (canShare) {

          await Sharing.shareAsync(
            downloadRes.uri
          );

        }

        else {

          Alert.alert(
            'Downloaded',
            `File saved to ${downloadRes.uri}`
          );

        }

      }

      else {

        Alert.alert(
          'Download Failed',
          `Server returned status ${downloadRes.status}.`
        );

      }

    }

    catch (error) {

      console.error(
        'DOWNLOAD ERROR:',
        error
      );

      Alert.alert(
        'Error',
        'Unable to download file.'
      );

    }

  };


  // ==================================================
  // DOWNLOAD BILL
  // ==================================================

  const handleDownloadBillPdf = () => {

    if (!bill) {
      return;
    }

    const baseUrl =
      process.env.EXPO_PUBLIC_API_BASE_URL;


    if (!baseUrl) {

      Alert.alert(
        'Configuration Error',
        'API base URL is not configured.'
      );

      return;

    }


    const url =
      `${baseUrl}/bills/${bill.id}/pdf`;


    downloadFile(
      url,
      `Bill_${bill.billNumber}.pdf`
    );

  };


  // ==================================================
  // DOWNLOAD RECEIPT
  // ==================================================

  const handleDownloadReceipt = () => {

    if (!bill) {
      return;
    }

    const baseUrl =
      process.env.EXPO_PUBLIC_API_BASE_URL;


    if (!baseUrl) {

      Alert.alert(
        'Configuration Error',
        'API base URL is not configured.'
      );

      return;

    }


    const url =
      `${baseUrl}/bills/${bill.id}/receipt`;


    downloadFile(
      url,
      `Receipt_${bill.billNumber}.pdf`
    );

  };


  // ==================================================
  // LOADING
  // ==================================================

  if (
    loading ||
    !bill
  ) {

    return (

      <View
        style={styles.loader}
      >

        <ActivityIndicator
          size="large"
        />

      </View>

    );

  }


  // ==================================================
  // TOTAL
  // ==================================================

  const totalCharges =
    bill.charges.reduce(
      (sum, charge) =>
        sum + Number(charge.amount || 0),
      0
    );


  // ==================================================
  // UI
  // ==================================================

  return (

    <ScrollView
      style={styles.container}
      contentContainerStyle={{
        paddingBottom: 30,
      }}
    >

      <Card
        style={styles.card}
      >

        {/* HEADER */}

        <View
          style={styles.headerRow}
        >

          {bill.logoUrl ? (

            <Avatar.Image
              size={55}
              source={{
                uri: bill.logoUrl,
              }}
            />

          ) : (

            <Avatar.Text
              size={55}
              label={
                bill.societyName
                  ?.charAt(0)
                  ?.toUpperCase() || 'S'
              }
            />

          )}


          <View
            style={styles.headerInfo}
          >

            <Text
              style={styles.societyName}
            >
              {bill.societyName}
            </Text>

            <Text
              style={styles.societyAddress}
            >
              {bill.societyAddress}
            </Text>

          </View>

        </View>


        <Divider
          style={{
            marginVertical: 12,
          }}
        />


        {/* BILL INFORMATION */}

        <Text
          style={styles.sectionTitle}
        >
          Bill Information
        </Text>


        <View style={styles.infoRow}>

          <Text style={styles.label}>
            Bill #:
          </Text>

          <Text style={styles.value}>
            {bill.billNumber}
          </Text>

        </View>


        {bill.invoiceNumber && (

          <View style={styles.infoRow}>

            <Text style={styles.label}>
              Invoice #:
            </Text>

            <Text style={styles.value}>
              {bill.invoiceNumber}
            </Text>

          </View>

        )}


        <View style={styles.infoRow}>

          <Text style={styles.label}>
            Resident:
          </Text>

          <Text style={styles.value}>
            {bill.residentName} ({bill.unitNumber})
          </Text>

        </View>


        <View style={styles.infoRow}>

          <Text style={styles.label}>
            Period:
          </Text>

          <Text style={styles.value}>
            {bill.period}
          </Text>

        </View>


        <View style={styles.infoRow}>

          <Text style={styles.label}>
            Due Date:
          </Text>

          <Text style={styles.value}>

            {bill.dueDate
              ? new Date(
                  bill.dueDate
                ).toLocaleDateString()
              : '-'}

          </Text>

        </View>


        <Divider
          style={{
            marginVertical: 12,
          }}
        />


        {/* CHARGES */}

        <Text
          style={styles.sectionTitle}
        >
          Itemized Charges
        </Text>


        {bill.charges.map(
          (charge, index) => (

            <View
              key={index}
              style={styles.chargeRow}
            >

              <Text
                style={styles.chargeDesc}
              >
                {charge.description}
              </Text>

              <Text
                style={styles.chargeAmt}
              >
                ₹ {Number(
                  charge.amount || 0
                ).toFixed(2)}
              </Text>

            </View>

          )
        )}


        <Divider
          style={{
            marginVertical: 12,
          }}
        />


        {/* TOTAL */}

        <View
          style={styles.totalRow}
        >

          <Text
            style={styles.totalLabel}
          >
            Total
          </Text>

          <Text
            style={styles.totalAmt}
          >
            ₹ {totalCharges.toFixed(2)}
          </Text>

        </View>


        {/* STATUS */}

        <View
          style={styles.statusRow}
        >

          <Text
            style={styles.label}
          >
            Status:
          </Text>

          <Chip
            style={styles.statusChip}
            textStyle={
              styles.statusChipText
            }
          >
            {bill.status}
          </Chip>

        </View>


        {bill.status === 'Paid' &&
          bill.paymentDate && (

          <View
            style={styles.infoRow}
          >

            <Text
              style={styles.label}
            >
              Paid On:
            </Text>

            <Text
              style={styles.value}
            >
              {new Date(
                bill.paymentDate
              ).toLocaleDateString()}
            </Text>

          </View>

        )}


        {bill.transactionId && (

          <View
            style={styles.infoRow}
          >

            <Text
              style={styles.label}
            >
              Transaction ID:
            </Text>

            <Text
              style={styles.value}
            >
              {bill.transactionId}
            </Text>

          </View>

        )}


        {/* ACTIONS */}

        <View
          style={styles.actionsRow}
        >

          {bill.status !== 'Paid' && (

            <Button
              mode="contained"
              onPress={handlePay}
              loading={paying}
              disabled={paying}
              style={styles.actionBtn}
            >
              {paying
                ? 'Processing...'
                : 'Pay Bill'}
            </Button>

          )}


          <Button
            mode="outlined"
            onPress={
              handleDownloadBillPdf
            }
            style={styles.actionBtn}
          >
            Download PDF
          </Button>


          {bill.status === 'Paid' && (

            <Button
              mode="outlined"
              onPress={
                handleDownloadReceipt
              }
              style={styles.actionBtn}
            >
              Download Receipt
            </Button>

          )}

        </View>

      </Card>

    </ScrollView>

  );

};


// ==================================================
// STYLES
// ==================================================

const styles =
  StyleSheet.create({

    container: {

      flex: 1,

      backgroundColor:
        '#111',

      padding: 12,

    },

    loader: {

      flex: 1,

      justifyContent:
        'center',

      alignItems:
        'center',

      backgroundColor:
        '#111',

    },

    card: {

      backgroundColor:
        '#1e1e1e',

      padding: 16,

      borderRadius: 12,

    },

    headerRow: {

      flexDirection:
        'row',

      alignItems:
        'center',

    },

    headerInfo: {

      marginLeft: 12,

      flex: 1,

    },

    societyName: {

      color:
        '#ff8c00',

      fontSize: 20,

      fontWeight:
        'bold',

    },

    societyAddress: {

      color:
        '#fff',

      fontSize: 14,

      marginTop: 3,

    },

    sectionTitle: {

      color:
        '#ff8c00',

      fontSize: 18,

      fontWeight:
        'bold',

      marginBottom: 8,

    },

    infoRow: {

      flexDirection:
        'row',

      marginBottom: 6,

      flexWrap:
        'wrap',

    },

    label: {

      color:
        '#fff',

      fontWeight:
        '600',

      marginRight: 5,

    },

    value: {

      color:
        '#fff',

      flexShrink: 1,

    },

    chargeRow: {

      flexDirection:
        'row',

      justifyContent:
        'space-between',

      marginBottom: 8,

    },

    chargeDesc: {

      color:
        '#fff',

      flex: 1,

    },

    chargeAmt: {

      color:
        '#fff',

      fontWeight:
        '600',

    },

    totalRow: {

      flexDirection:
        'row',

      justifyContent:
        'space-between',

      marginTop: 8,

      paddingVertical: 10,

    },

    totalLabel: {

      color:
        '#ff8c00',

      fontSize: 20,

      fontWeight:
        'bold',

    },

    totalAmt: {

      color:
        '#ff8c00',

      fontSize: 20,

      fontWeight:
        'bold',

    },

    statusRow: {

      flexDirection:
        'row',

      alignItems:
        'center',

      marginTop: 8,

      marginBottom: 8,

    },

    statusChip: {

      backgroundColor:
        '#333',

      marginLeft: 8,

    },

    statusChipText: {

      color:
        '#fff',

    },

    actionsRow: {

      flexDirection:
        'row',

      flexWrap:
        'wrap',

      justifyContent:
        'center',

      marginTop: 16,

    },

    actionBtn: {

      marginVertical: 5,

      marginHorizontal: 4,

    },

  });


export default BillDetailScreen;