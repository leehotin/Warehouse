//需要時引入的function 詳細用法請自己查看像是productlist那邊
export function setupSelectBox(selectBox, influence, Name) {
    let sURLInit = "/getlayout/layout";
    const InfluenceBox = document.getElementById(influence);

    selectBox.addEventListener('change', function () {
        InfluenceBox.innerHTML = "";
        InfluenceBox.appendChild(new Option('-----Select-----', ''));
        let sURL = sURLInit + "?search=" + selectBox.name + "&group=" + InfluenceBox.name + "&Name=" + Name + "&limit=" + selectBox.value;
        var Request = new XMLHttpRequest();
        Request.open("get", sURL, true);
        Request.responseType = 'json';
        Request.onreadystatechange = function () {
            if (Request.readyState == 4) {
                if (Request.status == 200) {
                    let json = Request.response;
                    //alert(json)
                    for (let item of json) {
                        let option = new Option(item._id, item._id);
                        InfluenceBox.appendChild(option);
                    }
                }
            }
        };
        Request.send();
    });
}
export function btn() {
    var btn = document.getElementById('btn');
    var all = document.body;
    btn.addEventListener('click', function () {
        toggleClass(all, 'v2');
        setMode();
    });

    function addClass(body, target) {
        if (!hasClass(body, target))
            body.className += " " + target;
    }
    function deleteClass(body, target) {
        var reg = new RegExp("\\b" + target + "\\b");
        body.className = body.className.replace(reg, "");
    }
    function toggleClass(body, target) {
        hasClass(body, target) ? deleteClass(body, target) : addClass(body, target);
    }
    function hasClass(body, target) {
        var reg = new RegExp("\\b" + target + "\\b");
        return reg.test(body.className)
    }
    function setMode() {
        const rootVal = ['--bg-color', '--link-color', '--hover-color', '--a-color'];   //設定var變量
        const color = ['white', 'white', 'rgb(241, 241, 147)', 'black'];                //比較初始色
        const result = ['#4b4949', 'black', 'rgb(122, 135, 236)', 'white'];             //作出變化
        var root = document.querySelector(':root');
        for (let i = 0; i < rootVal.length; i++) {
            const temp = getComputedStyle(root).getPropertyValue(rootVal[i]).trim();
            root.style.setProperty(rootVal[i], temp === color[i] ? result[i] : color[i]);
        }
    }
}
export function dio() {
    var dio = document.getElementsByName('Type');
    var target = document.getElementsByClassName('target');
    dio.forEach(function (radio) {
        radio.addEventListener('change', function () {
            if (radio.value === "in") {
                for (let element of target)
                    element.textContent = "INV";
            }
            else {
                for (let element of target)
                    element.textContent = "TRF";
            }
        });
    });
}
export function listen() {
    let listenID = document.getElementById('DeliveryID');
    let listenCompany = document.getElementById('Company');
    let listenAddress = document.getElementById('Address');
    let listenPhone = document.getElementById('Phone');
    let displayID = document.getElementsByClassName('displayID');
    let displayCompany = document.getElementById('displayCompany');
    let displayAddress = document.getElementById('displayAddress');
    let displayPhone = document.getElementById('displayPhone');

    listenID.addEventListener('input', function () {
        for (let element of displayID)
            element.textContent = listenID.value;
    });
    listenCompany.addEventListener('input', function () {
        displayCompany.textContent = listenCompany.value;
    });
    listenAddress.addEventListener('input', function () {
        displayAddress.textContent = listenAddress.value;
    });
    listenPhone.addEventListener('input', function () {
        displayPhone.textContent = listenPhone.value;
    });

}
export async function checkValue() {
    const numberOfCount = document.querySelectorAll('input[name="count"]');
    const numberOfCompleted = document.querySelectorAll('input[name="completed"]');
    let arrayCount = Array.from(numberOfCount).map(input => parseFloat(input.value));
    let arrayCompleted = Array.from(numberOfCompleted).map(input => parseFloat(input.value));
    if (arrayCount.some(isNaN) || arrayCompleted.some(isNaN)) {
        alert('數值校驗失敗，你輸入的有不為數字的值!!')
        return;
    }
    if (typeof (arrayCount.value) != 'string') {
        for (let i = 0; i < arrayCount.length; i++) {
            if (arrayCount[i] < 0) {
                alert('總數量初值不能小於0!!')
                return;
            }
            let difference = arrayCount[i] - arrayCompleted[i];
            if (difference < 0) {
                alert('真正做到供過於求，你一定入錯數值!!')
                return;
            }

        }
    }
    return true;

}
export async function listenForm() {

    let listenSubmit = document.getElementById('create');
    listenSubmit.addEventListener('click', async function () {
        const SubmitForm = document.getElementById('submit');
        //alert(SubmitForm.id)
        //event.defaultPrevented();
        if (!await checkValue()) {
            alert('你數字不對當然過不了，其他組員被那個吳思恬害慘了!!!!');
            return false;
        }
        await enableAllInputsAndSelects();
        // await fetch('/deliveryOrder/update', {
        //     method: "POST",
        //     headers:'',//customHeaders,
        //     body: document.body,//JSON.stringify(data),
        // })
        //     .then((response) => response.json())
        //     .then((data) => {
        //         console.log(data);
        //     });
        console.log(SubmitForm.innerHTML);
        SubmitForm.submit();
        //await SubmitForm.submit();

        //await SubmitForm.submit() ;
    });
    async function enableAllInputsAndSelects() {
        const selectsAndInputs = document.querySelectorAll('select,input');
        selectsAndInputs.forEach(element => {
            element.disabled = false;
        })
    }
}
export async function lockItem(uniqueIdCounter, tempNumber) {
    let tempCounter = uniqueIdCounter - 1;
    if (tempNumber != 0) {
        for (let i in tempNumber) {
            i = '-' + i;
            const uniqueIdProduct_id = `product_id-${tempCounter}${i}`;
            const uniqueIdName = `name-${tempCounter}${i}`;
            const uniqueIdType = `type-${tempCounter}${i}`;
            const uniqueIdBrand = `brand-${tempCounter}${i}`;
            const uniqueIdOrigin = `origin-${tempCounter}${i}`;
            const uniqueIdStock_id = `stock_id-${tempCounter}${i}`;
            const uniqueId_id = `hidden_id-${tempCounter}${i}`;
            const uniqueIdCount = `count-${tempCounter}${i}`;
            const uniqueIdCompleted = `completed-${tempCounter}${i}`;
            const lockItemID = [uniqueIdProduct_id, uniqueIdName, uniqueIdType, uniqueIdBrand, uniqueIdOrigin, uniqueIdStock_id, uniqueIdCount, uniqueIdCompleted];
            for (let lock of lockItemID) {
                const selectLock = document.getElementById(lock);
                selectLock.disabled = true;
            }
        }
    }
    else {
        const uniqueIdProduct_id = `product_id-${tempCounter}-0`;
        const uniqueIdName = `name-${tempCounter}-0`;
        const uniqueIdType = `type-${tempCounter}-0`;
        const uniqueIdBrand = `brand-${tempCounter}-0`;
        const uniqueIdOrigin = `origin-${tempCounter}-0`;
        const uniqueIdStock_id = `stock_id-${tempCounter}-0`;
        const uniqueId_id = `hidden_id-${tempCounter}-0`;
        const uniqueIdCount = `count-${tempCounter}-0`;
        const uniqueIdCompleted = `completed-${tempCounter}-0`;
        const lockItemID = [uniqueIdProduct_id, uniqueIdName, uniqueIdType, uniqueIdBrand, uniqueIdOrigin, uniqueIdStock_id, uniqueIdCount, uniqueIdCompleted];
        for (let lock of lockItemID) {
            const selectLock = document.getElementById(lock);
            selectLock.disabled = true;
        }
    }
}


