import { View, Text,Image ,TouchableOpacity,ScrollView, Alert, TextInput,Modal, Pressable} from 'react-native'
import React,{useState,useEffect} from 'react'
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Feather from '@expo/vector-icons/Feather';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import CustomButton from "../components/CustomButton"
import * as SQLite from 'expo-sqlite';

const MoneyBuddy = ({navigation}) => {
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
        }catch(error){
            console.log(error)
        }
    }
     const fetchDb=async()=>{
        try{
            const db= await SQLite.openDatabaseAsync("mydb")
            const data=await db.getAllAsync("SELECT * from buddies")
            setBuddies(data)
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

      <View className="flex justify-end items-start px-4 pt-4">
                <TouchableOpacity onPress={()=>{setIsModalVisible(true); setEditContent({id:Date.now(),name:"",mobile:""})}} className="bg-blue-500 text-center flex justify-center items-center p2 w-16 h-16 rounded-full">
                <FontAwesome6 name="add"  size={30} color="white" />
                </TouchableOpacity>
            </View>

        <ScrollView >
            <View className="flex  gap-2 p-5  pb-20" >
                {buddies?.map((buddy,index)=>{
                    return(
                        <View key={buddy.id} className="bg-blue-200 border-gray-400 border-[1px] p-3 rounded-lg">
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
        </ScrollView>
            

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