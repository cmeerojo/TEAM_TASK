<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Factories\HasFactory;

use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class User extends Authenticatable implements HasMedia
{
    use HasApiTokens, HasFactory, Notifiable, HasRoles, InteractsWithMedia;

    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    // 🔥 AUTO APPENDED FIELDS FOR API
    protected $appends = [
        'avatar_url',
        'role',
    ];

    /*
    |--------------------------------------------------------------------------
    | RELATIONSHIPS
    |--------------------------------------------------------------------------
    */

    // MANY-TO-MANY: user ↔ tasks
    public function tasks()
    {
        return $this->belongsToMany(Task::class);
    }

    // ONE-TO-MANY: admin creates tasks
    public function createdTasks()
    {
        return $this->hasMany(Task::class, 'created_by');
    }

    /*
    |--------------------------------------------------------------------------
    | AVATAR (FIXED)
    |--------------------------------------------------------------------------
    */

    public function getAvatarUrlAttribute()
    {
        // MUST MATCH media collection used on upload/update
        $media = $this->getFirstMedia('avatar');

        // SAFE RETURN (no empty strings)
        return $media ? $media->getFullUrl() : null;
    }

    /*
    |--------------------------------------------------------------------------
    | ROLE HELPER
    |--------------------------------------------------------------------------
    */

    public function getRoleAttribute()
    {
        return $this->getRoleNames()->first();
    }
}