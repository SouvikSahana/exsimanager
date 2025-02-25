import { View, Text, TouchableOpacity,TextInput, StyleSheet, Alert } from 'react-native'
import React,{useEffect, useState} from 'react'
import AntDesign from '@expo/vector-icons/AntDesign';
import EvilIcons from '@expo/vector-icons/EvilIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Dropdown } from 'react-native-element-dropdown';
import {useNavigation} from "@react-navigation/native"
import * as SQLite from 'expo-sqlite';
import * as Location from 'expo-location';

const Expense = ({route}) => {
    const [locations,setLocations]= useState([])
    const [location, setLocation] = useState();
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    async function getCurrentLocation() {
      
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location.coords)
    }

    getCurrentLocation();
  }, []);


    const navigation= useNavigation()

    const [items,setItems]= useState([])
    const [prices,setPrices]= useState([100,200,300,400,500])
    const [isEdit,setIsEdit]= useState(false)
    const [date,setDate]= useState(new Date())
    const [mode, setMode] = useState('date');
  const [show, setShow] = useState(false);
  const [buddies,setBuddies]= useState([])

  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setDate(currentDate);
    // console.log(currentDate)
    setContent({...content, date:selectedDate.getTime()})
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


    const [content,setContent]= useState({
        id: Date.now(),
        date: Date.now(),
        item:"",
        price:"",
        description:"",
        expenseType:"spent",
        paymentMethod:"online",
        latitude: null,
        longitude: null,
        tag: null
    })

    useEffect(()=>{
        const edit= route.params?.isEdit
        setIsEdit(edit)
        if(edit){
            setContent(route.params.data)
            setDate(new Date(route.params.data?.date))
            console.log(route.params.data)
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

      const paymentMode=[
        {label:"Online", value:"online"},
        {label:"Cash", value:"cash"},
        {label:"Both", value:"both"}
      ]
      const expenseType=[
        {label:"Earn",value:"earn"},
        {label:"Spent", value:"spent"},
        {label:"Lent", value:"lent"},
        {label:"Borrow", value:"borrow"}
      ]
    //   const items = [  
    //     { label: 'Food', value: 'food' },
    //     { label: 'Travel', value: 'travel' },
    //     { label: 'Accommodation', value: 'accommodation' },
    //     { label: 'Other', value: 'other' },
    // ];
      const [isFocus, setIsFocus] = useState(false);


      const createDb=async()=>{
        try{
            const db= await SQLite.openDatabaseAsync("mydb")
            db.execAsync("CREATE TABLE IF NOT EXISTS transactions (id INTEGER PRIMARY KEY , date INTEGER, item TEXT,price TEXT, description TEXT, expenseType TEXT, paymentMethod TEXT, latitude INTEGER, longitude INTEGER, tag TEXT);")
            db.execAsync("CREATE TABLE IF NOT EXISTS locations (id INTEGER PRIMARY KEY autoincrement, latitude INTEGER, longitude INTEGER);")
            db.execAsync("CREATE TABLE IF NOT EXISTS buddies (id INTEGER PRIMARY KEY , name TEXT, mobile TEXT);")
            // await db.closeAsync();
        }catch(error){
            console.log(error)
        }
    }
    const dropTable=async()=>{
        try{
            const db= await SQLite.openDatabaseAsync("mydb")
            db.execAsync("DROP TABLE transactions")
            await db.closeAsync();
        }catch(error){
            console.log(error)
        }
     }
     
     const fetchDb=async(id)=>{
        try{
            var db= await SQLite.openDatabaseAsync("mydb")
        }catch(error){
            console.log(error)
        }
        try{
            const data= await db.getAllAsync("SELECT * FROM buddies");
            const filtered= await data?.map((it)=>{
                return {
                    label: it.name,
                    value: it.name
                }
            })
            setBuddies(filtered)
        }catch(error){
            console.log(error)
        }
        try{
            const fetchItems=await db.getAllAsync("SELECT * from items")
            setItems(fetchItems)
        }catch(error){
            console.log(error)
        }
        try{
            const fetchLocations= await db.getAllAsync("SELECT * FROM locations");
            setLocations(fetchLocations)
        }catch(error){
            console.log(error)
        }
        try{
            await db.closeAsync();
        }catch(error){
            console.log(error)
        }
     }
     const handleSave=async()=>{
        try{
            if(content?.item && content?.price){
                const db= await SQLite.openDatabaseAsync("mydb")
                if((content?.expenseType=="lent" || content?.expenseType=="borrow")&& content?.tag==""){
                    Alert.alert("Blank Field","Please fill with person name")
                }else{
                    if(isEdit){
                        await db.runAsync("UPDATE transactions SET date = ? ,item = ? ,price = ? ,description = ? ,expenseType = ? ,paymentMethod = ? ,latitude = ? , longitude = ? , tag = ? WHERE id = ?",
                             content?.date, content?.item, content?.price, content?.description, content?.expenseType, content?.paymentMethod,
                            content?.latitude, content?.longitude, content?.tag,content?.id
                        )
                    }else{
                         await db.runAsync("INSERT INTO transactions (id,date,item,price,description,expenseType,paymentMethod,latitude, longitude, tag) VALUES (?,?,?,?,?,?,?,?,?,?)",
                            content?.id, content?.date, content?.item, content?.price, content?.description, content?.expenseType, content?.paymentMethod,
                            location?.latitude, location?.longitude, content?.tag
                         )
                         const filterLocation= locations.filter((l)=>l.latitude==location?.latitude && l.longitude==location?.longitude)
                         if(filterLocation.length>0){
                            console.log("Already present this location")
                         }else{
                            await db.runAsync("INSERT INTO locations (latitude, longitude) VALUES (?,?)", location?.latitude, location?.longitude);
                         }
                    }
                    await navigation.reset({
                        index: 0,  // Set TransactionHistory as the first screen
                        routes: [{ name: "TransactionHistory", params: { refresh: true } }],
                      });
                }
                await db.closeAsync();
            }else{
                Alert.alert("Blank Field","Plaese fill the blank fields")
            }
        }catch(error){
            console.log(error)
        }
     }
     useEffect(()=>{
        createDb()
        // dropTable()
        fetchDb()
      },[])
  return (
    <View className="flex-1 pt-4">
        <View className="px-8 flex flex-row justify-between items-center">
            <View>
                <View className="flex flex-row gap-2">
                <Text className="text-[20px] font-medium text-blue-600">Add</Text>
                <Dropdown
                    style={styles.dropdownNormal}
                    placeholderStyle={styles.placeholderStyle}
                    selectedTextStyle={styles.selectedTextStyleHeader}
                    inputSearchStyle={styles.inputSearchStyle}
                    iconStyle={styles.iconStyle}
                    data={expenseType}
                    // search
                    maxHeight={300}
                    labelField="label"
                    valueField="value"
                    searchPlaceholder="Search..."
                    value={content?.expenseType}
                    onChange={item => {
                        setContent({...content,expenseType:item.value})
                    }}
                />
                </View>
                
                <View className="flex flex-row gap-2">
                    <Text className=" pl-2">{isEdit?formatDate(content?.date):formatDate(date?.getTime())}</Text>
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
            <TouchableOpacity className=" gap-2 items-center p-2 bg-green-200 rounded-xl">
               
                <Dropdown
                    style={styles.dropdown}
                    placeholderStyle={styles.placeholderStyle}
                    selectedTextStyle={styles.selectedTextStyle}
                    inputSearchStyle={styles.inputSearchStyle}
                    iconStyle={styles.iconStyle}
                    data={paymentMode}
                    // search
                    maxHeight={300}
                    labelField="label"
                    valueField="value"
                    placeholder={!isFocus ? 'Select item' : '...'}
                    searchPlaceholder="Search..."
                    value={content?.paymentMethod}
                    onFocus={() => setIsFocus(true)}
                    onBlur={() => setIsFocus(false)}
                    onChange={item => {
                        setContent({...content,paymentMethod:item.value})
                        setIsFocus(false);
                    }}
                    renderLeftIcon={() => (
                        <AntDesign
                            style={styles.icon}
                            color="black"
                            name="Safety"
                            size={20}
                        />
                    )}
                />
            </TouchableOpacity>
        </View>

        {/* Search item option */}
        <View className="mx-8 text-xl border-[1px] border-gray-500 p-2 rounded-lg my-4">
        <Dropdown
                    style={styles.dropdownSearch}
                    placeholderStyle={styles.placeholderStyle}
                    selectedTextStyle={styles.selectedTextStyle}
                    inputSearchStyle={styles.inputSearchStyle}
                    iconStyle={styles.iconStyle}
                    data={items}
                    search
                    maxHeight={300}
                    labelField="label"
                    valueField="value"
                    value={content?.item}
                    onChange={item => {
                        setContent({...content,item:item?.value})
                        // setIsFocus(false);
                    }}
                />
        </View>

        {/* Tag person */}
        {(content?.expenseType=="lent" || content?.expenseType=="borrow") && (
             <View className="mx-8 text-xl border-[1px] border-gray-500 p-2 rounded-lg my-2">
            <Dropdown
            style={styles.dropdownSearch}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            inputSearchStyle={styles.inputSearchStyle}
            iconStyle={styles.iconStyle}
            data={buddies}
            search
            maxHeight={300}
            labelField="label"
            valueField="value"
            value={content?.tag}
            onChange={item => {
                setContent({...content,tag:item.value})
                // setIsFocus(false);
            }}
            placeholder='Tag person'
        /> </View>
        )
}
        <View className="flex flex-row justify-center items-center gap-1">
            <Text className="text-xl">₹</Text>
            <TextInput placeholder='price' value={content?.price} onChangeText={(e)=>setContent({...content,price:e})} className=" p-2 text-xl " keyboardType='numeric' />
        </View>
        <TextInput multiline value={content?.description} onChangeText={(e)=>setContent({...content,description:e})} placeholder='Add Comment' className=" p-2 text-md text-center"  />

        {/* Price assistance based on category */}
        <View className="flex flex-row flex-wrap justify-evenly my-3">
            {prices?.map((price,index)=>{
                return(
                    <TouchableOpacity key={index} onPress={()=>setContent({...content,price:JSON.stringify(price)})} className="p-2 px-4 bg-pink-200 rounded-lg ">
                        <Text>{price}</Text>
                    </TouchableOpacity>
                )
            })}
        </View>

        {/* add Item button  */}
        <View>
            <TouchableOpacity onPress={handleSave} className="p-2 rounded-lg bg-blue-500 mx-6 items-center">
                <Text className="font-medium text-white">{isEdit?"Edit":"Add"} Expense</Text>
            </TouchableOpacity>
        </View>
    </View>
  )
}

export default Expense

const styles = StyleSheet.create({
    dropdown: {
        height: 35,
        borderColor: 'gray',
        borderWidth: 0.5,
        borderRadius: 8,
        paddingHorizontal: 8,
        width:120
    },
    dropdownSearch: {
        height: 35,
        borderRadius: 8,
        paddingHorizontal: 8,
        width:"100%"
    },
    dropdownNormal:{
        height: 30,
        borderRadius: 8,
        paddingHorizontal: 8,
        width:120
    },
    icon: {
        marginRight: 5,
    },
    placeholderStyle: {
        fontSize: 16,
    },
    selectedTextStyle: {
        fontSize: 16,
    },
    selectedTextStyleHeader:{
        fontSize: 20,
        fontWeight: "bold",
        color:"blue",
    },
    iconStyle: {
        width: 20,
        height: 20,
    },
    inputSearchStyle: {
        height: 40,
        fontSize: 16,
    },
});