export async function createUniqueSelect(Options, uniqueIdCounter) {
    let specificDiv = document.getElementById('specificPosition');
    let i = 0;
    let firstDiv = document.createElement('div');
    firstDiv.className = 'row my-1';
    let firstLabel = document.createElement('label');
    firstLabel.className = 'fw-bold';
    firstLabel.setAttribute('p', `prod${uniqueIdCounter}`);
    firstLabel.textContent = `追加貨品資料${uniqueIdCounter}:`;
    firstDiv.appendChild(firstLabel);
    let outsideDiv = document.createElement('div');
    outsideDiv.className = 'col';
    let middleDiv = document.createElement('div');
    middleDiv.className = 'row py-1 my-1 border-bottom border-primary';
    let insideDiv = document.createElement('div');
    insideDiv.className = 'col';

    let sURLInit = "/getlayout/layout";
    const collectionName = 'products';

    const uniqueIdProduct_id = `product_id-${uniqueIdCounter}`;
    const uniqueIdName = `name-${uniqueIdCounter}`;
    const uniqueIdType = `type-${uniqueIdCounter}`;
    const uniqueIdBrand = `brand-${uniqueIdCounter}`;
    const uniqueIdOrigin = `origin-${uniqueIdCounter}`;
    const uniqueIdStock_id = `stock_id-${uniqueIdCounter}`;
    const uniqueId_id = `hidden_id-${uniqueIdCounter}`;
    const uniqueIdCount = `count-${uniqueIdCounter}`;
    const uniqueIdCompleted = `completed-${uniqueIdCounter}`;
    const nameLib = [/*0*/'name',  /*1*/   'type',/*2*/'brand',/*3*/'origin', /*4*/ 'stock_id',  /*5*/'count',  /*6*/'completed', /*7*/ 'product_id',/*8*/'data_id'];
    const labelTexts = [/*0*/'貨品名稱:',/*1*/'類型:',/*2*/'品牌:',/*3*/'來源地:',/*4*/'所在倉庫區:',/*5*/'總數量:',/*6*/'已到達數量',/*7*/'貨品編號:',/*8*/'所在倉庫區(預設):']
    const newUniqueID = [/*0*/uniqueIdName,/*1*/uniqueIdType,/*2*/uniqueIdBrand,/*3*/uniqueIdOrigin,/*4*/uniqueIdStock_id];
    const newinputTextId = [/*0*/uniqueIdCount,/*1*/uniqueIdCompleted];

    function newSetSelected(addString, valueToSelect, uniqueIdCounter) {
        let tempString = addString.charAt(0).toLowerCase() + addString.slice(1);
        tempString = `${tempString}-${uniqueIdCounter}`;
        const select = document.getElementById(tempString);
        for (const option of select) {
            if (option.value === valueToSelect) {
                option.selected = true;
                break;
            }
        }
    }




    let inputsFirst = document.createElement('input');

    inputsFirst.id = uniqueId_id;
    inputsFirst.name = nameLib[8];
    inputsFirst.type = 'hidden';
    insideDiv.appendChild(inputsFirst);
    let select = document.createElement('select');

    select.name = nameLib[7];
    select.innerHTML = Options[5];
    select.id = uniqueIdProduct_id;
    let selectLabel = document.createElement('label');
    selectLabel.setAttribute('for', `${nameLib[7]}-${uniqueIdCounter}`);
    selectLabel.textContent = labelTexts[7];

    insideDiv.appendChild(selectLabel);
    insideDiv.appendChild(select);
    middleDiv.appendChild(insideDiv);


    for (let row of newUniqueID) {
        const insideDiv = document.createElement('div');
        insideDiv.className = 'col';

        const select = document.createElement('select');
        [select.name, select.id, select.innerHTML] = [nameLib[i], row, Options[i]];
        /*select.id = row;
         select.name = nameLib[i] ;
         select.innerHTML = Options[i] ;*/
        const selectLabel = document.createElement('label');
        selectLabel.setAttribute('for', `${nameLib[i]}-${uniqueIdCounter}`);
        selectLabel.textContent = labelTexts[i];
        insideDiv.appendChild(selectLabel);
        insideDiv.appendChild(select);
        middleDiv.appendChild(insideDiv);

        i++;
    }

    insideDiv = document.createElement('div');
    insideDiv.className = 'col';
    let InputLabel = document.createElement('label');
    InputLabel.setAttribute('for', `${nameLib[4]}-0-${uniqueIdCounter}`);
    InputLabel.textContent = labelTexts[8];
    insideDiv.appendChild(InputLabel);
    middleDiv.appendChild(insideDiv);


    for (let row of newinputTextId) {
        const insideDiv = document.createElement('div');
        insideDiv.className = 'col';
        let inputs = document.createElement('input');
        [inputs.id, inputs.name, inputs.type, inputs.className] = [row, nameLib[i], 'text', 'form-control text-center'];
        /* inputs.id = row ;
         inputs.name = nameLib[i];
         inputs.type = 'text' ;
         inputs.className = 'form-control text-center' ;*/

        const InputLabel = document.createElement('label');
        InputLabel.setAttribute('for', `${nameLib[i]}-${uniqueIdCounter}`);
        InputLabel.textContent = labelTexts[i];
        insideDiv.appendChild(InputLabel);
        insideDiv.appendChild(inputs);
        middleDiv.appendChild(insideDiv);
        i++
    }
    outsideDiv.appendChild(middleDiv);
    firstDiv.appendChild(outsideDiv);
    specificDiv.insertAdjacentElement('beforebegin', firstDiv);
    let newListenList = [uniqueIdProduct_id, uniqueIdName, uniqueIdType, uniqueIdBrand, uniqueIdOrigin, uniqueIdStock_id]
    for (let listen of newListenList) {
        const listening = document.getElementById(listen);
        listening.addEventListener('change', function () {
            let sURL = sURLInit + "?search=" + listening.id + "&group=&Name=" + collectionName + "&limit=" + listening.value;
            var Request = new XMLHttpRequest();
            Request.open("get", sURL, true);
            Request.responseType = 'json';
            Request.onreadystatechange = function () {
                if (Request.readyState == 4) {
                    if (Request.status == 200) {
                        let json = Request.response;
                        let data = json['0'];
                        let values = {};
                        Object.entries(data).forEach(([key, value]) => {
                            //alert(_id.option)
                            // let P = key.options ;
                            // alert(Product_id.options.length)
                            newSetSelected(key, value, uniqueIdCounter)
                            //setSelected(key,value)
                            //  for(i in key.option)
                            // alert(key.option[i])
                        });
                        //setSelected(Object.keys(data[i]),data[i])                   

                        /*for(const i of a[0]){
                            setSelected(Object.keys(a[i]),a[i])
                            alert(Object.keys(a[i]))
                        }*/
                        //alert(json[0]['Product_id'])
                        //setSelected(,json[])
                        //addOptionsToSelects(json[0]);
                    }
                }
            };
            Request.send();
        });
    }
    return uniqueIdCounter + 1;

}

