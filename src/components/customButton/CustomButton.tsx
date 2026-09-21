import {
  View,
  Text,
  TouchableOpacity,
  ImageSourcePropType,
  Image,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import React from 'react';
import { fontScale, scale } from '../../utils/scale';
import { style } from './style';
import { Fontconstants } from '../../constants/fontConstants';
import { ColorConstants } from '../../constants/colorConstants';

interface customButton {
  title: string;
  onPress: () => void;
  width?: number;
  disable: boolean;
  topHeight?: number;
  bgColor?: string;
  txtColor?: string;
  borderColor?: string;
  borderWidth?: number;
  fontsize?: number;
  fontfamily?: string;
  bordRadius?: number;

  leftImage?: ImageSourcePropType;
  rightImage?: ImageSourcePropType;
  imageSize?: number;
  iconColor?: string;
  margLeft?: number;
  margRight?: number;
  leftIcon?: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  buttonStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  accessibilityLabel?: string;
}
const CustomButton = (props: customButton) => {
  const {
    title,
    onPress,
    width,
    disable,
    topHeight,
    bgColor,
    txtColor,
    leftImage,
    rightImage,
    imageSize,
    borderColor,
    borderWidth,
    fontsize,
    fontfamily,
    bordRadius,
    iconColor,
    margLeft,
    margRight,
  } = props;
  console.log('leftImage->', leftImage);

  return (
    <View style={[{ marginTop: scale(topHeight || 0) }, props.containerStyle]}>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={props.accessibilityLabel || title}
        disabled={disable}
        onPress={onPress}
        activeOpacity={0.8}
        style={[
          style.touchStyle,
          {
            width: width ? scale(width) : '100%',
            backgroundColor: bgColor || ColorConstants.BTNCOLOR,
            borderWidth: scale(borderWidth || 0),
            borderColor: borderColor || 'transparent',
            borderRadius: scale(bordRadius || 4),
          },
          props.buttonStyle,
        ]}
      >
        {props.leftIcon}
        {leftImage && (
          <Image
            source={leftImage}
            style={{
              width: scale(imageSize || 24),
              height: scale(imageSize || 24),
              marginRight: scale(margRight || 16),
              tintColor: iconColor,
            }}
          />
        )}
        <Text
          style={[
            style.titleTxt,
            {
              color: txtColor || ColorConstants.WHITE,
              fontSize: fontScale(fontsize || 16),
              fontFamily: fontfamily || Fontconstants.MEDIUM,
            },
            props.textStyle,
          ]}
        >
          {title}
        </Text>
        {rightImage && (
          <Image
            source={rightImage}
            style={{
              width: scale(imageSize || 24),
              height: scale(imageSize || 24),
              marginLeft: scale(margLeft || 16),
              tintColor: iconColor,
            }}
          />
        )}
      </TouchableOpacity>
    </View>
  );
};

export default CustomButton;
