import { View, Text,Image ,StyleSheet,FlatList,TouchableOpacity,ScrollView, Alert, TextInput,Modal, Pressable} from 'react-native'
import React,{useState,useEffect} from 'react'
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Feather from '@expo/vector-icons/Feather';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import CustomButton from "../components/CustomButton"
import * as SQLite from 'expo-sqlite';
import * as Contacts from 'expo-contacts';


  
const MoneyBuddy = ({navigation}) => {
    const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    (async () => {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status === 'granted') {
        const { data } = await Contacts.getContactsAsync({
          fields: [Contacts.Fields.PhoneNumbers],
        });

        if (data.length > 0) {
          setContacts(data);
          setFilteredContacts(data);
        }
      }
    })();
  }, []);

  const handleSearch = (text) => {
    setSearch(text);
    const lower = text.toLowerCase();
    const filtered = contacts.filter((contact) =>
      contact.name?.toLowerCase().includes(lower) ||
      contact.phoneNumbers?.some((num) =>
        num.number.replace(/\s|-/g, '').includes(lower.replace(/\s|-/g, ''))
      )
    );
    setFilteredContacts(filtered);
  };

    const [isModalVisible,setIsModalVisible]= useState(false)
    const [isEdit,setIsEdit]= useState(false)
    const [editContent,setEditContent]= useState({})
    const closeModal=()=>{
        setIsModalVisible(false)
        setIsEdit(false)
        setEditContent({})
    }
    const [buddies,setBuddies] = useState([
    ])  

    const removeBuddy=async(id)=>{
        try{
            const db= await SQLite.openDatabaseAsync("mydb")
            await db.runAsync("DELETE FROM buddies WHERE id = ?",id);
            const filtered= buddies.filter((buddy)=> buddy.id!==id)
            setBuddies([...filtered])
            await db.closeAsync();
        }catch(error){
            console.log(error)
        }
    }

    const handleDelete=(id)=>{
        try{
            Alert.alert(
                "Delete Buddy",
                "Are you sure want to delete your Money Buddy?",
                [{text:"Cancel",style:"cancel"},{text:"Okay",style:"destructive",onPress:()=>{removeBuddy(id)}}]
            )
        }catch(error){
            console.log(error.message)
        }
    }

    const handleSave=async ()=>{
        try{
            if(editContent?.name){
                const db= await SQLite.openDatabaseAsync("mydb")
                if(isEdit){
                    const filtered= buddies.map((buddy)=>{
                        if(buddy.id==editContent.id){
                            return editContent;
                        }else{
                            return buddy
                        }
                    })
                    await db.runAsync("UPDATE buddies SET name = ? , mobile = ? WHERE id = ?",editContent?.name, editContent?.mobile, editContent?.id)
                    setBuddies([...filtered])
                }else{
                    await db.runAsync("INSERT INTO buddies (id,name,mobile) VALUES (?,?,?)",editContent?.id,editContent?.name?.trim(),editContent?.mobile);
                    setBuddies([...buddies,editContent])
                }
                closeModal()
                await db.closeAsync();
            }else{
                Alert.alert("Blank Field","Please enter Buddy Name")
            }
            
        }catch(error){
            console.log(error)
            Alert.alert("Error","There is an error in saving data.")
        }
    }

    const createDb=async()=>{
        try{
            const db= await SQLite.openDatabaseAsync("mydb")
            db.execAsync("CREATE TABLE IF NOT EXISTS buddies (id INTEGER PRIMARY KEY , name TEXT, mobile TEXT);")
            // await db.closeAsync();
        }catch(error){
            console.log(error)
        }
    }
     const fetchDb=async()=>{
        try{
            const db= await SQLite.openDatabaseAsync("mydb")
            const data=await db.getAllAsync("SELECT * from buddies")
            setBuddies(data)
            await db.closeAsync();
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
    <View className="flex-1 ">

      {/* <View className="flex justify-end items-start px-4 pt-4">
                <TouchableOpacity onPress={()=>{setIsModalVisible(true); setEditContent({id:Date.now(),name:"",mobile:""})}} className="bg-blue-500 text-center flex justify-center items-center p2 w-16 h-16 rounded-full">
                <FontAwesome6 name="add"  size={30} color="white" />
                </TouchableOpacity>
            </View> */}

        {/* <ScrollView >
            <View className="flex  gap-2 p-5  pb-20" >
                {buddies?.map((buddy,index)=>{
                    return(
                        <View key={buddy.id} className="border-b-[1px] border-gray-400  p-3 ">
                            <Pressable onPress={()=>navigation.navigate("BuddyHistory",{name:buddy?.name,mobile:buddy?.mobile})}>
                                <Text className="text-center font-bold text-lg ">{buddy?.name}</Text>
                                <Text className="text-center text-sx mb-2 italic ">{buddy?.mobile}</Text>
                                </Pressable>
                            <View className="flex flex-row justify-evenly">
                                <TouchableOpacity onPress={()=>{setEditContent(buddy);setIsEdit(true);setIsModalVisible(true)}}  className=" p-2 bg-blue-500 flex flex-row gap-2 rounded-lg border-[1px] border-white">
                                    <Feather name="edit" size={17} color="white" />
                                    <Text className="text-white">Edit</Text>
                                </TouchableOpacity>
                                 <TouchableOpacity onPress={()=>handleDelete(buddy.id)}  className=" p-2 bg-red-100 flex flex-row rounded-lg  border-[1px] border-white">
                                 <MaterialIcons name="delete-outline" size={22} color="red" />
                                    <Text>Delete</Text>
                                </TouchableOpacity>
                            </View>
                            
                        </View>
                    )
                })}
            </View>
        </ScrollView> */}
            
            <View style={styles.wrapper}>
      <TextInput
        style={styles.searchBar}
        placeholder="Search by name or number"
        value={search}
        onChangeText={handleSearch}
      />
      <FlatList
        data={filteredContacts}
        keyExtractor={(item) => item.id}
        renderItem={(itemData)=>{
            return  <TouchableOpacity style={styles.item} onPress={()=>{if(itemData?.item?.phoneNumbers?.[0]?.number)navigation.navigate("BuddyHistory",{name:itemData?.item?.name,mobile:itemData?.item?.phoneNumbers?.[0]?.number,key:itemData?.item?.lookupKey})}}>
            <Text style={styles.name}>{itemData?.item?.name}</Text>
            <Text style={styles.phone}>
              {itemData?.item?.phoneNumbers?.[0]?.number || 'No phone number'}
            </Text>
          </TouchableOpacity>
        }}
        contentContainerStyle={styles.container}
        ListFooterComponent={()=>{
            return (
                <View className="h-[100px] ">
                    </View>
            )
            }}
      />
    </View>
      
    

            <Modal
            visible={isModalVisible}
            animationType='slide'
            transparent={true}
            onRequestClose={closeModal}
            >
                <View className="bg-white w-[95vw] mx-auto rounded-lg h-[95vh] gap-3 elevation-xl my-auto">
                   
                    <TouchableOpacity onPress={closeModal} className=" self-end m-2 ">
                        <View className="flex flex-row gap-1 p-2 bg-red-50 self-end rounded-lg ">
                            <Ionicons name="close-circle-outline" size={24} color="black" />
                            <Text>Close</Text>
                        </View>
                    </TouchableOpacity>
                    <Text className="text-lg font-bold text-center">{isEdit?"Edit Money Buddy":"Add Money Buddy"}</Text>
                        

                    <View className="px-4 gap-2">
                        <View className="flex flex-row gap-2 items-center justify-between">
                            <Text className="font-medium text-blue-500">Name :</Text>
                            <TextInput value={editContent?.name} onChangeText={(e)=>setEditContent({...editContent, name:e})} placeholder='Enter Name' className=" w-[80%] border-[1px] border-gray-600 p-2 px-4 rounded-lg"></TextInput>
                        </View>
                        <View className="flex flex-row gap-2 items-center justify-between">
                            <Text className="font-medium text-blue-500">Mobile :</Text>
                            <TextInput value={editContent?.mobile} onChangeText={(e)=>setEditContent({...editContent, mobile:e})} maxLength={10} keyboardType='numeric' placeholder='Enter Mobile No' className="  w-[80%] border-[1px] border-gray-600 p-2 px-4 rounded-lg"></TextInput>
                        </View>
                        
                        <View className=" rounded-lg bg-blue-500 m-1 overflow-hidden mx-8 mt-8">
                            <Pressable android_ripple={{color:'blue'}} onPress={handleSave} className="p-3 items-center">
                                <Text className="text-white">{isEdit?"Edit":"Save"}</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
    </View>
  )
}

export default MoneyBuddy

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        // paddingTop: 50,
      },
      container: {
        paddingHorizontal: 16,
      },
      searchBar: {
        margin: 16,
        padding: 10,
        borderColor: '#aaa',
        borderWidth: 1,
        borderRadius: 8,
      },
      item: {
        padding: 10,
        borderBottomWidth: 1,
        borderColor: '#ccc',
      },
      name: {
        fontSize: 16,
        fontWeight: 'bold',
      },
      phone: {
        fontSize: 14,
        color: '#555',
      },
  });