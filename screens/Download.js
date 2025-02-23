import { View, Text, TouchableOpacity, Alert } from 'react-native'
import React from 'react'
import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system';
import {shareAsync} from "expo-sharing"

const Download = () => {
    const types=["transactions","items","targets","buddies"]

    async function saveJsonToFile(filePath,type) {
        try {
            const db= await SQLite.openDatabaseAsync("mydb")
            const q="SELECT * from "+type
            const data=await db.getAllAsync(q)

            const jsonData = JSON.stringify(data);

  
           await FileSystem.writeAsStringAsync(filePath, jsonData, {
                encoding: FileSystem.EncodingType.UTF8,
              });
              save(filePath)
              Alert.alert("Download Complete","Download to Download folder")
        } catch (error) {
          console.error('Error saving JSON data to file:', error);
        }
      }

      const save=(uri)=>{
        shareAsync(uri)
      }
    const handleDownload=async(type)=>{
        try{
            const filePath = FileSystem.documentDirectory + `${type}.json`;
            await saveJsonToFile(filePath,type)
        }catch(error){
            console.log(error)
        }
    }
  return (
    <View>
        <View className="flex flex-row flex-wrap gap-3 mt-4 p-2 justify-center">
      {types?.map((type,index)=>{
        return(
        <TouchableOpacity key={index} onPress={()=>handleDownload(type)} className="bg-purple-500  p-2 rounded-lg">
            <Text className="text-white">Download {type}</Text>
        </TouchableOpacity>)
      })}
      </View>
    </View>
  )
}

export default Download