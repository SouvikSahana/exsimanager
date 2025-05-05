import { View, Text, TouchableOpacity, Alert } from 'react-native'
import React,{useState, useEffect} from 'react'
import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system';
import {shareAsync, isAvailableAsync} from "expo-sharing"
import * as DocumentPicker from 'expo-document-picker'
// import RNHTMLtoPDF from 'react-native-html-to-pdf';
import * as Print from 'expo-print';
import AntDesign from '@expo/vector-icons/AntDesign';

const Download = () => {
    const types=["transactions","items","targets"]
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December"
  ];
  let currentDate = new Date();

    async function saveJsonToFile(filePath,type) {
        try {
            const db= await SQLite.openDatabaseAsync("mydb")
            const q="SELECT * from "+type
            const data=await db.getAllAsync(q)

            const jsonData = JSON.stringify(data);

  
           await FileSystem.writeAsStringAsync(filePath, jsonData, {
                encoding: FileSystem.EncodingType.UTF8,
              });
              save(filePath)
              await db.closeAsync();
              Alert.alert("Download Complete","Download to Download folder")
        } catch (error) {
          console.error('Error saving JSON data to file:', error);
        }
      }
      const save=(uri)=>{
        shareAsync(uri)
      }
    const handleDownload=async(type)=>{
        try{
            const filePath = FileSystem.documentDirectory + `${type}.json`;
            await saveJsonToFile(filePath,type)
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

    const [categoryData,setCategoryData]= useState([])
        const [expenseType,setExpenseType]= useState([])
        const [expenseTypeMonth,setExpenseTypeMonth]= useState([])
        const [expenseTypeYear,setExpenseTypeYear]= useState([])

        const [dayWise,setDayWise]= useState([])

        const [payMethod,setPayMethod]= useState([])
        const [day,setDay]=useState(0)
        const [month,setMonth]= useState(0)
        const [year,setYear]= useState(0)

        const calendar=async()=>{
            try{
                const d=new Date()
                setDay(d.getDate())
                setMonth((d.getMonth()+1))
                setYear(d.getFullYear())
            }catch(error){
                console.log(error)
            }
        }
        useEffect(()=>{
          calendar()
        },[])
    const saveAsPDF=async ()=>{
      try{
        const thisMonth=`${year}-${String(month).padStart(2, '0')}`
        const thisYear=`${year}`

           const db= await SQLite.openDatabaseAsync("mydb")
          const data=await db.getAllAsync("SELECT * from transactions order by date desc")

          const categoryData= await db.getAllAsync("SELECT  SUM(transactions.price) as total, items.category from transactions JOIN items on transactions.item=items.label AND strftime('%Y-%m', transactions.date/1000, 'unixepoch') = ? AND expenseType='spent' group by items.category ",thisMonth);
          setCategoryData(categoryData)
          const expenseTypeMonth=await db.getAllAsync("SELECT et.type, COALESCE(SUM(t.price), 0) AS total FROM ( SELECT 'earn' AS type UNION ALL SELECT 'spent' UNION ALL SELECT 'lent' UNION ALL SELECT 'borrow') AS et LEFT JOIN transactions  AS t ON et.type = t.expenseType  AND strftime('%Y-%m', t.date/1000, 'unixepoch') = ?  GROUP BY et.type ",thisMonth)
          setExpenseTypeMonth(expenseTypeMonth)
          const expenseTypeYear=await db.getAllAsync("SELECT et.type, COALESCE(SUM(t.price), 0) AS total FROM ( SELECT 'earn' AS type UNION ALL SELECT 'spent' UNION ALL SELECT 'lent' UNION ALL SELECT 'borrow') AS et LEFT JOIN transactions  AS t ON et.type = t.expenseType  AND strftime('%Y', t.date/1000, 'unixepoch') = ?  GROUP BY et.type ",thisYear)
          setExpenseTypeYear(expenseTypeYear)
          const payMethod= await db.getAllAsync("SELECT et.tp as type , COALESCE(SUM(t.price), 0) as total from ( SELECT 'online' AS tp UNION ALL SELECT 'cash' UNION ALL SELECT 'both')  AS et LEFT JOIN transactions AS t ON et.tp = t.paymentMethod AND strftime('%Y-%m', t.date/1000, 'unixepoch') = ? AND expenseType='spent' GROUP BY et.tp",thisMonth)
          setPayMethod(payMethod)
          const dayWise= await db.getAllAsync("SELECT SUM(price) AS value, SUM(price) AS dataPointText, strftime('%d', date/1000, 'unixepoch') as label FROM transactions WHERE expenseType='spent' AND strftime('%Y-%m', date/1000, 'unixepoch') = ? GROUP BY strftime('%Y-%m-%d', date/1000, 'unixepoch')",thisMonth)
          setDayWise(dayWise)
          await db.closeAsync();
          
          let htmlContent = `
          <h1 style="margin:16px; color:blue;">Transactions Report</h1>`

          // for monthly expense
          htmlContent += `<div style="padding: 14px; background-color: #e5e7eb; margin: 16px; border-radius: 8px;">
    <p style="font-weight: 500; color: #3b82f6; margin-bottom: 16px;">
       ${months[currentDate.getMonth()]}, ${currentDate.getFullYear()}
    </p>
    <div style="display: flex; flex-wrap: wrap; justify-content: space-evenly; gap: 12px;">
`
      expenseTypeMonth?.forEach((it)=>{
        htmlContent += `
          <div style="display: flex; flex-direction: column; padding: 8px; background-color: #E1BEE7; border-radius: 8px; width: 45%; paddin-left:20px;">
            <p style="font-size: 14px; font-weight:bold; margin:0; padding:0;font-size:18px;">${it?.type}</p>
            <p style="font-size: 16px; font-weight: 500;margin:0; padding:0; font-size:15px;">₹ ${it?.total}</p>
        </div>
        `
      })
      htmlContent +=`</div>
                  </div>`

           // for yearly expense
           htmlContent += `<div style="padding: 14px; background-color: #e5e7eb; margin: 16px; border-radius: 8px;">
           <p style="font-weight: 500; color: #3b82f6; margin-bottom: 16px;">
              ${currentDate.getFullYear()}
           </p>
           <div style="display: flex; flex-wrap: wrap; justify-content: space-evenly; gap: 12px;">
       `
             expenseTypeYear?.forEach((it)=>{
               htmlContent += `
                 <div style="display: flex; flex-direction: column; padding: 8px; background-color: #B2EBF2; border-radius: 8px; width: 45%; paddin-left:20px;">
                   <p style="font-size: 14px; font-weight:bold; margin:0; padding:0;font-size:18px;">${it?.type}</p>
                   <p style="font-size: 16px; font-weight: 500;margin:0; padding:0; font-size:15px;">₹ ${it?.total}</p>
               </div>
               `
             })
             htmlContent +=`</div>
                         </div>`

          // for monthly payment method
          htmlContent += `<div style="padding: 14px; background-color: #e5e7eb; margin: 16px; border-radius: 8px;">
          <p style="font-weight: 500; color: #3b82f6; margin-bottom: 16px;">
          ${months[currentDate.getMonth()]}, ${currentDate.getFullYear()}
          </p>
          <div style="display: flex; flex-wrap: wrap; justify-content: space-evenly; gap: 12px;">
      `
            payMethod?.forEach((it)=>{
              htmlContent += `
                <div style="display: flex; flex-direction: column; padding: 8px; background-color: #A7FFEB; border-radius: 8px; width: 30%; paddin-left:20px;">
                  <p style="font-size: 14px; font-weight:bold; margin:0; padding:0;font-size:18px;">${it?.type}</p>
                  <p style="font-size: 16px; font-weight: 500;margin:0; padding:0; font-size:15px;">₹ ${it?.total}</p>
              </div>
              `
            })
            htmlContent +=`</div>
                        </div>`
            
          // for monthly category data
          htmlContent += `<div style="padding: 14px; background-color: #e5e7eb; margin: 16px; border-radius: 8px;">
          <p style="font-weight: 500; color: #3b82f6; margin-bottom: 16px;">
          ${months[currentDate.getMonth()]}, ${currentDate.getFullYear()}
          </p>
          <div style="display: flex; flex-wrap: wrap; justify-content: space-evenly; gap: 12px;">
      `
            categoryData?.forEach((it)=>{
              htmlContent += `
                <div style="display: flex; flex-direction: column; padding: 8px; background-color: #DCEDC8; border-radius: 8px; width: 30%; paddin-left:20px;">
                  <p style="font-size: 14px; font-weight:bold; margin:0; padding:0;font-size:18px;">${it?.category}</p>
                  <p style="font-size: 16px; font-weight: 500;margin:0; padding:0; font-size:15px;">₹ ${it?.total}</p>
              </div>
              `
            })
            htmlContent +=`</div>
                        </div>`

            // daywise data
            htmlContent +=`<table border="1" style="width:90%; border-collapse: collapse; margin-left:auto; margin-right:auto;">
            <tr>
              <th>Date</th>
              <th >Amount</th>
            </tr>`;
            dayWise?.forEach((txn) => {
              htmlContent += `
                <tr>
                  <td style="text-align:center;">${txn?.label} ${months[currentDate.getMonth()]}, ${currentDate.getFullYear()}</td>
                  <td style="text-align:end; padding-right:10px;">${txn?.value}</td>
                </tr>`;
            });
    
            htmlContent += `</table>`;

            // transactions

          htmlContent +=`<h3 style="margin:16px;">Transactions</h3> <table border="1" style="width:95%; border-collapse: collapse; margin-left:auto; margin-right:auto; margin-top:16px;">
            <tr>
              <th>Item</th>
              <th >Type</th>
              <th >Amount</th>
              <th >Date</th>
              <th >Payment </br> Mode</th>
              <th style="width:250px;">Description</th>
            </tr>`;
            data?.forEach((txn) => {
              htmlContent += `
                <tr>
                  <td style="text-align:center;">${txn?.item}</td>
                  <td style="text-align:center;">${(txn?.expenseType=="lent"||txn?.expenseType=="borrow")?txn?.expenseType+" </br> " +txn?.tag:txn?.expenseType}</td>
                  <td style="text-align:end;">${txn?.price}</td>
                  <td style="text-align:end;">${formatDate(txn?.date)}</td>
                  <td style="text-align:center;">${txn?.paymentMethod}
                  <td style="width:250px; text-align:center;">${txn?.description}</td>
                </tr>`;
            });
    
            htmlContent += `</table>`;

            const { uri } = await Print.printToFileAsync({ html: htmlContent });
    
            // Step 4: Share the PDF file
            const canShare = await isAvailableAsync();
            if (canShare) {
              await shareAsync(uri);
            } else {
              console.log("❌ Sharing not available on this device");
            }
      }catch(error){
        console.log(error)
      }
    }
    const exportDatabase = async () => {
      try{
      //  const newPath = FileSystem.cacheDirectory + 'mydb.db';
       const path= FileSystem.documentDirectory + 'SQLite/mydb'
      //  await FileSystem.copyAsync({ from: path , to: newPath });
       await shareAsync(path);
      }catch(error){
           console.log(error)
      }
     };

const importDatabase = async () => {
      try {
        const result = await DocumentPicker.getDocumentAsync({
          type: "application/octet-stream", // Allows picking any file type
          copyToCacheDirectory: false, // Avoid unnecessary copies
        });

        if (result.canceled || !result.assets || result.assets.length === 0) {
          console.log("❌ File picking canceled");
          return;
        }

        const pickedFile = result.assets[0]; // Get the selected file details
        console.log("📂 Selected file:", pickedFile);

        // Step 2: Define the destination folder and file path
        const destinationFolder = FileSystem.documentDirectory + 'SQLite/' // Custom folder
        const destinationPath = destinationFolder + pickedFile.name // Destination file path

        // Step 3: Ensure the folder exists
        await FileSystem.makeDirectoryAsync(destinationFolder, { intermediates: true });

        // Step 4: Move the file
        await FileSystem.copyAsync({
          from: pickedFile.uri,
          to: destinationPath,
        });

        console.log(`✅ File moved successfully to: ${destinationPath}`);
      } catch (error) {
        console.error("❌ Error moving file:", error);
      }
};


  return (
    <View>
        <View className="flex flex-row flex-wrap gap-3 mt-4 p-2 justify-center border-b-[1px] pb-6 border-gray-300 mx-4">
      {types?.map((type,index)=>{
        return(
        <TouchableOpacity key={index} onPress={()=>handleDownload(type)} className="bg-orange-500 flex flex-row items-center text-center justify-center gap-3 py-4 w-[100%]  p-2 rounded-lg">
           <AntDesign name="download" size={20} color="white" /> <Text className="text-white ">Download {type}</Text>
        </TouchableOpacity>)
      })}
      
      </View>
      <TouchableOpacity  onPress={saveAsPDF} className="bg-blue-500 mx-6 mt-4 flex gap-3 flex-row justify-center items-center p-2 py-4 rounded-lg">
      <AntDesign name="download" size={20} color="white" /><Text className="text-white">Expeses As PDF</Text>
        </TouchableOpacity>

     

      <TouchableOpacity  onPress={importDatabase} className="bg-blue-500 mx-6 mt-4 flex gap-3 flex-row justify-center items-center  p-2 py-4 rounded-lg">
      <AntDesign name="download" size={20} color="white" /> <Text className="text-white">Import Database</Text>
        </TouchableOpacity>
        <TouchableOpacity  onPress={exportDatabase} className="bg-green-500 flex flex-row justify-center gap-3  mx-6 mt-4 items-center p-2 py-4 rounded-lg">
        <AntDesign name="download" size={20} color="white" /> <Text className="text-white">Export Database</Text>
        </TouchableOpacity>
    </View>
  )
}

export default Download