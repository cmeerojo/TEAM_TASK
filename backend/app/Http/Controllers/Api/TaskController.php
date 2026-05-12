<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Models\User;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    // GET ALL TASKS (ADMIN ONLY)
    public function index()
    {
        return Task::with(['users', 'creator'])->latest()->get();
    }

    // CREATE TASK (ADMIN ONLY)
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string',
            'description' => 'nullable|string',
            'users' => 'array', // employee IDs
        ]);

        $task = Task::create([
            'title' => $request->title,
            'description' => $request->description,
            'status' => 'pending',
            'created_by' => $request->user()->id,
        ]);

        // attach employees
        if ($request->users) {
            $task->users()->attach($request->users);
        }

        return $task->load(['users', 'creator']);
    }

    // UPDATE TASK (ADMIN ONLY)
    public function update(Request $request, $id)
    {
        $task = Task::findOrFail($id);

        $task->update($request->only([
            'title',
            'description',
            'status',
        ]));

        // update assigned employees
        if ($request->has('users')) {
            $task->users()->sync($request->users);
        }

        return $task->load(['users', 'creator']);
    }

    // EMPLOYEE TASKS
    public function myTasks($userId)
    {
        $user = User::findOrFail($userId);

        return $user->tasks()->with(['creator', 'users'])->get();
    }

    // UPDATE STATUS (EMPLOYEE OR ADMIN)
    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:pending,in_progress,completed'
        ]);

        $task = Task::findOrFail($id);

        $task->update([
            'status' => $request->status
        ]);

        return $task->load(['users', 'creator']);
    }

    public function destroy($id)
    {
    $task = Task::findOrFail($id);

    // detach users first (important for pivot cleanup)
    $task->users()->detach();

    $task->delete();

    return response()->json([
        'message' => 'Task deleted successfully'
        ]);
    }
}