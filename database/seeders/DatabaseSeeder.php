<?php

namespace Database\Seeders;

use App\Models\Conversation;
use App\Models\Message;
use App\Models\Participant;
use App\Models\User;
use Carbon\CarbonInterface;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use RuntimeException;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database with a small development world.
     */
    public function run(): void
    {
        // Fake users with a known password must never exist in a real database.
        if (app()->isProduction()) {
            throw new RuntimeException('The development seeder must not run in production.');
        }

        // Test User must stay first: it is user 1.
        $test = User::factory()->create(['name' => 'Test User', 'email' => 'test@example.com']);
        $alice = User::factory()->create(['name' => 'Alice Johnson', 'email' => 'alice@example.com']);
        $brian = User::factory()->create(['name' => 'Brian Smith', 'email' => 'brian@example.com']);
        $carol = User::factory()->create(['name' => 'Carol Davis', 'email' => 'carol@example.com']);
        $david = User::factory()->create(['name' => 'David Brown', 'email' => 'david@example.com']);
        $emma = User::factory()->create(['name' => 'Emma Wilson', 'email' => 'emma@example.com']);

        // People with no chats yet, for "search users and start a chat" (Phase 3).
        User::factory(5)->create();

        // Direct chats. The first one is a chat with yourself.
        $this->direct($test, $test, days: 20, count: 12);
        $this->direct($test, $alice, days: 14, count: 60);
        $this->direct($test, $brian, days: 5, count: 25);
        $this->direct($alice, $brian, days: 8, count: 20); // Test User is not in this one
        $this->direct($test, $emma, days: 60, count: 2000); // very long, for scrolling and indexes

        // A group with four members.
        $friends = $this->group([$test, $alice, $brian, $carol], days: 10);
        $this->fill($friends, 120);

        // A group where David left, four days after it started.
        $leaver = $this->group([$test, $alice, $david], days: 12);
        $this->leave($leaver, $david, now()->subDays(8));
        $this->fill($leaver, 40);

        // A group where Test User cleared the chat three days ago.
        $clearer = $this->group([$test, $carol, $david], days: 9);
        $this->clear($clearer, $test, now()->subDays(3));
        $this->fill($clearer, 50);
    }

    /**
     * A direct chat that started $days ago, with $count messages.
     * Duplicates the "start a direct chat" rule that Phase 3 will own.
     */
    private function direct(User $first, User $second, int $days, int $count): void
    {
        $conversation = Conversation::factory()
            ->direct($first, $second, now()->subDays($days))
            ->create();

        $this->fill($conversation, $count);
    }

    /**
     * A group that started $days ago. Everyone joined just before it started,
     * and the first member "created" it with a system message.
     *
     * @param  array<int, User>  $members
     */
    private function group(array $members, int $days): Conversation
    {
        $start = now()->subDays($days);

        $conversation = Conversation::factory()->create([
            'created_at' => $start,
            'updated_at' => $start,
        ]);

        foreach ($members as $member) {
            Participant::factory()
                ->for($conversation)
                ->for($member)
                ->joinedAt($start->copy()->subSecond())
                ->create();
        }

        Message::factory()
            ->for($conversation)
            ->for($members[0], 'sender')
            ->system('Group created')
            ->sentAt($start)
            ->create();

        return $conversation;
    }

    private function leave(Conversation $conversation, User $user, CarbonInterface $at): void
    {
        $conversation->participants()->where('user_id', $user->id)->firstOrFail()->update(['left_at' => $at]);
    }

    private function clear(Conversation $conversation, User $user, CarbonInterface $at): void
    {
        $conversation->participants()->where('user_id', $user->id)->firstOrFail()->update(['cleared_at' => $at]);
    }

    /**
     * Fill a conversation with $count messages, spread from its start to now,
     * created oldest first. Each sender is a member at that moment.
     */
    private function fill(Conversation $conversation, int $count): void
    {
        $start = $conversation->created_at;
        $members = $conversation->participants()->with('user')->get();

        // Whole seconds between messages. At least 2, so a sub-second jitter never reorders them.
        $span = now()->getTimestamp() - $start->getTimestamp();
        $step = max(2, intdiv($span, $count + 1));

        $recent = collect();

        for ($i = 0; $i < $count; $i++) {
            $at = $start->copy()->addSeconds(($i + 1) * $step)->addMicroseconds(random_int(0, 999_999));

            $senders = $members->filter(fn (Participant $member) => $member->joined_at->lessThan($at)
                && ($member->left_at === null || $member->left_at->greaterThan($at)));

            if ($senders->isEmpty()) {
                continue;
            }

            $sender = $senders->random();
            $factory = Message::factory()->for($conversation)->for($sender->user, 'sender')->sentAt($at);

            // Sometimes reply to a recent message the sender is allowed to see.
            $visible = $recent->filter(fn (Message $message) => $message->created_at->greaterThan($sender->joined_at));

            if ($visible->isNotEmpty() && random_int(1, 12) === 1) {
                $factory = $factory->replyingTo($visible->random());
            }

            // Sometimes the message was deleted for everyone.
            if (random_int(1, 40) === 1) {
                $factory = $factory->trashed();
            }

            $recent->push($factory->create());

            if ($recent->count() > 6) {
                $recent->shift();
            }
        }
    }
}