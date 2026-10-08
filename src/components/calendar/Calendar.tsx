import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import moment from 'moment';

import {Colors, Radius, Spacing} from '../../constants/theme';
import {Fontconstants} from '../../constants/fontConstants';

type CalendarProps = {
  selected: string;
  availableDays: string[];
  onSelectDate: (date: string) => void;
};

const WEEKDAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

const Calendar = ({
  selected,
  availableDays,
  onSelectDate,
}: CalendarProps) => {
  const today = moment().startOf('day');
  const monthStart = today.clone().startOf('month');

  const allowedDays = new Set(
    availableDays.map(day => day.trim().toLowerCase()),
  );

  // Empty cells align the first date with its weekday.
  const leadingEmptyCells = monthStart.day();
  const totalCells =
    Math.ceil((leadingEmptyCells + monthStart.daysInMonth()) / 7) * 7;

  const cells = Array.from({length: totalCells}, (_, index) => {
    const dayNumber = index - leadingEmptyCells + 1;

    if (dayNumber < 1 || dayNumber > monthStart.daysInMonth()) {
      return null;
    }

    return monthStart.clone().date(dayNumber);
  });

  const weeks = Array.from(
    {length: totalCells / 7},
    (_, index) => cells.slice(index * 7, index * 7 + 7),
  );

  return (
    <View style={styles.container}>
      <Text style={styles.monthText}>
        {monthStart.format('MMMM YYYY')}
      </Text>

      <View style={styles.weekRow}>
        {WEEKDAYS.map(day => (
          <View key={day} style={styles.cell}>
            <Text style={styles.weekdayText}>
              {day.slice(0, 3)}
            </Text>
          </View>
        ))}
      </View>

      {weeks.map((week, weekIndex) => (
        <View key={weekIndex} style={styles.weekRow}>
          {week.map((date, dayIndex) => {
            if (!date) {
              return <View key={dayIndex} style={styles.cell} />;
            }

            const fullDate = date.format('YYYY-MM-DD');
            const weekday = WEEKDAYS[date.day()].toLowerCase();

            const isDisabled =
              date.isBefore(today, 'day') ||
              !allowedDays.has(weekday);

            const isSelected =
              !isDisabled && selected === fullDate;

            return (
              <View key={fullDate} style={styles.cell}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  disabled={isDisabled}
                  onPress={() => onSelectDate(fullDate)}
                  accessibilityRole="button"
                  accessibilityLabel={date.format(
                    'dddd, D MMMM YYYY',
                  )}
                  accessibilityState={{
                    disabled: isDisabled,
                    selected: isSelected,
                  }}
                  style={[
                    styles.dateCard,
                    isDisabled && styles.disabledCard,
                    isSelected && styles.selectedCard,
                  ]}>
                  <Text
                    style={[
                      styles.dateText,
                      isDisabled && styles.disabledText,
                      isSelected && styles.selectedText,
                    ]}>
                    {date.format('D')}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
};

export default Calendar;

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.sm,
  },
  monthText: {
    marginBottom: Spacing.md,
    textAlign: 'center',
    fontFamily: Fontconstants.BOLD,
    fontSize: 18,
    color: Colors.primary[600],
  },
  weekRow: {
    flexDirection: 'row',
  },
  cell: {
    flex: 1,
    padding: 3,
  },
  weekdayText: {
    textAlign: 'center',
    marginBottom: Spacing.sm,
    fontSize: 12,
    fontFamily: Fontconstants.BOLD,
    color: Colors.primary[600],
  },
  dateCard: {
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: Colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedCard: {
    backgroundColor: Colors.primary[600],
  },
  disabledCard: {
    backgroundColor: '#EEEEEE',
  },
  dateText: {
    fontSize: 16,
    fontFamily: Fontconstants.BOLD,
    color: Colors.primary[600],
  },
  disabledText: {
    color: '#AAAAAA',
  },
  selectedText: {
    color: '#FFFFFF',
  },
});