import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useState } from 'react';
import {
  Colors,
  FontSize,
  FontWeight,
  Radius,
  Shadows,
  Spacing,
} from '../../../../constants/theme';
import { Card } from '../../../../components/ui/Card';
import CustomDropdown from '../../../../components/customDropdown/CustomDropdown';
import { Chip, Input } from '../../../../components/input/Input';
import { ScreenHeader } from '../../../../components/screenHeader/ScreenHeader';
import { PatientStateOption } from '../../../../utils/patientStateOptions';
import { PatientCityOption } from '../../../../utils/patientCityOptions';
import { Button } from '../../../../components/ui/Button';
import { useApp } from '../../../../context/AppContext';
import { pick, types, isCancel } from '@react-native-documents/picker';
import {
  UserPlus,
  ScanLine,
  CheckCircle,
  Shield,
  FileUp,
  FileText,
} from 'lucide-react-native';
import { ColorConstants } from '../../../../constants/colorConstants';
import { Fontconstants } from '../../../../constants/fontConstants';
import { scale } from '../../../../utils/scale';
import CustomButton from '../../../../components/customButton/CustomButton';
const GENDERS = ['Male', 'Female', 'Other'] as const;
const TITLE_OPTIONS = ['Mr', 'Ms', 'Mrs'];
const PANEL_OPTIONS = ['Yes', 'No'];
const PATIENT_TYPE_OPTIONS = ['Self', 'Family Member'];

interface Country {
  country_code?: string;
  countryss_id?: number | string;
  countryss_name?: string;
  phone_code?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  filter_status?: string;
}

