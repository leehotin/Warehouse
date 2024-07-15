//需要時引入的function 詳細用法請自己查看像是productlist那邊
export function setupSelectBox(selectBox,influence,Name) {
    var sURLInit = "/getlayout/layout";
    const InfluenceBox = document.getElementById(influence);

    selectBox.addEventListener('change', function () { 
        InfluenceBox.innerHTML = "";
    InfluenceBox.appendChild(new Option('-----Select-----',''));
        let sURL = sURLInit + "?search=" + selectBox.name + "&group=" + InfluenceBox.name+"&Name="+Name+"&limit="+selectBox.value;
        var Request = new XMLHttpRequest();
        Request.open("get", sURL, true);
        Request.responseType = 'json';
        Request.onreadystatechange = function () {
            if (Request.readyState == 4) {
                if (Request.status == 200) {
                    let json = Request.response;
                    //alert(json)
                    for (let item of json){
                        let option = new Option(item._id,item._id);
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
