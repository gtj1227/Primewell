import amqp from 'amqplib';
import {
    createPerscription,
    createPayment,
    getPrescriptionWithNamesById
} from './PrimeWell_db.js';
import dotenv from 'dotenv'
dotenv.config()


const RABBITMQ_URL = process.env.RABBITMQ_URL;
const EXCHANGE_NAME = 'prescriptions_exchange';

async function sendPrescription(pharmacyName, prescriptionData) {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();
    await channel.assertExchange(EXCHANGE_NAME, 'direct', { durable: true });

    const messageBuffer = Buffer.from(JSON.stringify(prescriptionData));

    await channel.publish(EXCHANGE_NAME, pharmacyName, messageBuffer, {
        persistent: true  // ensures message survives broker restarts
    });

    console.log(" [x] Sent to %s: '%s'", pharmacyName, prescriptionData);

    await channel.close();
    await connection.close();
}

async function consumePrescriptions(pharmacyName, onMessage) {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();
    await channel.assertExchange(EXCHANGE_NAME, 'direct', { durable: true });

    // ✅ Use durable, named queue
    const queueName = `pharmacy_queue_${pharmacyName}`;
    const q = await channel.assertQueue(queueName, {
        durable: true,
    });

    await channel.bindQueue(q.queue, EXCHANGE_NAME, pharmacyName);

    console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", q.queue);
    
    channel.consume(q.queue, async (msg) => {
        if (msg !== null) {
            const prescription = JSON.parse(msg.content.toString());

            try {
                const prescription_id = await createPerscription(
                    prescription.Patient_ID,
                    prescription.Pill_ID, 
                    prescription.Quantity,
                    prescription.Doctor_ID,
                    prescription.Pharm_ID,
                    "Pending"
                );
                console.log("Creating a new prescription from RabbitMQ");

                await createPayment(prescription.Patient_ID, prescription_id, "Prescription", "Pending");
                console.log("Payment Created");

                const enriched = await getPrescriptionWithNamesById(prescription_id);
                onMessage(enriched);
                channel.ack(msg);
            } catch (err) {
                console.log("Error Inserting new prescription: ", err);
            }
        }
    }, {
        noAck: false  // makes sure the message isn't removed from the queue until explicitly acknowledged
    });
}

async function preCreatePharmacyQueue(pharmacyName) {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();
    await channel.assertExchange(EXCHANGE_NAME, 'direct', { durable: true });

    const queueName = `pharmacy_queue_${pharmacyName}`;
    await channel.assertQueue(queueName, { durable: true });
    await channel.bindQueue(queueName, EXCHANGE_NAME, pharmacyName);

    console.log(`Pre-declared durable queue for pharmacy ${pharmacyName}`);

    await channel.close();
    await connection.close();
}

export { sendPrescription, consumePrescriptions, preCreatePharmacyQueue };
