const fs= require("fs")

const data= JSON.parse(fs.readFileSync("items.json"))
console.log(data.length)
const uniqueData = data.reduce((acc, current) => {
    if (!acc.find(item => item.label === current.label)) {
      acc.push(current);
    }
    return acc;
  }, []);

console.log(uniqueData.length)
fs.writeFileSync("item.json",JSON.stringify(uniqueData,null,2))