export async function setupSelectCreateForm(selectBoxs, influence, collectionName) {
    let sURLInit = "/getlayout/layout";
    const InfluenceBox = document.getElementById(influence);
    const [Name, Type, Brand, Origin, Stock_id, Product_id] = await selectBoxs;

    //alert(_id)
    /*ID.addEventListener('change', function () {
        InfluenceBox.innerHTML = "";
        InfluenceBox.appendChild(new Option('-----Select-----', ''));
        let sURL = sURLInit + "?search=" + selectBox.name + "&group=" + InfluenceBox.name + "&Name=" + collectionName + "&limit=" + selectBox.value;
        var Request = new XMLHttpRequest();
        Request.open("get", sURL, true);
        Request.responseType = 'json';
        Request.onreadystatechange = function () {
            if (Request.readyState == 4) {
                if (Request.status == 200) {
                    let json = Request.response;
                    //alert(json)
                    for (let item of json) {
                        let option = new Option(item., item.);
                        InfluenceBox.appendChild(option);
                    }
                }
            }
        };
        Request.send();
    });*/
    /*const selectBox1 = document.getElementById('_id');
    const selectBox2 = document.getElementById('Product_id');
    const selectBox3 = document.getElementById('Name');
    const selectBox4 = document.getElementById('Type');
    const selectBox5 = document.getElementById('Brand');
    const selectBox6 = document.getElementById('Origin');
    const selectBox7 = document.getElementById('Stock_id');
    let data = await iOemuSys.search('查詢並響應',iOemuSys.CreatedbIndex(req.query.Name),[req.query.group,req.query.search,req.query.limit]);
    let pipline = [{ $match: { [search]: limit } }, { $group: { _id: `$${group}` } }, { $sort: { _id: 1 } }];
                    match:{Product_id:}*/


    //const [ID, Product_id, Name, Type, Brand, Origin, Stock_id] = await selectBoxs;
    //監聽邏輯還在寫....

    Product_id.addEventListener('change', function () {
        let sURL = sURLInit + "?search=" + Product_id.id + "&group=&Name=" + collectionName + "&limit=" + Product_id.value;
        var Request = new XMLHttpRequest();
        Request.open("get", sURL, true);
        Request.responseType = 'json';
        Request.onreadystatechange = function () {
            if (Request.readyState == 4) {
                if (Request.status == 200) {
                    let json = Request.response;
                    let data = json['0'];
                    let values = {};
                    Object.entries(data).forEach(([key, value]) => {
                        //alert(key)
                        //alert(_id.option)
                        // let P = key.options ;
                        // alert(Product_id.options.length)
                        setSelected(key, value)
                        //setSelected(key,value)
                        //  for(i in key.option)
                        // alert(key.option[i])
                    });
                    //setSelected(Object.keys(data[i]),data[i])                   

                    /*for(const i of a[0]){
                        setSelected(Object.keys(a[i]),a[i])
                        alert(Object.keys(a[i]))
                    }*/
                    //alert(json[0]['Product_id'])
                    //setSelected(,json[])
                    //addOptionsToSelects(json[0]);
                }
            }
        };
        Request.send();
    }); /*Name.addEventListener('change', function () {
        InfluenceBox.innerHTML = "";
        InfluenceBox.appendChild(new Option('-----Select-----', ''));
        let sURL = sURLInit + "?search=" + selectBox.name + "&group=" + InfluenceBox.name + "&Name=" + collectionName + "&limit=" + selectBox.value;
        var Request = new XMLHttpRequest();
        Request.open("get", sURL, true);
        Request.responseType = 'json';
        Request.onreadystatechange = function () {
            if (Request.readyState == 4) {
                if (Request.status == 200) {
                    let json = Request.response;
                    //alert(json)
                    for (let item of json) {
                        let option = new Option(item., item.);
                        InfluenceBox.appendChild(option);
                    }
                }
            }
        };
        Request.send();
    }); Type.addEventListener('change', function () {
        InfluenceBox.innerHTML = "";
        InfluenceBox.appendChild(new Option('-----Select-----', ''));
        let sURL = sURLInit + "?search=" + selectBox.name + "&group=" + InfluenceBox.name + "&Name=" + collectionName + "&limit=" + selectBox.value;
        var Request = new XMLHttpRequest();
        Request.open("get", sURL, true);
        Request.responseType = 'json';
        Request.onreadystatechange = function () {
            if (Request.readyState == 4) {
                if (Request.status == 200) {
                    let json = Request.response;
                    //alert(json)
                    for (let item of json) {
                        let option = new Option(item., item.);
                        InfluenceBox.appendChild(option);
                    }
                }
            }
        };
        Request.send();
    }); Brand.addEventListener('change', function () {
        InfluenceBox.innerHTML = "";
        InfluenceBox.appendChild(new Option('-----Select-----', ''));
        let sURL = sURLInit + "?search=" + selectBox.name + "&group=" + InfluenceBox.name + "&Name=" + collectionName + "&limit=" + selectBox.value;
        var Request = new XMLHttpRequest();
        Request.open("get", sURL, true);
        Request.responseType = 'json';
        Request.onreadystatechange = function () {
            if (Request.readyState == 4) {
                if (Request.status == 200) {
                    let json = Request.response;
                    //alert(json)
                    for (let item of json) {
                        let option = new Option(item., item.);
                        InfluenceBox.appendChild(option);
                    }
                }
            }
        };
        Request.send();
    }); Origin.addEventListener('change', function () {
        InfluenceBox.innerHTML = "";
        InfluenceBox.appendChild(new Option('-----Select-----', ''));
        let sURL = sURLInit + "?search=" + selectBox.name + "&group=" + InfluenceBox.name + "&Name=" + collectionName + "&limit=" + selectBox.value;
        var Request = new XMLHttpRequest();
        Request.open("get", sURL, true);
        Request.responseType = 'json';
        Request.onreadystatechange = function () {
            if (Request.readyState == 4) {
                if (Request.status == 200) {
                    let json = Request.response;
                    //alert(json)
                    for (let item of json) {
                        let option = new Option(item., item.);
                        InfluenceBox.appendChild(option);
                    }
                }
            }
        };
        Request.send();
    }); Stock_id.addEventListener('change', function () {
        InfluenceBox.innerHTML = "";
        InfluenceBox.appendChild(new Option('-----Select-----', ''));
        let sURL = sURLInit + "?search=" + selectBox.name + "&group=" + InfluenceBox.name + "&Name=" + collectionName + "&limit=" + selectBox.value;
        var Request = new XMLHttpRequest();
        Request.open("get", sURL, true);
        Request.responseType = 'json';
        Request.onreadystatechange = function () {
            if (Request.readyState == 4) {
                if (Request.status == 200) {
                    let json = Request.response;
                    //alert(json)
                    for (let item of json) {
                        let option = new Option(item., item.);
                        InfluenceBox.appendChild(option);
                    }
                }
            }
        };
        Request.send();
    });*/
    function addOptionsToSelects(item) {
        addOptionsToSelect(ID, item._id);
        addOptionsToSelect(Product_id, item.Product_id);
        addOptionsToSelect(Name, item.Name);
        addOptionsToSelect(Type, item.Type);
        addOptionsToSelect(Brand, item.Brand);
        addOptionsToSelect(Origin, item.Origin);
        addOptionsToSelect(Stock_id, item.Stock_id);

        ID, Product_id, Name, Type, Brand, Origin, Stock_id
    }                   //product
    function setSelected(addString, valueToSelect) {
        let tempString = addString.charAt(0).toLowerCase() + addString.slice(1);
        tempString = `${tempString}-0`;
        //alert(typeof(selectElement))
        const select = document.getElementById(tempString);;
        //alert(select.length)
        //alert(select.options.length)
        //let data = Object.values(selectElement['0'])
        //alert(data)
        //alert(selectElement)
        //alert(selectElement.length)
        for (const option of select) {
            //alert(option)
            if (option.value === valueToSelect) {
                option.selected = true;
                break;
            }
        }
    }
    function addOptionsToSelect(selectId, value) {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = value;
        selectId.appendChild(option);
        selectId.value = value;
    }
}
//select.removeChild()