import { View, Text, Modal , Button, ActivityIndicator, Alert} from 'react-native'
import React,{useState,useEffect} from 'react'
import * as Network from "expo-network"
import axios from "axios"
import * as SQLite from 'expo-sqlite';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import {shareAsync} from "expo-sharing"

const Reloader = () => {
    const [netStatus, setNetStatus] = useState(null);
    const [isOpen,setIsOpen]= useState(false)

    const url="https://raw.githubusercontent.com/SouvikSahana/exsimanager/refs/heads/main/data/item.json"
      
    const checkNetwork = async () => {
        try {
                const status = await Network.getNetworkStateAsync();
                setNetStatus(status);
                const isDone = await AsyncStorage.getItem("sync")
                console.log(isDone)
                if(status?.isConnected && !isDone){
                    const db= await SQLite.openDatabaseAsync("mydb")
                    try{
                        const data= await axios.get(url)
                        const length= await  db.getAllAsync("SELECT COUNT(*) as count FROM items");
                        // console.log(length)
                        if(await data?.data?.length>0 &&  JSON.parse(length[0]?.count)<await data?.data?.length){
                            var count=0;
                            console.log("Runnig db")
                            setIsOpen(true)
                                await data?.data?.forEach(async({ id, label, value, category }) => {
                                    try{
                                        await db.runAsync('INSERT INTO items (id, label, value, category) VALUES (?, ?, ? , ?);', id, label, value, category);
                                    }catch(error){
                                        console.log(error)
                                    }finally{
                                        count ++;
                                        if(count==data?.data?.length){
                                            setIsOpen(false)
                                        }
                                    }
                                    
                                });
                                await AsyncStorage.setItem("sync","done")
                        }else{
                            console.log("Data not available or already loaded to local database")
                        }
                    }catch(error){
                        console.log(error)
                    }finally{
                       
                    }
                    //  db.closeAsync() beacuse of at last closing happened in Home.js
                }else{
                    console.log("Network is not connected.")
                }
            
        } catch (error) {
          console.error("Error fetching network status:", error);
          Alert.alert("Error", error)
        }
      };

  useEffect(() => {
    createDb()
   checkNetwork()
    // dropTable()
  }, []);


  const createDb=async()=>{
    try{
        const db= await SQLite.openDatabaseAsync("mydb")
        await db.execAsync("CREATE TABLE IF NOT EXISTS items (id TEXT PRIMARY KEY , label TEXT,value TEXT, category TEXT);")
        
    }catch(error){
        console.log(error)
    }
}
const dropTable=async()=>{
    try{
        const db= await SQLite.openDatabaseAsync("mydb")
        db.execAsync("DROP TABLE items")
        await AsyncStorage.removeItem("first")
    }catch(error){
        console.log(error)
    }finally{
        console.log("Operation done")
    }
 }
 
 const fetchDb=async(id)=>{
    try{
        const db= await SQLite.openDatabaseAsync("mydb")
        const fetchItems=await db.getAllAsync("SELECT * from items")
        console.log(fetchItems)
        // setItems(fetchItems)
    }catch(error){
        console.log(error)
    }
 }

 
  return (
    <View>
        <Modal visible={isOpen} transparent >
            <View className="bg-white mx-8 rounded-lg p-4 py-8 my-auto elevation-2xl items-center">
                <Text className="text-lg text-blue-600 my-4" >Wait...</Text>
                <ActivityIndicator size={54} />
                <Text className="text-lg text-blue-600 my-4" >Your app is being prepared.</Text>
            </View>
        </Modal>
    </View>
  )
}

export default Reloader