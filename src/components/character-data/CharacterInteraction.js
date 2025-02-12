export const characterInteraction = (charStates1, charStates2) => {
    // Create copies to avoid modifying original states
    let char1 = { ...charStates1 };
    let char2 = { ...charStates2 };

    let interactionType = '';
    let hitPoints = 0; // Initialize hitPoints variable

    if (char1.group[0] === char2.group[0]) {
        interactionType = 'assist'; // Default interaction type for allies
    } else {
        interactionType = 'attack'; // Default interaction type for enemies
    }

    switch (interactionType) {
        case 'attack':
            // Calculate hitPoints based on attack type
            let char1wpn = char1.wpnType || '';
            hitPoints = char1.atk - char2.def;
            if (char1wpn.includes("Magic")) {
                hitPoints = char1.atk - char2.res;
            }

            // Apply weapon triangle advantage/disadvantage
            if ((char1wpn.includes("Red") && char2.wpnType.includes("Green")) ||
                (char1wpn.includes("Green") && char2.wpnType.includes("Blue")) ||
                (char1wpn.includes("Blue") && char2.wpnType.includes("Red"))) {
                hitPoints = Math.floor(hitPoints * 1.2);
            } else if ((char1wpn.includes("Red") && char2.wpnType.includes("Blue")) ||
                (char1wpn.includes("Green") && char2.wpnType.includes("Red")) ||
                (char1wpn.includes("Blue") && char2.wpnType.includes("Green"))) {
                hitPoints = Math.floor(hitPoints * 0.8);
            }

            // Ensure minimum 0 hitPoints
            hitPoints = Math.max(0, hitPoints);
            const char2HP = char2.hp - hitPoints;

            return {
                char1: char1.name,
                char2: char2.name,
                action: 'attack',
                range: 1,
                hitPoints: hitPoints,
                endState: {
                    char2: {
                        hp: char2HP,
                    }
                },
                isAlly: char1.isAlly,
            };

        default:
            console.error(`Invalid interaction type: ${interactionType}`);
            return {
                error: "Invalid interaction type"
            };
    };
};

export const printInteractionResult = (actionResult) => {
    if (actionResult.error) {
        return `Error: ${actionResult.error}`;
    };

    const { char1, char2, action, hitPoints, endState } = actionResult;
    if (actionResult) {
        let resultText = `${char1} used ${action} on ${char2}. Dmg: ${hitPoints}. Result: ${JSON.stringify(endState)}`;

        return resultText;
    };
}

export const applyActionResult = (allyStates, foeStates, actionResult) => {
    // Convert allyStates and foeStates to arrays if they are objects
    const convertToArray = (states) => {
        if (!states) return [];
        if (Array.isArray(states)) return states;
        // If states is an object (dictionary), convert to array of values
        return Object.values(states);
    };

    // Validate actionResult and its endState
    if (!actionResult || !actionResult.endState) {
        console.error('Invalid action result or missing end state');
        return { updatedActiveTurnStates: [], updatedPassiveTurnStates: [] };
    }

    let activeTurnStates, passiveTurnStates;
    if (actionResult.isAlly) {
        activeTurnStates = convertToArray(allyStates);
        passiveTurnStates = convertToArray(foeStates);
    } else {
        activeTurnStates = convertToArray(foeStates);
        passiveTurnStates = convertToArray(allyStates);
    };

    // Safely extract end state results
    const activeTurnEndResult = actionResult.endState.char1 || {};
    const passiveTurnEndResult = actionResult.endState.char2 || {};

    const updatedActiveTurnStates = activeTurnStates.map(char => {
        if (activeTurnEndResult.name && char.name === activeTurnEndResult.name) {
            return {
                ...char,
                ...activeTurnEndResult
            };
        } else {
            return char;
        }
    });

    // Apply changes to passive turn states
    const updatedPassiveTurnStates = passiveTurnStates.map(char => {
        if (passiveTurnEndResult.name && char.name === passiveTurnEndResult.name) {
            return {
                ...char,
                ...passiveTurnEndResult
            };
        } else {
            return char;
        }
    });

    console.log('updatedActiveTurnStates', updatedActiveTurnStates, 'updatedPassiveTurnStates', updatedPassiveTurnStates);
    return { updatedActiveTurnStates, updatedPassiveTurnStates };
}

export const printCharacterState = (characterName, allyStates, foeStates) => {
    let characterState;
    
    // If allyStates is an object
    if (!Array.isArray(allyStates)) {
        characterState = allyStates[characterName];
    } else {
        // If allyStates is an array
        characterState = allyStates.find(char => char.name === characterName);
    }

    // If not found in allyStates, check foeStates
    if (!characterState) {
        if (!Array.isArray(foeStates)) {
            characterState = foeStates[characterName];
        } else {
            characterState = foeStates.find(char => char.name === characterName);
        }
    }

    // If character not found in either array
    if (!characterState) {
        return `Character "${characterName}" not found.`;
    }

    // Create a detailed state string
    const stateString = `Character: ${characterState.name}
Group: ${characterState.group}
HP: ${characterState.hp}
Attack: ${characterState.atk}
Defense: ${characterState.def}
Resistance: ${characterState.res}
Weapon Type: ${characterState.wpnType}
Skills: ${characterState.skills ? JSON.stringify(characterState.skills) : 'None'}`;

    return stateString;
};