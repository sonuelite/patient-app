import { StyleSheet } from "react-native";
import { fontScale, scale } from "../../utils/scale";
import { Fontconstants } from "../../constants/fontConstants";
import { ColorConstants } from "../../constants/colorConstants";

export const style = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  line: {
    height: scale(1),
    width: scale(125),
    backgroundColor: ColorConstants.DIVIDER_LINE,
  },
  text: {
    fontSize: fontScale(14),
    fontFamily: Fontconstants.MEDIUM,
    color: ColorConstants.GRAY_Heading,
  },
})