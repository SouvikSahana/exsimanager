import { View, Text, TextInput, TouchableOpacity, FlatList, Alert, SectionList} from 'react-native'
import React, { useEffect, useState } from 'react'
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as SQLite from 'expo-sqlite';


const AddItem = () => {
    const [label,setLabel]= useState("")
    const [category,setCategory]= useState("")
    const [items,setItems]= useState([])
    

    const removeItem=async(id)=>{
        try{
            const db= await SQLite.openDatabaseAsync("mydb")
            await db.runAsync("DELETE FROM items WHERE id = ?",id);
            const filtered= items.filter((item)=>item.id!==id)
            setItems([...filtered])
            await db.closeAsync();
        }catch(error){
            console.log(error)
        }
    }
    const handleDelete=(id)=>{
        try{
            Alert.alert("Delete Item","Are you sure want to delete this item?",
                [{text:"Cancel", style:'cancel'},{text:"Delete",style:'destructive',onPress:()=>removeItem(id)}]
            )
        }catch(error){
            console.log(error)
        }
    }
    const handleAdd=async()=>{
        try{
            if(label && category){
                const isPresent= items.filter((it)=>it.label?.toLowerCase()==label?.toLowerCase()?.trim())
                if(isPresent.length<1){
                    const db= await SQLite.openDatabaseAsync("mydb")
                    const id= Date.now()
                    setItems([...items,{
                        id:id ,
                        label: label,
                        category: category
                    }])
                    await db.runAsync("INSERT INTO items (id,label,value,category) VALUES (?,?,?,?)",id,label,label,category);
                    setCategory("")
                    setLabel("")
                    await db.closeAsync();
                }else{
                    Alert.alert("Duplicate Item","Item already present with this name")
                }
            }else{
                Alert.alert("Blank field","Please fill blanked filled")
            }
        }catch(error){

        }
    }

    const createDb=async()=>{
        try{
            const db= await SQLite.openDatabaseAsync("mydb")
            await db.execAsync("CREATE TABLE IF NOT EXISTS items (id TEXT PRIMARY KEY, label TEXT,value TEXT, category TEXT);")
            // await db.closeAsync();
        }catch(error){
            console.log(error)
        }
    }
     const fetchDb=async()=>{
        try{
            const db= await SQLite.openDatabaseAsync("mydb")
            const data=await db.getAllAsync("SELECT * from items")
            setItems(data)
            await db.closeAsync();
        }catch(error){
            console.log(error)
        }
     }
     const dropTable=async()=>{
        try{
            const db= await SQLite.openDatabaseAsync("mydb")
            db.execAsync("DROP TABLE items")
            await db.closeAsync();
        }catch(error){
            console.log(error)
        }
     }
     useEffect(()=>{
        createDb()
        fetchDb()
     },[])

    //  const groupedData = items.reduce((acc, item) => {
    //     const existingSection = acc.find(section => section.title === item.category);
    //     if (existingSection) {
    //       existingSection.data.push(item);
    //     } else {
    //       acc.push({ title: item.category, data: [item] });
    //     }
    //     return acc;
    //   }, []);
    
    const categoryMap = items.reduce((acc, item) => {
        if (!acc[item.category]) {
          acc[item.category] = item.label;
        } else {
          acc[item.category] += `  |  ${item.label}`;
        }
        return acc;
      }, {});
      
      // Convert to SectionList format
      const groupedData = Object.keys(categoryMap).map(category => ({
        title: category,
        data: [{ id: category, label: categoryMap[category] }],
      }));

     
  return (
    <View className="flex flex-1">
        <View className="p-2 px-4 gap-2">
            <TextInput value={label} onChangeText={(e)=>setLabel(e)} placeholder='Enter item name' className="border-[1px] border-black px-2 py-4 rounded-lg"/>
            <TextInput value={category} onChangeText={(e)=>setCategory(e)} placeholder='Enter category' className="border-[1px] border-black px-2 py-4 rounded-lg"/>
            <TouchableOpacity disabled={label=="" && category==""} onPress={handleAdd} className="items-center bg-blue-600 rounded-lg p-2 w-[70%] mx-auto">
                <Text className="text-white">Save Item</Text>
            </TouchableOpacity>
        </View>
        {/* <FlatList
            data={items}
            keyExtractor={(item)=> item.id}
            className="p-2 px-4 flex-1"
            ListFooterComponent={()=>{
                return (
                    <View className="h-[100px] ">
                        </View>
                )
            }}
            renderItem={(itemData)=>{
                return( <View className="flex flex-row mt-1 gap-2 bg-green-300 p-2 rounded-lg">
                            <View className="flex-1 flex-row flex gap-1 items-center">
                                <Text className="flex-1 font-semibold">{itemData.item.label}</Text>
                                <Text className="text-xs italic">{itemData.item.category}</Text>
                            </View>
                            
                            <TouchableOpacity onPress={()=>handleDelete(itemData.item.id)}>
                                <MaterialIcons name="delete" size={24} color="red" />
                            </TouchableOpacity>
                            
                    </View>)
            }}
         /> */}

<SectionList
  sections={groupedData}
  keyExtractor={(item) => item.id}
  renderSectionHeader={({ section: { title } }) => (
    <Text className="font-bold text-lg mt-2 ml-4 text-blue-700">{title}</Text>
  )}
  renderItem={({ item,index }) => {
    return  <View
          key={item?.data?.id}
          className="bg-blue-300 p-2 rounded-lg gap-4 flex-row justify-between items-center m-1 mx-4"
        >
          <Text className="font-semibold">{item?.label}</Text>
        </View>
}
  }
  ListFooterComponent={() => <View className="h-[100px]" />}
/>

    </View>
  )
}

export default AddItem