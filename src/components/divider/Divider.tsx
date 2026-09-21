import { View, Text } from 'react-native'
import React from 'react'
import { style } from './style';
import { scale } from '../../utils/scale';

interface divider {
    txt: string;
    topHeight?: number;
}

const Divider = (props: divider) => {
    const { txt, topHeight } = props;
  return (
    <View style={[style.container, { marginTop: scale(topHeight || 0)}]}>
      <View style={style.line} />
      <Text style={style.text}>{txt}</Text>
      <View style={style.line} />
    </View>
  )
}

export default Divider