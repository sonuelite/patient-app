import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
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
import { Button } from '../../../../components/ui/Button';

export default function FamilyMembersScreen() {
  const navigation = useNavigation();

  const {
    currentPatientId,
    patients,
    setCurrentPatientId,
    showToast,
  } = useApp();

  const [showAdd, setShowAdd] = useState(false);

  const patient =
    patients.find(item => item.id === currentPatientId) ?? patients[0];

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

  if (!patient) {
    return (
      <View style={styles.container}>
        <ScreenHeader
          title="Family Members"
          showBack
          onBackPress={() => navigation.goBack()}
        />

        <EmptyState
          icon={<Users size={48} color={Colors.neutral[300]} />}
          title="Patient not found"
          message="Patient information is currently unavailable."
        />
      </View>
    );
  }

  const familyMembers = patient.familyMembers ?? [];

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
        showsVerticalScrollIndicator={false}>
        <Card style={styles.currentCard}>
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
                {patient.id} · Primary
              </Text>
            </View>

            <Badge label="Active" color="success" />
          </View>
        </Card>

        <Text style={styles.sectionTitle}>
          Family Members ({familyMembers.length})
        </Text>

        {familyMembers.length === 0 ? (
          <EmptyState
            icon={
              <Users
                size={48}
                color={Colors.neutral[300]}
              />
            }
            title="No family members"
            message="Add family members to manage their healthcare."
            action={{
              label: 'Add Member',
              onPress: () => setShowAdd(true),
            }}
          />
        ) : (
          familyMembers.map(familyMember => (
            <Card
              key={familyMember.id}
              style={styles.memberCard}>
              <View style={styles.memberRow}>
                <View style={styles.memberAvatar}>
                  <Text style={styles.memberInitial}>
                    {familyMember.name.charAt(0).toUpperCase()}
                  </Text>
                </View>

                <View style={styles.memberInfo}>
                  <Text style={styles.memberName}>
                    {familyMember.name}
                  </Text>

                  <Text style={styles.memberMeta}>
                    {familyMember.relation} ·{' '}
                    {familyMember.gender},{' '}
                    {familyMember.age}y ·{' '}
                    {familyMember.bloodGroup}
                  </Text>
                </View>

                <TouchableOpacity
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
                    Switch
                  </Text>
                </TouchableOpacity>
              </View>
            </Card>
          ))
        )}

        <Button
          label="Add Family Member"
          onPress={() => setShowAdd(true)}
          variant="outline"
          fullWidth
          size="lg"
          icon={
            <Plus
              size={20}
              color={Colors.primary[600]}
            />
          }
        />
      </ScrollView>

      <BottomSheet
        visible={showAdd}
        onClose={() => setShowAdd(false)}
        title="Add Family Member">
        <View style={styles.bottomSheetContent}>
          <Text style={styles.sheetLabel}>
            This is a demo feature. In a production app, you
            would fill in family member details here.
          </Text>

          <Button
            label="Got it"
            onPress={() => setShowAdd(false)}
            fullWidth
            size="lg"
          />
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
    paddingBottom: Spacing.xl,
    gap: Spacing.md,
  },
  sheetLabel: {
    fontSize: FontSize.base,
    lineHeight: 22,
    color: Colors.neutral[500],
  },
});