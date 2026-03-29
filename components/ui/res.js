// 1)  Function that return the reverse of a string 

const { ReceiptEuro } = require("lucide-react");

// Approch 1
const reverseString = (str) => {
    let rev = ""

    for (let i = str.length - 1; i >= 0; i--) {
        rev += str[i];
    }
    return rev
}

// Approch 2 
const reverseStringInbuilt = (str) => {
    let rev = str.split("").reverse().join("")
    return rev
}

// 2) Function that returns longest word in the sentence 

const longestStr = (str) => {
    let lengOfStr = 0;
    let longest = ''

    for (let ch of str.split(" ")) {
        if (ch.length > lengOfStr) {
            lengOfStr = ch.length;
            longest = ch
        }
    }

    return longest;
}



// 3) Function which checks whether a string is  Palindrome or not

const palindromeNot = (str) => {
    let cleaned = str.toLowerCase().replace(/[^a-z0-9]/g, '')
    return str === str.split("").reverse().join("")
}

//  Remove the duplicate elements from given  array 

const removeDups = (arr) => {
    let NoDups = [...new Set(arr)]
    return NoDups
}


const arry = [1, 2, 3, 3, 3, 3]

console.log("Answer 3: ", removeDups(arry))


//  5) Function that checks whether  two strings are ANAGRAMS or not 

const isAnagram = (str1, str2) => {
    let comp1 = str1.toLowerCase().split("").sort().join("")
    let comp2 = str2.toLowerCase().split("").sort().join("")

    return comp1 == comp2;
}


//  Function that  returns number of Vowels in given string 

const numOfVowel = (str) => {
    let cnt = 0;
    let vwls = "aeiouAEIOU"
    for (ch of str) {
        if (vwls.includes(ch)) {
            cnt++;
        }
    }

    return cnt;
    // return str.split("").filter(ch=>"aeiouAEIOU".includes(ch)).length
}


//  7) Largest number in the given array 

const largNumArr = (arr) => {
    if (arr.length <= 0) {
        return
    }
    let maxNum = arr[0];

    for (num of arr) {
        if (num > maxNum) maxNum = num;
    }
    return maxNum;
}
const largNumArr2 = (arr) => {
   return arr.reduce((max,curr)=> curr>max ? curr :-Infinity);
}

//  Shorter one 

const arr = [1,6, 3, 1, 5, 1]

// console.log(largNumArr(arr))
console.log(...arr)

