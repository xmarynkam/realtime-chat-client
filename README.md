# Live Chat with Typing Indicator & Laravel Echo

This project is a **Vue 3 + Vite** SPA for implementing **live chat with typing indicator**, working with **Laravel API** via **Laravel Echo (WebSocket)**.

## Short description

The frontend is implemented on Vue 3 using Vite. The chat supports:
- real-time messaging,
- private channels for chat,
- indicator "the interlocutor is typing..." via `whisper` events,
- connection to the Laravel API, broadcasting events via a WebSocket server (`reverb`).

## Features

- Synchronization of messages between participants via Echo.
- Typing indicator in chat using `Echo.private().whisper()`.
- Laravel Broadcast authorization (via Sanctum token).
- Integration with WebSocket API (`/broadcasting/auth`).
- Support for Laravel Reverb WebSocket server.

## Connecting to Laravel API via Reverb

The project expects the Laravel backend to:
- have a `BroadcastServiceProvider` configured,
- use **Reverb** WebSockets,
- have defined channels in `routes/channels.php`, for example:

```php
Broadcast::channel('chat.{chatId}', function ($user, $chatId) {
    return $user->chats()->where('chat_id', $chatId)->exists();
});
```

## Project Setup

### Requirements

- Node.js **v20** (recommended to use [nvm](https://github.com/nvm-sh/nvm) for version management)

```sh
cp .env.example .env
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```
