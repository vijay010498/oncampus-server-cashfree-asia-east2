const functions = require('firebase-functions');
const fetch = require('node-fetch');
const admin = require('firebase-admin')
admin.initializeApp();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const validateFirebaseIdToken = async (req,res,next) =>{
  console.log('Checking');
  if((!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) &&
        !(req.cookies && req.cookies._session)){
          res.status(403).send('PETER IS PRO');
          return;
        }
        let idToken;
        if(req.headers.authorization && req.headers.authorization.startsWith('Bearer ')){
          idToken = req.headers.authorization.split('Bearer ')[1];
        }
        else if(req.cookies){
          idToken = req.cookies._session;
        }
        else {
          res.status(403).send('PETER IS PRO');
          return;
        }
        try{
          const decodedIdToken = await admin.auth().verifyIdToken(idToken);
          req.user = decodedIdToken;
          next();
          return;
        }catch(error){
          res.status(403).send('PETER IS PRO');
          return;
        }
}

//init app
const app = express();
app.use(cors({origin:true}));

//cookie parser no need for mobile
app.use(validateFirebaseIdToken);

app.get('/token',async (req,res)=>{

  let orderId = req.query.orderId;
  let orderAmount = req.query.orderAmount;

  if(orderId === undefined || orderId === null)
        res.status(401).send("Error orderId not found");
  else if (orderAmount === undefined || orderAmount === null)
        res.status(401).send("Error orderAmount not found");
  else {
    var url = "https://test.cashfree.com/api/v2/cftoken/order";
    var headers = {
        "Content-Type":"application/json",
        "X-Client-Id":"1769533d14ef0247f0de4922f59671",
        "X-Client-Secret":"c8717547fefcc4cc6f593b128ee22cf997f6e69b"
    }
    var data = {
      "orderId":orderId,
      "orderAmount":orderAmount,
      "orderCurrency":"INR"
    }
    try{
      const response = await fetch(url,{method:'POST',headers:headers,body:JSON.stringify(data)});
      const json = await response.json();
      res.send(json);
    }
    catch(error){
      res.send(error);
    }
  }
});

exports.cashfree = functions
                  .region('asia-east2')
                  .https.onRequest(app);
