import { View, Text, TouchableOpacity, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import FontAwesome from '@expo/vector-icons/FontAwesome';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as SQLite from 'expo-sqlite';

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
            navigation.replace("TransactionHistory")
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
        <View className="flex flex-row mt-2 items-center">
            <Text className="font-semibold text-lg">Item: </Text>
            <Text>{data?.item}</Text>
        </View>
        <View className="flex flex-row mt-2 items-center">
            <Text className="font-semibold text-lg">Price: </Text>
            <Text>{data?.price}</Text>
        </View>
        {
           (data?.expenseType=="lent" || data?.expenseType=="borrow") && ( <View className="flex flex-row mt-2 items-center">
            <Text className="font-semibold text-lg">Person: </Text>
            <Text>{data?.tag}</Text>
        </View>)
        }
        <View className="flex flex-row mt-2 items-center">
            <Text className="font-semibold text-lg">Date: </Text>
            <Text>{formatDate(data?.date)}</Text>
        </View>
        <View className="flex flex-row mt-2 items-center">
            <Text className="font-semibold text-lg">Expense Type: </Text>
            <Text>{data?.expenseType}</Text>
        </View>
        <View className="flex flex-row mt-2 items-center">
            <Text className="font-semibold text-lg">Payment Method: </Text>
            <Text>{data?.paymentMethod}</Text>
        </View>
        <View className="flex flex-row mt-2 items-center">
            <Text className="font-semibold text-lg">Description: </Text>
            <Text>{data?.description}</Text>
        </View>
        <View className="flex flex-row items-center mt-2">
            <Text className="font-semibold text-lg">Location: </Text>
            <Text>Lat: {data?.latitude}, Lon: {data?.longitude}</Text>
        </View>

        <View className="mt-4 flex flex-row gap-2">
            <TouchableOpacity onPress={handleEdit} className="flex flex-1 flex-row gap-2 bg-green-600 p-2 rounded-lg justify-center">
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