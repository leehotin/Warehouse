function setClass(name,setClass,removeClass,getBy){
    switch(getBy){
        case "id":
            for(let list of document.getElementById(name)){
                list.classList.remove(removeClass);
                list.classList.add(setClass);
            }
            break;
        case "class":
            for(let list of document.getElementsByClassName(name)){
                list.classList.remove(removeClass);
                list.classList.add(setClass);
            }
            break;
        case "tag":
            for(list of document.getElementsByTagName(name)){
                list.classList.remove(removeClass);
                list.classList.add(setClass);
            };
            break;
    }
}

function setDarkMode(){
    if(localStorage.getItem("darkmode")=="dark"){
        setClass("darkmode","dark","white","class");
        document.getElementsByClassName("darkmode-btn")[0].innerHTML = "Daytime Mode";
    }else{
        setClass("darkmode","white","dark","class");
        document.getElementsByClassName("darkmode-btn")[0].innerHTML = "Dark Mode";
    }
}

function changeDarkMode(){
    if(localStorage.getItem("darkmode")=="dark"){
        localStorage.setItem("darkmode","white");
    }else{
        localStorage.setItem("darkmode","dark");
    }
}

function darkMode(btn){
    changeDarkMode();
    setDarkMode();
    if(localStorage.getItem("darkmode")=="dark"){
        document.getElementsByClassName("darkmode-btn")[0].innerHTML = "Daytime Mode";
    }else{
        document.getElementsByClassName("darkmode-btn")[0].innerHTML = "Dark Mode";
    }
}
