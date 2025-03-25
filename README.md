# Web3 Match Maker Game

A retro-styled educational game that helps players learn Web3 terminology through an engaging matching card game. Built with React, TypeScript, and NES.css for a nostalgic pixel art aesthetic.

## Features

- Match Web3 terms with their definitions
- Retro pixel art design with NES.css styling
- Progress tracking and scoring system
- Leaderboard functionality
- Wallet integration with Privy
- Mobile-responsive design

## Tech Stack

- React
- TypeScript
- NES.css for retro styling
- Privy for Web3 wallet integration
- Supabase for backend and leaderboard
- Vite for build tooling

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- A Supabase account for backend services
- A Privy account for wallet integration

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/web3-game.git
cd web3-game
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env` file in the root directory and add your environment variables:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_PRIVY_APP_ID=your_privy_app_id
```

4. Start the development server:
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:5173](http://localhost:5173) to view the app in your browser.

## Game Rules

1. Click "Start Game" to begin
2. Match Web3 terms with their correct definitions
3. Each correct match earns you points
4. Complete sets to earn XP
5. Try to achieve the highest score and climb the leaderboard

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Background pixel art by [Artist Name]
- NES.css for the retro styling
- All contributors and supporters of the project 