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
    //讀取db用，預設是載入db是Warehouse_In_Out_System，而預設集合是products，查詢的文檔是product，還有一些剩餘參數未使用
    async Read(inquire='product',db='Warehouse_In_Out_System',collection='products',...ele){
            console.log('前台進入閱覧'+inquire+'模式，加油~');
            const setdb = [db,collection];
            console.log(setdb);
            console.log(await this.client.db(setdb[0]).collection(setdb[1]).find().toArray());
           /* console.log(ele);
            let id ;
            if(ele)//ObjectId.createFromHexString(req.session.user_id)
                ele =ele[0] ;
            else id = undefined ;
            console.log(id);*/
            //把找到的所有結果放入data裡
            var data = await this.client.db(setdb[0]).collection(setdb[1]).find().toArray();
            //回傳到呼叫函數的地方data所載的東西然後再由那邊處理
            return data ;
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
    async sort(setdb,matchCol,targetValue,fromValue,localMatch,targetMatch,setSelector,inquire='Name',...ele){
        console.log('前台使用排序功能對'+setdb[0]+'資料庫中的'+setdb[1]+'集合裡的'+inquire+'項進行排序，做到了~~');
        //把找到的資料依想要排序的項目進行排序並裝入data裡
        //const data = await this.client.db(setdb[0]).collection(setdb[1]).find().sort({[inquire]:setdb[2]}).toArray();
        //回傳到呼叫的函數的地方data所載的東西然後再由那邊處理
        
            //console.log(typeof(targetValue));
           // let value ;
           /* if(typeof(targetValue)==='object' ){
                const objectId = targetValue ;
                value = objectId.toHexString();
                value = ObjectId.createFromHexString(value);
            }*/
            let joinData = await this.client.db(setdb[0]).collection(setdb[1]).aggregate([
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
                },
                {
                    $sort:{[inquire]:setdb[2]}
                }
            ]).toArray();
            //console.log(joinData)

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
    async delete(dbName='Warehouse_In_Out_System' ,collectionName='products', target){
        //設定db成固定參數
        const setdb = [dbName,collectionName] ;
        //讓後台能看到正在進行這個操作
        console.log('前台進入對'+ setdb[1] +'內的資料'+ target[1] +'進行刪除，各位考試加油~');
        //如果沒有傳入目標的陣列的第二個元素則跳出本呼叫
        if(!target[1]){
            return console.log('要處理的目標為空值或不完全，請退回再試或詢問相關技術人員~');
        }
        //當沒有意外的話便進行刪除處理(單項)
        await this.client.db(setdb[0]).collection(setdb[1]).deleteOne({[target[0]]:target[1]}) ;
        console.log('已完成對資料' + target[1] + '的分解~') ;
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
        //回傳data2db裡的東西(裡面不一定要東西，裡面裝什麼視乎進行的checkLogin()方法得到的東西)
        return data2db;
    }
}

module.exports = IOemuSys ;



/*exports.A = async (...ele) => {
    try {
        await client.connect();
        const data = await client.db(ele[0]).collection(ele[1]).findOne({ name: ele[2] });
        console.log(data.name);
    } finally {
        await client.close();
    }
};

exports.function_Main = async (...elements) => {
    await exports.A(...elements);
};
/*module.exports = {
    function_Main: async (...elements) => {
        await A(...elements);
    },
    A: async (...ele) => {
        try {
            await client.connect();
            const data = await client.db(ele[0]).collection(ele[1]).findOne({ name: ele[2] });
            console.log(data.name);
        } finally {
            await client.close();
        }
    }
};
exports.function_Main = async(...elements)=>{
    await exports.A(...elements);
}
/*module.exports = {
    function_Main: async (...elements) => {
        await A(...elements);
    },
    A: async (...ele) => {
        try {
            await client.connect();

            const data = await client.db(ele[0]).collection(ele[1]).findOne({ id: ele[2] });
            console.log(data.id);
        }
        finally {
            await client.close();
        }
    },
    A('123','234') ;



};

/*module.exports = {
    function_Main: async (...elements) => {
        await A(...elements);
    },
    A: async (...ele) => {
        try {
            await client.connect();
            const data = await client.db(ele[0]).collection(ele[1]).findOne({ id: ele[2] });
            console.log(data.id);
        } finally {
            await client.close();
        }
    }
};
  /*  function_Create: async function(...elements){
        try{
            await client.connect();
        }
        finally{
            await client.close();
        }

    },*/
    
/*    function_Read: async function(...elements){
        try{ 
            await client.connect();
            
            const data = await client.db(elements[0]).collection(elements[1]).findOne({name:elements[2]});
            console.log(data) ;
        }
        finally{
            await client.close();
        }
    },

    function_Del: async (...elements)=>{
        try{
            await client.connect();
        }
        finally{
            await client.close();
        }
    },
    
    function_Update: async (...elements)=>{
        try{
            await client.connect();
        }
        finally{
            await client.close();
        }
    }
};*/
