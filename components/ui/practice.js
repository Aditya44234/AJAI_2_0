//  1 What is functional declarations .

function sqaureOfNum(num) {
    return num * num

}

//  2) What is functional expressional 

const addNums=(arr)=>{
    return arr.reduce((num,curr)=>curr+num,0)
}

const ans=addNums([1,2,3])
console.log("ANswer : ", ans)


//  IIFE -Immediatly invoked function

({
    console.log("I am IIFE")
})()