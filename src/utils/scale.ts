import { Dimensions, PixelRatio, Platform } from 'react-native'

export const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } =
  Dimensions.get('window')

const guidelineBaseWidth = 375
const guidelineBaseHeight = 852

export const scale = (size: number, isHeight: boolean = false): number => {
  const scaleFactor = isHeight
    ? SCREEN_HEIGHT / guidelineBaseHeight
    : SCREEN_WIDTH / guidelineBaseWidth
  return Math.round(size * scaleFactor)
}

export const moderateScale = (size: number, factor: number = 0.5): number => {
  const scaleFactor =
    (SCREEN_WIDTH / guidelineBaseWidth + SCREEN_HEIGHT / guidelineBaseHeight) /
    2
  return Math.round(size + (scaleFactor - 1) * factor * size)
}

export const fontScale = (size: number): number => {
  const scale = SCREEN_WIDTH / guidelineBaseWidth;
  const newSize = size * scale;

  if (Platform.OS === 'ios') {
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  } else {
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  }
}

export const responsiveImageWidth = (width: number): number =>
  (SCREEN_WIDTH / guidelineBaseWidth) * width;

export const responsiveImageHeight = (height: number): number =>
  (SCREEN_HEIGHT / guidelineBaseHeight) * height;

export const scaleImageToWidth = (
  originalWidth: number,
  originalHeight: number,
  targetWidth: number = SCREEN_WIDTH
): { width: number; height: number } => {
  const ratio = originalHeight / originalWidth;
  const height = targetWidth * ratio;
  return {
    width: targetWidth,
    height,
  };
};

// export const getTextStyle = (size:number, heightMultiplier = 1.4) => ({
//     fontSize: fontScale(size),
//     lineHeight: fontScale(size * heightMultiplier),
//     letterSpacing: Platform.select({ ios: 0, android: 0 }),
//     includeFontPadding: false, // Critical for Android consistency
// });
export const getTextStyle = (size: number, heightMultiplier = 1.4) => {
  const fontSize = fontScale(size);
  // Calculate line height precisely
  const lineHeight = fontScale(size * heightMultiplier);

  return {
    fontSize,
    lineHeight,
    letterSpacing: Platform.select({ 
      ios: 0, // Inter often needs slight negative tracking on iOS to match Figma 0%
      android: 0 
    }),
    includeFontPadding: false,
    // textAlignVertical: 'center',
  };
};