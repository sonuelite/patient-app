import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Search, Pill, Plus, Check} from 'lucide-react-native';

import {
  Colors,
  Spacing,
  FontSize,
  FontWeight,
  Radius,
} from '../../../constants/theme';
import BackHeader from '../../../components/backHeader/BackHeader';
import {useApp} from '../../../context/AppContext';
import {showToast} from '../../../utils/toast';

export default function PharmacyScreen() {
  const insets = useSafeAreaInsets();

  const {medicineStock, prescriptions, currentPatientId} = useApp();

  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<string[]>([]);

  const myPrescriptions = prescriptions.filter(
    prescription => prescription.patientId === currentPatientId,
  );

  const filteredMedicines = medicineStock.filter(medicine =>
    medicine.name.toLowerCase().includes(search.trim().toLowerCase()),
  );

  const toggleCart = (medicineId: string) => {
    setCart(previousCart => {
      if (previousCart.includes(medicineId)) {
        return previousCart.filter(id => id !== medicineId);
      }

      return [...previousCart, medicineId];
    });
  };

  const handleCheckout = () => {
    // Add the order API here before clearing the cart.
    showToast('Checkout API is not integrated yet', 'error');
  };

  return (
    <View style={styles.container}>
      <BackHeader title="Pharmacy" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {paddingBottom: insets.bottom + 100},
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        {myPrescriptions.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>
              From Your Prescriptions
            </Text>

            {myPrescriptions.map(prescription => (
              <View key={prescription.id} style={styles.card}>
                <View style={styles.rxHeader}>
                  <Pill size={20} color={Colors.primary[600]} />

                  <View style={styles.rxInfo}>
                    <Text style={styles.rxDiag}>
                      {prescription.diagnosis}
                    </Text>

                    <Text style={styles.rxDoctor}>
                      {prescription.doctorName} · {prescription.date}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.badge,
                      prescription.status === 'finalized'
                        ? styles.successBadge
                        : styles.neutralBadge,
                    ]}>
                    <Text
                      style={[
                        styles.badgeText,
                        prescription.status === 'finalized'
                          ? styles.successBadgeText
                          : styles.neutralBadgeText,
                      ]}>
                      {prescription.status}
                    </Text>
                  </View>
                </View>

                <View style={styles.rxMeds}>
                  {prescription.medicines.map(medicine => (
                    <View
                      key={medicine.id}
                      style={styles.rxMedItem}>
                      <Text style={styles.rxMedName}>
                        {medicine.name}
                      </Text>

                      <Text style={styles.rxMedDose}>
                        {medicine.dosage} · {medicine.frequency} ·{' '}
                        {medicine.duration}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </>
        )}

        <Text style={styles.sectionTitle}>Order Medicines</Text>

        <View style={styles.searchBox}>
          <Search size={18} color={Colors.neutral[400]} />

          <TextInput
            style={styles.searchInput}
            placeholder="Search medicines..."
            placeholderTextColor={Colors.neutral[400]}
            value={search}
            onChangeText={setSearch}
            autoCorrect={false}
          />
        </View>

        {filteredMedicines.length === 0 && (
          <Text style={styles.emptyText}>No medicines found.</Text>
        )}

        {filteredMedicines.map(medicine => {
          const isInCart = cart.includes(medicine.id);

          return (
            <View key={medicine.id} style={styles.card}>
              <View style={styles.medRow}>
                <View style={styles.medInfo}>
                  <Text style={styles.medName}>
                    {medicine.name}
                  </Text>

                  <Text style={styles.medMeta}>
                    Batch: {medicine.batch} · Exp: {medicine.expiry}
                  </Text>

                  <Text style={styles.medPrice}>
                    ₹{medicine.price}
                  </Text>

                  {medicine.stock <= medicine.lowStockThreshold && (
                    <View style={[styles.badge, styles.warningBadge]}>
                      <Text
                        style={[
                          styles.badgeText,
                          styles.warningBadgeText,
                        ]}>
                        Low Stock
                      </Text>
                    </View>
                  )}
                </View>

                <TouchableOpacity
                  style={[
                    styles.cartBtn,
                    isInCart && styles.cartBtnActive,
                  ]}
                  onPress={() => toggleCart(medicine.id)}
                  accessibilityRole="button"
                  accessibilityLabel={
                    isInCart
                      ? `Remove ${medicine.name} from cart`
                      : `Add ${medicine.name} to cart`
                  }>
                  {isInCart ? (
                    <Check size={20} color="#FFFFFF" />
                  ) : (
                    <Plus size={20} color={Colors.primary[600]} />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          );
        })}

        {cart.length > 0 && (
          <View style={styles.checkoutBar}>
            <Text style={styles.checkoutText}>
              {cart.length} item(s) in cart
            </Text>

            <TouchableOpacity
              style={styles.checkoutBtn}
              onPress={handleCheckout}
              accessibilityRole="button">
              <Text style={styles.checkoutBtnText}>Checkout</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.base,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.neutral[900],
    marginBottom: Spacing.md,
    marginTop: Spacing.sm,
  },
  card: {
    backgroundColor: Colors.neutral[0],
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  rxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  rxInfo: {
    flex: 1,
  },
  rxDiag: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: Colors.neutral[900],
  },
  rxDoctor: {
    fontSize: FontSize.sm,
    color: Colors.neutral[400],
    marginTop: 2,
  },
  rxMeds: {
    gap: Spacing.sm,
  },
  rxMedItem: {
    backgroundColor: Colors.neutral[50],
    borderRadius: Radius.md,
    padding: Spacing.md,
  },
  rxMedName: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.neutral[900],
  },
  rxMedDose: {
    fontSize: FontSize.xs,
    color: Colors.neutral[500],
    marginTop: 2,
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
  },
  successBadge: {
    backgroundColor: Colors.success[100],
  },
  successBadgeText: {
    color: '#166534',
  },
  neutralBadge: {
    backgroundColor: Colors.neutral[100],
  },
  neutralBadgeText: {
    color: Colors.neutral[700],
  },
  warningBadge: {
    backgroundColor: Colors.warning[100],
    marginTop: Spacing.sm,
  },
  warningBadgeText: {
    color: '#92400E',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutral[0],
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    minHeight: 48,
    marginBottom: Spacing.md,
    borderWidth: 1.5,
    borderColor: Colors.neutral[200],
  },
  searchInput: {
    flex: 1,
    marginLeft: Spacing.sm,
    fontSize: FontSize.base,
    color: Colors.neutral[900],
  },
  emptyText: {
    textAlign: 'center',
    color: Colors.neutral[500],
    fontSize: FontSize.base,
    paddingVertical: Spacing.xl,
  },
  medRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  medInfo: {
    flex: 1,
    marginRight: Spacing.md,
  },
  medName: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: Colors.neutral[900],
  },
  medMeta: {
    fontSize: FontSize.xs,
    color: Colors.neutral[400],
    marginTop: 2,
  },
  medPrice: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.primary[700],
    marginTop: 4,
  },
  cartBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.primary[200],
  },
  cartBtnActive: {
    backgroundColor: Colors.primary[600],
    borderColor: Colors.primary[600],
  },
  checkoutBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.neutral[0],
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginTop: Spacing.md,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  checkoutText: {
    flex: 1,
    fontSize: FontSize.base,
    color: Colors.neutral[700],
    fontWeight: FontWeight.medium,
    marginRight: Spacing.sm,
  },
  checkoutBtn: {
    backgroundColor: Colors.primary[600],
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  checkoutBtnText: {
    color: '#FFFFFF',
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
  },
});