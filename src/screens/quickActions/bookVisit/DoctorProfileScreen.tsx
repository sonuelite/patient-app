import {useAppSelector} from '../../../store/hooks';
import {selectDoctors} from '../../../store/selectors';
import React, {useState} from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  RouteProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {
  Award,
  Calendar,
  ChevronLeft,
  Clock,
  MapPin,
  Star,
  Video,
} from 'lucide-react-native';

import {
  Colors,
  FontSize,
  FontWeight,
  Radius,
  Shadows,
  Spacing,
} from '../../../constants/theme';
import {Card, Badge} from '../../../components/ui/Card';
import {Avatar} from '../../../components/ui/DataDisplay';
import {Button} from '../../../components/ui/Button';
import {TIME_SLOTS} from '../../../data/mockData';
import type {RootStackParamList} from '../../../types';
import { ColorConstants } from '../../../constants/colorConstants';
import { Fontconstants } from '../../../constants/fontConstants';
import { scale } from '../../../utils/scale';
import CustomButton from '../../../components/customButton/CustomButton';

type DoctorProfileNavigationProp =
  NativeStackNavigationProp<
    RootStackParamList,
    'DoctorProfile'
  >;

type DoctorProfileRouteProp = RouteProp<
  RootStackParamList,
  'DoctorProfile'
>;

