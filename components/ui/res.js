


let arr = [1, 2, 2, 3, 4, 4]

const new_arr = []


for (let i = 0; i < arr.length; i++) {
    if (!new_arr.includes(arr[i])) {
        new_arr.push(arr[i])
    }
}

console.log(new_arr)

const eff_arr = [...new Set(arr)]

console.log("New : ", eff_arr)

console.log("First...")
setTimeout(()=>{
    console.log("Second...")
},500)

console.log("Third...")
