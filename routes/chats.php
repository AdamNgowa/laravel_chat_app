<?php

use App\Http\Controllers\ChatController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\UserSearchController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('chats', [ChatController::class, 'index'])->name('chats.index');
    Route::get('chats/{conversation}',[ChatController::class,'show'])->name('chats.show');
    Route::post('chats', [ChatController::class, 'store'])->name('chats.store');
    Route::post('chats/{conversation}/messages',[MessageController::class,'store'])->name('chats.send');
    Route::get('users/search',UserSearchController::class)->name('users.search');    
});