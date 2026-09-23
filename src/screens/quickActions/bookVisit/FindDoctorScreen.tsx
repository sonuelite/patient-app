import React, {useMemo, useState} from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {
  ChevronLeft,
  Search,
  SlidersHorizontal,
} from 'lucide-react-native';

import {
  Colors,
  Spacing,
  FontSize,
  FontWeight,
  Radius,
} from '../../../constants/theme';
import {DoctorCard} from '../../../components/ui/DataDisplay';
import {Chip} from '../../../components/input/Input';
import {BottomSheet} from '../../../components/ui/Feedback';
import {useApp} from '../../../context/AppContext';
import {DEPARTMENTS} from '../../../data/mockData';
import type {RootStackParamList} from '../../../types';

type FindDoctorNavigationProp =
  NativeStackNavigationProp<
    RootStackParamList,
    'FindDoctor'
  >;

export default function FindDoctorScreen() {
  const insets = useSafeAreaInsets();

  const navigation =
    useNavigation<FindDoctorNavigationProp>();

  const {doctors} = useApp();

  const [search, setSearch] = useState('');
  const [selectedDepartment, setSelectedDepartment] =
    useState<string | null>(null);

  const [showFilters, setShowFilters] =
    useState(false);

  const [filterOnline, setFilterOnline] =
    useState(false);

  const [filterToday, setFilterToday] =
    useState(false);

  const [minRating, setMinRating] =
    useState(0);

  const filteredDoctors = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return doctors.filter(doctor => {
      if (!doctor.active) {
        return false;
      }

      const matchesSearch =
        !searchText ||
        doctor.name
          .toLowerCase()
          .includes(searchText) ||
        doctor.specialty
          .toLowerCase()
          .includes(searchText);

      if (!matchesSearch) {
        return false;
      }

      if (
        selectedDepartment &&
        doctor.specialty !== selectedDepartment
      ) {
        return false;
      }

      if (
        minRating > 0 &&
        doctor.rating < minRating
      ) {
        return false;
      }

      /*
       * Add these filters after confirming the exact
       * property names in your Doctor type:
       *
       * if (filterOnline && !doctor.onlineAvailable) {
       *   return false;
       * }
       *
       * if (filterToday && !doctor.availableToday) {
       *   return false;
       * }
       */

      return true;
    });
  }, [
    doctors,
    search,
    selectedDepartment,
    minRating,
    filterOnline,
    filterToday,
  ]);

  const handleDepartmentPress = (
    department: string,
  ) => {
    setSelectedDepartment(previousDepartment =>
      previousDepartment === department
        ? null
        : department,
    );
  };

  const handleDoctorPress = (
    doctorId: string,
  ) => {
    navigation.navigate('DoctorProfile', {
      doctorId,
    });
  };

  const handleApplyFilters = () => {
    setShowFilters(false);
  };

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.header,
          {
            paddingTop:
              insets.top + Spacing.md,
          },
        ]}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <ChevronLeft
              size={24}
              color={Colors.neutral[900]}
            />
          </TouchableOpacity>

          <Text style={styles.title}>
            Find a Doctor
          </Text>
        </View>

        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Search
              size={18}
              color={Colors.neutral[400]}
            />

            <TextInput
              style={styles.searchInput}
              placeholder="Doctor name or specialty"
              placeholderTextColor={
                Colors.neutral[400]
              }
              value={search}
              onChangeText={setSearch}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
            />
          </View>

          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.filterButton}
            onPress={() => setShowFilters(true)}>
            <SlidersHorizontal
              size={20}
              color={Colors.primary[600]}
            />
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={
            styles.departmentContent
          }>
          <Chip
            label="All"
            selected={!selectedDepartment}
            onPress={() =>
              setSelectedDepartment(null)
            }
          />

          {DEPARTMENTS.map(department => (
            <Chip
              key={department}
              label={department}
              selected={
                selectedDepartment === department
              }
              onPress={() =>
                handleDepartmentPress(department)
              }
            />
          ))}
        </ScrollView>
      </View>

      <ScrollView
        style={styles.doctorList}
        contentContainerStyle={
          styles.doctorListContent
        }
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <Text style={styles.resultCount}>
          {filteredDoctors.length} doctor(s) found
        </Text>

        {filteredDoctors.map(doctor => (
          <DoctorCard
            key={doctor.id}
            doctor={doctor}
            onPress={() =>
              handleDoctorPress(doctor.id)
            }
          />
        ))}

        {filteredDoctors.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>
              No doctors found
            </Text>

            <Text style={styles.emptyMessage}>
              Try changing your search or filters.
            </Text>
          </View>
        ) : null}
      </ScrollView>

      <BottomSheet
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        title="Filters">
        <View style={styles.filterContent}>
          <Text style={styles.filterLabel}>
            Consultation Type
          </Text>

          <View style={styles.filterChips}>
            <Chip
              label="Available Today"
              selected={filterToday}
              onPress={() =>
                setFilterToday(previous => !previous)
              }
            />

            <Chip
              label="Online Consultation"
              selected={filterOnline}
              onPress={() =>
                setFilterOnline(previous => !previous)
              }
            />
          </View>

          <Text style={styles.filterLabel}>
            Minimum Rating
          </Text>

          <View style={styles.filterChips}>
            {[0, 3, 4, 4.5].map(rating => (
              <Chip
                key={rating}
                label={
                  rating === 0
                    ? 'Any'
                    : `${rating}+`
                }
                selected={minRating === rating}
                onPress={() =>
                  setMinRating(rating)
                }
              />
            ))}
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.applyButton}
            onPress={handleApplyFilters}>
            <Text style={styles.applyButtonText}>
              Apply Filters
            </Text>
          </TouchableOpacity>
        </View>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
  },
  header: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.neutral[0],
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  backButton: {
    padding: Spacing.xs,
    marginRight: Spacing.sm,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.neutral[900],
  },
  searchRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  searchBox: {
    flex: 1,
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.neutral[50],
    borderRadius: Radius.md,
  },
  searchInput: {
    flex: 1,
    marginLeft: Spacing.sm,
    paddingVertical: 0,
    fontSize: FontSize.base,
    color: Colors.neutral[900],
  },
  filterButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary[50],
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.primary[200],
  },
  departmentContent: {
    paddingBottom: Spacing.sm,
  },
  doctorList: {
    flex: 1,
  },
  doctorListContent: {
    padding: Spacing.base,
    paddingBottom: 100,
  },
  resultCount: {
    marginBottom: Spacing.md,
    fontSize: FontSize.sm,
    color: Colors.neutral[400],
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  emptyTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.neutral[800],
  },
  emptyMessage: {
    marginTop: Spacing.xs,
    fontSize: FontSize.sm,
    color: Colors.neutral[400],
  },
  filterContent: {
    paddingBottom: Spacing.xl,
  },
  filterLabel: {
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: Colors.neutral[700],
  },
  filterChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  applyButton: {
    alignItems: 'center',
    marginTop: Spacing.xl,
    paddingVertical: Spacing.md + 2,
    backgroundColor: Colors.primary[600],
    borderRadius: Radius.md,
  },
  applyButtonText: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: Colors.neutral[0],
  },
});