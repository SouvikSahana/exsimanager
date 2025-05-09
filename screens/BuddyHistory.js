import { View, Text,Image ,TouchableOpacity,Linking,FlatList, Alert} from 'react-native'
import React,{useEffect, useState} from 'react'
import BottomTab from '../components/BottomTab'
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Ionicons from '@expo/vector-icons/Ionicons';
import CustomButton from "../components/CustomButton"
import * as SQLite from 'expo-sqlite';
import AntDesign from '@expo/vector-icons/AntDesign';

const BuddyHistory = ({navigation,route}) => {
    const [data,setData]= useState({})
    const [transactions,setTransactions]= useState([])
    const [status,setStatus]= useState({type:"None",value:0})

    useEffect(()=>{
        setData(route.params)
    },[])
    
    useEffect(()=>{
        if(transactions?.length>0){
            const amount=transactions?.reduce((total,num)=>{
                if(num.expenseType=="lent"){
                    return total - Number(num.price)
                }else{
                    return total + Number(num.price)
                }
            },0)
            if(amount<0){
                setStatus({type:"Lent",value:amount})
            }else if(amount==0){
                setStatus({type:"None",value:0})
            }else{
                setStatus({type:"Borrow",value:amount})
            }
        }
    },[transactions])
    const fetchData=async(key)=>{
        try{
            const db=await SQLite.openDatabaseAsync("mydb")
            // console.log(key)
                const b= await db.getAllAsync("SELECT * FROM transactions WHERE tag = ?", key);
                setTransactions(b)
                await db.closeAsync();
        }catch(error){
            console.log(error)
        }
    }
    useEffect(()=>{
        if(data?.name){
            fetchData(data?.key)
        }
    },[data])

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

      const handleShare=async()=>{
        try{
            if (!data?.name && !data?.mobile && !status?.type=="Lent") {
                Alert.alert("Field Data is Missing");
                return;
              }
          const list= transactions?.map((transaction)=>{
            if(transaction?.expenseType=="lent"){
                return `\n📅 *Date:* ${formatDate(transaction?.date)}\n` +`🛒 *Item:* ${transaction?.item}\n` + `💰 *Amount:* ₹${transaction?.price}\n`
            }
          })
              const message = `📌 *Payment Due* 📌\n\n` +
                `👤 *Name:* ${data?.name}\n` +
                `💰 *Amount:* ₹${status?.value*-1}\n` +
                `✅ Transaction Data tracked by ExsiManager\n` + list ;
          
              const whatsappUrl = `whatsapp://send?phone=${data?.mobile}&text=${encodeURIComponent(message)}`;
          
              Linking.openURL(whatsappUrl).catch(() =>
                Alert.alert("WhatsApp is not installed!")
              );
        }catch(error){
            Alert.alert("Error",error)
        }
      }
    return (
    <View className="flex-1 ">
      

        <View  >

            <View className="elevation-lg bg-purple-50 rounded-lg m-4 mx-6">
            <View className="p-2 px-4 rounded-lg gap-1  mx-auto mt-2">
                <View className="flex flex-row gap-2 items-center ">
                    {/* <Text className="font-medium text-blue-500">Name :</Text> */}
                    <Text className="text-[20px] mx-auto text-blue-600">{ data?.name}</Text>
                </View>
                <View className="flex flex-row gap-2 items-center ">
                    {/* <Text className="font-medium text-blue-500">Mobile :</Text> */}
                    <Text className="text-[15px] mx-auto text-orange-600">{data?.mobile}</Text>
                </View>
            </View>
            
            <View className={`p-4 mx-10 items-center  rounded-xl flex flex-row justify-around my-0`}>
                <View className="flex flex-row gap-2 justify-center items-center">
                <Text className={`font-medium text-[16px] ${status?.value<0?"text-green-600":"text-orange-600"}`}>{status?.type}</Text>
                    {status?.value<0 && <TouchableOpacity onPress={handleShare}> <AntDesign name="sharealt" size={20} color="blue" /> </TouchableOpacity>}
                </View>
                <Text className={` ${status?.value<0?"text-green-600":"text-orange-600"}`}>₹ {status?.value}</Text>
                
            </View>
            </View>

            <FlatList
            data={transactions}
            keyExtractor={(item)=>item.id}
            className="px-4"
            ListFooterComponent={()=>{
                return (
                    <View className="h-[100px] ">
                        </View>
                )
            }}
            renderItem={(itemData)=>{
                return (
                    <TouchableOpacity onPress={()=>navigation.navigate("Transaction",{id:itemData.item.id})} className={`flex flex-row border-b-[1px] border-slate-300   items-center gap-3 p-1 px-3 mt-1`}>
                            <View className={`${itemData.item?.expenseType=="lent"?"bg-green-600":"bg-orange-600"} p-[6px] px-4 rounded-full`}>
                               <Text className="text-[17px] text-white font-semibold">{itemData.item?.expenseType=="lent"?"L":"B"}</Text> 
                            </View>
                            <View className="flex-1">
                                <Text className={`text-[15px]  ${itemData.item?.expenseType=="lent"?"text-green-600":"text-orange-600"}`}>{itemData.item.item} </Text>
                                <Text className="text-[12px] text-gray-600 italic">{formatDate(itemData.item.date)}</Text>
                            </View>
                            <View className="flex  items-center">
                            <Text className={itemData.item.expenseType=="spent"?"text-orange-600 text-[13px] ":"text-green-600 text-[13px] "}>₹ {Number(itemData.item.price).toFixed(2)}</Text>
                                {/* <Text className={itemData.item.expenseType=="spent"?"text-orange-600 text-xs":"text-green-600 text-[16px] font-medium"}>{itemData.item.expenseType}</Text> */}
                            </View>
                        </TouchableOpacity>
                )
            }}
        />
        </View>
    </View>
  )
}

export default BuddyHistory