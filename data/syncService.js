// services/syncService.js
import { synchronize } from '@nozbe/watermelondb/sync';
import { database } from './database';
import axios from 'axios';

axios.interceptors.request.use(
    (config) => {
        console.log('Request Config:', config);
        return config;
    },
    (error) => {
        console.error('Request Error:', error);
        return Promise.reject(error);
    }
);

axios.interceptors.response.use(
    (response) => {
        console.log('Response:', response);
        return response;
    },
    (error) => {
        console.error('Response Error:', error.message);
        if (error.response) {
            console.error('Server Response:', error.response.data);
        } else if (error.request) {
            console.error('No Response Received:', error.request);
        }
        return Promise.reject(error);
    }
);
let isSyncing =false


export async function syncDatabase() {
    if (isSyncing) return; // Prevent multiple simultaneous executions
isSyncing = true;
    try {
        await synchronize({
            database: database,
            // sendCreatedAsUpdated: true,
            pullChanges: async ({ lastPulledAt }) => {
                try {
                    const response = await axios.post(
                        'http://192.168.1.3:6000/sync',
                        { lastPulledAt }, // Send lastPulledAt as null for the first sync
                        { headers: { 'Content-Type': 'application/json' } }
                    );

                    if (response.status !== 200) {
                        throw new Error('Failed to pull changes');
                    }

                    const { changes, last_pulled_at } = response.data;

                    if (!last_pulled_at || typeof last_pulled_at !== 'number') {
                        throw new Error('Invalid timestamp returned from server');
                    }

                    console.log('Last pulled at:', last_pulled_at,changes?.userdata?.created); // Log for debugging
                    return { changes, timestamp: last_pulled_at };

                } catch (error) {
                    console.error('Error in pullChanges:', error);
                    throw error;
                }
            },


            pushChanges: async ({ changes }) => {
                console.log(changes, "Changes being pushed");

                // Axios call with explicit headers
                const response = await axios.post(
                    'http://192.168.1.3:6000/sync',
                    { changes }, // Request body
                    {
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    }
                );

                if (response.status !== 200) {
                    throw new Error('Failed to push changes');
                }
            },
        });

        console.log('Sync completed successfully');
    } catch (error) {
        console.error('Sync failed:', error);
    } finally{
        isSyncing = false;
    }
}


