import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator, Alert, Modal, ScrollView, StyleSheet, Text, TextInput,
  TouchableOpacity, View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {
  ArrowLeft, Check, ChevronDown, ChevronRight, FlaskConical,
  MessageCircle, Phone, Plus, Search, ShoppingCart, UserRound, X,
} from 'lucide-react-native';
import {Colors, FontSize, FontWeight, Radius, Spacing} from '../../../constants/theme';
import {useApp} from '../../../context/AppContext';
import {useAppSelector} from '../../../store/hooks';
import {selectPatient} from '../../../store/selectors';
import type {RootStackParamList} from '../../../types';
import {getAllLabTests} from '../../../network/api';
import type {LabCatalogTest} from '../../../network/api';
import {getErrorMessage} from '../../../utils/apiError';

const TEST_BATCH_SIZE = 6;

const money = (value: number) => `₹${value.toLocaleString('en-IN')}`;

const BookTestsScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const {currentPatientId, patients} = useApp();
  const authPatient = useAppSelector(selectPatient);
  const [query, setQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(TEST_BATCH_SIZE);

  const [selected, setSelected] = useState<number[]>([]);
  const [tests, setTests] = useState<LabCatalogTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);

  useEffect(() => {setVisibleCount(TEST_BATCH_SIZE);}, [query, retry]);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    const loadTests = async () => {
      try {
        const data = await getAllLabTests(controller.signal);
        if (active) {setTests(data);}
      } catch (loadError) {
        if (active) {setError(getErrorMessage(loadError, 'Unable to load lab tests'));}
      } finally {
        if (active) {setLoading(false);}
      }
    };
    loadTests();
    return () => {active = false; controller.abort();};
  }, [retry]);

  const [reviewVisible, setReviewVisible] = useState(false);
  const patientName = patients.find(patient => patient.id === currentPatientId)?.name
    || [authPatient?.first_name, authPatient?.last_name].filter(Boolean).join(' ') || 'Patient';
  const selectedTests = tests.filter(test => selected.includes(test.id));
  const total = selectedTests.reduce((sum, test) => sum + test.price, 0);
  const visibleTests = tests.filter(test => `${test.test_name} ${test.test_code} ${test.sample_type}`.toLowerCase().includes(query.trim().toLowerCase()));
  const toggleTest = (id: number) => setSelected(previous => previous.includes(id)
    ? previous.filter(item => item !== id) : [...previous, id]);
  const contactTeam = () => Alert.alert('Booking assistance', 'Hospital contact details are not available yet. Please contact your hospital directly for help booking tests.');

  return (
    <View style={[styles.screen, {paddingTop: insets.top}]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton} accessibilityRole="button" accessibilityLabel="Go back">
          <ArrowLeft size={22} color={Colors.neutral[900]} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Book Lab Tests</Text>
        <TouchableOpacity onPress={() => setReviewVisible(true)} style={styles.iconButton} accessibilityRole="button" accessibilityLabel={`View cart, ${selected.length} tests selected`}>
          <ShoppingCart size={23} color={Colors.neutral[900]} />
          {selected.length > 0 && <View style={styles.cartBadge}><Text style={styles.cartCount}>{selected.length}</Text></View>}
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.content}
        stickyHeaderIndices={[1]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={100}
        onScroll={({nativeEvent: {layoutMeasurement, contentOffset, contentSize}}) => {
          if (!loading && !error && layoutMeasurement.height + contentOffset.y >= contentSize.height - 120) {
            setVisibleCount(count => Math.min(count + TEST_BATCH_SIZE, visibleTests.length));
          }
        }}
      >
        <TouchableOpacity style={styles.patientCard} onPress={() => navigation.navigate('FamilyMembers')} accessibilityRole="button" accessibilityLabel={`Booking for ${patientName}. View family members`}>
          <View style={styles.avatar}><UserRound size={24} color={Colors.primary[600]} /></View>
          <View style={styles.flex}><Text style={styles.caption}>Booking for</Text><Text style={styles.patientName}>{patientName}</Text></View>
          <ChevronDown size={18} color={Colors.neutral[500]} />
        </TouchableOpacity>

        <View style={styles.searchStickyHeader}>
        <View style={styles.searchBar}>
          <Search size={20} color={Colors.neutral[500]} />
          <TextInput value={query} onChangeText={setQuery} placeholder="Search tests and health profiles" placeholderTextColor={Colors.neutral[400]} style={styles.searchInput} accessibilityLabel="Search tests and health profiles" returnKeyType="search" />
          {!!query && <TouchableOpacity onPress={() => setQuery('')} accessibilityRole="button" accessibilityLabel="Clear search"><X size={18} color={Colors.neutral[500]} /></TouchableOpacity>}
        </View>

        </View>

        <View style={styles.contactRow}>
          <TouchableOpacity style={[styles.contactCard, styles.callCard]} onPress={contactTeam} accessibilityRole="button">
            <View style={styles.contactIcon}><Phone size={20} color={Colors.primary[600]} /></View>
            <View style={styles.flex}><Text style={styles.contactTitle}>Book via Call</Text><Text style={styles.contactCaption}>Talk to our team</Text></View>
            <ChevronRight size={16} color={Colors.neutral[500]} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.contactCard, styles.whatsappCard]} onPress={contactTeam} accessibilityRole="button">
            <View style={[styles.contactIcon, styles.whatsappIcon]}><MessageCircle size={20} color={Colors.success[700]} /></View>
            <View style={styles.flex}><Text style={styles.contactTitle}>WhatsApp</Text><Text style={styles.contactCaption}>Chat with us</Text></View>
            <ChevronRight size={16} color={Colors.neutral[500]} />
          </TouchableOpacity>
        </View>

        <View style={styles.sectionHeading}>
          <Text style={styles.sectionTitle}>Diagnostic tests</Text>
          <TouchableOpacity onPress={() => setQuery('')} style={styles.viewAll} accessibilityRole="button" accessibilityLabel="View all diagnostic tests"><Text style={styles.viewAllText}>View all</Text><ChevronRight size={16} color={Colors.primary[600]} /></TouchableOpacity>
        </View>
        {loading ? (
          <View style={styles.empty}><ActivityIndicator size="large" color={Colors.primary[600]} /><Text style={styles.caption}>Loading lab tests...</Text></View>
        ) : error ? (
          <View style={styles.empty}>
            <Text style={styles.patientName}>Unable to load lab tests</Text>
            <Text style={styles.caption}>{error}</Text>
            <TouchableOpacity style={styles.continueButton} onPress={() => setRetry(value => value + 1)} accessibilityRole="button"><Text style={styles.continueText}>Retry</Text></TouchableOpacity>
          </View>
        ) : <View style={styles.grid}>
          {visibleTests.slice(0, visibleCount).map(test => {
            const added = selected.includes(test.id);
            return (
              <View key={test.id} style={styles.testCard}>
                <View style={styles.testHeading}>
                  <View style={styles.testIcon}><FlaskConical size={21} color={Colors.primary[600]} /></View>
                  {/* <View style={styles.flex}><Text style={styles.testName}>{test.test_name.trim()}</Text><Text style={styles.testDescription}>{[test.sample_type, test.reporting_time].filter(Boolean).join(' | ')}</Text></View> */}
                  <View style={styles.flex}><Text style={styles.testName}>{test.test_name.trim()}</Text><Text style={styles.testDescription}>{test.sample_type}</Text></View>
                </View>
                <Text style={styles.price}>{money(test.price)}</Text>
                <TouchableOpacity onPress={() => toggleTest(test.id)} style={[styles.addButton, added && styles.addedButton]} accessibilityRole="button" accessibilityLabel={`${added ? 'Remove' : 'Add'} ${test.test_name.trim()}`} accessibilityState={{selected: added}}>
                  {added ? <Check size={16} color={Colors.neutral[0]} /> : <Plus size={16} color={Colors.primary[600]} />}
                  <Text style={[styles.addText, added && styles.addedText]}>{added ? 'Added' : 'Add test'}</Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>}
        {!loading && !error && visibleTests.length === 0 && <View style={styles.empty}><FlaskConical size={32} color={Colors.neutral[400]} /><Text style={styles.patientName}>No tests found</Text><Text style={styles.caption}>{tests.length === 0 ? 'No lab tests are currently available.' : 'Try a different test name.'}</Text></View>}
      </ScrollView>

      <View style={[styles.footer, {paddingBottom: Math.max(insets.bottom, Spacing.base)}]}>
        <View style={styles.flex}><Text style={styles.caption}>{selected.length} {selected.length === 1 ? 'test' : 'tests'} selected</Text><Text style={styles.total}>{money(total)}</Text></View>
        <TouchableOpacity style={[styles.continueButton, selected.length === 0 && styles.disabled]} disabled={selected.length === 0} onPress={() => setReviewVisible(true)} accessibilityRole="button" accessibilityState={{disabled: selected.length === 0}}>
          <Text style={styles.continueText}>Continue</Text><ChevronRight size={19} color={Colors.neutral[0]} />
        </TouchableOpacity>
      </View>

      <Modal visible={reviewVisible} transparent animationType="slide" onRequestClose={() => setReviewVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.sheet, {paddingBottom: Math.max(insets.bottom, Spacing.xl)}]}>
            <View style={styles.sectionHeading}><Text style={styles.sectionTitle}>Selected tests</Text><TouchableOpacity style={styles.iconButton} onPress={() => setReviewVisible(false)} accessibilityRole="button" accessibilityLabel="Close selected tests"><X size={22} color={Colors.neutral[700]} /></TouchableOpacity></View>
            <Text style={styles.caption}>Booking for {patientName}</Text>
            <ScrollView contentContainerStyle={styles.reviewList}>
              {selectedTests.map(test => <View key={test.id} style={styles.reviewRow}><View style={styles.flex}><Text style={styles.patientName}>{test.test_name.trim()}</Text><Text style={styles.caption}>{money(test.price)}</Text></View><TouchableOpacity style={styles.iconButton} onPress={() => toggleTest(test.id)} accessibilityRole="button" accessibilityLabel={`Remove ${test.test_name.trim()}`}><X size={18} color={Colors.neutral[500]} /></TouchableOpacity></View>)}
              {selectedTests.length === 0 && <Text style={styles.caption}>Your cart is empty. Add tests to get started.</Text>}
            </ScrollView>
            <View style={styles.reviewRow}><Text style={styles.patientName}>Total</Text><Text style={styles.total}>{money(total)}</Text></View>
            <Text style={styles.notice}>Online booking is not available yet. Contact your hospital to confirm prices and availability.</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default BookTestsScreen;

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: Colors.neutral[50]},
  flex: {flex: 1},
  header: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm},
  iconButton: {width: 44, height: 44, alignItems: 'center', justifyContent: 'center'},
  headerTitle: {fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.neutral[900]},
  cartBadge: {position: 'absolute', right: 2, top: 0, minWidth: 18, height: 18, borderRadius: Radius.pill, backgroundColor: Colors.primary[600], alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3},
  cartCount: {color: Colors.neutral[0], fontSize: FontSize.xs, fontWeight: FontWeight.bold},
  content: {padding: Spacing.base, paddingTop: Spacing.xs, paddingBottom: Spacing.xl},
  patientCard: {flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.md, backgroundColor: Colors.neutral[0], borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.neutral[200]},
  avatar: {width: 40, height: 40, borderRadius: Radius.pill, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.primary[100]},
  caption: {fontSize: FontSize.sm, color: Colors.neutral[500]},
  patientName: {fontSize: FontSize.base, fontWeight: FontWeight.semibold, color: Colors.neutral[900]},
  searchStickyHeader: {backgroundColor: Colors.neutral[50], paddingBottom: Spacing.sm},
  searchBar: {flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, backgroundColor: Colors.neutral[0], borderWidth: 1, borderColor: Colors.neutral[200], borderRadius: Radius.md, paddingHorizontal: Spacing.md, marginTop: Spacing.md},
  searchInput: {flex: 1, minHeight: 46, fontSize: FontSize.sm, color: Colors.neutral[900], paddingVertical: Spacing.sm},
  contactRow: {flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.md},
  contactCard: {flex: 1, flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, borderRadius: Radius.md, padding: Spacing.sm, minHeight: 70},
  callCard: {backgroundColor: Colors.primary[50]},
  whatsappCard: {backgroundColor: Colors.success[50]},
  contactIcon: {width: 34, height: 34, borderRadius: Radius.pill, backgroundColor: Colors.primary[100], alignItems: 'center', justifyContent: 'center'},
  whatsappIcon: {backgroundColor: Colors.success[100]},
  contactTitle: {fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.neutral[900]},
  contactCaption: {fontSize: FontSize.xs, color: Colors.neutral[500], marginTop: Spacing.xs},
  sectionHeading: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: Spacing.lg, marginBottom: Spacing.md},
  sectionTitle: {fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.neutral[900]},
  viewAll: {flexDirection: 'row', alignItems: 'center', minHeight: 36},
  viewAllText: {fontSize: FontSize.sm, color: Colors.primary[600], fontWeight: FontWeight.medium},
  grid: {flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm},
  testCard: {width: '48%', flexGrow: 1, maxWidth: '50%', backgroundColor: Colors.neutral[0], borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.neutral[200], padding: Spacing.md},
  testHeading: {flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm, flex: 1, marginBottom: Spacing.md},
  testIcon: {width: 32, height: 32, borderRadius: Radius.pill, backgroundColor: Colors.primary[50], alignItems: 'center', justifyContent: 'center'},
  testName: {fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.neutral[900]},
  testDescription: {fontSize: FontSize.xs, color: Colors.neutral[500], marginTop: Spacing.xs},
  price: {fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.neutral[900], marginBottom: Spacing.sm},
  addButton: {minHeight: 36, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: Spacing.xs, borderWidth: 1, borderColor: Colors.primary[600], borderRadius: Radius.xs},
  addedButton: {backgroundColor: Colors.primary[600]},
  addText: {fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.primary[600]},
  addedText: {color: Colors.neutral[0]},
  footer: {flexDirection: 'row', alignItems: 'center', gap: Spacing.base, padding: Spacing.base, backgroundColor: Colors.neutral[0], borderTopWidth: 1, borderTopColor: Colors.neutral[200], borderTopLeftRadius: Radius.base, borderTopRightRadius: Radius.base},
  total: {fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.neutral[900], marginTop: Spacing.xs},
  continueButton: {flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, paddingHorizontal: Spacing.xl, minHeight: 48, backgroundColor: Colors.primary[600], borderRadius: Radius.sm},
  continueText: {fontSize: FontSize.base, color: Colors.neutral[0], fontWeight: FontWeight.semibold},
  disabled: {opacity: 0.4},
  empty: {alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.xxxl},
  modalBackdrop: {flex: 1, justifyContent: 'flex-end', backgroundColor: '#00000066'},
  sheet: {maxHeight: '80%', backgroundColor: Colors.neutral[0], borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl, padding: Spacing.lg},
  reviewList: {paddingVertical: Spacing.md},
  reviewRow: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.md, paddingVertical: Spacing.sm},
  notice: {fontSize: FontSize.sm, color: Colors.neutral[500], lineHeight: 20, marginTop: Spacing.md},
});
