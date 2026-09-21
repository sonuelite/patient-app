import { StyleSheet } from "react-native";
import { fontScale, scale } from "../../utils/scale";
import { Fontconstants } from "../../constants/fontConstants";

export const style = StyleSheet.create({
    touchStyle: {
        height: scale(48),
        borderRadius: scale(4),
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    titleTxt: {
        fontSize: fontScale(16),
        fontFamily: Fontconstants.MEDIUM,
    }
})