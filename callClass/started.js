//const { AllSubstringsIndexStrategy } = require('js-search');
//const { filter } = require('domutils');   //不知為什麼會有XD
const { MongoClient, ObjectId } = require('mongodb');
//const ObjectId = require('mongodb').ObjectId;

class IOemuSys {
    //建構函數用
    constructor() {
        this.client = null;
    }

    //創造連線用
    async connect() {
        this.client = await MongoClient.connect("mongodb://localhost:27017/");
        await this.client.connect();
    }
    //中斷連線用
    async disconnect() {
        await this.client.close();
    }
    async CreatedbIndex(collectionName) {
        collectionName = collectionName || 'products';
        return ['Warehouse_In_Out_System', collectionName];
    }
    async tesiit(data, id) {
        let da = await this.client.db('Warehouse_In_Out_System').collection('products').replaceOne({ _id: id }, data);

        return da;
    }
    async lookupSheet(lookup) {
        const lookupSheet = lookup || ['stocks', 'stock_id', '_id', 'trans_stock_id'];
        return lookupSheet;
    }

    /*   沒有使用的功能 預期是把想要轉換的文檔字段轉成想要的型別
        async selectType(setdb) {
            setdb = setdb || this.CreatedbIndex();
            const [dbName, collectionName] = await setdb;
            //let d =await this.client.db(dbName).collection(collectionName).find({}).toArray()//.update({delivery_id:delivery_id},{$set:{delivery_check:String(delivery_check)}});
            //console.log(d);
        }
    */

    async Read(inquire = 'product', setdb, ...ele) {
        setdb = setdb || this.CreatedbIndex();   //初始化db
        const [dbName, collectionName] = await setdb;
        //console.log(collectionName) ;                //終極濃縮版....新學來的...
        //console.log('前台進入閱覧' + inquire + '模式，加油~');
        //const setdb = [db, collection];//Rita的舊寫法版本初始化db
        let data, projection = {}, pipline = [];
        if (ele.length !== 0) {
            //如果剩餘參數長度不為0就把ele[0][0]的值當成ele[0][1]的鍵 ;如果用剩餘參數，前台怎麼都會傳一個數組給後台，所以要檢查是不是長度為0
            projection[ele[0][0]] = ele[0][1];
            switch (ele[0][0]) {
                case "_id":
                case "Product_id":
                case "delivery_id":
                    data = await this.client.db(dbName).collection(collectionName).findOne(projection);
                    break;
                case "Brand":
                    let Origin = [], Brand;
                    //這樣把ele[0][0]當索引分組, 其他不用顯示，這邊的sort操作_id不是指原本的_id，不加的話取得的順序會改變
                    pipline = [{ $group: { _id: `$${ele[0][0]}` } }, { $sort: { _id: 1 } }];
                    Origin = [{ $group: { _id: "$Origin" } }, { $sort: { _id: 1 } }, { $project: { _id: 0, Origin: "$_id" } }];

                    //console.log(pipline);
                    Brand = await this.client.db(dbName).collection(collectionName).aggregate(pipline).toArray();
                    Origin = await this.client.db(dbName).collection(collectionName).aggregate(Origin).toArray();
                    data = [Brand, Origin];
                    break;
                case "username":
                    projection['_id'] = 0;
                    projection['deleted_at'] = 1;
                    data = await this.client.db(dbName).collection(collectionName).find({}, { projection }).toArray();
                    break;
                case "recycleBin":
                    pipline = { inquire: ele[0][1] };    //創建排序方法查詢
                    data = await this.client.db(dbName).collection(collectionName).find().sort(pipline).toArray();
                    break;
                default:
            }
        }
        else data = await this.client.db(dbName).collection(collectionName).find().toArray();
        return data;
    }
    async search(inquire, setdb, query) {
        setdb = setdb || this.CreatedbIndex();
        const [dbName, collectionName] = await setdb;
        const [group, search, limit] = await query;
        console.log('前台有人進行了1次' + inquire + '操作');
        let pipline = [{ $match: { [search]: limit } }, { $group: { _id: `$${group}` } }, { $sort: { _id: 1 } }];
        let data = await this.client.db(dbName).collection(collectionName).aggregate(pipline).toArray();
        return data;

    }

