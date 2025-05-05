import { View, Text, StyleSheet, Linking, TouchableOpacity,Dimensions, TextInput, Pressable } from 'react-native'
import React,{useEffect, useState} from 'react'
import MapView ,{Marker, PROVIDER_DEFAULT, UrlTile} from 'react-native-maps';
import * as SQLite from 'expo-sqlite';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

const TomTomMap = ({ region, locations,apiKey }) => {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        html, body, #map { margin: 0; padding: 0; height: 100%; width: 100%; }
      </style>
      <script src="https://api.tomtom.com/maps-sdk-for-web/cdn/6.x/6.19.0/maps/maps-web.min.js"></script>
      <link rel="stylesheet" href="https://api.tomtom.com/maps-sdk-for-web/cdn/6.x/6.19.0/maps/maps.css"/>
    </head>
    <body>
      <div id="map"></div>
      <script>
        const map = tt.map({
          key: '${apiKey}',  // Replace with your key
          container: 'map',
          center: [${region.longitude}, ${region.latitude}],
          zoom: 8
        });

        const locations = ${JSON.stringify(locations?.filter(l => l.latitude && l.longitude).map(loc => ({
          lat: +loc.latitude.toFixed(4),
          lng: +loc.longitude.toFixed(4),
        })))};

        locations.forEach(loc => {
          new tt.Marker().setLngLat([loc.lng, loc.lat]).addTo(map);
        });
      </script>
    </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      <WebView
        originWhitelist={['*']}
        source={{ html: htmlContent }}
        javaScriptEnabled
        domStorageEnabled
      />
    </View>
  );
};

const LocationS = () => {

  const [locations,setLocations]= useState([])
  const [apiKey,setApiKey]= useState(null)

    const [region, setRegion] = useState({
        latitude: 22.6249,
        longitude: 88.4016,
        latitudeDelta: 1.922,
        longitudeDelta: 1.421,
      });

      const fetchData=async()=>{
        try{
          const db= await SQLite.openDatabaseAsync("mydb")
          const fetchLocations= await db.getAllAsync("SELECT * FROM locations where latitude!='null'");
            setLocations(fetchLocations)
            // console.log(fetchLocations)
            await db.closeAsync();
        }catch(error){
          console.log(error)
        }
      }
      useEffect(()=>{
        fetchData()
      },[])
      const [location, setLocation] = useState();
      const [value,setValue]= useState("")
      useEffect(() => {
        async function getCurrentLocation() {
          let { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== 'granted') {
            setErrorMsg('Permission to access location was denied');
            return;
          }
    
          let location = await Location.getCurrentPositionAsync({});
          setLocation(location.coords)
          // console.log(location.coords)
        }
    
        getCurrentLocation();
      }, []);

      const handleSubmit=async()=>{
        try{
          if(value){
            await AsyncStorage.setItem("api",value)
            setApiKey(value)
          }
        }catch(error){
          console.log(error)
        }
      }
      const handleDelete=async()=>{
        try{
          await AsyncStorage.removeItem("api")
          setApiKey(null)
        }catch(error){
          console.log(error)
        }
      }
      const getKey=async()=>{
        try{
          const a=await AsyncStorage.getItem("api")
          if(a){
            setApiKey(a)
          }
        }catch(error){
          console.log(error)
        }
      }
      useEffect(()=>{
        getKey()
      },[])
  return (
    <View className=" flex flex-1  ">
      {/* <View>
        {locations?.map(({latitude,longitude},index)=>{
          return( <TouchableOpacity key={index} onPress={()=>Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`)} className="bg-blue-200 p-4 mx-4 my-1 rounded-lg flex flex-row justify-between">
            <Text>Lat: {latitude}</Text>
            <Text>Long: {longitude}</Text>
          </TouchableOpacity>)
        })}
      </View> */}

      {/* Later on add this features as it requires ann google api key */}
    {/* <MapView
      provider={PROVIDER_DEFAULT}
       style={styles.map}
       region={region}
    >
      <UrlTile
          urlTemplate="http://c.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maximumZ={19}
        />
      {locations?.map((location,index)=>
        {
          if(location?.latitude && location?.longitude)
            return <Marker key={index} coordinate={{latitude: Number((location?.latitude).toFixed(4)) , longitude: Number((location?.longitude).toFixed(4))}} />}
      )}
    </MapView> */}
    {(location?.latitude && apiKey) &&  <TomTomMap
  region={location}
  locations={locations}
  apiKey={apiKey}
/>}
{apiKey && <TouchableOpacity onPress={handleDelete} className="absolute right-5 top-5 z-50  border-[1px] border-white  rounded-full p-2 bg-gray-300">
  <MaterialIcons name="delete" size={24} color="red" />
</TouchableOpacity> }

      {!apiKey &&
        <View className="flex-1  p-4">
          <Text>Your Map(Tom Tom only) Api key: </Text>
          <TextInput className="border-[1px] border-black w-[100%] mt-2 rounded-md px-2" value={value} onChangeText={(e)=>setValue(e)} placeholder='Enter Tom Tom key' />
          <View className="bg-blue-500  rounded-lg mt-4 text-center overflow-hidden">
          <Pressable className="p-3" onPress={handleSubmit}  android_ripple={{color:"blue"}} disabled={value==""}>
           <Text className="text-white mx-auto" >Submit</Text> 
          </Pressable>
          </View>
           </View>
      }
    </View>
  )
}

export default LocationS

const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    map: {
      width: '100%',
      height: '100%'
    },
  });