import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import "./global.css"
import StateProvider from './StateProvider';
import {initialState,reducer} from "./reducer"
import Router from './Router';


export default function App() {
  return (
    <StateProvider initialState={initialState} reducer={reducer}>
      <Router />

       <StatusBar style="light"
        backgroundColor='#0489F4'
         />
    </StateProvider>
       
  );
}

