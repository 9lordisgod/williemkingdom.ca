/* 9LORD OS — content. Edit this file to update the site. */
window.LORD = (() => {
  const PROFILE = {
    name: 'Williem Fan',
    handle: '9lordisgod',
    x: 'williemdoe',
    location: 'Richmond, BC, Canada',
    company: 'Internet Money since 2008',
    bio: 'Open source everything.',
    tagline: 'Builder across Solana, Bitcoin, Monero, agents, and markets.',
    github: 'https://github.com/9lordisgod',
    xurl: 'https://x.com/williemdoe',
    avatar: 'https://avatars.githubusercontent.com/u/140681955?v=4',
    since: 2023,
    // static fallbacks; refreshed live from the GitHub API when reachable
    stats: { repos: 76, followers: 59 },
    stack: ['TypeScript', 'Python', 'Rust', 'Go', 'GDScript', 'Solidity'],
    interests: ['cypherpunk tooling', 'prediction markets', 'ZK / FHE', 'quant finance', 'autonomous agents', 'game dev'],
    now: [
      'Open-source AI literacy for K-12 (SI Academy)',
      'Polymarket research tooling (Mercedes Signal / Bot)',
      'On-chain social experiments (Dreaming Fly)',
      'A 3D 掼蛋 roguelike in Godot',
    ],
  };

  const PROJECTS = [
    {
      id: 'si-academy', repo: 'ai-course', name: 'SI Academy',
      kind: 'EdTech · AI literacy', lang: 'JavaScript', stars: 1,
      blurb: 'Open-source K-12 AI literacy platform with ElevenLabs voice-over, mastery points and a Teacher Hub. Bilingual, aligned with Canada\u2019s National AI Literacy Initiative.',
      tags: ['k12', 'ai-literacy', 'elevenlabs', 'bilingual', 'canada'],
      live: 'https://9lordisgod.github.io/ai-course/',
    },
    {
      id: 'cypherpunk-code', repo: 'cypherpunk-code', name: 'Cypherpunk Code',
      kind: 'Protocol · Crypto education', lang: 'TypeScript', stars: 1,
      blurb: 'An open-source crypto education protocol. Learn the primitives, read the code, verify the claims.',
      tags: ['education', 'crypto', 'open-source'],
    },
    {
      id: 'mercedes-signal', repo: 'mercedes-signal', name: 'Mercedes Signal',
      kind: 'Markets · Research desk', lang: 'Web', stars: 1,
      blurb: 'Cypherpunk\u2019s Polymarket research desk. Prediction-market research, published in the open.',
      tags: ['polymarket', 'prediction-markets', 'research'],
      live: 'https://www.cypherpunk-code.com/',
    },
    {
      id: 'mercedesbot', repo: 'mercedesbot', name: 'Mercedes Bot',
      kind: 'Markets · Trading bot', lang: 'Python', stars: 0,
      blurb: 'Open-source Polymarket research bot with Time Travel simulation, paper trading and optional live auto-trade.',
      tags: ['polymarket', 'trading-bot', 'python'],
    },
    {
      id: 'dreaming-fly', repo: 'dreaming-fly', name: 'Dreaming Fly',
      kind: 'On-chain · Social experiment', lang: 'TypeScript', stars: 1,
      blurb: 'A social experiment on chain.',
      tags: ['on-chain', 'social'],
      live: 'https://www.dreaming-fly.com/',
    },
    {
      id: 'grap3', repo: 'grap3', name: 'Grap3',
      kind: 'Mobile dApp · Solana Seeker', lang: 'TypeScript / React Native', stars: 1,
      blurb: '\uD83C\uDF47 Open-source crypto-native dating dApp for Solana Seeker. Wallet-first auth, on-chain trust, encrypted chat, USDC/SOL payments.',
      tags: ['solana-mobile', 'react-native', 'web3', 'dating-app'],
    },
    {
      id: 'guan-dan-poker', repo: 'guan-dan-poker', name: 'Guan Dan Poker 掼蛋赌局',
      kind: 'Game · Godot 4', lang: 'GDScript', stars: 0,
      blurb: 'Open-source Godot 4.7 3D 掼蛋 roguelike + PvP multiplayer. MIT licensed.',
      tags: ['godot4', 'roguelike', 'multiplayer', 'card-game'],
    },
    {
      id: 'darkwow', repo: 'DarkWow-Chain-Research', name: 'DarkWow Chain Research',
      kind: 'Research · On-chain', lang: 'Python', stars: 2,
      blurb: 'DarkWow chain research, updated weekly.',
      tags: ['research', 'on-chain', 'weekly'],
    },
    {
      id: 'illuminated', repo: 'illuminated', name: 'Illuminated',
      kind: 'Solana · Bootcamp', lang: 'TypeScript', stars: 0,
      blurb: 'Solana Foundation \u00D7 Encode Club bootcamp final project.',
      tags: ['solana', 'encode-club'],
    },
  ];

  const PHILOSOPHY = {
    life: [
      {
        q: 'Luck is a big factor in success or failure, but passion, commitment, and consistency most define a person\u2019s success. Life happens, but those who play the long game and keep grinding win.',
        by: '@williemdoe, on X', src: 'https://x.com/williemdoe',
      },
      'Play the long game. Compounding is the only magic that is real.',
      'Luck opens the door. Consistency is what keeps you in the room.',
      'Ship, then talk. The repo is the r\u00E9sum\u00E9.',
      'Judged by the work, not the name. Let the commits carry the reputation.',
      'Stay a student. The market tutors anyone who stops learning \u2014 and it charges tuition.',
      'Independence is the goal. Internet money is just the tool.',
    ],
    tech: [
      'Open source everything. Code you cannot read is a promise you cannot verify.',
      'Don\u2019t trust. Verify.',
      {
        q: 'Privacy is not secrecy. A private matter is something one doesn\u2019t want the whole world to know, but a secret matter is something one doesn\u2019t want anybody to know. Privacy is the power to selectively reveal oneself to the world.',
        by: 'Eric Hughes, A Cypherpunk\u2019s Manifesto (1993)',
      },
      {
        q: 'The root problem with conventional currency is all the trust that\u2019s required to make it work. The central bank must be trusted not to debase the currency, but the history of fiat currencies is full of breaches of that trust.',
        by: 'Satoshi Nakamoto (2009)',
      },
      'Markets are the most honest oracle we have. Build tools that let people bet on the truth.',
      'Agents are the new users. Design protocols for machines first; the humans follow the liquidity.',
      'Teaching a kid AI literacy is the highest-leverage commit you can make to the future.',
      'Small machines, big ideas. 512 \u00D7 342 pixels was enough to change the world once.',
      { q: 'Cypherpunks write code.', by: 'Eric Hughes' },
    ],
  };

  const LINKS = [
    { label: 'GitHub', url: PROFILE.github, note: '@9lordisgod \u00B7 all repositories' },
    { label: 'X / Twitter', url: PROFILE.xurl, note: '@williemdoe \u00B7 markets, code, the long game' },
    { label: 'SI Academy', url: 'https://9lordisgod.github.io/ai-course/', note: 'open-source K-12 AI literacy' },
    { label: 'Cypherpunk Code', url: 'https://www.cypherpunk-code.com/', note: 'Polymarket research desk' },
    { label: 'Dreaming Fly', url: 'https://www.dreaming-fly.com/', note: 'a social experiment on chain' },
  ];

  const BOOT = [
    ['9LORD OS 1.0 (cypherpunk build) \u2014 booting', ''],
    ['CPU: Motorola 68000 @ 7.83 MHz', 'OK'],
    ['RAM: 4096 KB, zero closed-source bytes', 'OK'],
    ['Mounting /dev/bitcoin', 'OK'],
    ['Mounting /dev/solana', 'OK'],
    ['Mounting /dev/monero', 'hidden'],
    ['Loading agents.sys', 'OK'],
    ['Syncing prediction markets', '99.9%'],
    ['Checking for trusted third parties', 'none, good'],
    ['Fetching github.com/9lordisgod', '{repos} repos'],
    ['Starting Finder', ''],
  ];

  const TRASH = [
    { name: 'fiat.dat', size: '0 trust' },
    { name: 'trust_me_bro.txt', size: '1 KB' },
    { name: 'closed_source.zip', size: '??? MB' },
    { name: 'web2_terms_of_service.pdf', size: '94 pages' },
  ];

  return { PROFILE, PROJECTS, PHILOSOPHY, LINKS, BOOT, TRASH };
})();
