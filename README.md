# Tokimeki Mastodon

This project is a clone of [Tokimeki Unfollow](https://tokimeki-unfollow.glitch.me/) for Mastodon. It lets you review the accounts you follow, and saves your progress in your browser's local storage.

## Contributing

The project is based on the [T3 stack](https://create.t3.gg/), it uses:

- [NextJS](https://nextjs.org/) for the server, and [React](https://reactjs.org) for the UI
- [Tailwind](https://tailwindcss.com/)
- [Zustand](https://github.com/pmndrs/zustand) for the state-managed, using its [persist](https://github.com/pmndrs/zustand/blob/main/docs/integrations/persisting-store-data.md) middleware to save the data locally.

You will need NodeJS (see [.nvrmrc](./.nvmrc) for the version) installed.

### Setup steps

- `npm install`
- `npm run dev` for the local dev server
- `npm run typecheck` and `npm run typecheck:watch` to run TypeScript's type-checking process

TODO: write more documentation.
