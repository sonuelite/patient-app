import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
} from 'react-native';

import { useNavigation } from '@react-navigation/native';
import { ChevronLeft } from 'lucide-react-native';

import { style } from './style';
import { ColorConstants } from '../../constants/colorConstants';

interface BackHeaderProps {
  title?: string;
}

const BackHeader = ({ title }: BackHeaderProps) => {
  const navigation = useNavigation();

  return (
    <View style={style.container}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={style.backButton}
        activeOpacity={0.7}
      >
        <ChevronLeft
          size={24}
          color={ColorConstants.BLACK}
        />
      </TouchableOpacity>

      {title && (
        <Text style={style.title}>
          {title}
        </Text>
      )}
    </View>
  );
};

export default BackHeader;

