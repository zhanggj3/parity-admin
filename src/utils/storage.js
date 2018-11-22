const Storage = window.localStorage;



export function getStorage (key) {
    return Storage.getItem(key);
}
export function setStorage (key,data) {
    Storage.setItem(key,data);
}
export function deleteItem (key) {
    Storage.removeItem(key);
}
export function pushStorage (key,data) {
    let prevDataArr = getStorage(key);
    if(!prevDataArr || prevDataArr === '[]' || prevDataArr === ''){
        prevDataArr = [];
        prevDataArr.push(data);
    }else{
        prevDataArr = JSON.parse(prevDataArr);
        prevDataArr.push(data);
    }
    Storage.setItem(key,JSON.stringify(prevDataArr));
}
export function replaceStorage (key,data,matchKey) {
    console.log(data);
    let prevDataArr = getStorage(key);
    if(!prevDataArr || prevDataArr === '[]' || prevDataArr === ''){
        prevDataArr = [];
        prevDataArr.push(data);
    }else{
        prevDataArr = JSON.parse(prevDataArr);

        for(let i=0;i<prevDataArr.length;i++){
            if(prevDataArr[i][matchKey] === data[matchKey]){
                prevDataArr.splice(i,1);
            }else{
                continue;
            }
        }
        prevDataArr.push(data);
    }
    Storage.setItem(key,JSON.stringify(prevDataArr));
}

export function replaceNameStorage (key,name,matchValue) {
    let prevDataArr = getStorage(key);
    if(prevDataArr && prevDataArr !== ''){
        prevDataArr = JSON.parse(prevDataArr);
        for(let i=0;i<prevDataArr.length;i++){
            if(prevDataArr[i].address === matchValue){
                prevDataArr[i].name = name;
            }else{
                continue;
            }
        }
    }
    Storage.setItem(key,JSON.stringify(prevDataArr));
}

export function deleteStorage (key,matchValue) {
    let prevDataArr = getStorage(key);
    if(prevDataArr && prevDataArr !== '[]' && prevDataArr !== ''){
        prevDataArr = JSON.parse(prevDataArr);
        console.log(prevDataArr)
        for(let i=0;i<prevDataArr.length;i++){
            if(prevDataArr[i].address === matchValue){
                prevDataArr.splice(i,1);
            }else{
                continue;
            }
        }
    }

    Storage.setItem(key,JSON.stringify(prevDataArr));
}

