import { View, Text, StyleSheet, Linking, TouchableOpacity } from 'react-native'
import React,{useEffect, useState} from 'react'
import MapView ,{Marker} from 'react-native-maps';
import * as SQLite from 'expo-sqlite';


const Location = () => {

  const [locations,setLocations]= useState([])

    // const [region, setRegion] = useState({
    //     latitude: 22.6249,
    //     longitude: 88.4016,
    //     latitudeDelta: 1.922,
    //     longitudeDelta: 1.421,
    //   });

      const fetchData=async()=>{
        try{
          const db= await SQLite.openDatabaseAsync("mydb")
          const fetchLocations= await db.getAllAsync("SELECT * FROM locations where latitude!='null'");
            setLocations(fetchLocations)
            await db.closeAsync();
        }catch(error){
          console.log(error)
        }
      }
      useEffect(()=>{
        fetchData()
      },[])
  return (
    <View className=" flex flex-1  ">
      <View>
        {locations?.map(({latitude,longitude},index)=>{
          return( <TouchableOpacity key={index} onPress={()=>Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`)} className="bg-blue-200 p-4 mx-4 my-1 rounded-lg flex flex-row justify-between">
            <Text>Lat: {latitude}</Text>
            <Text>Long: {longitude}</Text>
          </TouchableOpacity>)
        })}
      </View>

      {/* Later on add this features as it requires ann google api key */}
    {/* <MapView
      provider='google'
       style={styles.map}
       region={region}
    >
      {locations?.map((location,index)=>
        {
          if(location?.latitude && location?.longitude)
            return <Marker key={index} coordinate={{latitude: Number((location?.latitude).toFixed(4)) , longitude: Number((location?.longitude).toFixed(4))}} />}
      )}
    </MapView> */}
    </View>
  )
}

export default Location

const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    map: {
      width: '100%',
      height: '100%'
    },
  });