    async sort(inquire, setdb, lookupSheet, reqQuery, ...ele) {
        setdb = setdb || this.CreatedbIndex();
        const [dbName, collectionName] = await setdb;
        lookupSheet = lookupSheet || this.lookupSheet();
        const [from, localField, foreignField, as] = await lookupSheet;
        let [sort, sequence] = reqQuery;
        let query;
        console.log('前台使用排序功能對' + dbName + '資料庫中的' + collectionName + '集合裡的' + sort + '項進行' + inquire + '，做到了~~');
        if (sequence == "1")
            sequence = 1;
        else sequence = -1;
        if (ele[0]) {
            if (ele[0].length == 24)
                ele[0] = ObjectId.createFromHexString(ele[0]);
            query = [{ $match: { [sort]: ele[0] } }, { $lookup: { from, localField, foreignField, as } }, { $sort: { [sort]: sequence } }];
        }
        else
            query = [{ $lookup: { from, localField, foreignField, as } }, { $sort: { [sort]: sequence } }];

        let joinData = await this.client.db(dbName).collection(collectionName).aggregate(query).toArray();

        return joinData;
    }

    //暫時未使用
    async update(inquire, setdb, query, ...ele) {
        setdb = setdb || this.CreatedbIndex();
        const [dbName, collectionName] = await setdb;
        let result = [], temp = {}, items = [], data;
        switch (inquire) {
            case 'updateDeliveryOrder':
                for (let i = 0; i < query['item[product_id]'].length; i++) {
                    items[i] = {
                        product_id: query['item[product_id]'][i],
                        name: query['item[name]'][i],
                        count: Number(query['item[count]'][i]),
                        completed: Number(query['item[completed]'][i]),
                        stock_id: query['item[stock_id]'][i]
                    };
                };
                if (query['up_item[name]'][0] != '') {
                    let j = 0;
                    for (let i = query['item[product_id]'].length; i < query['item[product_id]'].length + 2; i++) {
                        items[i] = {
                            "product_id": query['up_item[product_id]'][j],
                            "name": query['up_item[name]'][j],
                            "count": Number(query['up_item[count]'][j]),
                            "completed": Number(query['up_item[completed]'][j]),
                            "stock_id": query['up_item[stock_id]'][j]
                        };
                        j++;
                    }
                };
                temp = {
                    delivery_id: query['delivery_id'],
                    company: query['company'],
                    address: query['address'],
                    phone: query['phone'],
                    items: items,
                    type: query['type'],
                    delivery_check: query['delivery_check'],
                    delivery_user: query['delivery_user'],
                    updated_at: new Date()
                };
                result = [{
                    updateOne: {
                        filter: { delivery_id: query['delivery_id'] },
                        update: {
                            $set: temp
                        },
                        upset: true
                    }
                }];
                data = await this.client.db(dbName).collection(collectionName).bulkWrite(result);
                break;
            case 'newProduct':
                result = [{
                    insertOne: query
                }];
                data = await this.client.db(dbName).collection(collectionName).bulkWrite(result);
                break;
            default:
        }
        return data;
    }

    //進行刪除東西的操作，預設dbName是Warehouse_In_Out_System，集合2是products，並再傳入一個目標參數，該目標參數是一個陣列，裡面應該有兩個元素
    async delete(inquire = '空值', setdb, target) {
        // Read(inquire='product',db='Warehouse_In_Out_System',collection='products',...ele){
        //設定db成固定參數  await iOemuSys.delete('Warehouse_In_Out_System','products',['Product_id',req.body.call_no]);
        setdb = setdb || this.CreatedbIndex();   //初始化db
        const [dbName, collectionName] = await setdb;
        const junkBin = 'recycleBin';
        let filter;
        let data = await this.Read(inquire, setdb, [target[0], target[1]]);
        //console.log(data);      //一個斷點//讓後台能看到正在進入這一步
        data['source'] = collectionName;
        data['who'] = target[2];
        data['original_id'] = data['_id'];
        delete data['_id'];
        let query = [{ insertOne: data }];
         let starting = await this.client.db(dbName).collection(junkBin).bulkWrite(query);
        if (starting) {
            console.log('資料已移轉至垃圾桶，資料如下：');
            console.log(starting);
        }
        else return err = 'Error發生了，文件沒法搬運完成QAQ';
        //console.log(data);
        query = [{ deleteOne: { filter:{} } }];
        //console.log('a',target[1])
        //[{ deleteOne: { filter } }] = query;
        //for (const i in data) {
        //    if (data.hasOwnProperty(target[0])) {
                filter= {[target[0]]:target[1]};
        //        break;
        //    }
        //}
        console.log('a',filter);
        let toEnding = await this.client.db(dbName).collection(collectionName).bulkWrite(query)
        if (toEnding) {
            console.log(`資料已從${inquire}移除~~身心舒暢~~那嚿資料如下：`);
            console.log(toEnding);
        }
        else return err = '糟了，文件有危險，因為是世界奇觀~';
        return 0;
    }
    /*Not use
    async check(inquire,setdb,_id){
        setdb = setdb || this.CreatedbIndex();
        const [dbName, collectionName] = await setdb ;
        try{
            await this.connect()
        if(_id){
            let user = await this.client.db(dbName).collection(collectionName).findOne({_id});
          if(user){
            return true ;
          }else{
            return false;
          }
        }else{
          return false; 
        }
      }finally{
        await this.disconnect();
      }
    }
    */

