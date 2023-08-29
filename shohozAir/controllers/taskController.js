import asyncHandler from 'express-async-handler'

import Task from '../models/taskModel.js'

/**
 *
 * @desc    add a new task
 * @route   POST /api/tasks
 * @access  Private
 */
const addTask = asyncHandler(async (req, res) => {
    const { details } = req.body
    const task = await Task.create({
        details,
        userId: req.user.id,
    })

    if (task) {
        let newTask = task.dataValues
        res.status(201).json({
            id: newTask.id,
            details: newTask.details,
            isComplete: newTask.isComplete,
            userId: newTask.userId,
        })
    } else {
        res.status(400)
        throw new Error('Invalid task data')
    }
})

/**
 *
 * @desc    update a task
 * @route   PUT /api/tasks/:id
 * @access  Private
 */
const updateTask = asyncHandler(async (req, res) => {
    const task = await Task.findByPk(req.params.id)

    if (task) {
        task.details = req.body.details || task.details
        task.isComplete = req.body.isComplete || task.isComplete

        const updatedTask = await task.save()

        res.json({
            id: updatedTask.id,
            details: updatedTask.details,
            isComplete: updatedTask.isComplete,
            userId: updatedTask.userId,
        })
    } else {
        res.status(404)
        throw new Error('Task not found')
    }
})

/**
 *
 * @desc    delete a task
 * @route   DELETE /api/tasks/:id
 * @access  Private
 */
const deleteTask = asyncHandler(async (req, res) => {
    const task = await Task.findByPk(req.params.id)
    if (task) {
        await task.destroy()
        res.json({ message: 'Task removed' })
    } else {
        res.status(404)
        throw new Error('Task not found')
    }
})

export { addTask, updateTask, deleteTask }
