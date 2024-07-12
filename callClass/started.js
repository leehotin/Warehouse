//const { AllSubstringsIndexStrategy } = require('js-search');
const {MongoClient, ObjectId} = require('mongodb');
//const ObjectId = require('mongodb').ObjectId;

class IOemuSys{
    //建構函數用
    constructor(){
        this.client = null ;
    }

    //創造連線用
    async connect(){        
        this.client = await MongoClient.connect("mongodb://localhost:27017/") ;
         await this.client.connect();
    }
    //中斷連線用
    async disconnect(){
        await this.client.close();
    }
    async CreatedbIndex(collectionName){
        collectionName = collectionName || 'products' ;
        return  ['Warehouse_In_Out_System',collectionName] ;
    }
    async test(data,id){
        let da = await this.client.db('Warehouse_In_Out_System').collection('products').replaceOne({_id:id},data);
        //let data = await this.client.db('Warehouse_In_Out_System').collection('products').find().toArray();

        return da ;
    }
    //讀取db用，預設是載入db是Warehouse_In_Out_System，而預設集合是products，查詢的集合類型是product，還有一些剩餘參數未使用
    async Read(inquire = 'product', setdb, ...ele) {
        setdb = setdb || this.CreatedbIndex();   //初始化db
        const [dbName, collectionName] = await setdb ; 
        console.log(collectionName) ;                //終極濃縮版....新學來的...
        console.log('前台進入閱覧' + inquire + '模式，加油~');
        //const setdb = [db, collection];//Rita的舊寫法版本初始化db
        let data, query, projection = {};
        if (ele[0][0])       //如果存在就把ele[0][0]的值當成ele[0][1]的鍵 ;
            projection[ele[0][0]] = ele[0][1];
        //console.log(projection);//監察數值有沒有進去用  理論上可以刪了(就是設個斷點的用意看程式有沒有進行到這一段)
        switch (ele[0][0]) {
            case "Product_id":
            case "delivery_id":
                data = await this.client.db(dbName).collection(collectionName).findOne(projection);
                break;
            case "username":
                projection['_id'] = 0;
                projection['deleted_at'] = 1;
                data = await this.client.db(dbName).collection(collectionName).find({}, { projection }).toArray();
                break;
            case "recycleBin":
                query = {inquire:ele[0][1]} ;    //創建排序方法查詢

               // data = await this.client.db(dbName).collection(collectionName).find({}).toArray() ;
                data = await this.client.db(dbName).collection(collectionName).find().sort(query).toArray();
                break;
            default :
        }
        //把找到的所有結果放入data裡
        //回傳到呼叫函數的地方data所載的東西然後再由那邊處理
        console.log(data);
        return data;
    }
    async search(a){
        console.log('前台有人進行了1次搜尋作業');
        const setdb = ['Warehouse_In_Out_System','products'] ;
        //var data = await this.client.db(setdb[0]).collection(setdb[1]).createIndex({"$**":"text"});
        var data = await this.client.db(setdb[0]).collection(setdb[1]).find({$text:{$search:a}}).toArray(); 
        return data ;
        //var data = await this.client.db(setdb[0]).collection(setdb[1]).find().toArray();
    }
    //對所想要進行的資料進行排序，預設是對Name排序
    async sort(setdb,matchCol,targetValue,from,localField,foreignField,as,inquire='Name',...ele){
        console.log('前台使用排序功能對'+setdb[0]+'資料庫中的'+setdb[1]+'集合裡的'+inquire+'項進行排序，做到了~~');
        if(setdb[2]=="1")
            setdb[2] = 1 ;
        else setdb[2] = -1 ;
        //把找到的資料依想要排序的項目進行排序並裝入data裡
        //const data = await this.client.db(setdb[0]).collection(setdb[1]).find().sort({[inquire]:setdb[2]}).toArray();
        //回傳到呼叫的函數的地方data所載的東西然後再由那邊處理
        // let value ;
        /* if(typeof(targetValue)==='object' ){
                const objectId = targetValue ;
                value = objectId.toHexString();
                value = ObjectId.createFromHexString(value);
            }*/
            //setdb[3]
            let v = [{$lookup:{from,localField,foreignField,as}},{$sort:{[inquire]:setdb[2]}}];
            let joinData = await this.client.db(setdb[0]).collection(setdb[1]).aggregate(v//[//{
                    //$match:{[matchCol]:value}
                //},
              /*  {
                    $lookup:{
                        from:from,
                        localField:localMatch,
                        foreignField:targetMatch,
                        as:setSelector
                    }
                },
                {
                    $sort:{[inquire]:setdb[2]}
                }
            ]*/).toArray();
            //console.log(joinData)
                console.log(v);
        return joinData ;
    } 

