import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {
  Receipt,
  CreditCard,
  Smartphone,
  Building,
  Banknote,
  ShieldCheck,
  Check,
  X,
} from 'lucide-react-native';

import {
  Colors,
  Spacing,
  FontSize,
  FontWeight,
  Radius,
} from '../../../constants/theme';
import BackHeader from '../../../components/backHeader/BackHeader';
import {showToast} from '../../../utils/toast';
import {useApp} from '../../../context/AppContext';
import type {Bill} from '../../../types';

type BillTab = 'pending' | 'paid' | 'insurance';

type PaymentMethod =
  | 'upi'
  | 'card'
  | 'netbanking'
  | 'cash'
  | 'insurance';

const tabs: BillTab[] = ['pending', 'paid', 'insurance'];

const paymentMethods = [
  {id: 'upi', label: 'UPI', icon: Smartphone},
  {id: 'card', label: 'Card', icon: CreditCard},
  {id: 'netbanking', label: 'Net Banking', icon: Building},
  {id: 'cash', label: 'Cash', icon: Banknote},
  {id: 'insurance', label: 'Insurance', icon: ShieldCheck},
] as const;

const formatAmount = (amount: number) =>
  `₹${amount.toLocaleString('en-IN')}`;

export default function BillingScreen() {
  const insets = useSafeAreaInsets();

  const {currentPatientId, bills} = useApp();

  const [tab, setTab] = useState<BillTab>('pending');
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>('upi');

  const myBills = bills.filter(
    bill => bill.patientId === currentPatientId,
  );

  const filteredBills = myBills.filter(bill => {
    if (tab === 'pending') {
      return bill.status === 'pending' || bill.status === 'partial';
    }

    if (tab === 'paid') {
      return bill.status === 'paid';
    }

    return bill.status === 'insurance';
  });

  const openPayment = (bill: Bill) => {
    if (bill.outstanding <= 0) {
      return;
    }

    setSelectedBill(bill);
    setPaymentMethod('upi');
    setShowPayment(true);
  };

  const closePayment = () => {
    setShowPayment(false);
    setSelectedBill(null);
  };

  const handlePay = () => {
    if (!selectedBill || selectedBill.outstanding <= 0) {
      return;
    }

    // Integrate your payment API using:
    // selectedBill.id
    // selectedBill.outstanding
    // paymentMethod
    //
    // Refresh bills and show success only after the backend
    // confirms the payment.

    showToast('Payment API is not integrated yet', 'error');
  };

  return (
    <View style={styles.container}>
      <BackHeader title="My Bills" />

      <View style={styles.tabs}>
        {tabs.map(item => {
          const isActive = tab === item;

          return (
            <TouchableOpacity
              key={item}
              onPress={() => setTab(item)}
              accessibilityRole="button"
              accessibilityState={{selected: isActive}}
              style={[styles.tab, isActive && styles.tabActive]}>
              <Text
                style={[
                  styles.tabText,
                  isActive && styles.tabTextActive,
                ]}>
                {item.charAt(0).toUpperCase() + item.slice(1)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {paddingBottom: insets.bottom + Spacing.xxl},
        ]}
        showsVerticalScrollIndicator={false}>
        {filteredBills.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Receipt size={48} color={Colors.neutral[300]} />

            <Text style={styles.emptyTitle}>
              No {tab} bills
            </Text>

            <Text style={styles.emptyMessage}>
              {tab === 'pending'
                ? 'You have no pending payments.'
                : `No ${tab} bills to show.`}
            </Text>
          </View>
        ) : (
          filteredBills.map(bill => (
            <View key={bill.id} style={styles.billCard}>
              <View style={styles.billTop}>
                <View style={styles.billLeft}>
                  <Text style={styles.billInvoice}>
                    {bill.invoiceNumber}
                  </Text>

                  <Text style={styles.billDesc}>
                    {bill.description}
                  </Text>

                  <Text style={styles.billDate}>
                    {bill.date}
                  </Text>
                </View>

                <View
                  style={[
                    styles.statusBadge,
                    bill.status === 'paid'
                      ? styles.paidBadge
                      : bill.status === 'insurance'
                        ? styles.insuranceBadge
                        : styles.pendingBadge,
                  ]}>
                  <Text style={styles.statusText}>
                    {bill.status.charAt(0).toUpperCase() +
                      bill.status.slice(1)}
                  </Text>
                </View>
              </View>

              <View style={styles.billBottom}>
                <View style={styles.billAmounts}>
                  <View style={styles.amountRow}>
                    <Text style={styles.amountLabel}>Total</Text>
                    <Text style={styles.amountValue}>
                      {formatAmount(bill.amount)}
                    </Text>
                  </View>

                  {bill.paid > 0 && (
                    <View style={styles.amountRow}>
                      <Text style={styles.amountLabel}>Paid</Text>
                      <Text style={styles.amountValuePaid}>
                        {formatAmount(bill.paid)}
                      </Text>
                    </View>
                  )}

                  {bill.outstanding > 0 && (
                    <View style={styles.amountRow}>
                      <Text style={styles.amountLabel}>
                        Outstanding
                      </Text>
                      <Text style={styles.amountValueOutstanding}>
                        {formatAmount(bill.outstanding)}
                      </Text>
                    </View>
                  )}
                </View>

                {bill.outstanding > 0 && (
                  <TouchableOpacity
                    style={styles.payBtn}
                    onPress={() => openPayment(bill)}
                    accessibilityRole="button">
                    <Text style={styles.payBtnText}>Pay Now</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <Modal
        visible={showPayment}
        transparent
        animationType="slide"
        onRequestClose={closePayment}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={closePayment}
            accessibilityRole="button"
            accessibilityLabel="Close payment"
          />

          <View
            style={[
              styles.paymentSheet,
              {
                paddingBottom: Math.max(
                  insets.bottom,
                  Spacing.md,
                ),
              },
            ]}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Payment</Text>

              <TouchableOpacity
                onPress={closePayment}
                style={styles.closeButton}
                accessibilityRole="button"
                accessibilityLabel="Close payment">
                <X size={24} color={Colors.neutral[700]} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {selectedBill && (
                <>
                  <View style={styles.paymentAmountCard}>
                    <Text style={styles.paymentAmountLabel}>
                      Amount to Pay
                    </Text>

                    <Text style={styles.paymentAmount}>
                      {formatAmount(selectedBill.outstanding)}
                    </Text>

                    <Text style={styles.paymentInvoice}>
                      {selectedBill.invoiceNumber}
                    </Text>
                  </View>

                  <Text style={styles.paymentLabel}>
                    Select Payment Method
                  </Text>

                  {paymentMethods.map(method => {
                    const Icon = method.icon;
                    const isSelected =
                      paymentMethod === method.id;

                    return (
                      <TouchableOpacity
                        key={method.id}
                        onPress={() =>
                          setPaymentMethod(method.id)
                        }
                        accessibilityRole="button"
                        accessibilityState={{
                          selected: isSelected,
                        }}
                        style={[
                          styles.paymentMethod,
                          isSelected &&
                            styles.paymentMethodActive,
                        ]}>
                        <Icon
                          size={22}
                          color={
                            isSelected
                              ? Colors.primary[600]
                              : Colors.neutral[400]
                          }
                        />

                        <Text
                          style={[
                            styles.paymentMethodText,
                            isSelected &&
                              styles.paymentMethodTextActive,
                          ]}>
                          {method.label}
                        </Text>

                        {isSelected && (
                          <Check
                            size={20}
                            color={Colors.primary[600]}
                          />
                        )}
                      </TouchableOpacity>
                    );
                  })}

                  <TouchableOpacity
                    style={styles.paymentButton}
                    onPress={handlePay}
                    accessibilityRole="button">
                    <Text style={styles.paymentButtonText}>
                      Pay {formatAmount(selectedBill.outstanding)}
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  tabs: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.md,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.sm + 2,
    borderRadius: Radius.md,
    alignItems: 'center',
    backgroundColor: Colors.neutral[50],
  },
  tabActive: {
    backgroundColor: Colors.primary[50],
  },
  tabText: {
    fontSize: FontSize.sm,
    color: Colors.neutral[500],
    fontWeight: FontWeight.medium,
  },
  tabTextActive: {
    color: Colors.primary[700],
    fontWeight: FontWeight.semibold,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
  },
  emptyTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.neutral[900],
    marginTop: Spacing.md,
  },
  emptyMessage: {
    fontSize: FontSize.sm,
    color: Colors.neutral[500],
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  billCard: {
    backgroundColor: Colors.neutral[0],
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  billTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  billLeft: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  billInvoice: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
    color: Colors.neutral[900],
  },
  billDesc: {
    fontSize: FontSize.sm,
    color: Colors.neutral[500],
    marginTop: 2,
  },
  billDate: {
    fontSize: FontSize.xs,
    color: Colors.neutral[400],
    marginTop: 2,
  },
  statusBadge: {
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
  },
  paidBadge: {
    backgroundColor: Colors.success[100],
  },
  pendingBadge: {
    backgroundColor: Colors.warning[100],
  },
  insuranceBadge: {
    backgroundColor: Colors.primary[50],
  },
  statusText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    color: Colors.neutral[700],
  },
  billBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: Spacing.sm,
  },
  billAmounts: {
    flex: 1,
    gap: Spacing.xs,
  },
  amountRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  amountLabel: {
    fontSize: FontSize.xs,
    color: Colors.neutral[400],
  },
  amountValue: {
    fontSize: FontSize.sm,
    color: Colors.neutral[900],
    fontWeight: FontWeight.semibold,
  },
  amountValuePaid: {
    fontSize: FontSize.sm,
    color: Colors.success[600],
    fontWeight: FontWeight.semibold,
  },
  amountValueOutstanding: {
    fontSize: FontSize.sm,
    color: Colors.error[600],
    fontWeight: FontWeight.bold,
  },
  payBtn: {
    backgroundColor: Colors.primary[600],
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm + 2,
  },
  payBtnText: {
    color: '#FFFFFF',
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
//   modalBackdrop: {
//     ...StyleSheet.absoluteFillObject,
//   },
modalBackdrop: {
  position: 'absolute',
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
},
  paymentSheet: {
    maxHeight: '90%',
    backgroundColor: Colors.neutral[0],
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    padding: Spacing.base,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  sheetTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.neutral[900],
  },
  closeButton: {
    padding: Spacing.sm,
  },
  paymentAmountCard: {
    alignItems: 'center',
    padding: Spacing.lg,
    backgroundColor: Colors.neutral[50],
    borderRadius: Radius.lg,
    marginBottom: Spacing.lg,
  },
  paymentAmountLabel: {
    fontSize: FontSize.base,
    color: Colors.neutral[400],
  },
  paymentAmount: {
    fontSize: FontSize.display,
    fontWeight: FontWeight.bold,
    color: Colors.primary[700],
    marginTop: Spacing.sm,
  },
  paymentInvoice: {
    fontSize: FontSize.sm,
    color: Colors.neutral[400],
    marginTop: Spacing.xs,
  },
  paymentLabel: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: Colors.neutral[700],
    marginBottom: Spacing.md,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.neutral[50],
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1.5,
    borderColor: Colors.neutral[200],
  },
  paymentMethodActive: {
    borderColor: Colors.primary[500],
    backgroundColor: Colors.primary[50],
  },
  paymentMethodText: {
    flex: 1,
    fontSize: FontSize.base,
    color: Colors.neutral[700],
    fontWeight: FontWeight.medium,
  },
  paymentMethodTextActive: {
    color: Colors.primary[700],
    fontWeight: FontWeight.semibold,
  },
  paymentButton: {
    alignItems: 'center',
    backgroundColor: Colors.primary[600],
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    marginTop: Spacing.md,
  },
  paymentButtonText: {
    color: '#FFFFFF',
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
  },
});