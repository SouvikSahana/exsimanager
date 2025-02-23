import { View, Text } from 'react-native'
import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import {createNativeStackNavigator} from "@react-navigation/native-stack"

import Home from "./screens/Home"
import Expense from "./screens/Expense"
import BuddyHistory from "./screens/BuddyHistory"
import DataBase from './screens/DataBase'
import MoneyBuddy from "./screens/MoneyBuddy"
import Target from "./screens/Target"
import TransactionPage from "./screens/TransactionPage"
import BottomTab from './components/BottomTab'
import Location from './screens/Location'
import AddItem from './screens/AddItem'
import Transaction from './screens/Transaction'
import Download from './screens/Download'
import Support from './screens/Support'

const Stack= createNativeStackNavigator()

const Router = () => {
  return (
    <View className="flex-1">
      <NavigationContainer>
      <Stack.Navigator>
        
          <Stack.Screen name='Home'
           options={{headerTitle:"Hello, Buddy",headerStyle:{backgroundColor:'#0489F4'},headerTintColor:'white',
        }} component={Home} />

          <Stack.Screen name='BuddyHistory'
           options={{headerStyle:{backgroundColor:'#0489F4'},headerTintColor:'white'
        }} component={BuddyHistory} />

          <Stack.Screen name='Expense'
           options={{headerStyle:{backgroundColor:'#0489F4'},headerTintColor:'white'
        }} component={Expense} />

        <Stack.Screen name='Database'
           options={{headerStyle:{backgroundColor:'#0489F4'},headerTintColor:'white'
        }} component={DataBase} />

        <Stack.Screen name='MoneyBuddy'
           options={{headerStyle:{backgroundColor:'#0489F4'},headerTintColor:'white'
        }} component={MoneyBuddy} />

      

      <Stack.Screen name='Target'
           options={{headerStyle:{backgroundColor:'#0489F4'},headerTintColor:'white'
        }} component={Target} />

        <Stack.Screen name='Additem'
           options={{headerStyle:{backgroundColor:'#0489F4'},headerTintColor:'white'
        }} component={AddItem} />

<Stack.Screen name='Download'
           options={{headerStyle:{backgroundColor:'#0489F4'},headerTintColor:'white'
        }} component={Download} />

<Stack.Screen name='Transaction'
           options={{headerStyle:{backgroundColor:'#0489F4'},headerTintColor:'white'
        }} component={Transaction} />

<Stack.Screen name='Location'
           options={{headerStyle:{backgroundColor:'#0489F4'},headerTintColor:'white'
        }} component={Location} />

<Stack.Screen name='Support'
           options={{headerStyle:{backgroundColor:'#0489F4'},headerTintColor:'white'
        }} component={Support} />

<Stack.Screen name='TransactionHistory'
           options={{headerStyle:{backgroundColor:'#0489F4'},headerTintColor:'white', headerTitle:"Transaction History"
        }} component={TransactionPage} />

        </Stack.Navigator>
        <BottomTab/>
      </NavigationContainer>
      
    </View>
  )
}

export default Router