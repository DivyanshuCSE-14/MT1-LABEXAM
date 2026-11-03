
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;

// Store employee tasks in a JavaScript array.
const tasks = [
    {
        id: 1,
        taskName: 'Develop Login Page',
        assignedTo: 'Rahul Sharma',
        status: 'Pending'
    },
    {
        id: 2,
        taskName: 'Test Website',
        assignedTo: 'Priya Singh',
        status: 'In Progress'
    },
    {
        id: 3,
        taskName: 'Prepare Project Report',
        assignedTo: 'Amit Kumar',
        status: 'Completed'
    }
];

// Create the HTTP server.
const server = http.createServer((req, res) => {
    const { method, url } = req;

    // A1 and A2: Welcome route.
    if (method === 'GET' && url === '/') {
        res.writeHead(200, {
            'Content-Type': 'text/html; charset=utf-8'
        });

        res.end(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Employee Task Management</title>
            </head>
            <body>
                <h1>Welcome to Employee Task Management</h1>
                <p>Node.js HTTP Server is running.</p>
            </body>
            </html>
        `);
        return;
    }

    // A2 and A3: Retrieve all tasks.
    if (method === 'GET' && url === '/tasks') {
        res.writeHead(200, {
            'Content-Type': 'application/json; charset=utf-8'
        });

        res.end(JSON.stringify(tasks, null, 2));
        return;
    }

    // A2: About route.
    if (method === 'GET' && url === '/about') {
        res.writeHead(200, {
            'Content-Type': 'text/plain; charset=utf-8'
        });

        res.end(
            'Employee Task Management Application using Node.js HTTP and FS modules.'
        );
        return;
    }

    // A4: Serve index.html using the FS module.
    if (method === 'GET' && url === '/home') {
        const filePath = path.join(
            __dirname,
            'public',
            'index.html'
        );

        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                res.writeHead(500, {
                    'Content-Type': 'text/plain; charset=utf-8'
                });

                res.end('Error: Unable to read index.html');
                return;
            }

            res.writeHead(200, {
                'Content-Type': 'text/html; charset=utf-8'
            });

            res.end(data);
        });
        return;
    }

    // A3: Add a task using the POST method.
    if (method === 'POST' && url === '/add-task') {
        let body = '';

        req.on('data', chunk => {
            body += chunk;

            // Prevent an excessively large request body.
            if (body.length > 1e6) {
                res.writeHead(413, {
                    'Content-Type': 'application/json'
                });

                res.end(JSON.stringify({
                    error: 'Request body is too large'
                }));

                req.destroy();
            }
        });

        req.on('end', () => {
            if (res.writableEnded) return;

            let newTask;

            try {
                newTask = JSON.parse(body);
            } catch {
                res.writeHead(400, {
                    'Content-Type': 'application/json'
                });

                res.end(JSON.stringify({
                    error: 'Invalid JSON request body'
                }));
                return;
            }

            if (
                !newTask ||
                typeof newTask !== 'object' ||
                Array.isArray(newTask)
            ) {
                res.writeHead(400, {
                    'Content-Type': 'application/json'
                });

                res.end(JSON.stringify({
                    error: 'Task must be a JSON object'
                }));
                return;
            }

            const { id, taskName, assignedTo, status } = newTask;

            if (
                id === undefined ||
                id === null ||
                !Number.isInteger(Number(id)) ||
                String(id).trim() === '' ||
                !Number.isSafeInteger(Number(id)) ||
                Number(id) < 1 ||
                typeof taskName !== 'string' ||
                !taskName.trim() ||
                typeof assignedTo !== 'string' ||
                !assignedTo.trim() ||
                typeof status !== 'string' ||
                !status.trim()
            ) {
                res.writeHead(400, {
                    'Content-Type': 'application/json'
                });

                res.end(JSON.stringify({
                    error: 'Required fields: valid id, taskName, assignedTo and status'
                }));
                return;
            }

            const taskId = Number(id);

            if (tasks.some(task => task.id === taskId)) {
                res.writeHead(409, {
                    'Content-Type': 'application/json'
                });

                res.end(JSON.stringify({
                    error: 'Task ID already exists'
                }));
                return;
            }

            const task = {
                id: taskId,
                taskName: taskName.trim(),
                assignedTo: assignedTo.trim(),
                status: status.trim()
            };

            tasks.push(task);

            res.writeHead(201, {
                'Content-Type': 'application/json'
            });

            res.end(JSON.stringify({
                message: 'Task added successfully',
                task
            }));
        });
        return;
    }

    // A5: Return 404 for unknown routes.
    res.writeHead(404, {
        'Content-Type': 'application/json; charset=utf-8'
    });

    res.end(JSON.stringify({
        error: 'Route not found'
    }));
});

// Start the server.
server.listen(PORT, () => {
    console.log(`HTTP Server running at http://localhost:${PORT}`);
});
