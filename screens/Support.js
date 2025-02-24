import { View, Text, Image, Pressable , Linking, Alert, TouchableOpacity} from 'react-native'
import React from 'react'
import * as Clipboard from 'expo-clipboard';
import Feather from '@expo/vector-icons/Feather';

const Support = () => {
      const copyToClipboard = async () => {
        await Clipboard.setStringAsync("souviksahana35@gmail.com");
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
    const getProfile=async()=>{
      try{
          await Linking.openURL("https://souviksahana.netlify.app/").catch(()=>{
              Alert.alert("Error in opening github URL")
          })
      }catch(error){
          console.log(error)
      }
  }
    //
  return (
    <View className="p-2">
      
      <TouchableOpacity onPress={copyToClipboard} className="mx-8 my-4 rounded-lg bg-blue-200 p-2 flex flex-row gap-2 justify-center items-end">
        <Feather name="copy" size={20} color="black" />
        <Text>souviksahana35@gmail.com</Text>
      </TouchableOpacity>

      <Pressable onPress={getGithub} className="mx-8 my-4 rounded-lg bg-slate-200 p-2 items-center">
        <Text>Github - Code</Text>
      </Pressable>
      <Pressable onPress={getProfile} className="mx-8 my-4 rounded-lg bg-blue-100 p-2 items-center">
        <Text>Developer Profile</Text>
      </Pressable>

      <View>
        <Text className="text-center mt-4 text-gray-400">Still working on it. For queries contact us.</Text>
        <Text className="text-center mt-1 text-gray-400 text-sm">You can provide us Financial Support also.</Text>
      </View>
    </View>
  )
}

export default Support