    async rollBack(setdb, equiueId, ...ele) {
        setdb = setdb || this.CreatedbIndex();
        const [dbName, junkBin] = await setdb ;       //這是垃圾的初始化...
        let query, datas, steck=[], steckNotes=[], steckStock=[], steckUsers=[], temp=[],starting,toEnding;
        if(typeof(equiueId)=='string'){
            equiueId = [equiueId];
        }
        for (let i of equiueId) {
            steck.push(ObjectId.createFromHexString(i));
        }
        query = { _id: { $in: steck } };
        datas = await this.client.db(dbName).collection(junkBin).find(query).toArray();
        steck = [];
        query = [] ;
        for (let data of datas) {
            data.collectionName = data.source;
            temp.push(data._id);
            data._id = data.original_id;
            delete data.original_id;
            delete data.source;
            delete data.who;
            switch (data.collectionName) {
                case "delivery_notes":
                    steckNotes.push(data);
                    delete data.collectionName;
                    break;
                case "products":
                    steck.push(data);
                    delete data.collectionName;
                    break;
                case "stocks":
                    steckStock.push(data);
                    delete data.collectionName;
                    break;
                case "users":
                    steckUsers.push(data);
                    delete data.collectionName;
                    break;
                default:        
            }
        }
        if(steck.length!=0){
            query = [] ;
            for(let data of steck)
                query.push({insertOne:data})
        starting = await this.client.db(dbName).collection('products').bulkWrite(query);
        }
        if(steckNotes.length!=0){
            query = [] ;
            for(let data of steckNotes)
                query.push({insertOne:data})
        starting = await this.client.db(dbName).collection('delivery_notes').bulkWrite(query);
        }
        if(steckStock.length!=0){
            query = [] ;
            for(let data of steckStock)
                query.push({insertOne:data})
        starting = await this.client.db(dbName).collection('stocks').bulkWrite(query);
        }
        if(steckUsers.length!=0){
            query = [] ;
            for(let data of steckUsers)
                query.push({insertOne:data})
        starting = await this.client.db(dbName).collection('users').bulkWrite(query);
        }
        query = [] ;
        console.log(temp);
        query = [{deleteMany:{filter:{_id:{$in:temp}}}}];
        //console
        console.log(query);
        toEnding = await this.client.db(dbName).collection(junkBin).bulkWrite(query);
        //return toEnding;
        /*let starting = await this.client.db(dbName).collection(setdb[1]).bulkWrite(query);  //bulkWrite是批量操作mongodb的方法，
        if(starting){                                                                         //同學如有不懂可以在VS Code先點在想要看說明的方法字串中
            console.log('資料已從垃圾桶裡回到家裡，其內容是：') ;                      //然後按F12 可以看到其相關的用法和作者的註解等資訊
            console.log(starting);
        }
        else return err = 'Error發生了，文件沒法搬運完成QAQ';                                                 //除止有意外直接死用
        for(const i in data){
            if(data.hasOwnProperty(target[0])){
                query[0].deleteOne['_id']= ObjectId.createFromHexString(data._id) ;                                    //比對 偷懶用   結果到頭來懶就偷不到  code就寫了很多出來...
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
                //因為我不想想太多，如有這麼個 岡刂 岡刂 女子 土褱 木幾 我鳥 者阝 手高 口吾 手店 ...*/
    }

}

module.exports = IOemuSys;