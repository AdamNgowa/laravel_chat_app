<?php

use App\Http\Controllers\ChatController;
use App\Http\Controllers\MessageController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('chats', [ChatController::class, 'index'])->name('chats.index');
    Route::get('chats/{conversation}',[ChatController::class,'show'])->name('chats.show');
    Route::post('chats/{conversation}/messages',[MessageController::class,'store'])->name('chats.send');
});