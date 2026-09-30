import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import Toast from 'react-native-toast-message';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {Plus, Users, Repeat} from 'lucide-react-native';

import {
  Colors,
  Spacing,
  FontSize,
  FontWeight,
  Radius,
} from '../../../../constants/theme';
import {Card, Badge, EmptyState} from '../../../../components/ui/Card';
import { Avatar } from '../../../../components/ui/DataDisplay';
import { ScreenHeader } from '../../../../components/screenHeader/ScreenHeader';
import { BottomSheet } from '../../../../components/ui/Feedback';
import { useApp } from '../../../../context/AppContext';
import {Chip, Input} from '../../../../components/input/Input';
import CustomButton from '../../../../components/customButton/CustomButton';
import {ColorConstants} from '../../../../constants/colorConstants';
import {Fontconstants} from '../../../../constants/fontConstants';
import {scale} from '../../../../utils/scale';
import {showToast as showFormToast} from '../../../../utils/toast';
import {addFamilyMember, getAllRelatedPatients, getPatientDetails} from '../../../../network/api';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../../../../types';
import type {RelatedPatient} from '../../../../network/api';
import {getErrorMessage} from '../../../../utils/apiError';
import {useAppSelector} from '../../../../store/hooks';
import {selectAccessToken, selectEntityId, selectPatientId} from '../../../../store/selectors';
import axios from 'axios';

interface FamilyMemberForm {
  firstName: string;
  lastName: string;
  dob: string;
  gender: 'Male' | 'Female' | 'Other';
  relation: string;
}

const initialForm: FamilyMemberForm = {
  firstName: '', lastName: '', dob: '', gender: 'Male', relation: '',
};

