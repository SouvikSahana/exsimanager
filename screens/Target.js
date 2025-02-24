import { View, Text,Image ,TouchableOpacity,ScrollView,Modal, TextInput,Pressable, Alert} from 'react-native'
import React,{useEffect, useState} from 'react'
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Feather from '@expo/vector-icons/Feather';
import AntDesign from '@expo/vector-icons/AntDesign';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as SQLite from 'expo-sqlite';


const Target = () => {
    const [isAddModal,setIsAddModal]= useState(false)
    const [isEdit,setIsEdit]= useState(false)
    const [editElement,setEditElement]= useState({})
    
    const closeAddModal=()=>{
        setIsAddModal(false)
        setEditElement({})
        setIsEdit(false)
    }
    const [targets,setTargets]= useState([])

    const handleTarget=async ()=>{
        try{
            if(editElement?.item){
                const db= await SQLite.openDatabaseAsync("mydb")
                if(isEdit){
                    const filtered= targets?.map((target)=>{
                        if(target.id==editElement.id){
                            return {
                                ... target, item: editElement?.item
                            }
                        }else{
                            return target
                        }
                    })
                    await db.runAsync("UPDATE targets SET item = ? WHERE id = ?",editElement?.item?.trim(),editElement?.id)
                    setTargets([...filtered])
                }else{
                    const id= Math.floor(Math.random() * 100)+"00y"+Date.now()
                    const date= Date.now()
                    await db.runAsync("INSERT INTO targets (id,item,date) VALUES (?,?,?)",id,editElement?.item?.trim(),date);
                    setTargets([
                        ... targets,
                        {
                            item: editElement?.item,
                            date:  date,
                            id: id
                        }
                    ])
                }
                closeAddModal()
            }else{
                Alert.alert("Fill Field","Please enter Item name.")
            }
        }catch(error){
            console.log(error)
        }
    }

    const handleRemove=async(id)=>{
        try{
            const db= await SQLite.openDatabaseAsync("mydb")
            await db.runAsync("DELETE FROM targets WHERE id = ?",id);
            const filtered= targets?.filter((target)=> target.id!==id)
            setTargets([...filtered])
        }catch(error){
            console.log(error)
        }
    }
    const handleDelete=(id)=>{
        try{
            Alert.alert("Delete Item","Are you sure to delete this Item?",[{text:"cancel",style:'cancel',onPress:()=>closeAddModal()},{text:"delete",style:"destructive",onPress:()=>handleRemove(id)}])
        }catch(error){
            console.log(error)
        }
    }
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

    const createDb=async()=>{
        try{
            const db= await SQLite.openDatabaseAsync("mydb")
            db.execAsync("CREATE TABLE IF NOT EXISTS targets (id TEXT PRIMARY KEY , item TEXT, date INTEGER);")
            // await db.closeAsync();
        }catch(error){
            console.log(error)
        }
    }
     const fetchDb=async()=>{
        try{
            const db= await SQLite.openDatabaseAsync("mydb")
            const data=await db.getAllAsync("SELECT * from targets")
            setTargets(data)
            await db.closeAsync();
        }catch(error){
            console.log(error)
        }
     }
     const dropTable=async()=>{
        try{
            const db= await SQLite.openDatabaseAsync("mydb")
            db.execAsync("DROP TABLE targets")
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
        {/* add Button */}
        <View className="overflow-hidden rounded-xl m-2 mx-4 w-40">
            <Pressable android_ripple={{color:'blue'}} onPress={()=>{
                setEditElement({item:""});
                setIsAddModal(true)
            }} className="bg-green-600 p-2 rounded-xl  overflow-hidden  ">
                <Text className="text-white text-center">Add Target</Text>
            </Pressable>
        </View>
        <ScrollView >
        <View className="px-2  mt-2  pb-20 ">
                {targets?.map((target)=>{
                    return(
                        <View key={target?.id} className="px-2 pb-2  m-[1px] mx-2 bg-green-200 rounded-lg ">
                            <View className="flex flex-row justify-between items-center "> 
                                <Text className="font-semibold text-lg ">{target?.item}</Text>
                                <Text className="text-xs ">{formatDate(target.date)}</Text>
                            </View>
                            
                            <View className="flex flex-row justify-between items-center px-4 mt-1">
                            <TouchableOpacity onPress={()=>{setIsAddModal(true); setEditElement(target);setIsEdit(true)}} className=" p-1  rounded-full border-[1px] border-white">
                                <Feather name="edit" size={20} color="purple" />
                                </TouchableOpacity>
                            <TouchableOpacity onPress={()=>handleDelete(target?.id)} className="border-[1px] border-white rounded-full p-1">
                                <MaterialIcons name="delete" size={24} color="red" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    )
                })}
            </View>
        </ScrollView>
                

                {/* for add & edit  */}
                <Modal
                    animationType='slide'
                    visible={isAddModal}
                    onRequestClose={closeAddModal}
                    transparent={true}
                    >
                        <View className="bg-white w-[90vw] mx-auto my-auto elevation-xl gap-2 rounded-xl p-4">
                            <TouchableOpacity onPress={closeAddModal} className="z-50 absolute right-4 top-4 bg-gray-200 rounded-full p-2">
                                <AntDesign name="closecircleo" size={17} color="black" />
                            </TouchableOpacity>
                            <Text className="font-bold text-xl text-center mb-4">{isEdit?"Edit Target":"Add Target"}</Text>
                            <View className="flex  gap-2 ">
                                <Text className="font-medium text-lg">Item Name: </Text>
                                <TextInput className="border-[1px]  border-gray-400 p-2 rounded-lg " onChangeText={(e)=>setEditElement({... editElement, item:e})} placeholder='Enter name' value={editElement?.item} />
                            </View>
                            
                            <View className=" rounded-lg bg-blue-500 m-1 overflow-hidden mx-8 mt-6 ">
                                <Pressable onPress={handleTarget} android_ripple={{color:'blue'}} className="p-3 items-center">
                                    <Text className="text-white">{isEdit?"Edit":"Save"}</Text>
                                </Pressable>
                            </View>
                        </View>
                </Modal>
                {/* add money buddy btn */}
            <View className="flex justify-end items-end absolute bottom-[4%] right-8">
                <TouchableOpacity onPress={()=>setIsAddModal(true)} className="bg-orange-300 text-center flex justify-center items-center p2 w-16 h-16 rounded-full">
                <FontAwesome6 name="add"  size={30} color="white" />
                </TouchableOpacity>
            </View>
    </View>
  )
}

export default Target