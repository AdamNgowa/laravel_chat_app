<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Gate;
use App\Models\Conversation;

class StoreMessageRequest extends FormRequest
{
    /**The longest message we accept */
    public const MAX_BODY_LENGTH = 5000;
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        /** @var Conversation $conversation */
        $conversation = $this->route('conversation');

        Gate::authorize('send',$conversation);

        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     * Laravel already trims the text, so a message of only spaces arrives empty and fails `required`.
     *
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'body' => ['required','string','max:'.self::MAX_BODY_LENGTH],
            'client_uuid' => ['required','uuid'],
        ];
    }
}