export default function FamilyMembersScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [loadingPatient, setLoadingPatient] = useState(false);
  const patientRequest = useRef<AbortController | null>(null);
  const insets = useSafeAreaInsets();
  const parentPatientId = useAppSelector(selectPatientId);
  const entityId = useAppSelector(selectEntityId);
  const accessToken = useAppSelector(selectAccessToken);
  useEffect(() => () => { patientRequest.current?.abort(); }, [parentPatientId, accessToken]);
  const [saving, setSaving] = useState(false);
  const submissionPending = useRef(false);

  const {
    currentPatientId,
    setCurrentPatientId,
    showToast,
  } = useApp();

  const [relatedPatients, setRelatedPatients] = useState<RelatedPatient[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const listRequest = useRef<AbortController | null>(null);

  const loadMembers = useCallback(async () => {
    listRequest.current?.abort();
    const controller = new AbortController();
    listRequest.current = controller;
    if (parentPatientId === null || !accessToken) {
      setRelatedPatients([]);
      setLoadError('Please sign in again to view family members');
      setLoadingMembers(false);
      return;
    }
    setLoadingMembers(true);
    setLoadError(null);
    try {
      const records = await getAllRelatedPatients(parentPatientId, controller.signal);
      if (!controller.signal.aborted) { setRelatedPatients(records); }
    } catch (error: unknown) {
      if (!controller.signal.aborted) {
        setLoadError(getErrorMessage(error, 'Unable to load family members'));
      }
    } finally {
      if (!controller.signal.aborted) { setLoadingMembers(false); }
    }
  }, [parentPatientId, accessToken]);

  useFocusEffect(useCallback(() => {
    setRelatedPatients([]);
    loadMembers();
    return () => { listRequest.current?.abort(); };
  }, [loadMembers]));

  const [showAdd, setShowAdd] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  useEffect(() => {
    if (!showAdd && successMessage) {
      showFormToast(successMessage, 'success');
      setSuccessMessage(null);
    }
  }, [showAdd, successMessage]);
  const [form, setForm] = useState<FamilyMemberForm>(initialForm);

  const update = <K extends keyof FamilyMemberForm>(
    key: K,
    value: FamilyMemberForm[K],
  ) => setForm(prev => ({...prev, [key]: value}));

  // const handleContinue = async () => {
  //   if (submissionPending.current) { return; }
  //   if (
  //     !form.firstName.trim() ||
  //     !form.lastName.trim() ||
  //     !form.dob.trim() ||
  //     !form.relation.trim()
  //   ) {
  //     showFormToast('Please fill all required fields', 'error');
  //     return;
  //   }

  //   const dob = form.dob.trim();
  //   const birthDate = new Date(`${dob}T00:00:00`);
  //   const [year, month, day] = dob.split('-').map(Number);
  //   if (
  //     !/^\d{4}-\d{2}-\d{2}$/.test(dob) ||
  //     Number.isNaN(birthDate.getTime()) ||
  //     birthDate.getFullYear() !== year ||
  //     birthDate.getMonth() !== month - 1 ||
  //     birthDate.getDate() !== day ||
  //     birthDate > new Date()
  //   ) {
  //     showFormToast('Please enter a valid date of birth (YYYY-MM-DD)', 'error');
  //     return;
  //   }

  //   if (parentPatientId === null || !accessToken) {
  //     showFormToast('Please sign in again to add a family member', 'error');
  //     return;
  //   }
  //   if (entityId === null) {
  //     showFormToast('Please select an entity before adding a family member', 'error');
  //     return;
  //   }

  //   submissionPending.current = true;
  //   setSaving(true);
  //   Keyboard.dismiss();
  //   try {
  //     const response = await addFamilyMember({
  //       parentPatientId,
  //       firstName: form.firstName,
  //       lastName: form.lastName,
  //       dob,
  //       gender: form.gender,
  //       relationOf: form.relation,
  //     });
  //     console.log('Family member added successfully:', response);
  //     setForm(initialForm);
  //     setShowAdd(false);
  //     setSuccessMessage(response.message || 'Family member added successfully');
  //     await loadMembers();
  //   } catch (error: unknown) {
  //     showFormToast(getErrorMessage(error, 'Unable to add family member'), 'error');
  //   } finally {
  //     submissionPending.current = false;
  //     setSaving(false);
  //   }
  // };

  const records = relatedPatients.map(item => ({
    id: String(item.patient_id),
    name: `${item.first_name} ${item.last_name}`.trim(),
    photo: item.photo ?? undefined,
    uhid: item.uhid,
    relation: item.relation_of,
    gender: item.gender,
    status: item.status,
  }));
  const isSelf = (relation: string) => relation.trim().toLowerCase() === 'self';
  const patient = records.find(item => isSelf(item.relation));
  const familyMembers = records.filter(item => !isSelf(item.relation));

  const handleSwitchProfile = (familyMember: {
    id: string;
    name: string;
  }) => {
    setCurrentPatientId(familyMember.id);

    showToast(
      `Switched to ${familyMember.name}'s profile`,
      'info',
    );
  };

  const addPatientHandler = async () => {
    console.log('Add Patient button pressed');
    if (patientRequest.current && !patientRequest.current.signal.aborted) { return; }
    if (parentPatientId === null || !accessToken) {
      showFormToast('Please sign in again to add a patient', 'error');
      return;
    }
    const controller = new AbortController();
    patientRequest.current = controller;
    setLoadingPatient(true);
    try {
      const patientDetails = await getPatientDetails(parentPatientId, controller.signal);
      console.log('Patient details fetched successfully:', patientDetails);
      if (!controller.signal.aborted) {
        navigation.navigate('AddPatient', {patientDetails});
      }
    } catch (error: unknown) {
  if (axios.isAxiosError(error)) {
    console.log('Patient details request ID:', parentPatientId);
    console.log('Patient details status:', error.response?.status);
    console.log('Patient details error body:', error.response?.data);
  } else {
    console.log('Error fetching patient details:', error);
  }

  if (!controller.signal.aborted) {
    showFormToast(
      getErrorMessage(error, 'Unable to load patient details'),
      'error',
    );
  }
} finally {
      if (patientRequest.current === controller) {
        patientRequest.current = null;
        setLoadingPatient(false);
      }
    }
  };
  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Family Members"
        showBack
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={loadingMembers} onRefresh={loadMembers} />
        }
        showsVerticalScrollIndicator={false}>
        {loadingMembers && records.length === 0 && (
          <ActivityIndicator size="large" color={Colors.primary[600]} />
        )}
        {loadError && (
          <EmptyState
            icon={<Users size={48} color={Colors.neutral[300]} />}
            title="Unable to load family members"
            message={loadError}
            action={{label: 'Retry', onPress: loadMembers}}
          />
        )}
        {patient && <Card style={styles.currentCard}>
          <View style={styles.currentRow}>
            <Avatar
              uri={patient.photo}
              size={48}
              name={patient.name}
            />

            <View style={styles.currentInfo}>
              <Text style={styles.currentName}>
                {patient.name}
              </Text>

              <Text style={styles.currentId}>
                {patient.uhid} · Primary
              </Text>
            </View>

            <Badge label={patient.status} color={patient.status.toLowerCase() === 'active' ? 'success' : 'neutral'} />
          </View>
        </Card>}

        <Text style={styles.sectionTitle}>
          Family Members ({familyMembers.length})
        </Text>

        {familyMembers.length === 0 ? 
        // (!loadingMembers && !loadError && (
        //   <EmptyState
        //     icon={
        //       <Users
        //         size={48}
        //         color={Colors.neutral[300]}
        //       />
        //     }
        //     title="No family members"
        //     message="Add family members to manage their healthcare."
        //     action={{
        //       label: 'Add Member',
        //       onPress: () => setShowAdd(true),
        //     }}
        //   />
        // ))
        null
         : (
          familyMembers.map(familyMember => (
            <Card
              key={familyMember.id}
              style={styles.memberCard}>
              <View style={styles.memberRow}>
                <Avatar uri={familyMember.photo} name={familyMember.name} size={44} />

                <View style={styles.memberInfo}>
                  <Text style={styles.memberName}>
                    {familyMember.name}
                  </Text>

                  <Text style={styles.memberMeta}>
                    {familyMember.relation} ·{' '}
                    {familyMember.gender} · {familyMember.uhid}
                  </Text>
                </View>

                {/* <TouchableOpacity
                  activeOpacity={0.7}
                  style={styles.switchButton}
                  onPress={() =>
                    handleSwitchProfile(familyMember)
                  }>
                  <Repeat
                    size={16}
                    color={Colors.primary[600]}
                  />

                  <Text style={styles.switchText}>
                    {currentPatientId === familyMember.id ? 'Selected' : 'Switch'}
                  </Text>
                </TouchableOpacity> */}
              </View>
            </Card>
          ))
        )}

        {/* <CustomButton
          title="Add Family Member"
          onPress={() => setShowAdd(true)}
          disable={saving}
          topHeight={30}
          bgColor={ColorConstants.BTNCOLOR}
          fontsize={14}
          fontfamily={Fontconstants.SEMIBOLD}
          bordRadius={scale(12)}
          leftIcon={
            <Plus
              size={20}
              color={ColorConstants.WHITE}
              style={styles.addMemberIcon}
            />
          }
        /> */}
        <CustomButton
          title={loadingPatient ? 'Loading patient...' : 'Add Patient'}
          onPress={addPatientHandler}
          disable={saving || loadingPatient}
          topHeight={30}
          bgColor={ColorConstants.BTNCOLOR}
          fontsize={14}
          fontfamily={Fontconstants.SEMIBOLD}
          bordRadius={scale(12)}
          leftIcon={
            <Plus
              size={20}
              color={ColorConstants.WHITE}
              style={styles.addMemberIcon}
            />
          }
        />
      </ScrollView>

      {/* <BottomSheet
        visible={showAdd}
        dismissible={!saving}
        onClose={() => {
          if (!submissionPending.current) { setShowAdd(false); }
        }}
        height="80%"
        title="Add Family Member">
        <KeyboardAvoidingView
          style={styles.keyboardAvoidingView}
          pointerEvents={saving ? 'none' : 'auto'}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <ScrollView
            contentContainerStyle={[
              styles.bottomSheetContent,
              {paddingBottom: Spacing.xxxl + insets.bottom},
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <Text style={styles.stepTitle}>Basic Details</Text>
            <Input
              label="First Name *"
              value={form.firstName}
              onChangeText={value => update('firstName', value)}
              placeholder="Enter first name"
            />
            <Input
              label="Last Name *"
              value={form.lastName}
              onChangeText={value => update('lastName', value)}
              placeholder="Enter last name"
            />
            <Input
              label="Date of Birth *"
              value={form.dob}
              onChangeText={value => update('dob', value)}
              placeholder="YYYY-MM-DD"
            />
            <Text style={styles.label}>Gender</Text>
            <View style={styles.chipRow}>
              {(['Male', 'Female', 'Other'] as const).map(gender => (
                <Chip
                  key={gender}
                  label={gender}
                  selected={form.gender === gender}
                  onPress={() => update('gender', gender)}
                />
              ))}
            </View>
            <Input
              label="Relation *"
              value={form.relation}
              onChangeText={value => update('relation', value)}
              placeholder="e.g. Father, Mother, Spouse"
            />
            <CustomButton
              title={saving ? 'Adding...' : 'Add Family Member'}
              disable={saving}
              topHeight={30}
              bgColor={ColorConstants.BTNCOLOR}
              fontsize={14}
              fontfamily={Fontconstants.SEMIBOLD}
              bordRadius={scale(12)}
              onPress={handleContinue}
            />
          </ScrollView>
        </KeyboardAvoidingView>
        {showAdd && <Toast />}
      </BottomSheet> */}
    </View>
  );
}

const styles = StyleSheet.create({
  addMemberIcon: {
    marginRight: Spacing.sm,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.base,
    paddingBottom: 100,
  },
  currentCard: {
    marginBottom: Spacing.lg,
  },
  currentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  currentInfo: {
    flex: 1,
  },
  currentName: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.neutral[900],
  },
  currentId: {
    marginTop: 2,
    fontSize: FontSize.sm,
    color: Colors.neutral[400],
  },
  sectionTitle: {
    marginBottom: Spacing.md,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.neutral[900],
  },
  memberCard: {
    marginBottom: Spacing.sm,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  memberAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberInitial: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.primary[700],
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: Colors.neutral[900],
  },
  memberMeta: {
    marginTop: 2,
    fontSize: FontSize.sm,
    color: Colors.neutral[400],
  },
  switchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    backgroundColor: Colors.primary[50],
  },
  switchText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.primary[700],
  },
  bottomSheetContent: {
    paddingTop: Spacing.md,
    paddingHorizontal: Math.max(0, scale(24) - Spacing.base),
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  stepTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.neutral[900],
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.neutral[700],
    marginBottom: Spacing.sm,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: Spacing.md,
  },
});
