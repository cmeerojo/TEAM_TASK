<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\TaskController;
use App\Http\Controllers\Api\ProfileController;
use App\Models\User;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// AUTH ROUTES (public)
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// PROTECTED ROUTES
Route::middleware('auth:sanctum')->group(function () {

    // auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);


    // users
    Route::get('/users', function () {
    return User::role('employee')->get();
    });
    Route::get('/profile/{id}', function ($id) {
    $user = User::with(['tasks'])->findOrFail($id);

    $tasks = $user->tasks;

    return [
        'id' => $user->id,
        'name' => $user->name,
        'email' => $user->email,
        'role' => $user->getRoleNames()->first(),
        'avatar_url' => $user->getFirstMediaUrl('avatar'),
        'tasks' => $tasks,
        'task_count' => $tasks->count(),
        'pending_count' => $tasks->where('status', 'pending')->count(),
        'in_progress_count' => $tasks->where('status', 'in_progress')->count(),
        'completed_count' => $tasks->where('status', 'completed')->count(),
    ];
});

    // profile
    Route::patch('/profile/{id}', [ProfileController::class, 'update']);

    // tasks (admin)
    Route::get('/tasks', [TaskController::class, 'index']);
    Route::post('/tasks', [TaskController::class, 'store']);
    Route::patch('/tasks/{id}', [TaskController::class, 'update']);
    Route::delete('/tasks/{id}', [TaskController::class, 'destroy']);
    Route::post('/employees', [UserController::class, 'store']);
    Route::get('/employees', [UserController::class, 'index']);
    Route::get('/employees', function () {
    return User::role('employee')->get();
});


    // employee tasks
    Route::get('/my-tasks/{userId}', [TaskController::class, 'myTasks']);
    Route::patch('/tasks/{id}/status', [TaskController::class, 'updateStatus']);
});