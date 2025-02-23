import { View, Text, Image, Pressable , Linking, Alert, TouchableOpacity} from 'react-native'
import React from 'react'
import * as Clipboard from 'expo-clipboard';
import Feather from '@expo/vector-icons/Feather';

const Support = () => {
      const copyToClipboard = async () => {
        await Clipboard.setStringAsync("souviksahana57-1@okhdfcbank");
      };
    const getGithub=async()=>{
        try{
            await Linking.openURL("https://github.com/SouvikSahana/exsimanager").catch(()=>{
                Alert.alert("Error in opening github URL")
            })
        }catch(error){
            console.log(error)
        }
    }
  return (
    <View className="p-2">
      <View>
        <Image source={require("../assets/pay.jpeg")} resizeMode='contain' className="w-[90vw] h-[45vh]  mx-auto"/>
      </View>
      <TouchableOpacity onPress={copyToClipboard} className="mx-8 my-4 rounded-lg bg-blue-200 p-2 flex flex-row gap-2 justify-center items-end">
        <Feather name="copy" size={20} color="black" />
        <Text>souviksahana57-1@okhdfcbank</Text>
      </TouchableOpacity>

      <Pressable onPress={getGithub} className="mx-8 my-4 rounded-lg bg-slate-200 p-2 items-center">
        <Text>Github - Code</Text>
      </Pressable>
    </View>
  )
}

export default Support