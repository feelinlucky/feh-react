// CharacterInteraction.stories.js
import { characterInteraction } from './CharacterInteraction';

export default {
  title: 'Game/CharacterInteraction',
  component: characterInteraction
};

// Mock character states
const redMage = {
  hp: 100,
  atk: 50,
  def: 20,
  res: 30,
  wpnType: ['Red', 'Magic']
};

const greenWarrior = {
  hp: 120,
  atk: 45,
  def: 35,
  res: 15,
  wpnType: ['Green', 'Physical']
};

const blueHealer = {
  hp: 80,
  atk: 40,
  def: 15,
  res: 40,
  wpnType: ['Blue', 'Magic']
};

// Test cases
export const MagicAttack = () => {
  const result = characterInteraction(redMage, greenWarrior, 'attack');
  return (
    <div>
      <pre>{JSON.stringify({ args: { attacker: redMage, defender: greenWarrior, interactionType: 'attack' }, result }, null, 2)}</pre>
    </div>
  );
};

export const WeaponTriangleAdvantage = () => {
  const result = characterInteraction(redMage, greenWarrior, 'attack');
  return (
    <div>
      <pre>{JSON.stringify({ args: { attacker: redMage, defender: greenWarrior, interactionType: 'attack' }, result }, null, 2)}</pre>
    </div>
  );
};

export const WeaponTriangleDisadvantage = () => {
  const result = characterInteraction(greenWarrior, redMage, 'attack');
  return (
    <div>
      <pre>{JSON.stringify({ args: { attacker: greenWarrior, defender: redMage, interactionType: 'attack' }, result }, null, 2)}</pre>
    </div>
  );
};

export const HealingAction = () => {
  const injuredChar = { ...greenWarrior, hp: 50 };
  const result = characterInteraction(blueHealer, injuredChar, 'heal');
  return (
    <div>
      <pre>{JSON.stringify({ args: { healer: blueHealer, target: injuredChar, interactionType: 'heal' }, result }, null, 2)}</pre>
    </div>
  );
};

export const InvalidInteraction = () => {
  const result = characterInteraction(redMage, greenWarrior, 'invalid');
  return (
    <div>
      <pre>{JSON.stringify({ args: { char1: redMage, char2: greenWarrior, interactionType: 'invalid' }, result }, null, 2)}</pre>
    </div>
  );
};

