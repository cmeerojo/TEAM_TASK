<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class ProfileController extends Controller
{
    public function show($id)
    {
        $user = User::findOrFail($id);

        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->getRoleNames()->first(),
            'avatar_url' => $user->getFirstMediaUrl('avatar'),
        ]);
    }

    public function update(Request $request, $id)
    {
        try {
            $user = User::findOrFail($id);

            $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|email',
                'avatar' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
                'current_password' => 'nullable|string',
                'new_password' => 'nullable|string|min:8|confirmed',
            ]);

            // UPDATE USER INFO
            $user->name = $request->name;
            $user->email = $request->email;

            // HANDLE PASSWORD CHANGE (optional)
            if ($request->filled('new_password')) {
                // require current password and verify
                if (! $request->filled('current_password') || ! Hash::check($request->current_password, $user->password)) {
                    return response()->json(['message' => 'Current password is incorrect'], 422);
                }

                $user->password = bcrypt($request->new_password);
            }

            $user->save();

            // HANDLE AVATAR UPLOAD
            if ($request->hasFile('avatar')) {

                // REMOVE OLD AVATAR
                $user->clearMediaCollection('avatar');

                // ADD NEW AVATAR
                $user
                    ->addMedia($request->file('avatar'))
                    ->toMediaCollection('avatar');
            }

            // IMPORTANT: REFRESH USER
            $user->refresh();

            // RETURN COMPLETE USER
            return response()->json([
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->getRoleNames()->first(),
                    'avatar_url' => $user->getFirstMediaUrl('avatar'),
                ]
            ]);

        } catch (\Exception $e) {

            return response()->json([
                'message' => $e->getMessage()
            ], 500);

        }
    }
}