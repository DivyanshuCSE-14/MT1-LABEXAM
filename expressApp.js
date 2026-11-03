
import express from 'express';

const app = express();
const PORT = 4000;

// Middleware to parse incoming JSON bodies.
app.use(express.json());

// In-memory employee task records.
const tasks = [
    {
        id: 1,
        taskName: 'Develop Login Page',
        assignedTo: 'Rahul Sharma',
        status: 'Pending',
        priority: 'High'
    },
    {
        id: 2,
        taskName: 'Test Website',
        assignedTo: 'Priya Singh',
        status: 'In Progress',
        priority: 'Medium'
    },
    {
        id: 3,
        taskName: 'Prepare Project Report',
        assignedTo: 'Amit Kumar',
        status: 'Completed',
        priority: 'Low'
    }
];

// Helper function to find a task by its ID.
function findTaskIndex(id) {
    return tasks.findIndex(task => task.id === id);
}

// Validate a task's required fields.
function hasValidTaskFields(body, includeId = false) {
    if (
        !body ||
        typeof body !== 'object' ||
        Array.isArray(body)
    ) {
        return false;
    }

    const validText = value =>
        typeof value === 'string' && value.trim().length > 0;

    return (
        (!includeId ||
            (
                Number.isSafeInteger(body.id) &&
                body.id > 0
            )
        ) &&
        validText(body.taskName) &&
        validText(body.assignedTo) &&
        validText(body.status) &&
        validText(body.priority)
    );
}

// B2: GET /tasks
// Retrieve all tasks.
app.get('/tasks', (req, res) => {
    res.status(200).json(tasks);
});

// B2: GET /tasks/:id
// Retrieve one task by ID.
app.get('/tasks/:id', (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id < 1) {
        return res.status(400).json({
            error: 'Invalid task ID'
        });
    }

    const index = findTaskIndex(id);

    if (index === -1) {
        return res.status(404).json({
            error: 'Task not found'
        });
    }

    res.status(200).json(tasks[index]);
});

// B2: POST /tasks
// Create a new task.
app.post('/tasks', (req, res) => {
    if (!hasValidTaskFields(req.body, true)) {
        return res.status(400).json({
            error: 'Required fields: valid id, taskName, assignedTo, status and priority'
        });
    }

    if (tasks.some(task => task.id === req.body.id)) {
        return res.status(409).json({
            error: 'Task ID already exists'
        });
    }

    const newTask = {
        id: req.body.id,
        taskName: req.body.taskName.trim(),
        assignedTo: req.body.assignedTo.trim(),
        status: req.body.status.trim(),
        priority: req.body.priority.trim()
    };

    tasks.push(newTask);

    res.status(201).json({
        message: 'Task added successfully',
        task: newTask
    });
});

// B2: PUT /tasks/:id
// Update an existing task.
app.put('/tasks/:id', (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id < 1) {
        return res.status(400).json({
            error: 'Invalid task ID'
        });
    }

    const index = findTaskIndex(id);

    if (index === -1) {
        return res.status(404).json({
            error: 'Task not found'
        });
    }

    if (!hasValidTaskFields(req.body)) {
        return res.status(400).json({
            error: 'Required fields: taskName, assignedTo, status and priority'
        });
    }

    tasks[index] = {
        id,
        taskName: req.body.taskName.trim(),
        assignedTo: req.body.assignedTo.trim(),
        status: req.body.status.trim(),
        priority: req.body.priority.trim()
    };

    res.status(200).json({
        message: 'Task updated successfully',
        task: tasks[index]
    });
});

// B2: DELETE /tasks/:id
// Delete a task by ID.
app.delete('/tasks/:id', (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id < 1) {
        return res.status(400).json({
            error: 'Invalid task ID'
        });
    }

    const index = findTaskIndex(id);

    if (index === -1) {
        return res.status(404).json({
            error: 'Task not found'
        });
    }

    const deletedTask = tasks.splice(index, 1)[0];

    res.status(200).json({
        message: 'Task deleted successfully',
        task: deletedTask
    });
});

// Handle malformed JSON request bodies.
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({
            error: 'Invalid JSON request body'
        });
    }

    next(err);
});

// Handle unknown API routes.
app.use((req, res) => {
    res.status(404).json({
        error: 'Route not found'
    });
});

// Start the Express server.
app.listen(PORT, () => {
    console.log(`Express Server running at http://localhost:${PORT}`);
});
