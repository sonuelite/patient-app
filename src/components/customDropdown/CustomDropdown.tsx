import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Modal,
  Pressable,
} from 'react-native';

import { ChevronDown, Check } from 'lucide-react-native';

import {
  Colors,
  Spacing,
  FontSize,
  FontWeight,
  Radius,
  Shadows,
} from '../../constants/theme';

export type DropdownOption = { label: string; value: string };

type CustomDropdownProps = {
  label?: string;
  value: string;
  options: (string | DropdownOption)[];
  placeholder?: string;
  onSelect: (value: string) => void;
  disabled?: boolean;
};

const CustomDropdown: React.FC<CustomDropdownProps> = ({
  label,
  value,
  options,
  placeholder = 'Select',
  onSelect,
  disabled = false,
}) => {
  const [visible, setVisible] = useState(false);
  const normalizedOptions = options.map(option =>
    typeof option === 'string' ? { label: option, value: option } : option,
  );
  const selectedLabel = normalizedOptions.find(
    option => option.value === value,
  )?.label;

  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });

  const containerRef = useRef<React.ElementRef<typeof View>>(null);

  // ---------------------------------------------------------
  // OPEN DROPDOWN
  // ---------------------------------------------------------

  const openDropdown = () => {
    if (disabled) {
      return;
    }

    containerRef.current?.measureInWindow((x, y, width, height) => {
      setDropdownPosition({
        top: y + height + 4,
        left: x,
        width,
      });

      setVisible(true);
    });
  };

  // ---------------------------------------------------------
  // CLOSE DROPDOWN
  // ---------------------------------------------------------

  const closeDropdown = () => {
    setVisible(false);
  };

  // ---------------------------------------------------------
  // SELECT OPTION
  // ---------------------------------------------------------

  const handleSelect = (item: string) => {
    onSelect(item);
    setVisible(false);
  };

  // ---------------------------------------------------------
  // CLOSE WHEN COMPONENT UNMOUNTS
  // ---------------------------------------------------------

  useEffect(() => {
    return () => {
      setVisible(false);
    };
  }, []);

  return (
    <>
      <View ref={containerRef} collapsable={false} style={styles.container}>
        {label ? <Text style={styles.label}>{label}</Text> : null}

        <TouchableOpacity
          activeOpacity={0.8}
          disabled={disabled}
          onPress={openDropdown}
          style={[
            styles.dropdownButton,
            disabled && styles.dropdownDisabled,
            visible && styles.dropdownButtonActive,
          ]}
        >
          <Text
            numberOfLines={1}
            style={[styles.selectedText, !value && styles.placeholderText]}
          >
            {selectedLabel || value || placeholder}
          </Text>

          <ChevronDown
            size={20}
            color={disabled ? Colors.neutral[300] : Colors.neutral[500]}
            style={[visible && styles.chevronUp]}
          />
        </TouchableOpacity>
      </View>

      {/* =====================================================
          DROPDOWN MODAL
      ====================================================== */}

      <Modal
        visible={visible}
        transparent
        animationType="none"
        onRequestClose={closeDropdown}
      >
        <View style={styles.modalContainer}>
          {/* BACKDROP */}

          <Pressable style={StyleSheet.absoluteFill} onPress={closeDropdown} />

          {/* DROPDOWN LIST */}

          <View
            style={[
              styles.dropdownList,
              {
                position: 'absolute',
                top: dropdownPosition.top,
                left: dropdownPosition.left,
                width: dropdownPosition.width,
              },
            ]}
          >
            {options.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No options available</Text>
              </View>
            ) : (
              <FlatList
                data={normalizedOptions}
                keyExtractor={(item, index) => `${item.value}-${index}`}
                keyboardShouldPersistTaps="handled"
                nestedScrollEnabled
                showsVerticalScrollIndicator={false}
                style={styles.list}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => {
                  const selected = item.value === value;

                  return (
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => handleSelect(item.value)}
                      style={[styles.option, selected && styles.selectedOption]}
                    >
                      <Text
                        numberOfLines={2}
                        style={[
                          styles.optionText,
                          selected && styles.selectedOptionText,
                        ]}
                      >
                        {item.label}
                      </Text>

                      {selected ? (
                        <Check size={18} color={Colors.primary[600]} />
                      ) : null}
                    </TouchableOpacity>
                  );
                }}
              />
            )}
          </View>
        </View>
      </Modal>
    </>
  );
};

export default CustomDropdown;

// =========================================================
// STYLES
// =========================================================

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: Spacing.md,
  },

  label: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.neutral[700],
    marginBottom: Spacing.sm,
  },

  dropdownButton: {
    minHeight: 48,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    paddingHorizontal: Spacing.md,

    backgroundColor: Colors.neutral[0],

    borderWidth: 1,
    borderColor: Colors.neutral[200],

    borderRadius: Radius.md,

    ...Shadows.sm,
  },

  dropdownButtonActive: {
    borderColor: Colors.primary[500],
  },

  dropdownDisabled: {
    backgroundColor: Colors.neutral[100],
    borderColor: Colors.neutral[200],
  },

  selectedText: {
    flex: 1,
    fontSize: FontSize.base,
    color: Colors.neutral[800],
    fontWeight: FontWeight.medium,
    marginRight: Spacing.sm,
  },

  placeholderText: {
    color: Colors.neutral[400],
    fontWeight: FontWeight.regular,
  },

  chevronUp: {
    transform: [
      {
        rotate: '180deg',
      },
    ],
  },

  // =======================================================
  // MODAL
  // =======================================================

  modalContainer: {
    flex: 1,
  },

  // =======================================================
  // DROPDOWN LIST
  // =======================================================

  dropdownList: {
    maxHeight: 250,

    backgroundColor: Colors.neutral[0],

    borderWidth: 1,
    borderColor: Colors.neutral[200],

    borderRadius: Radius.md,

    ...Shadows.lg,
  },

  list: {
    maxHeight: 250,
  },

  listContent: {
    paddingVertical: Spacing.xs,
  },

  // =======================================================
  // OPTION
  // =======================================================

  option: {
    minHeight: 48,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,

    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },

  selectedOption: {
    backgroundColor: Colors.primary[50],
  },

  optionText: {
    flex: 1,

    fontSize: FontSize.base,
    color: Colors.neutral[700],

    marginRight: Spacing.sm,
  },

  selectedOptionText: {
    color: Colors.primary[700],
    fontWeight: FontWeight.semibold,
  },

  // =======================================================
  // EMPTY STATE
  // =======================================================

  emptyContainer: {
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyText: {
    fontSize: FontSize.sm,
    color: Colors.neutral[400],
  },
});
