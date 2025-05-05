import { View, Text, TouchableOpacity, Alert, Linking } from 'react-native'
import React, { useEffect, useState } from 'react'
import FontAwesome from '@expo/vector-icons/FontAwesome';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as SQLite from 'expo-sqlite';
import Ionicons from '@expo/vector-icons/Ionicons';

const Transaction = ({navigation,route}) => {
    const [data,setData]= useState({})
 

    const fetchData=async(id)=>{
        try{
            const db= await SQLite.openDatabaseAsync("mydb")
            const getData= await db.getFirstAsync("SELECT * FROM transactions WHERE id = ? ",id)
            setData(getData)
            await db.closeAsync();
        }catch(error){
            console.log(error)
        }
    }
    useEffect(()=>{
        const date=route.params.id
        if(date){
            fetchData(date)
        }
        
    },[route])

    function formatDate(dateNumber) {
        if (typeof dateNumber !== 'number' || isNaN(dateNumber)) {
          return "Invalid date input";
        }
        const date = new Date(dateNumber);
        const monthsOfYearShort = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const dayOfMonth = date.getDate();  // Get the day of the month (1-31)
        const monthNameShort = monthsOfYearShort[date.getMonth()];
        const year = date.getFullYear();
        return `${dayOfMonth}, ${monthNameShort} ${year}`;
      }

      const removeTransaction=async()=>{
        try{
            const db= await SQLite.openDatabaseAsync("mydb")
            await db.runAsync("DELETE FROM transactions WHERE id = ?",data?.id);
            // navigation.goBack("TransactionHistory",{refresh:true})
            // navigation.dispatch(StackActions.replace("TransactionHistory",{refresh:true}))
            navigation.reset({
                index: 0,  // Set TransactionHistory as the first screen
                routes: [{ name: "TransactionHistory", params: { refresh: true } }],
              });
            await db.closeAsync();
        }catch(error){
            console.log(error)
        }
      }
      const handleDelete=()=>{
        try{
            Alert.alert("Delete Transaction","Are you sure wanna remove this transaction?",[{text:"cancel",style:"cancel"},{text:"delete",style:"destructive",onPress:()=>removeTransaction()}])
        }catch(error){
            console.log(error)
        }
      }

      const handleEdit=()=>{
        try{
            navigation.navigate("Expense",{isEdit:true,data:data})
        }catch(error){
            console.log(error)
        }
      }
  return (
    <View className="px-4 p-2">
        <View className="flex flex-row mt-2 items-center ml-6">
            <Text className="text-green-700 italic">{formatDate(data?.date)}</Text>
        </View>
        <View className="flex flex-row mt-0 items-center">
            {/* <Text className="font-semibold text-lg">Item: </Text> */}
            <Text className="font-semibold text-2xl mx-auto text-blue-800">{data?.item}</Text>
        </View>
        <View className="flex flex-row mt-2 items-center">
            {/* <Text className="font-semibold text-lg">Price: </Text> */}
            <Text className="mx-auto text-lg font-semibold text-purple-500"> ₹ {data?.price}</Text>
        </View>
        {data?.description && <View className="flex flex-row mt-2 items-center">
            <Text className="mx-auto p-2">{data?.description}</Text>
        </View>}
       
       <View className="flex flex-row flex-wrap gap-3 justify-center mt-6">
            <View className=" bg-green-800 p-2 px-4 rounded-xl">
                    <Text className="text-white capitalize">{data?.expenseType}</Text>
                </View>
                <View  className=" bg-orange-800 p-2 px-4 rounded-xl">
                    <Text className="text-white capitalize">{data?.paymentMethod}</Text>
                </View>

                {
                (data?.expenseType=="lent" || data?.expenseType=="borrow") && ( <View className=" bg-purple-800 p-2 px-4 rounded-xl">
                    {/* <Text className="font-semibold text-lg">Person: </Text> */}
                    <Text className="text-white">{data?.name}</Text>
                </View>)
                }
        </View>
        
       
        <TouchableOpacity className="flex flex-row justify-center gap-2 bg-blue-500 p-2 w-[50%] mx-auto rounded-lg items-center mt-6" onPress={()=>Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${data?.latitude},${data?.longitude}`)}>
        <Ionicons name="location-outline" size={24} color="white" />
            <Text className="text-white text-lg ">Location </Text>
            {/* <Text>Lat: {data?.latitude}, Lon: {data?.longitude}</Text> */}
        </TouchableOpacity>

        <View className="mt-20 flex flex-row gap-2 ">
            <TouchableOpacity onPress={handleEdit} className="flex flex-1 flex-row gap-2 bg-blue-600 p-2 rounded-lg justify-center">
                <FontAwesome name="edit" size={24} color="white" />
                <Text className="text-white">Edit</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleDelete} className="flex flex-1 flex-row gap-2 bg-red-600 p-2 rounded-lg justify-center">
            <MaterialIcons name="delete-forever" size={24} color="white" />
                <Text className="text-white">Delete</Text>
            </TouchableOpacity>
        </View>
    </View>
  )
}

export default Transaction