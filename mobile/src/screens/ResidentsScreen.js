import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import { COLORS } from '../theme/colors';

export default function ResidentsScreen() {
  const [data, setData] = useState({ societyName: 'Your Society', approvedResidents: [] });
  const [loading, setLoading] = useState(true);
  useEffect(() => { api.get('/api/residents').then(({ data: response }) => setData(response)).catch(() => {}).finally(() => setLoading(false)); }, []);
  return <SafeAreaView style={styles.page}>
    <FlatList data={data.approvedResidents || []} keyExtractor={(item) => item._id} contentContainerStyle={styles.content}
      ListHeaderComponent={<View style={styles.title}><Ionicons name="people" size={28} color="#0d6efd" /><Text style={styles.heading}>Residents of {data.societyName}</Text><Text style={styles.subheading}>View all registered residents in your society.</Text></View>}
      ListEmptyComponent={loading ? <ActivityIndicator color="#0d6efd" size="large" /> : <Text style={styles.empty}>No approved residents yet.</Text>}
      renderItem={({ item }) => <View style={styles.card}><View style={styles.avatar}>{item.profileImage ? <Image source={{ uri: item.profileImage }} style={styles.avatarImage} /> : <Ionicons name="person" size={40} color="#fff" />}</View><Text style={styles.name}>{item.firstName} {item.lastName}</Text><Text style={styles.flat}>Flat {item.flatNumber}</Text><View style={styles.rule} /><Text style={styles.phone}><Ionicons name="call" size={14} color="#198754" />  {item.phoneNumber || 'Not added'}</Text></View>} />
  </SafeAreaView>;
}
const styles = StyleSheet.create({ page:{flex:1,backgroundColor:'#f4f9f9'}, content:{padding:16,gap:16}, title:{alignItems:'center',paddingVertical:18},heading:{fontSize:22,fontWeight:'700',color:'#212529',marginTop:7,textAlign:'center'},subheading:{color:'#6c757d',marginTop:5,textAlign:'center'},card:{backgroundColor:'#fff',borderRadius:20,padding:22,alignItems:'center',shadowColor:'#000',shadowOpacity:.08,shadowRadius:8,elevation:3},avatar:{width:100,height:100,borderRadius:50,backgroundColor:'#0d6efd',alignItems:'center',justifyContent:'center',overflow:'hidden'},avatarImage:{width:'100%',height:'100%'},name:{fontSize:18,fontWeight:'700',marginTop:13,color:'#212529'},flat:{marginTop:7,backgroundColor:'#0d6efd',color:'#fff',paddingHorizontal:10,paddingVertical:4,borderRadius:12,fontWeight:'700'},rule:{height:1,alignSelf:'stretch',backgroundColor:'#e9ecef',marginVertical:16},phone:{color:'#495057'},empty:{textAlign:'center',color:'#6c757d',padding:30} });
