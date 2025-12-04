import { GameConfig } from './models/types';

export const defaultGameConfig: GameConfig = {
  minPlayers: 2,
  maxPlayers: 8,
  roundDuration: 60, // seconds
  intermissionDuration: 5, // seconds
  totalRounds: 3,
  prompts: [
    // Halloween Characters
    'skeleton', 'zombie', 'ghost', 'vampire', 'witch', 'mummy', 'werewolf', 'frankenstein',
    'bat', 'black cat', 'spider', 'scarecrow', 'grim reaper', 'demon', 'monster',
    
    // Halloween Objects
    'pumpkin', 'jack-o-lantern', 'cauldron', 'broomstick', 'tombstone', 'coffin', 'haunted house',
    'witch hat', 'magic wand', 'crystal ball', 'potion', 'spell book', 'candle', 'skull',
    
    // Halloween Treats
    'candy corn', 'lollipop', 'chocolate bar', 'candy apple', 'trick or treat bag', 'cupcake',
    
    // Spooky Things
    'cobweb', 'full moon', 'graveyard', 'fog', 'lightning', 'haunted tree', 'creepy eyes',
    'bones', 'fangs', 'claws', 'shadow', 'darkness',
    
    // Halloween Activities
    'trick or treat', 'carving pumpkin', 'flying on broomstick', 'casting spell', 'haunting',
    
    // General (Easy to Draw)
    'cat', 'dog', 'tree', 'flower', 'sun', 'moon', 'star', 'heart', 'smile',
    'house', 'car', 'umbrella', 'book', 'key', 'clock', 'balloon', 'crown'
  ]
};

export const serverPort = process.env.PORT ? parseInt(process.env.PORT) : 3000;
