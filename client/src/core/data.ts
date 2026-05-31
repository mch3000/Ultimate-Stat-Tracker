// ─── Seed data ────────────────────────────────────────────────────────────────
// On first boot (and on v6→v7 migrations) `seedTeamsAndGames()` produces the
// team-add / player-add events for every demo team plus the game-add events
// for every demo fixture. Engine tests also build their fixture sessions from
// this seed (via MOCK_GAMES below — kept as a compatibility export).
//
// Layout, top to bottom: real BUML fixture (the live test target) emitted
// first so it shows at the top of GameSetup, then Empire vs Breeze as the
// canonical AUDL demo. AUDL Summer Series + Championship were removed in
// the 2026-05-11 trim.

import type { GameConfig, Player, Team } from './types'
import type { TeamEvent, TeamEventInput } from './teams/types'
import type { ScheduledGameEvent, ScheduledGameEventInput } from './games/types'
import { addPlayer, addTeam } from './teams/actions'
import { addScheduledGame } from './games/actions'

// ─── Reusable team/player builders ────────────────────────────────────────────

function team(id: 'A' | 'B', name: string, short: string, color: string): Team {
  return { id, name, short, color }
}

function player(
  id: number, name: string, teamId: 'A' | 'B', gender: 'M' | 'F',
  photoUrl?: string, jerseyNumber?: number,
): Player {
  return {
    id, name, teamId, gender,
    ...(photoUrl ? { photoUrl } : {}),
    ...(jerseyNumber !== undefined ? { jerseyNumber } : {}),
  }
}

// ─── Global identifiers ──────────────────────────────────────────────────────
// GlobalTeamIds and PlayerIds are reserved here so the seed is deterministic.
// User-created entities use `Math.max(...existing) + 1`, so reserving low ids
// for the demo is safe.
const EMPIRE_GID     = 1
const BREEZE_GID     = 2
const WEDGIES_GID    = 3
const BAGS_GID = 4

const EMPIRE = team('A', 'New York Empire', 'NYE', '#1f4788')
const BREEZE = team('B', 'DC Breeze',       'DCB', '#ff6640')

const portrait = (g: 'men' | 'women', n: number) => `https://randomuser.me/api/portraits/${g}/${n}.jpg`

// Empire 1–13, Breeze 14–26 (untouched from the original demo so existing
// engine tests stay valid). Lizards 27–36, Gooselings 37–47.
const EMPIRE_ROSTER: Player[] = [
  player( 1, 'Alex Atkins',                  'A', 'M', portrait('men', 32),    7),
  player( 2, 'Caoba Nichim-Luta',            'A', 'M', portrait('men', 64)      ),
  player( 3, 'Matt LaBar',                   'A', 'M', undefined,             11),
  player( 4, 'Ben Jagt',                     'A', 'M', portrait('men', 17),   23),
  player( 5, 'Benjamin Simmons',             'A', 'M'                           ),
  player( 6, 'Nicholas Whitlock',            'A', 'M', undefined,              4),
  player( 7, 'Samuel McCrory',               'A', 'M', portrait('men', 45)      ),
  player( 8, 'Solomon Rueschemeyer-Bailey',  'A', 'M', portrait('men', 83),   42),
  player( 9, 'Tej Murthy',                   'A', 'M'                           ),
  player(10, 'Sarah Mitchell',               'A', 'F', portrait('women', 26),  6),
  player(11, 'Jordan Reyes',                 'A', 'F', portrait('women', 51)    ),
  player(12, 'Megan Fernandez',              'A', 'F', portrait('women', 9),  18),
  player(13, 'Leah Cohen',                   'A', 'F'                           ),
]

const BREEZE_ROSTER: Player[] = [
  player(14, 'Xavier Schafer',      'B', 'M', portrait('men', 12),     8),
  player(15, 'Graham Turner',       'B', 'M', undefined,              13),
  player(16, 'Aidan Downey',        'B', 'M', portrait('men', 76)       ),
  player(17, 'Charlie McCutcheon',  'B', 'M', portrait('men', 29),    21),
  player(18, 'AJ Merriman',         'B', 'M'                            ),
  player(19, 'Zachary Burpee',      'B', 'M', undefined,              88),
  player(20, 'Lev Blumenfeld',      'B', 'M', portrait('men', 53)       ),
  player(21, 'Wiebe van den Brink', 'B', 'M', portrait('men', 88),     3),
  player(22, 'Ben Greenberg',       'B', 'M'                            ),
  player(23, 'Maya Patel',          'B', 'F', portrait('women', 33),  14),
  player(24, 'Olivia Brooks',       'B', 'F', portrait('women', 68)     ),
  player(25, 'Emily Wong',          'B', 'F', undefined,               2),
  player(26, 'Hannah Reilly',       'B', 'F', portrait('women', 12)     ),
]

// ─── BUML 2026-05-11 rosters ─────────────────────────────────────────────────
// Real teams for live test recording. No portraits — names and gender only.

