const amqp=require("amqplib");const crypto=require("crypto");const EXCHANGE="anetwork.events";
async function publishEvent(routingKey,payload){
 const connection=await amqp.connect(process.env.RABBITMQ_URL);
 try{
  const channel=await connection.createConfirmChannel();
  await channel.assertExchange(EXCHANGE,"topic",{durable:true});
  channel.publish(EXCHANGE,routingKey,Buffer.from(JSON.stringify({eventId:crypto.randomUUID(),eventType:routingKey,occurredAt:new Date().toISOString(),payload})),{persistent:true,contentType:"application/json"});
  await channel.waitForConfirms();await channel.close();
 }finally{await connection.close();}
}
module.exports={publishEvent};