    //暫時未使用
    async update(...ele){
        try{
            await this.connect();
            for(const x in ele[2]){
                //console.log(ele[2]);
               // await this.client.db(ele[0]).collection(ele[1]).updateOne({Product_id:ele[2][i]})
            }
        }
        finally{
            await this.disconnect();
        }
    }
    //只是試驗時有使用，還未進行修改讓所有地方呼叫，所以只是傳入剩餘參數
    async Create(...ele){
        //未把所有動作分開處理
        try{
            var w =  0 ;
            //var t = {} ;
            const newObjectlist = ele[2].slice();
            //進行這個物件本身的呼叫方式可以用this.XXXXXX
            await this.connect();
            //因為剩餘參數是以陣列的形式傳入，所以要進行一點陣列操作
            await this.client.db(ele[0]).createCollection(ele[1]) ;
            console.log(ele[2].length);
            //忘了為什麼會這樣了....
            while(w< ele[2].length && newObjectlist.length>0){
                //一個不正統的做法
                if(await this.client.db(ele[0]).collection(ele[1]).findOne({Product_id:newObjectlist[w].Product_id})){
                    //當上面找到的話進行增加的動作
                    await this.client.db(ele[0]).collection(ele[1]).updateOne({Product_id:newObjectlist[w].Product_id},{"$inc":{"Count":newObjectlist[w].Count}}) ;
                    //陣列操作
                    newObjectlist.splice(newObjectlist[w],1) ;
                    //這邊好像沒作用
                    continue ;
                    
                }
                //流程控制
                w++;
                
                //console.log(newObjectlist) ;
                //await this.client.db(ele[0]).collection(ele[1]).insertOne(ele[2][w]) ;
        
                    //return console.log('已有資料存在');
               // console.log(ele[2][w].Product_id);
            }//console.log(w);
            //console.log(newObjectlist);
            if(newObjectlist.length>0)
                await this.client.db(ele[0]).collection(ele[1]).insertMany(newObjectlist) ;
          //console.log(dat) ;
        }
        finally{
            //呼叫本身的一個叫disconnect的方法
            await this.disconnect();
        }
    }
    //進行刪除東西的操作，預設dbName是Warehouse_In_Out_System，集合2是products，並再傳入一個目標參數，該目標參數是一個陣列，裡面應該有兩個元素
    async delete(inquire='空值' ,setdb, target){
       // Read(inquire='product',db='Warehouse_In_Out_System',collection='products',...ele){
        //設定db成固定參數  await iOemuSys.delete('Warehouse_In_Out_System','products',['Product_id',req.body.call_no]);
        setdb = setdb || this.CreatedbIndex();   //初始化db
        const [dbName, collectionName] = await setdb ;
        const junkBin = 'recycleBin' ; 
        let data = await this.Read(inquire,setdb,[target[0],target[1]]);
        //console.log(data);      //一個斷點//讓後台能看到正在進入這一步
        data['source'] = collectionName ;
        data['who'] = target[2] ;
        data['original_id'] = data['_id'];
        delete data['_id'];
        let query = [{insertOne:data}];
        let starting = await this.client.db(dbName).collection(junkBin).bulkWrite(query);
        if(starting){
            console.log('資料已移轉至垃圾桶，資料如下：') ;
            console.log(starting) ;
        }
        else return err = 'Error發生了，文件沒法搬運完成QAQ' ;
        console.log(data);
        if(!query[0].deleteOne[0].filter){
            query[0].deleteOne[0].filter = {} ;
        }
        query = [{deleteOne:{filter:{}}}];
        for(const i in data){
            if(data.hasOwnProperty(target[0])){
                query[0].deleteOne[0].filter[target[0]]= target[1] ;
                break ;
            }
        }
        let toEnding = await this.client.db(dbName).collection(collectionName).bulkWrite(query)
        if(toEnding){
            console.log(`資料已從${inquire}移除~~身心舒暢~~那嚿資料如下：`) ;
            console.log(toEnding);
        }
        else return err = '糟了，文件有危險，因為是世界奇觀~' ; 
        //如果沒有傳入目標的陣列的第二個元素則跳出本呼叫///
        //await this.client.db(setdb[0]).collection(setdb[1]).bulkWrite(query);/
        //await this.client.db(setdb[0]).collection(setdb[1]).deleteOne( { Product_id: 'AB100010' });
        //if(!target[1]){
        //    return console.log('要處理的目標為空值或不完全，請退回再試或詢問相關技術人員~');/
        //}
        //當沒有意外的話便進行刪除處理(單項)
        //await this.client.db(setdb[0]).collection(setdb[1]).deleteOne({[target[0]]:target[1]}) ;
        //console.log('已完成對資料' + target[1] + '的分解~') ;
        //return 0不寫好像也不會在JS上面當錯
        return 0 ;
    }
    //檢查Login狀態
    async checkLogin(data2db){
        //用getdata來裝找到的文檔筆數
        let getdata = await this.client.db('Warehouse_In_Out_System').collection('users').countDocuments({username:data2db[0]});
        //如果多於1筆則報錯，並回傳error這個陣列，其中陣列第二個元素用來給呼叫的地方重定向成login那邊的路由
        if(getdata!=1){
            let error = [('老兄~~~我找到超過一個使用者叫' + data[0] + '的人耶~~不可能，絕對不可能~'),'login'] ;
            return error ;
        }
        //真的把找到的唯一一筆資料傳入getdata裡面
        getdata = await this.client.db('Warehouse_In_Out_System').collection('users').findOne({username:data2db[0],password:data2db[1]});
        //如果找不到匹配的資料(username和password)則進行這個if
        if(!getdata)
            //回傳一個字串
            return 'user_call_Version/login' ;
        //有找到的話把結果裝成result的一個陣列，暫定裡面有三個元素，分別是使用者名稱、密碼(已經過sha256處理的結果)[可以不用傳也可]、使用者身份類別等資料
        let result = [getdata.username, getdata.password, getdata.role] ;
        //回傳呼叫的地方result陣列
        return result ;
    }
    async joinCollection(dbName='Warehouse_In_Out_System',collectionName='products',matchCol,targetValue,fromValue,localMatch,targetMatch,setSelector,...ele){
        //console.log(typeof(targetValue));
        let value ;
        if(typeof(targetValue)==='object' ){
            const objectId = targetValue ;
            value = objectId.toHexString();
            value = ObjectId.createFromHexString(value);
        }
        let joinData = await this.client.db(dbName).collection(collectionName).aggregate([
           //{
                //$match:{[matchCol]:value}
            //},
            {
                $lookup:{
                    from:fromValue,
                    localField:localMatch,
                    foreignField:targetMatch,
                    as:setSelector
                }
            }//,
            //{
            //    $limit: 1
            //}
        ]).toArray();
        //value = joinData[0].trans_stock_id ;
        //value = [value[0].area,value[0].name] ;
        //console.log(joinData)        
        return joinData ;
    }
    //以下為呼叫函數系列，都使用剩餘參數
    async function_Read(...elements){
        await this.Read(...elements);
    }
    async function_Create(...elements){
        await this.Create(...elements);
    }
    async function_update(...elements){
        await this.update(...elements);
    }
    async function_joinCollection(...elements){
        let Data = await this.joinCollection(...elements);
        return Data ;
    }
    //呼叫檢查Login的函數 
    async function_checkLogin(data){
        //如果沒有資料則回傳errormessage作回應
        if(!data){
            let errormessage = '沒有使用者資料或密碼為空，不能進行操作與查閱~' ;
            return console.log(errormessage) ;
        }
        //有兩項資料則才進行資料比對和把結果裝在data2db裡
        let data2db = await this.checkLogin(data);
        //回傳data2db裡的東西(裡面不一定要東西，裡面裝什麼視乎進行的checkLogin()方法得到的東西)//
        return data2db;
    }
    async remove(dbName='Warehoust_In_Out_System',equiueId,...ele){
        const junkBin = 'recycleBin' ;        //這是垃圾的初始化...
        let data = await this.client.db(dbName).collection(junkBin).findOne({original_id:ObjectId.createFromHexString(equiueId)});
        const setdb = [dbName, data['source']];  //初始化 db數據
        data['_id'] = data['original_id'];       //把存在垃圾桶裡的 好東西拿回去的憑證之一
        delete data['original_id'];              //把這個憑證刪掉
        delete data['source'];                   //這是本來的來源地 好東西拿回去的憑證之二
        let query = [{insertOne:data}];          //做一個詢問條件句  以藏在下面要用的地方
        let starting = await this.client.db(setdb[0]).collection(setdb[1]).bulkWrite(query);  //bulkWrite是批量操作mongodb的方法，
        if(starting){                                                                         //同學如有不懂可以在VS Code先點在想要看說明的方法字串中
            console.log('資料已從垃圾桶裡回到家裡，其內容是：') ;                      //然後按F12 可以看到其相關的用法和作者的註解等資訊
            console.log(starting);
        }
        else return err = 'Error發生了，文件沒法搬運完成QAQ';                                                 //除止有意外直接死用
        for(const i in data){
            if(data.hasOwnProperty(target[0])){
                query[0].deleteOne['original_id']= ObjectId.createFromHexString(data._id) ;                                    //比對 偷懶用   結果到頭來懶就偷不到  code就寫了很多出來...
                break ;//比對到就跳出不讓for loop跑到最後浪費運算時間
            }
        }
        query = [{deleteOne:{filter:{}}}] ; //注入用
        let toEnding = await this.client.db(setdb[0]).collection(junkBin).bulkWrite(query) ;  //刪除垃圾桶的文檔
        if(toEnding){
            console.log('已把垃圾桶的垃圾清了~~身心舒暢~~那嚿垃圾資料如下：') ;
            console.log(toEnding);
        }
        else return err = '糟了，文件有危險，因為是世界奇觀~' ;   
                //因為我不想想太多，如有這麼個 岡刂 岡刂 女子 土褱 木幾 我鳥 者阝 手高 口吾 手店 ...
     }
}

module.exports = IOemuSys ;