export default function DoctorProfileScreen() {
  const insets = useSafeAreaInsets();

  const navigation =
    useNavigation<DoctorProfileNavigationProp>();

  const route = useRoute<DoctorProfileRouteProp>();

  const {doctorId} = route.params;
  const doctors = useAppSelector(selectDoctors);
  console.log('doctors-->:', doctors);

  const [selectedSlot, setSelectedSlot] =
    useState<string | null>(null);

  const [selectedDay, setSelectedDay] =
    useState(0);

  const doctor =
    doctors.find(item => item.id === doctorId);

  const days = [
    'Today',
    'Tomorrow',
    'Wed',
    'Thu',
    'Fri',
  ];

  const handleBookAppointment = () => {
    if (!doctor) {
      return;
    }

    navigation.navigate('BookAppointment', {
      doctorId: doctor.id,
    });
  };

  const handleVideoConsultation = () => {
    if (!doctor) {
      return;
    }

    navigation.navigate('BookAppointment', {
      doctorId: doctor.id,
      consultationType: 'video',
    });
  };

  if (!doctor) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>
          Doctor not found
        </Text>

        <TouchableOpacity
          style={styles.goBackButton}
          onPress={() => navigation.goBack()}>
          <Text style={styles.goBackButtonText}>
            Go Back
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.scrollContent
        }>
        <View
          style={[
            styles.header,
            {
              paddingTop:
                insets.top + Spacing.md,
            },
          ]}>
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <ChevronLeft
              size={24}
              color={Colors.neutral[0]}
            />
          </TouchableOpacity>

          <View style={styles.profileSection}>
            <Avatar
              uri={doctor.photo}
              size={80}
              name={doctor.name}
            />

            <Text style={styles.doctorName}>
              {doctor.name}
            </Text>

            <Text style={styles.doctorQualification}>
              {doctor.qualification}
            </Text>

            <View style={styles.ratingRow}>
              <Star
                size={16}
                color={Colors.warning[500]}
                fill={Colors.warning[500]}
              />

              <Text style={styles.ratingText}>
                {doctor.rating ?? 'Not rated'}
              </Text>

              <Text style={styles.dot}>·</Text>

              <Text style={styles.experienceText}>
                {doctor.experience === null ? 'Experience unavailable' : `${doctor.experience} years exp`}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.body}>
          <View style={styles.infoCards}>
            <View style={styles.infoCard}>
              <Award
                size={18}
                color={Colors.primary[600]}
              />

              <Text style={styles.infoLabel}>
                Specialty
              </Text>

              <Text style={styles.infoValue}>
                {doctor.specialty}
              </Text>
            </View>

            <View style={styles.infoCard}>
              <Clock
                size={18}
                color={Colors.success[600]}
              />

              <Text style={styles.infoLabel}>
                Fee
              </Text>

              <Text style={styles.infoValue}>
                {doctor.consultationFee === null ? 'Fee unavailable' : `₹${doctor.consultationFee}`}
              </Text>
            </View>

            <View style={styles.infoCard}>
              <MapPin
                size={18}
                color={Colors.accent[600]}
              />

              <Text style={styles.infoLabel}>
                Hospital
              </Text>

              <Text
                style={styles.infoValue}
                numberOfLines={1}>
                {doctor.hospital}
              </Text>
            </View>
          </View>

          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>
              About
            </Text>

            <Text style={styles.aboutText}>
              {doctor.about}
            </Text>
          </Card>

          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>
              Languages
            </Text>

            <View style={styles.languageRow}>
              {doctor.languages.map(language => (
                <Badge
                  key={language}
                  label={language}
                  color="info"
                />
              ))}
            </View>
          </Card>

          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>
              Available Days
            </Text>

            <View style={styles.daysRow}>
              {doctor.availableDays.map(day => (
                <View
                  key={day}
                  style={styles.dayPill}>
                  <Text style={styles.dayText}>
                    {day}
                  </Text>
                </View>
              ))}
            </View>
          </Card>

          {/* <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>
              Book a Slot
            </Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={
                false
              }
              contentContainerStyle={
                styles.daysContent
              }>
              {days.map((day, index) => (
                <TouchableOpacity
                  key={day}
                  activeOpacity={0.7}
                  onPress={() =>
                    setSelectedDay(index)
                  }
                  style={[
                    styles.daySelect,
                    selectedDay === index &&
                      styles.daySelectActive,
                  ]}>
                  <Text
                    style={[
                      styles.daySelectText,
                      selectedDay === index &&
                        styles.daySelectTextActive,
                    ]}>
                    {day}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.slotsGrid}>
              {TIME_SLOTS.slice(0, 8).map(slot => (
                <TouchableOpacity
                  key={slot}
                  activeOpacity={0.7}
                  onPress={() =>
                    setSelectedSlot(slot)
                  }
                  style={[
                    styles.slot,
                    selectedSlot === slot &&
                      styles.slotSelected,
                  ]}>
                  <Text
                    style={[
                      styles.slotText,
                      selectedSlot === slot &&
                        styles.slotTextSelected,
                    ]}>
                    {slot}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card> */}

          {doctor.reviews.length > 0 ? (
            <Card style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>
                Reviews
              </Text>

              {doctor.reviews.map(review => (
                <View
                  key={review.id}
                  style={styles.reviewItem}>
                  <View style={styles.reviewHeader}>
                    <Text style={styles.reviewName}>
                      {review.patientName}
                    </Text>

                    <View style={styles.reviewStars}>
                      <Star
                        size={12}
                        color={Colors.warning[500]}
                        fill={Colors.warning[500]}
                      />

                      <Text
                        style={styles.reviewRating}>
                        {review.rating}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.reviewText}>
                    {review.comment}
                  </Text>

                  <Text style={styles.reviewDate}>
                    {review.date}
                  </Text>
                </View>
              ))}
            </Card>
          ) : null}
        </View>
      </ScrollView>

      <View
        style={[
          styles.bottomBar,
          {
            paddingBottom:
              insets.bottom + Spacing.sm,
          },
        ]}>
        {/* <Button
          label="Book Appointment"
          onPress={handleBookAppointment}
          fullWidth
          size="lg"
          icon={
            <Calendar
              size={20}
              color={Colors.neutral[0]}
            />
          }
        /> */}
        <CustomButton
          title="Book Appointment"
          onPress={handleBookAppointment}
          disable={false}
        //   topHeight={30}
          bgColor={ColorConstants.BTNCOLOR}
          fontsize={14}
          fontfamily={Fontconstants.SEMIBOLD}
          bordRadius={scale(12)}
          leftIcon={
            <Calendar
              size={20}
              color={Colors.neutral[0]}
              style={styles.bookAppointmentIcon}
            />
          }
        />

        {/* <TouchableOpacity
          activeOpacity={0.7}
          style={styles.consultButton}
          onPress={handleVideoConsultation}>
          <Video
            size={20}
            color={Colors.primary[600]}
          />
        </TouchableOpacity> */}
      </View>
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
    paddingBottom: 100,
  },
  header: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.xl,
    backgroundColor: Colors.primary[700],
    borderBottomLeftRadius: Radius.xl,
    borderBottomRightRadius: Radius.xl,
  },
  backButton: {
    padding: Spacing.xs,
    marginBottom: Spacing.md,
  },
  profileSection: {
    alignItems: 'center',
  },
  doctorName: {
    marginTop: Spacing.md,
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.bold,
    color: Colors.neutral[0],
  },
  doctorQualification: {
    marginTop: Spacing.xs,
    fontSize: FontSize.base,
    color: Colors.primary[200],
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.sm,
  },
  ratingText: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: Colors.neutral[0],
  },
  dot: {
    fontSize: FontSize.base,
    color: Colors.primary[300],
  },
  experienceText: {
    fontSize: FontSize.base,
    color: Colors.primary[200],
  },
  body: {
    padding: Spacing.base,
    paddingTop: Spacing.lg,
  },
  infoCards: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  infoCard: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.xs,
    padding: Spacing.md,
    backgroundColor: Colors.neutral[0],
    borderRadius: Radius.lg,
    ...Shadows.sm,
  },
  infoLabel: {
    fontSize: FontSize.xs,
    color: Colors.neutral[400],
  },
  infoValue: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.neutral[900],
    textAlign: 'center',
  },
  sectionCard: {
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.neutral[900],
  },
  aboutText: {
    fontSize: FontSize.base,
    lineHeight: 24,
    color: Colors.neutral[600],
  },
  languageRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  daysRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  dayPill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.success[50],
    borderRadius: Radius.pill,
  },
  dayText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.success[700],
  },
  daysContent: {
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  daySelect: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    backgroundColor: Colors.neutral[50],
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.neutral[200],
  },
  daySelectActive: {
    backgroundColor: Colors.primary[50],
    borderColor: Colors.primary[500],
  },
  daySelectText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.neutral[600],
  },
  daySelectTextActive: {
    fontWeight: FontWeight.semibold,
    color: Colors.primary[700],
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  slot: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    backgroundColor: Colors.neutral[50],
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.neutral[200],
  },
  slotSelected: {
    backgroundColor: Colors.primary[600],
    borderColor: Colors.primary[600],
  },
  slotText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.neutral[700],
  },
  slotTextSelected: {
    fontWeight: FontWeight.semibold,
    color: Colors.neutral[0],
  },
  reviewItem: {
    paddingBottom: Spacing.md,
    marginBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reviewName: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: Colors.neutral[900],
  },
  reviewStars: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  reviewRating: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.neutral[600],
  },
  reviewText: {
    marginTop: Spacing.xs,
    fontSize: FontSize.sm,
    lineHeight: 20,
    color: Colors.neutral[600],
  },
  reviewDate: {
    marginTop: Spacing.xs,
    fontSize: FontSize.xs,
    color: Colors.neutral[400],
  },
  bottomBar: {
    // flexDirection: 'row',
    // alignItems: 'center',
    // gap: Spacing.sm,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.md,
    backgroundColor: Colors.neutral[0],
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[100],
    // backgroundColor: 'red',
  },
  consultButton: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary[50],
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.primary[200],
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.base,
    backgroundColor: Colors.neutral[50],
  },
  emptyTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.neutral[900],
  },
  goBackButton: {
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.primary[600],
    borderRadius: Radius.md,
  },
  goBackButtonText: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: Colors.neutral[0],
  },
    bookAppointmentIcon: {
    marginRight: Spacing.sm,
  },
});