import React, {useMemo} from 'react';
import {
  ScrollView,
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
  onSelectDate: (date: string) => void;
};

const Calendar = ({selected, onSelectDate}: CalendarProps) => {
  const dates = useMemo(
    () =>
      Array.from({length: 7}, (_, index) =>
        moment().add(index, 'days').format('YYYY-MM-DD'),
      ),
    [],
  );

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        nestedScrollEnabled
        decelerationRate="fast"
        disableIntervalMomentum
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {dates.map(fullDate => {
          const isSelected = selected === fullDate;

          return (
            <TouchableOpacity
              key={fullDate}
              activeOpacity={0.7}
              onPress={() => onSelectDate(fullDate)}
              style={[
                styles.dateCard,
                isSelected && styles.selectedCard,
              ]}>
              <Text
                style={[
                  styles.dayText,
                  isSelected && styles.selectedText,
                ]}>
                {moment(fullDate).format('ddd')}
              </Text>

              <Text
                style={[
                  styles.dateText,
                  isSelected && styles.selectedText,
                ]}>
                {moment(fullDate).format('DD')}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default Calendar;

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.sm,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  dateCard: {
    width: 64,
    height: 72,
    borderRadius: Radius.md,
    backgroundColor: Colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedCard: {
    backgroundColor: Colors.primary[600],
  },
  dayText: {
    color: Colors.primary[600],
    fontSize: 12,
  },
  dateText: {
    color: Colors.primary[600],
    fontFamily: Fontconstants.BOLD,
    fontSize: 18,
    marginTop: 4,
  },
  selectedText: {
    color: '#FFFFFF',
  },
});