import { View, Text,KeyboardAvoidingView,Platform, TouchableOpacity, Pressable } from 'react-native'
import React,{useState} from 'react'
import AntDesign from '@expo/vector-icons/AntDesign';
import Ionicons from '@expo/vector-icons/Ionicons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Foundation from '@expo/vector-icons/Foundation';
import {useNavigation, StackActions} from "@react-navigation/native"

const BottomTab = () => {
    const [active,setIsActive] = useState("")
    const navigation= useNavigation()

  return (
    <View className="absolute bottom-1 flex-1 w-[100%]">
        <View className="bg-[#0489F4] h-[65px] p-2 mb-6 mx-4 rounded-xl elevation-xl flex flex-row justify-between px-10">
            <TouchableOpacity className="p-4 bg-blue-400 rounded-full" onPress={()=> navigation.dispatch(StackActions.replace("Home"))}>
                <AntDesign name="home" size={24} color="white" />
                </TouchableOpacity>
            <TouchableOpacity className="p-4 bg-blue-400 rounded-full" onPress={()=> navigation.dispatch(StackActions.replace("TransactionHistory"))}>
                <Ionicons name="receipt-outline" size={24} color="white" />
                </TouchableOpacity>
            <View className="overflow-hidden   h-[70px] w-[70px] items-center justify-center relative bottom-5 border-[1px] border-[#0489F4] bg-white rounded-full">
            <Pressable android_ripple={{color:'skyblue'}} className="p-4  h-[70px] w-[70px] items-center justify-center" onPress={()=> navigation.dispatch(StackActions.replace("Expense"))}>
                <FontAwesome6 name="add" size={28} color="black" /> 
                </Pressable>
                </View>
            <TouchableOpacity className="p-4 bg-blue-400 rounded-full" onPress={()=> navigation.dispatch(StackActions.replace("Target"))}>
                {/* <AntDesign name="user" size={24} color="white" />  */}
                <Foundation name="target-two" size={24} color="white" />
                </TouchableOpacity>
            <TouchableOpacity className="p-4 bg-blue-400 rounded-full" onPress={()=> navigation.dispatch(StackActions.replace("MoneyBuddy"))}>
                {/* <AntDesign name="setting" size={24} color="white" /> */}
                <FontAwesome6 name="person-falling" size={24} color="white" />
                </TouchableOpacity>
        </View>
    </View>
  )
}

export default BottomTab