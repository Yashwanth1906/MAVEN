import 'dotenv/config';
import express from 'express';
import { createClient } from 'redis';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
    datasources: {
        db: {
            url: process.env.DATABASE_URL
        }
    }
});

const redisClient = createClient({
    url: `redis://localhost:6379`
});

const QUEUE_NAME = 'chat_operations';

async function connectRedis() {
    try {
        await redisClient.connect();
        console.log('Connected to Redis');
    } catch (error) {
        console.error('Redis connection error:', error);
        process.exit(1);
    }
}

async function processQueue() {
    try {
        while (true) {
            const result = await redisClient.brPop(QUEUE_NAME, 0);
            if (!result) continue;

            const operation = JSON.parse(result.element);
            console.log('Processing operation:', operation.type);
            console.log(operation.data);
            try {
                switch (operation.type) {
                    case 'create_history':
                        await prisma.history.create({
                            data: operation.data
                        });
                        console.log('History created successfully');
                        break;

                    case 'save_chat':
                        await prisma.chat.create({
                            data: operation.data
                        });
                        console.log('Chat saved successfully');
                        break;

                    default:
                        console.error('Unknown operation type:', operation.type);
                }
            } catch (error) {
                console.error('Error processing operation:', error);
            }
        }
    } catch (error) {
        console.error('Queue processing error:', error);
        setTimeout(processQueue, 5000);
    }
}

app.get('/health', (req, res) => {
    res.json({ status: 'healthy' });
});

async function startWorker() {
    try {
        await connectRedis();
        await processQueue();
    } catch (error) {
        console.error('Worker startup error:', error);
        process.exit(1);
    }
}

const PORT = process.env.WORKER_PORT || 3001;
app.listen(PORT, () => {
    console.log(`Worker service listening on port ${PORT}`);
    startWorker();
});

process.on('SIGTERM', async () => {
    console.log('SIGTERM received. Closing connections...');
    await redisClient.quit();
    await prisma.$disconnect();
    process.exit(0);
}); 