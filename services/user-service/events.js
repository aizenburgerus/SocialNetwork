const amqp=require("amqplib");const pool=require("./db");const EXCHANGE="anetwork.events";const QUEUE="user-service.user-registered";
async function startUserRegisteredConsumer(){
 while(true){let connection;
  try{
   connection=await amqp.connect(process.env.RABBITMQ_URL);
   const channel=await connection.createChannel();
   await channel.assertExchange(EXCHANGE,"topic",{durable:true});
   await channel.assertQueue(QUEUE,{durable:true});
   await channel.bindQueue(QUEUE,EXCHANGE,"user.registered");
   channel.prefetch(10);
   console.log("UserService subscribed to user.registered");
   channel.consume(QUEUE,async message=>{
    if(!message)return;
    try{
     const event=JSON.parse(message.content.toString());
     if(event.eventType!=="user.registered"||!event.payload?.userId){channel.ack(message);return;}
     await pool.query("INSERT INTO profiles(user_id,username) VALUES($1,$2) ON CONFLICT(user_id) DO UPDATE SET username=EXCLUDED.username,updated_at=NOW()",[event.payload.userId,event.payload.username]);
     console.log("Profile created/updated for user:",event.payload.userId);channel.ack(message);
    }catch(error){console.error("UserRegistered processing failed:",error);channel.nack(message,false,true);}
   });
   await new Promise(resolve=>{connection.once("close",resolve);connection.once("error",resolve);});
  }catch(error){console.error("RabbitMQ consumer unavailable; retry in 5s:",error.message);}
  finally{if(connection){try{await connection.close();}catch{}}}
  await new Promise(resolve=>setTimeout(resolve,5000));
 }
}
module.exports={startUserRegisteredConsumer};
