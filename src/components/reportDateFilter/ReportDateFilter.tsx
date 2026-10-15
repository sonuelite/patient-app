import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import moment from 'moment';
import {
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Colors,
  FontSize,
  FontWeight,
  Radius,
  Spacing,
} from '../../constants/theme';

type Range = { startDate: string; endDate: string };

export default function ReportDateFilter({
  range,
  onApply,
}: {
  range: Range | null;
  onApply: (range: Range) => void;
}) {
  const insets = useSafeAreaInsets();
  const [visible, setVisible] = useState(false);
  const [draft, setDraft] = useState<Range>({ startDate: '', endDate: '' });
  const [field, setField] = useState<keyof Range | null>(null);
  const [month, setMonth] = useState(moment().startOf('month'));
  const [error, setError] = useState('');
  const open = () => {
    setDraft(range || { startDate: '', endDate: '' });
    setField(null);
    setError('');
    setVisible(true);
  };
  const days = Array.from(
    { length: month.day() + month.daysInMonth() },
    (_, i) =>
      i < month.day() ? null : month.clone().date(i - month.day() + 1),
  );
  return (
    <>
      <TouchableOpacity
        style={styles.selector}
        onPress={open}
        accessibilityRole="button"
        accessibilityLabel="Filter reports by date"
      >
        <CalendarDays size={20} color={Colors.primary[700]} />
        <Text style={styles.range}>
          {range
            ? `${moment(range.startDate).format('D MMM YYYY')} – ${moment(
                range.endDate,
              ).format('D MMM YYYY')}`
            : 'Select date range'}
        </Text>
        <ChevronDown size={18} color={Colors.neutral[600]} />
      </TouchableOpacity>
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={() => setVisible(false)}
      >
        <View style={styles.overlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setVisible(false)}
            accessibilityRole="button"
            accessibilityLabel="Dismiss filters"
          />
          <View
            style={[
              styles.sheet,
              { paddingBottom: Math.max(insets.bottom, Spacing.base) },
            ]}
          >
            <View style={styles.handle} />
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.heading}>
                <Text style={styles.title}>Filter reports</Text>
                <TouchableOpacity
                  onPress={() => setVisible(false)}
                  accessibilityRole="button"
                  accessibilityLabel="Close filters"
                  style={styles.close}
                >
                  <X size={22} color={Colors.neutral[500]} />
                </TouchableOpacity>
              </View>
              <Text style={styles.subtitle}>Choose a date range</Text>
              {(['startDate', 'endDate'] as const).map(key => (
                <View key={key}>
                  <Text style={styles.label}>
                    {key === 'startDate' ? 'From date' : 'To date'}
                  </Text>
                  <TouchableOpacity
                    style={styles.date}
                    accessibilityRole="button"
                    accessibilityLabel={
                      key === 'startDate'
                        ? 'Choose from date'
                        : 'Choose to date'
                    }
                    onPress={() => {
                      setField(field === key ? null : key);
                      setMonth(
                        (draft[key] ? moment(draft[key]) : moment()).startOf(
                          'month',
                        ),
                      );
                    }}
                  >
                    <CalendarDays size={20} color={Colors.primary[700]} />
                    <Text style={styles.range}>
                      {draft[key]
                        ? moment(draft[key]).format('D MMM YYYY')
                        : 'Select date'}
                    </Text>
                    <ChevronDown size={18} color={Colors.neutral[500]} />
                  </TouchableOpacity>
                </View>
              ))}
              {field && (
                <View style={styles.calendar}>
                  <View style={styles.heading}>
                    <TouchableOpacity
                      style={styles.close}
                      accessibilityRole="button"
                      accessibilityLabel="Previous month"
                      onPress={() =>
                        setMonth(month.clone().subtract(1, 'month'))
                      }
                    >
                      <ChevronLeft size={22} color={Colors.primary[700]} />
                    </TouchableOpacity>
                    <Text style={styles.title}>
                      {month.format('MMMM YYYY')}
                    </Text>
                    <TouchableOpacity
                      style={styles.close}
                      accessibilityRole="button"
                      accessibilityLabel="Next month"
                      onPress={() => setMonth(month.clone().add(1, 'month'))}
                    >
                      <ChevronRight size={22} color={Colors.primary[700]} />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.grid}>
                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                      <Text key={day} style={styles.weekday}>
                        {day}
                      </Text>
                    ))}
                    {days.map((date, i) => {
                      const selected =
                        date?.format('YYYY-MM-DD') === draft[field];
                      return date ? (
                        <TouchableOpacity
                          key={i}
                          style={[styles.day, selected && styles.selected]}
                          accessibilityRole="button"
                          accessibilityLabel={date.format('D MMMM YYYY')}
                          accessibilityState={{ selected }}
                          onPress={() => {
                            setDraft({
                              ...draft,
                              [field]: date.format('YYYY-MM-DD'),
                            });
                            setField(null);
                            setError('');
                          }}
                        >
                          <Text
                            style={selected ? styles.white : styles.dayText}
                          >
                            {date.date()}
                          </Text>
                        </TouchableOpacity>
                      ) : (
                        <View key={i} style={styles.day} />
                      );
                    })}
                  </View>
                </View>
              )}
              {!!error && <Text style={styles.error}>{error}</Text>}
              <TouchableOpacity
                style={styles.apply}
                accessibilityRole="button"
                onPress={() => {
                  if (!draft.startDate || !draft.endDate) {
                    setError('Select both from and to dates.');
                    return;
                  }
                  if (moment(draft.startDate).isAfter(draft.endDate, 'day')) {
                    setError('From date must be on or before to date.');
                    return;
                  }
                  onApply(draft);
                  setVisible(false);
                }}
              >
                <Text style={styles.applyText}>Apply filters</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.primary[100],
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.base,
    backgroundColor: Colors.neutral[0],
  },
  range: { flex: 1, color: Colors.neutral[800], fontSize: FontSize.sm },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.neutral[0],
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: Spacing.base,
    maxHeight: '90%',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.neutral[200],
    alignSelf: 'center',
    marginVertical: Spacing.sm,
  },
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
    color: Colors.neutral[900],
  },
  close: { padding: Spacing.sm },
  subtitle: {
    fontSize: FontSize.sm,
    color: Colors.neutral[500],
    marginBottom: Spacing.sm,
  },
  label: {
    fontSize: FontSize.sm,
    color: Colors.neutral[500],
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  date: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.primary[100],
    borderRadius: Radius.md,
  },
  calendar: { marginTop: Spacing.sm },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  weekday: {
    width: '14.2857%',
    textAlign: 'center',
    color: Colors.neutral[500],
    paddingVertical: Spacing.sm,
  },
  day: {
    width: '14.2857%',
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.md,
  },
  selected: { backgroundColor: Colors.primary[600] },
  dayText: { color: Colors.neutral[900] },
  white: { color: Colors.neutral[0] },
  error: { color: Colors.error[600], marginTop: Spacing.sm },
  apply: {
    backgroundColor: Colors.primary[600],
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.md,
    marginTop: Spacing.base,
    marginBottom: Spacing.sm,
  },
  applyText: {
    color: Colors.neutral[0],
    fontWeight: FontWeight.semibold,
    fontSize: FontSize.sm,
  },
});