const AddPatient = () => {
  const [title, setTitle] = useState('Mr');
  const [patientType, setPatientType] = useState('Self');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [mobile, setMobile] = useState('');
  const [address, setAddress] = useState('');
  const [country, setCountry] = useState('');
  const [countries, setCountries] = useState<Country[]>([]);
  const [countryLoading, setCountryLoading] = useState(false);
  const [countryId, setCountryId] = useState('');
  const [state, setState] = useState('');
  const [stateId, setStateId] = useState('');
  const [states, setStates] = useState<PatientStateOption[]>([]);
  const [stateLoading, setStateLoading] = useState(false);
  const [stateError, setStateError] = useState('');
  const [stateRetry, setStateRetry] = useState(0);
  const [city, setCity] = useState('');
  const [cityId, setCityId] = useState('');
  const [cities, setCities] = useState<PatientCityOption[]>([]);
  const [cityLoading, setCityLoading] = useState(false);
  const [cityError, setCityError] = useState('');
  const [cityRetry, setCityRetry] = useState(0);
  const [area, setArea] = useState('');
  const [pincode, setPincode] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [panelVal, setPanelVal] = useState('');
  const [saving, setSaving] = useState(false);
  const [selectedPdf, setSelectedPdf] = useState<{
    uri: string;
    name: string | null;
    type: string | null;
    size: number | null;
  } | null>(null);
  const [selectedConsentPdf, setSelectedConsentPdf] = useState<{
    uri: string;
    name: string | null;
    type: string | null;
    size: number | null;
  } | null>(null);
  const { showToast } = useApp();

  const countryOptions = countries
    .map(item => item.countryss_name)
    .filter((name): name is string => Boolean(name));

  const handlePdfUpload = async () => {
    try {
      const [file] = await pick({
        type: [types.pdf],
        allowMultiSelection: false,
      });

      console.log('Selected PDF:', file);

      setSelectedPdf({
        uri: file.uri,
        name: file.name,
        type: file.type,
        size: file.size,
      });

      showToast('PDF selected successfully', 'success');
    } catch (error) {
      if (isCancel(error)) {
        console.log('PDF selection cancelled');
        return;
      }

      console.log('PDF Picker Error:', error);
      showToast('Failed to select PDF', 'error');
    }
  };

  const handleConsentUpload = async () => {
    try {
      const [file] = await pick({
        type: [types.pdf],
        allowMultiSelection: false,
      });

      console.log('Selected Consent PDF:', file);

      setSelectedConsentPdf({
        uri: file.uri,
        name: file.name,
        type: file.type,
        size: file.size,
      });

      showToast('Consent PDF selected successfully', 'success');
    } catch (error) {
      if (isCancel(error)) {
        console.log('Consent PDF selection cancelled');
        return;
      }

      console.log('Consent PDF Picker Error:', error);
      showToast('Failed to select consent PDF', 'error');
    }
  };
  const addPatientHandler = () => {
    console.log('Add Patient button pressed');
  }
  return (
    <View style={styles.container}>
      <ScreenHeader title="Add Patient" showBack />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Patient Type */}
        <Text style={styles.sectionTitle}>Patient Type</Text>
        <Card style={styles.formCard}>
          <CustomDropdown
            label="Title *"
            value={patientType}
            options={PATIENT_TYPE_OPTIONS}
            placeholder="Select title"
            onSelect={setPatientType}
          />
        </Card>
        {/* Personal Information */}

        <Text style={styles.sectionTitle}>Personal Information</Text>

        <Card style={styles.formCard}>
          <CustomDropdown
            label="Title *"
            value={title}
            options={TITLE_OPTIONS}
            placeholder="Select title"
            onSelect={setTitle}
          />

          <Input
            label="First Name *"
            value={firstName}
            onChangeText={setFirstName}
            placeholder="Enter first name"
          />

          <Input
            label="Last Name *"
            value={lastName}
            onChangeText={setLastName}
            placeholder="Enter last name"
          />

          <Input
            label="Date of Birth (YYYY-MM-DD) *"
            value={dob}
            onChangeText={setDob}
            placeholder="e.g. 1990-05-12"
          />

          <Text style={styles.fieldLabel}>Gender</Text>

          <View style={styles.chipRow}>
            {GENDERS.map(item => (
              <Chip
                key={item}
                label={item}
                selected={gender === item}
                onPress={() => setGender(item)}
              />
            ))}
          </View>

          <Input
            label="Phone Number *"
            value={mobile}
            onChangeText={setMobile}
            placeholder="+91 XXXXX XXXXX"
            keyboardType="phone-pad"
          />
        </Card>

        {/* Address */}

        <Text style={styles.sectionTitle}>Address</Text>

        <Card style={styles.formCard}>
          <Input
            label="Address"
            value={address}
            onChangeText={setAddress}
            placeholder="Street address"
            multiline
          />

          {/* COUNTRY DROPDOWN */}

          <CustomDropdown
            label="Country *"
            value={country}
            options={countryOptions}
            placeholder={
              countryLoading
                ? 'Loading countries...'
                : countryOptions.length > 0
                ? 'Select country'
                : 'No countries found'
            }
            onSelect={selectedCountry => {
              if (selectedCountry !== country) {
                setState('');
                setStateId('');
                setStates([]);
                setCity('');
                setCityId('');
                setCities([]);
              }
              /*
               * Set country name
               */
              setCountry(selectedCountry);

              /*
               * Find complete API object
               */
              const selectedCountryData = countries.find(
                item => item.countryss_name === selectedCountry,
              );

              if (selectedCountryData) {
                /*
                 * API field:
                 * countryss_id
                 */
                const selectedId = selectedCountryData.countryss_id;

                setCountryId(String(selectedId ?? ''));

                console.log('Selected Country:', selectedCountryData);

                console.log(
                  'Selected Country Name:',
                  selectedCountryData.countryss_name,
                );

                console.log('Selected Country ID:', selectedId);
              }
            }}
          />

          <CustomDropdown
            label="State *"
            value={state}
            options={states.map(item => item.name)}
            disabled={!countryId || stateLoading || states.length === 0}
            placeholder={
              !countryId
                ? 'Select country first'
                : stateLoading
                ? 'Loading states...'
                : stateError
                ? 'Unable to load states'
                : states.length === 0
                ? 'No states found'
                : 'Select state'
            }
            onSelect={selectedName => {
              const selectedState = states.find(
                item => item.name === selectedName,
              );
              setState(selectedState?.name || '');
              setStateId(selectedState?.id || '');
              if (selectedState?.id !== stateId) {
                setCity('');
                setCityId('');
                setCities([]);
              }
            }}
          />
          {!!stateError && (
            <View>
              <Text accessibilityRole="alert">{stateError}</Text>
              <Button
                label="Retry loading states"
                onPress={() => setStateRetry(value => value + 1)}
              />
            </View>
          )}

          <CustomDropdown
            label="City *"
            value={city}
            options={cities.map(item => item.name)}
            disabled={!stateId || cityLoading || cities.length === 0}
            placeholder={
              !stateId
                ? 'Select state first'
                : cityLoading
                ? 'Loading cities...'
                : cityError
                ? 'Unable to load cities'
                : cities.length === 0
                ? 'No cities found'
                : 'Select city'
            }
            onSelect={selectedName => {
              const selectedCity = cities.find(
                item => item.name === selectedName,
              );
              setCity(selectedCity?.name || '');
              setCityId(selectedCity?.id || '');
            }}
          />
          {!!cityError && (
            <View>
              <Text accessibilityRole="alert">{cityError}</Text>
              <Button
                label="Retry loading cities"
                onPress={() => setCityRetry(value => value + 1)}
              />
            </View>
          )}

          <Input
            label="Area"
            value={area}
            onChangeText={setArea}
            placeholder="Area"
          />

          <Input
            label="Pincode"
            value={pincode}
            onChangeText={setPincode}
            placeholder="Pincode"
            keyboardType="numeric"
          />
        </Card>
        {/* Contact Details */}

        <Text style={styles.sectionTitle}>Contact Details</Text>

        <Card style={styles.formCard}>
          {/* <Input
            label="Phone *"
            value={phone}
            onChangeText={setPhone}
            placeholder="+91 XXXXX XXXXX"
            keyboardType="phone-pad"
          /> */}
          <Input
            label="Phone *"
            value={phone}
            onChangeText={text => {
              const numericValue = text.replace(/[^0-9]/g, '');

              if (numericValue.length <= 10) {
                setPhone(numericValue);
              }
            }}
            placeholder="Enter 10-digit phone number"
            keyboardType="phone-pad"
          />

          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="patient@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </Card>

        {/* Billing And Panel Details */}

        <Text style={styles.sectionTitle}>Billing And Panel Details</Text>

        <Card style={styles.formCard}>
          <CustomDropdown
            label="Panel Required"
            value={panelVal}
            options={PANEL_OPTIONS}
            placeholder="Select "
            onSelect={setPanelVal}
          />

          {/* {panelVal === 'Yes' && (
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={handlePdfUpload}
            >
              <FileUp size={20} color={Colors.primary[500]} />
              <Text style={styles.uploadPdfTxt}>Upload PDF</Text>
            </TouchableOpacity>
          )} */}
          {panelVal === 'Yes' && (
            <>
              <TouchableOpacity
                style={styles.uploadButton}
                onPress={handlePdfUpload}
                activeOpacity={0.7}
              >
                <FileUp size={20} color={Colors.primary[500]} />

                <Text style={styles.uploadPdfTxt}>
                  {selectedPdf ? 'Change PDF' : 'Upload PDF'}
                </Text>
              </TouchableOpacity>

              {selectedPdf && (
                <View style={styles.selectedPdfContainer}>
                  <FileText size={18} color={Colors.success[600]} />

                  <View style={styles.pdfInfo}>
                    <Text style={styles.pdfName} numberOfLines={1}>
                      {selectedPdf.name}
                    </Text>

                    {selectedPdf.size != null && (
                      <Text style={styles.pdfSize}>
                        {(selectedPdf.size / 1024 / 1024).toFixed(2)} MB
                      </Text>
                    )}
                  </View>
                </View>
              )}
            </>
          )}
        </Card>

        {/* Consent Details */}
        <Text style={styles.sectionTitle}>Consent Details</Text>

        <Card style={styles.formCard}>
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={handleConsentUpload}
            activeOpacity={0.7}
          >
            <FileUp size={20} color={Colors.primary[500]} />

            <Text style={styles.uploadPdfTxt}>
              {selectedConsentPdf ? 'Change Consent' : 'Upload Consent'}
            </Text>
          </TouchableOpacity>

          {selectedConsentPdf && (
            <View style={styles.selectedPdfContainer}>
              <FileText size={18} color={Colors.success[600]} />

              <View style={styles.pdfInfo}>
                <Text style={styles.pdfName} numberOfLines={1}>
                  {selectedConsentPdf.name}
                </Text>

                {selectedConsentPdf.size != null && (
                  <Text style={styles.pdfSize}>
                    {(selectedConsentPdf.size / 1024 / 1024).toFixed(2)} MB
                  </Text>
                )}
              </View>
            </View>
          )}
        </Card>
                <CustomButton
          title="Submit"
          onPress={addPatientHandler}
          disable={saving}
          topHeight={30}
          bgColor={ColorConstants.BTNCOLOR}
          fontsize={14}
          fontfamily={Fontconstants.SEMIBOLD}
          bordRadius={scale(12)}
          
        />
      </ScrollView>
    </View>
  );
};

