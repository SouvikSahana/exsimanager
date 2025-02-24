import { View, Text,TextInput ,TouchableOpacity,ScrollView, Image,Modal,FlatList,StyleSheet, Dimensions} from 'react-native'
import React,{useState,useCallback, useRef,useEffect} from 'react'
import {LineChart} from "react-native-gifted-charts"
import AntDesign from '@expo/vector-icons/AntDesign';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import {useNavigation} from "@react-navigation/native"
import * as SQLite from 'expo-sqlite';

import EvilIcons from '@expo/vector-icons/EvilIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import Database from '../components/Database';

const Home = () => {
    const navigation= useNavigation()
    const [date,setDate]= useState(new Date())
    const [mode, setMode] = useState('date');
  const [show, setShow] = useState(false);

  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setDate(currentDate);
    console.log(currentDate)
    setShow(false);
    
  };

  const showMode = (currentMode) => {
    setShow(true);
    setMode(currentMode);
  };

  const showDatepicker = () => {
    showMode('date');
  };

  const showTimepicker = () => {
    showMode('time');
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


    const [categories,setCategories]= useState([
        {name:"All"},
        {name:"Food",image:"https://www.foodiesfeed.com/wp-content/uploads/2023/06/burger-with-melted-cheese.jpg",amount:4000},
        {name:"Grocery",image:"https://www.foodiesfeed.com/wp-content/uploads/2023/06/burger-with-melted-cheese.jpg",amount:4000},
        {name:"Festive",image:"https://www.foodiesfeed.com/wp-content/uploads/2023/06/burger-with-melted-cheese.jpg",amount:4000},
        {name:"Study",image:"https://www.foodiesfeed.com/wp-content/uploads/2023/06/burger-with-melted-cheese.jpg",amount:4000},
        {name:"Mis",image:"https://www.foodiesfeed.com/wp-content/uploads/2023/06/burger-with-melted-cheese.jpg",amount:4000}
    ])
 
    const data = [{value: 15}, {value: 30}, {value: 26}, {value: 40},{value: 15}, {value: 30}, {value: 26}, {value: 40}];

    const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
    ];
    const [isCategoryPicker,setIsCategoryPicker]= useState(false)
    let currentDate = new Date();
    const [pickCategory,setPickCategory]= useState("All")
    
   

    const [targetElement,setTargetElement]= useState({})
    const [isTargetModal,setIsTargetModal]= useState(false)

        const wd= Dimensions.get("window")

        const [categoryData,setCategoryData]= useState([])
        const [expenseType,setExpenseType]= useState([])
        const [expenseTypeMonth,setExpenseTypeMonth]= useState([])
        const [expenseTypeYear,setExpenseTypeYear]= useState([])

        const [dayWise,setDayWise]= useState([])

        const [payMethod,setPayMethod]= useState([])
        const [day,setDay]=useState(0)
        const [month,setMonth]= useState(0)
        const [year,setYear]= useState(0)

        const calendar=async()=>{
            try{
                const d=new Date()
                setDay(d.getDate())
                setMonth((d.getMonth()+1))
                setYear(d.getFullYear())
            }catch(error){
                console.log(error)
            }
        }
        const createDb=async()=>{
            try{
                const db= await SQLite.openDatabaseAsync("mydb")
                await db.execAsync("CREATE TABLE IF NOT EXISTS items (id TEXT PRIMARY KEY , label TEXT,value TEXT, category TEXT);")
                // await db.closeAsync();
            }catch(error){
                console.log(error)
            }
        }
        const fetchDb=async(id)=>{
            try{
                const thisDay = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const thisMonth=`${year}-${String(month).padStart(2, '0')}`
                const thisYear=`${year}`

                const db= await SQLite.openDatabaseAsync("mydb")

                const categoryData= await db.getAllAsync("SELECT  SUM(transactions.price) as total, items.category from transactions JOIN items on transactions.item=items.label AND strftime('%Y-%m', transactions.date/1000, 'unixepoch') = ? AND expenseType='spent' group by items.category ",thisMonth);
                setCategoryData(categoryData)

                const a=await db.getAllAsync("SELECT et.type, COALESCE(SUM(t.price), 0) AS total FROM ( SELECT 'earn' AS type UNION ALL SELECT 'spent' UNION ALL SELECT 'lent' UNION ALL SELECT 'borrow') AS et LEFT JOIN transactions  AS t ON et.type = t.expenseType  AND strftime('%Y-%m-%d', t.date/1000, 'unixepoch') = ?  GROUP BY et.type ",thisDay)
                setExpenseType(a)
                const expenseTypeMonth=await db.getAllAsync("SELECT et.type, COALESCE(SUM(t.price), 0) AS total FROM ( SELECT 'earn' AS type UNION ALL SELECT 'spent' UNION ALL SELECT 'lent' UNION ALL SELECT 'borrow') AS et LEFT JOIN transactions  AS t ON et.type = t.expenseType  AND strftime('%Y-%m', t.date/1000, 'unixepoch') = ?  GROUP BY et.type ",thisMonth)
                setExpenseTypeMonth(expenseTypeMonth)
                const expenseTypeYear=await db.getAllAsync("SELECT et.type, COALESCE(SUM(t.price), 0) AS total FROM ( SELECT 'earn' AS type UNION ALL SELECT 'spent' UNION ALL SELECT 'lent' UNION ALL SELECT 'borrow') AS et LEFT JOIN transactions  AS t ON et.type = t.expenseType  AND strftime('%Y', t.date/1000, 'unixepoch') = ?  GROUP BY et.type ",thisYear)
                setExpenseTypeYear(expenseTypeYear)

                const payMethod= await db.getAllAsync("SELECT et.tp as type , COALESCE(SUM(t.price), 0) as total from ( SELECT 'online' AS tp UNION ALL SELECT 'cash' UNION ALL SELECT 'both')  AS et LEFT JOIN transactions AS t ON et.tp = t.paymentMethod AND strftime('%Y-%m', t.date/1000, 'unixepoch') = ? AND expenseType='spent' GROUP BY et.tp",thisMonth)
                setPayMethod(payMethod)

                
                const dayWise= await db.getAllAsync("SELECT SUM(price) AS value, SUM(price) AS dataPointText, strftime('%d', date/1000, 'unixepoch') as label FROM transactions WHERE expenseType='spent' AND strftime('%Y-%m', date/1000, 'unixepoch') = ?  GROUP BY strftime('%Y-%m-%d', date/1000, 'unixepoch')",thisMonth)
                setDayWise(dayWise)
                await db.closeAsync();
            }catch(error){
                console.log(error)
            }
         }

         useEffect(()=>{
            calendar()
         },[])
        useEffect(()=>{
            if(day){
                createDb()
                fetchDb()
            }
            
        },[day])
  return (
    <View className="flex-1">
      <Database />
        <ScrollView className=" " >
            {/* <View className="items-center p-2 mt-1">
                <Text className="font-medium text-[22px]">₹ 12345</Text>
            </View> */}
           
                {/* Report as spent, gain */}
            <ScrollView horizontal={true} className="mt-2" showsHorizontalScrollIndicator={false}
                snapToInterval={wd?.width} // snap to the width of each card
                decelerationRate="fast"  // Adjust for desired scrolling speed/feel
                snapToAlignment="start"
            >
                <View className="w-[100vw]">
                    <View className="p-4   bg-gray-200 m-4 rounded-md">
                        <Text className="font-medium text-blue-500 mb-4">Today</Text>
                        <View className="flex flex-row flex-wrap  justify-evenly gap-3">
                                {
                                    expenseType?.map((it,index)=>{
                                        return(
                                            <TouchableOpacity key={index}  className={`flex flex-col  p-2 ${it?.type=="spent"?"bg-red-200":(it?.type=="lent"?"bg-purple-200":(it?.type=="borrow"?"bg-slate-300":"bg-green-200"))}  rounded-lg w-[45%]`}>
                                        <Text className="text-[14px] ">{it?.type}</Text>
                                        <Text className="text-[16px] font-medium">₹ {it?.total}</Text>
                                             </TouchableOpacity>
                                        )
                                    })
                                }
                        </View>
                    </View>
                </View>
                <View className="w-[100vw]">
                    <View className="p-4  bg-gray-200 m-4 rounded-md">
                        <Text className="font-medium text-blue-500 mb-4">{months[currentDate.getMonth()]}' {currentDate.getFullYear()}</Text>
                        <View className="flex flex-row flex-wrap  justify-evenly gap-3">
                        {
                                    expenseTypeMonth?.map((it,index)=>{
                                        return(
                                            <TouchableOpacity key={index}  className={`flex flex-col  p-2 ${it?.type=="spent"?"bg-red-200":(it?.type=="lent"?"bg-purple-200":(it?.type=="borrow"?"bg-slate-300":"bg-green-200"))}  rounded-lg w-[45%]`}>
                                        <Text className="text-[14px] ">{it?.type}</Text>
                                        <Text className="text-[16px] font-medium">₹ {it?.total}</Text>
                                             </TouchableOpacity>
                                        )
                                    })
                                }
                        </View>
                    </View>
                 </View>
                <View className="w-[100vw]">
                    <View className="p-4  bg-gray-200 m-4 rounded-md">
                        <Text className="font-medium text-blue-500 mb-4"> {currentDate.getFullYear()}</Text>
                        <View className="flex flex-row flex-wrap  justify-evenly gap-3">
                        {
                                    expenseTypeYear?.map((it,index)=>{
                                        return(
                                            <TouchableOpacity key={index}  className={`flex flex-col  p-2 ${it?.type=="spent"?"bg-red-200":(it?.type=="lent"?"bg-purple-200":(it?.type=="borrow"?"bg-slate-300":"bg-green-200"))}  rounded-lg w-[45%]`}>
                                        <Text className="text-[14px] ">{it?.type}</Text>
                                        <Text className="text-[16px] font-medium">₹ {it?.total}</Text>
                                             </TouchableOpacity>
                                        )
                                    })
                                }
                        </View>
                    </View>
                </View>
            </ScrollView>


            <Text className="font-medium text-blue-500 mb-4 mx-4">{months[currentDate.getMonth()]}' {currentDate.getFullYear()}</Text>
                {/* cash & online percentage */}
                 <View className="p-1  bg-gray-100 m-0 mx-4 rounded-md">
                <View className="flex flex-row flex-wrap  justify-center gap-1">
                                {payMethod?.map((pay,index)=>{
                                    return(
                                    <TouchableOpacity key={index} className={`flex flex-col  p-2 ${pay?.type=="cash"?"bg-red-200":(pay?.type=="online"?"bg-green-200":"bg-blue-200")} rounded-lg flex-1`}>
                                        <Text className="text-[14px] font-medium">{pay?.type}</Text>
                                        <Text className="text-[14px] italic">₹ {pay?.total}</Text>
                                    </TouchableOpacity>
                                    )
                                })}
                </View>
            </View>


        {/* Filter */}
        {/* <View className="p-3 px-6 flex flex-row justify-between">
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
            <TouchableOpacity className=" self-start flex flex-row gap-3 items-center" onPress={()=>setIsCategoryPicker(true)}>
                <Text>{pickCategory}</Text>
                <MaterialIcons name="category" size={24} color="black" />
            </TouchableOpacity>

        </View> */}

        {/* Category Modal */}
        <Modal
            transparent={true}
            visible={isCategoryPicker}
            onRequestClose={()=>setIsCategoryPicker(false)}
        >
            <View className="bg-white w-[70vw] h-[30vh] mx-auto my-auto elevation-xl rounded-lg flex flex-row p-4 px-10 gap-1">
                <TouchableOpacity onPress={()=>setIsCategoryPicker(false)} className="absolute right-2 top-2 z-40">
                    <AntDesign name="closecircleo" size={24} color="black" />
                </TouchableOpacity>
                <ScrollView className="text-center " showsVerticalScrollIndicator={false} >
                    {categories?.map((category)=>{
                        return(
                            <TouchableOpacity onPress={()=>{setPickCategory(category.name);setIsCategoryPicker(false)}} key={category.name} className={category.name==pickCategory?"items-center my-1 py-1 bg-red-200 rounded-lg":" items-center my-1 py-1"}>
                                <Text>{category.name}</Text>
                            </TouchableOpacity>
                        )
                    })}
                </ScrollView>
            </View>
        </Modal>


            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="p-2 pt-4 bg-blue-50 rounded-xl mx-auto">
                <LineChart data={dayWise} hideRules   areaChart1 scrollable scrollToEnd />
                {/* <LineChart data={dayWise} hideDataPoints areaChart1  hideYAxisText hideRules spacing={40}/> */}
                </ScrollView>

                {/* Category data */}
            <View className="p-4 flex  flex-row flex-wrap  justify-evenly gap-3 bg-gray-200 m-4 rounded-md ">
                {categoryData?.map((category,index)=>{
                    return(
                        <TouchableOpacity key={index} className="flex flex-row gap-3 p-2 items-center bg-purple-300 rounded-lg w-[45%]">
                            <View>
                            <Text className="text-[14px] font-medium">{category?.category}</Text>
                            <Text className="text-[13px]">₹ {category?.total}</Text>
                            </View>
                            
                        </TouchableOpacity>
                    )
                })}
            </View>
           
           {/* Location */}
            <TouchableOpacity onPress={()=> navigation.navigate("Location")} className="mb-4 mx-10 bg-blue-700 p-3 rounded-lg">
                <Text className="text-white text-center">Location Wise Data</Text>
            </TouchableOpacity>
            <View>
             <View className="mb-[112px] flex flex-row flex-wrap mx-4 gap-2 justify-center">
                    <TouchableOpacity onPress={()=> navigation.navigate("Additem")} className=" p-2 rounded-lg bg-orange-500  items-center">
                    <Text className="font-medium text-white">Add Item</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={()=> navigation.navigate("Download")} className=" p-2 rounded-lg bg-orange-500 items-center">
                    <Text className="font-medium text-white">Download Data</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={()=> navigation.navigate("Support")} className=" p-2 rounded-lg bg-orange-500 items-center">
                    <Text className="font-medium text-white">Developer Support</Text>
                </TouchableOpacity>
                </View>
            
        </View>
        </ScrollView>
    </View>
  )
}

export default Home

