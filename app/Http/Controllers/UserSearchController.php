<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserSearchController extends Controller
{
    /** The most people one search returns. */
    private const LIMIT = 10;

    /**
     * Find people by name, for "start a chat". Returns only id and name, never
     * an email, and never the person who is searching.
     */
    public function __invoke(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'q' => ['required', 'string', 'min:2', 'max:50'],
        ]);

        // In a LIKE pattern, % and _ are wildcards and \ escapes them. Escape what the
        // person typed so it is matched as plain text, not as a pattern.
        $term = str_replace(['\\', '%', '_'], ['\\\\', '\\%', '\\_'], $validated['q']);

        $users = User::query()
            ->where('id', '!=', $request->user()->id)
            ->where('name', 'like', "%{$term}%")
            ->orderBy('name')
            ->limit(self::LIMIT)
            ->get(['id', 'name']);

        return response()->json(['users' => $users]);
    }
}