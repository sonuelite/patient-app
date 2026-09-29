import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChevronLeft, Search } from 'lucide-react-native';

import {
  Colors,
  Spacing,
  FontSize,
  FontWeight,
  Radius,
} from '../../../constants/theme';
import { DoctorCard } from '../../../components/ui/DataDisplay';
import { Chip } from '../../../components/input/Input';
import {setDoctors} from '../../../store/doctorsSlice';
import { getAllDoctors } from '../../../network/api';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { selectDoctors, selectEntityId } from '../../../store/selectors';
import { getErrorMessage } from '../../../utils/apiError';
import { mapPatientDoctor } from '../../../utils/doctor';
import type { RootStackParamList } from '../../../types';

type FindDoctorNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'FindDoctor'
>;

export default function FindDoctorScreen() {
  const insets = useSafeAreaInsets();

  const navigation = useNavigation<FindDoctorNavigationProp>();

  const dispatch = useAppDispatch();
  const doctors = useAppSelector(selectDoctors);
  const entityId = useAppSelector(selectEntityId);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);

  // useEffect(() => {
  //   const controller = new AbortController();
  //   dispatch(setDoctors([]));
  //   setSelectedDepartment(null);
  //   setError(null);
  //   if (entityId === null) {
  //     setLoading(false);
  //     setError('Please select a hospital to view doctors.');
  //     return () => controller.abort();
  //   }
  //   setLoading(true);
  //   getAllDoctors(entityId, controller.signal)
  //     .then(result => {
  //       if (!controller.signal.aborted) {
  //         dispatch(setDoctors(result.map(mapPatientDoctor)));
  //       }
  //     })
  //     .catch(cause => {
  //       if (!controller.signal.aborted) {
  //         setError(
  //           getErrorMessage(cause, 'Unable to load doctors. Please try again.'),
  //         );
  //       }
  //     })
  //     .finally(() => {
  //       if (!controller.signal.aborted) {
  //         setLoading(false);
  //       }
  //     });
  //   return () => controller.abort();
  // }, [entityId, retry, dispatch]);

  useEffect(() => {
  const controller = new AbortController();

  const loadDoctors = async () => {
    dispatch(setDoctors([]));
    setSelectedDepartment(null);
    setError(null);

    if (entityId === null) {
      setLoading(false);
      setError('Please select a hospital to view doctors.');
      return;
    }

    setLoading(true);

    try {
      const result = await getAllDoctors(entityId, controller.signal);
      console.log('Doctors fetched:', result);
      if (!controller.signal.aborted) {
        dispatch(setDoctors(result.map(mapPatientDoctor)));
      }
    } catch (cause) {
      if (!controller.signal.aborted) {
        setError(
          getErrorMessage(cause, 'Unable to load doctors. Please try again.'),
        );
      }
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  };

  loadDoctors();

  return () => controller.abort();
}, [entityId, retry, dispatch]);

  const departments = useMemo(
    () =>
      Array.from(
        new Set(doctors.map(doctor => doctor.specialty).filter(Boolean)),
      ),
    [doctors],
  );

  const [search, setSearch] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(
    null,
  );

  const filteredDoctors = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return doctors.filter(doctor => {
      const matchesSearch =
        !searchText ||
        doctor.name.toLowerCase().includes(searchText) ||
        doctor.specialty.toLowerCase().includes(searchText);

      if (!matchesSearch) {
        return false;
      }

      if (selectedDepartment && doctor.specialty !== selectedDepartment) {
        return false;
      }

      return true;
    });
  }, [doctors, search, selectedDepartment]);

  const handleDepartmentPress = (department: string) => {
    setSelectedDepartment(previousDepartment =>
      previousDepartment === department ? null : department,
    );
  };

  const handleDoctorPress = (doctorId: string) => {
    navigation.navigate('DoctorProfile', {
      doctorId,
    });
  };

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + Spacing.md,
          },
        ]}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <ChevronLeft size={24} color={Colors.neutral[900]} />
          </TouchableOpacity>

          <Text style={styles.title}>Find a Doctor</Text>
        </View>

        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Search size={18} color={Colors.neutral[400]} />

            <TextInput
              style={styles.searchInput}
              placeholder="Doctor name or specialty"
              placeholderTextColor={Colors.neutral[400]}
              value={search}
              onChangeText={setSearch}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
            />
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.departmentContent}
        >
          <Chip
            label="All"
            selected={!selectedDepartment}
            onPress={() => setSelectedDepartment(null)}
          />

          {departments.map(department => (
            <Chip
              key={department}
              label={department}
              selected={selectedDepartment === department}
              onPress={() => handleDepartmentPress(department)}
            />
          ))}
        </ScrollView>
      </View>

      <ScrollView
        style={styles.doctorList}
        contentContainerStyle={styles.doctorListContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.emptyContainer}>
            <ActivityIndicator size="large" color={Colors.primary[600]} />
            <Text style={styles.emptyMessage}>Loading doctors...</Text>
          </View>
        ) : error ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>Unable to load doctors</Text>
            <Text style={styles.emptyMessage}>{error}</Text>
            <TouchableOpacity
              style={styles.applyButton}
              onPress={() => setRetry(value => value + 1)}
            >
              <Text style={styles.applyButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={styles.resultCount}>
              {filteredDoctors.length} doctor(s) found
            </Text>

            {filteredDoctors.map(doctor => (
              <DoctorCard
                key={doctor.id}
                doctor={doctor}
                onPress={() => handleDoctorPress(doctor.id)}
              />
            ))}

            {filteredDoctors.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyTitle}>No doctors found</Text>

                <Text style={styles.emptyMessage}>
                  Try changing your search or filters.
                </Text>
              </View>
            ) : null}
          </>
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
