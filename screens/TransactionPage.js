import { View, Text,TextInput ,TouchableOpacity,ScrollView, Image,Modal,FlatList,StyleSheet, SectionList} from 'react-native'
import React,{useState,useCallback, useRef,useEffect} from 'react'
import AntDesign from '@expo/vector-icons/AntDesign';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import EvilIcons from '@expo/vector-icons/EvilIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import {useNavigation} from "@react-navigation/native"
import * as SQLite from 'expo-sqlite';

const TransactionHistory = ({route}) => {
    const navigation= useNavigation()
    
    const [transactions,setTransactions]= useState([ ])

    const [isCategoryPicker,setIsCategoryPicker]= useState(false)
    const [pickCategory,setPickCategory]= useState("All")

    const [date,setDate]= useState(new Date())
    const [mode, setMode] = useState('date');
  const [show, setShow] = useState(false);
  
   const onChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setDate(currentDate);
    // console.log(currentDate)
    setShow(false);
    
  };

  const showMode = (currentMode) => {
    setShow(true);
    setMode(currentMode);
  };

  const showDatepicker = () => {
    showMode('date');
  };
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


  const [day,setDay]=useState(0)
  const [month,setMonth]= useState(0)
  const [year,setYear]= useState(0)
  const [firstTime,setFirstTime]= useState(true)

  const calendar=async(d)=>{
      try{
          setDay(d.getDate())
          setMonth((d.getMonth()+1))
          setYear(d.getFullYear())
      }catch(error){
          console.log(error)
      }
  }

const fetchData=async()=>{
    try{
        const thisDay = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const db=await SQLite.openDatabaseAsync("mydb")
        if(firstTime){
            const data= await db.getAllAsync("SELECT * FROM transactions order by date desc");
            setTransactions(data)
            setFirstTime(false)
        }else{
            const data= await db.getAllAsync("SELECT * FROM transactions WHERE strftime('%Y-%m-%d', transactions.date/1000, 'unixepoch') = ? order by date desc", thisDay);
            setTransactions(data)
        }
        // await db.closeAsync();
    }catch(error){
        console.log(error)
    }
}
useEffect(()=>{
    calendar(date)
 },[date])

useEffect(()=>{
  // console.log(route?.refresh)
    if(day){
        fetchData()
    }
},[day])


const groupedTransactions = transactions.reduce((acc, transaction) => {
    const date = formatDate(transaction.date); // Format date as needed
    if (!acc[date]) acc[date] = [];
    acc[date].push(transaction);
    return acc;
  }, {});
  
  // Convert to SectionList format
  const sections = Object.keys(groupedTransactions).map((date) => ({
    title: date,
    data: groupedTransactions[date],
  }));
  
  return (
    <View className="flex-1">
      
        {/* Filter */}
        <View className="p-3 px-6 flex flex-row justify-between">
            {/* for month & Year */}
            <View className="flex flex-row gap-2">
                    <Text className=" pl-2">{formatDate(date?.getTime())}</Text>
                    <TouchableOpacity onPress={showDatepicker}>
                     <EvilIcons name="calendar" size={24} color="black" />
                    </TouchableOpacity>
                    {show && (
                        <DateTimePicker
                        testID="dateTimePicker"
                        value={date}
                        mode={mode}
                        is24Hour={true}
                        display="default"
                        onChange={onChange}
                        />
                    )}
                </View>

        </View>
       
      

        {/* <FlatList
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
                    <TouchableOpacity onPress={()=>navigation.navigate("Transaction",{id:itemData.item.id})} className={`flex flex-row ${itemData.item?.expenseType=="spent"?"bg-red-200":(itemData.item?.expenseType=="lent"?"bg-purple-200":(itemData.item?.expenseType=="borrow"?"bg-slate-300":"bg-green-200"))} rounded-lg items-center gap-3 p-1 px-3 mt-1`}>
                            <View className="flex-1">
                                <Text className="text-[15px] font-bold">{itemData.item.item} </Text>
                                <Text className="text-[12px] text-gray-600">{formatDate(itemData.item.date)}</Text>
                            </View>
                            <View className="flex  items-center">
                            <Text className={itemData.item.expenseType=="spent"?"text-red-600 text-[14px] font-medium":"text-green-600 text-[14px] font-medium"}>₹ {itemData.item.price}</Text>
                                <Text className={itemData.item.expenseType=="spent"?"text-red-600 text-xs":"text-green-600 text-[16px] font-medium"}>{itemData.item.expenseType}</Text>
                            </View>
                        </TouchableOpacity>
                )
            }}
        /> */}

<SectionList
 ListFooterComponent={()=>{
    return (
        <View className="h-[100px] ">
            </View>
    )
    }}
    sections={sections}
    keyExtractor={(item) => item.id}
    renderSectionHeader={({ section: { title } }) => (
      <Text className="text-lg text-blue-600 font-semibold bg-gray-100  mt-2 mx-4">{title}</Text>
    )}
    renderItem={({ item }) => (
      <TouchableOpacity
        onPress={() => navigation.navigate("Transaction", { id: item.id })}
        className={`flex flex-row mx-4 ${
          item?.expenseType == "spent"
            ? "bg-red-200"
            : item?.expenseType == "lent"
            ? "bg-purple-200"
            : item?.expenseType == "borrow"
            ? "bg-slate-300"
            : "bg-green-200"
        } rounded-lg items-center gap-3 p-1 px-3 mt-1`}
      >
        <View className="flex-1">
          <Text className="text-[15px] font-bold">{item.item} </Text>
          <Text className="text-[12px] text-gray-600">{formatDate(item.date)}</Text>
        </View>
        <View className="flex items-center">
          <Text
            className={
              item.expenseType == "spent"
                ? "text-red-600 text-[14px] font-medium"
                : "text-green-600 text-[14px] font-medium"
            }
          >
            ₹ {item.price}
          </Text>
          <Text
            className={
              item.expenseType == "spent"
                ? "text-red-600 text-xs"
                : "text-green-600 text-[16px] font-medium"
            }
          >
            {item.expenseType}
          </Text>
        </View>
      </TouchableOpacity>
    )}
  />
    </View>
  )
}

export default TransactionHistory

