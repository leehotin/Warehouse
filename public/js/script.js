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
    var dio = document.getElementsByName('type');
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
    var listenID = document.getElementById('DeliveryID');
    var listenCompany = document.getElementById('Company');
    var listenAddress = document.getElementById('Address');
    var listenPhone = document.getElementById('Phone');
    var displayID = document.getElementsByClassName('displayID');
    var displayCompany = document.getElementById('displayCompany');
    var displayAddress = document.getElementById('displayAddress');
    var displayPhone = document.getElementById('displayPhone');
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
export async function setupSelectCreateForm(selectBoxs, influence, collectionName) {
    let sURLInit = "/getlayout/layout";
    const InfluenceBox = document.getElementById(influence);
    const [ID, Product_id, Name, Type, Brand, Origin, Stock_id] = await selectBoxs;

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
   
   
   
   /* 監聽邏輯還在寫....
                   Product_id.addEventListener('change', function () {
        alert(Product_id.id)
        let sURL = sURLInit + "?search=" + Product_id.id + "&group=&Name=" + collectionName + "&limit=" + Product_id.value;
        var Request = new XMLHttpRequest();
        Request.open("get", sURL, true);
        Request.responseType = 'json';
        Request.onreadystatechange = function () {
            if (Request.readyState == 4) {
                if (Request.status == 200) {
                    let json = Request.response;
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
    function addOptionsToSelects(item){
        addOptionsToSelect(ID,item._id);
        addOptionsToSelect(Product_id,item.Product_id);
        addOptionsToSelect(Name,item.Name);
        addOptionsToSelect(Type,item.Type);
        addOptionsToSelect(Brand,item.Brand);
        addOptionsToSelect(Origin,item.Origin);
        addOptionsToSelect(Stock_id,item.Stock_id);
        
        ID, Product_id, Name, Type, Brand, Origin, Stock_id
    }
    function addOptionsToSelect(selectId,value){
        const option = document.createElement('option');
        option.value = value;
        option.textContent = value;
        selectId.appendChild(option);
        selectId.value = value ;
    }
}
//select.removeChild()