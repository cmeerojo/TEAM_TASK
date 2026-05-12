<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    protected $fillable = [
        'title',
        'description',
        'status',
        'created_by',
    ];

    // MANY-TO-MANY: tasks ↔ users
    public function users()
    {
        return $this->belongsToMany(User::class);
    }

    // creator (admin)
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}