const WEDGIES_ROSTER: Player[] = [
  player(27, 'Dana',    'A', 'F'),
  player(28, 'Imo',  'A', 'F'),
  player(29, 'Doog',     'A', 'F'),
  player(30, 'Lorna',       'A', 'F'),
  player(31, 'Lou',       'A', 'F'),
  player(32, 'Rosa',       'A', 'F'),
  player(33, 'Ruby',       'A', 'F'),
  player(34, 'Samara',       'A', 'F'),
  player(35, 'Sheryn',       'A', 'F'),
  player(36, 'Zab',       'A', 'F'),
  player(48, 'Asheek',         'A', 'M'),
  player(49, 'Ben',  'A', 'M'),
  player(50, 'Mikey',   'A', 'M'),
  player(51, 'Myall',     'A', 'M'),
  player(52, 'Sam',        'A', 'M'),
  player(53, 'Tim',       'A', 'M'),
  player(54, 'Asher',       'A', 'M'),
  player(55, 'Kwong',       'A', 'M'),
  player(56, 'Svatos',       'A', 'M'),
  player(57, 'Wan',       'A', 'M'),
]

const BAGS_ROSTER: Player[] = [
  player(37, 'Ariel',  'B', 'F'),
  player(38, 'Penny',    'B', 'F'),
  player(39, 'Celeste','B', 'F'),
  player(40, 'Emily',      'B', 'F'),
  player(41, 'Chloe',           'B', 'F'),
  player(42, 'Rachel',         'B', 'F'),
  player(43, 'A Young',          'B', 'M'),
  player(44, 'Sangah',        'B', 'M'),
  player(45, 'Andy',      'B', 'M'),
  player(46, 'Jack',      'B', 'M'),
  player(47, 'Nic',       'B', 'M'),
  player(58, 'Harrison',       'B', 'M'),
  player(59, 'Paul',       'B', 'M'),
]

// Lizards play in white today (the two teams' usual red + maroon were too
// similar on a dark canvas — white reads cleanly against the maroon as the
// opposing outline).
const WEDGIES    = team('A', 'Wedgies', 'Wed', '#ffffff')
const BAGS = team('B', 'Bags',       'BAG', '#6e1a1a')

// ─── Seed function ────────────────────────────────────────────────────────────

interface SeedResult {
  teamEvents: TeamEvent[]
  gameEvents: ScheduledGameEvent[]
}

function stampTeam(events: TeamEventInput[]): TeamEvent[] {
  // Deterministic ids starting at 1 — matches the production appender shape
  // but doesn't depend on Date.now() (so seed output stays stable in tests).
  return events.map((e, i) => ({ ...e, id: i + 1, timestamp: 0 }) as TeamEvent)
}
function stampGame(events: ScheduledGameEventInput[]): ScheduledGameEvent[] {
  return events.map((e, i) => ({ ...e, id: i + 1, timestamp: 0 }) as ScheduledGameEvent)
}

function emitTeamWithRoster(
  out: TeamEventInput[], gid: number, t: Team, roster: Player[],
): void {
  out.push(addTeam(gid, t.name, t.short, t.color))
  for (const p of roster) {
    out.push(addPlayer(
      p.id, gid, p.name, p.gender,
      {
        ...(p.jerseyNumber !== undefined ? { jerseyNumber: p.jerseyNumber } : {}),
        ...(p.photoUrl     !== undefined ? { photoUrl:     p.photoUrl     } : {}),
      },
    ))
  }
}

/** Produce the team-add/player-add/game-add events that materialise the demo
 *  state. Pure — safe to call from store init, migrations, and tests. */
export function seedTeamsAndGames(): SeedResult {
  const teamInputs: TeamEventInput[] = []
  emitTeamWithRoster(teamInputs, EMPIRE_GID,     EMPIRE,     EMPIRE_ROSTER)
  emitTeamWithRoster(teamInputs, BREEZE_GID,     BREEZE,     BREEZE_ROSTER)
  emitTeamWithRoster(teamInputs, WEDGIES_GID,    WEDGIES,    WEDGIES_ROSTER)
  emitTeamWithRoster(teamInputs, BAGS_GID, BAGS, BAGS_ROSTER)

  // Order matters: deriveScheduledGames preserves insertion order, so BUML is
  // emitted first to appear at the top of GameSetup.
  const gameInputs: ScheduledGameEventInput[] = [
    addScheduledGame({
      gameId: 1, name: 'Empire vs Breeze', scheduledTime: '09:00',
      teamAGlobalId: EMPIRE_GID, teamBGlobalId: BREEZE_GID,
      halfTimeAt: 8, scoreCapAt: 15,
    }),
  ]

  return {
    teamEvents: stampTeam(teamInputs),
    gameEvents: stampGame(gameInputs),
  }
}

// ─── Compatibility export ─────────────────────────────────────────────────────
// `MOCK_GAMES` is still re-exported because the existing engine + store tests
// read rosters directly off it. Element [0] stays Empire vs Breeze so the
// existing test fixtures (which use player ids 1–26) keep working unchanged.
// The runtime app no longer consults this — everything flows through the
// seeded teamsLog / scheduledGamesLog.

export const MOCK_GAMES: GameConfig[] = [
  {
    id: 1, name: 'Empire vs Breeze', scheduledTime: '09:00',
    teamAGlobalId: EMPIRE_GID, teamBGlobalId: BREEZE_GID,
    teams: { A: EMPIRE, B: BREEZE },
    rosters: { A: EMPIRE_ROSTER, B: BREEZE_ROSTER },
    halfTimeAt: 8, scoreCapAt: 15,
  },
]