export default AddPatient;

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

  modeRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },

  modeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md + 2,
    borderRadius: Radius.md,
    backgroundColor: Colors.neutral[0],
    borderWidth: 1.5,
    borderColor: Colors.neutral[200],
    ...Shadows.sm,
  },

  modeBtnActive: {
    borderColor: Colors.primary[500],
    backgroundColor: Colors.primary[50],
  },

  modeText: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.medium,
    color: Colors.neutral[500],
  },

  modeTextActive: {
    color: Colors.primary[700],
    fontWeight: FontWeight.semibold,
  },

  abhaCard: {
    marginBottom: Spacing.md,
  },

  abhaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },

  abhaHeaderText: {
    flex: 1,
  },

  abhaTitle: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
    color: Colors.neutral[900],
  },

  abhaSub: {
    fontSize: FontSize.xs,
    color: Colors.neutral[400],
    marginTop: 2,
  },

  verifiedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.success[50],
    borderRadius: Radius.sm,
    padding: Spacing.sm + 2,
    marginBottom: Spacing.md,
  },

  verifiedText: {
    fontSize: FontSize.sm,
    color: Colors.success[700],
    fontWeight: FontWeight.semibold,
  },

  sectionTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.neutral[700],
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },

  formCard: {
    marginBottom: Spacing.md,
  },

  fieldLabel: {
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
  uploadButton: {
    borderColor: Colors.primary[500],
    borderWidth: 1.5,
    flexDirection: 'row',
    paddingHorizontal: Spacing.xs,
    alignSelf: 'flex-start',
    // width: scale(110),
  },
  uploadPdfTxt: {
    color: Colors.primary[500],
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  selectedPdfContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
    padding: Spacing.sm,
    borderRadius: Radius.sm,
    backgroundColor: Colors.success[50],
    gap: Spacing.sm,
  },

  pdfInfo: {
    flex: 1,
  },

  pdfName: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.neutral[800],
  },

  pdfSize: {
    fontSize: FontSize.xs,
    color: Colors.neutral[500],
    marginTop: 2,
  },
});
