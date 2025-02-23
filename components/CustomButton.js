import { View, Text, Pressable } from 'react-native'
import React, { Children } from 'react'

const CustomButton = ({children}) => {
  return (
    <View className=" rounded-lg bg-blue-500 m-1 overflow-hidden mx-3">
    <Pressable android_ripple={{color:'blue'}} className="p-3 items-center">
        <Text className="text-white">{children}</Text>
    </Pressable>
    </View>
  )
}

export default CustomButton