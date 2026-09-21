import { StyleSheet } from 'react-native';

import { fontScale, moderateScale, scale } from '../../utils/scale';

export const style = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: scale(24),
  },

  backButton: {
    padding: scale(4),
  },

  title: {
    marginLeft: scale(8),
    fontSize: fontScale(18),
    fontWeight: '600',
  },
});