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
                }
            };

        case 'assist':
            let skill = (char1.skills && char1.skills.assist) ? char1.skills.assist : '';
            let effect = {};

            switch (skill) {
                case 'Rally Attack':
                    effect.atk = Math.min(char2.atk + 5, 99);
                    break;
                case 'Rally Defense':
                    effect.def = Math.min(char2.def + 5, 99);
                    break;
                case 'Heal':
                    // Healing - restore 50% of healer's attack as HP
                    let healing = Math.floor(char1.atk * 0.5);
                    effect.hp = Math.min(char2.hp, char2.hp + healing);
            };

            return {
                char1: char1.name,
                char2: char2.name,
                action: 'assist',
                range: 1,
                hitPoints: hitPoints,
                endState: effect
            };

        default:
            console.error(`Invalid interaction type: ${interactionType}`);
            return {
                error: "Invalid interaction type"
            };
    };
};

export const printInteractionResult = (interactionResult) => {
    if (interactionResult.error) {
        return `Error: ${interactionResult.error}`;
    };

    const { char1, char2, action, hitPoints, endState } = interactionResult;
    if (interactionResult) {
        let resultText = `${char1} used ${action} on ${char2}. Dmg: ${hitPoints}. Result: ${JSON.stringify(endState)}`;

        return resultText;
    };
}

export const applyActionEffect = (charState1, charState2, actionResult) => {
    const { char1, char2, action, endState } = actionResult;
    let newCharState2 = {
        ...charState2,
        ...endState
    };
}

export const applyActionResult = (allyStates, foeStates, actionResult) => {
    // Ensure allyStates is an array
    const safeAllyStates = Array.isArray(allyStates) ? allyStates : [];
    const safeFoeStates = Array.isArray(foeStates) ? foeStates : [];

    // Determine the target states based on the characters in the action result
    const isAllyAction = actionResult.char1 && safeAllyStates.some(char => char.name === actionResult.char1);
    const targetStates = isAllyAction ? safeFoeStates : safeAllyStates;

    // Find the target character
    const targetCharIndex = targetStates.findIndex(char => char.name === actionResult.char2);

    // If target character found, apply the end state
    if (targetCharIndex !== -1) {
        const updatedTargetStates = [...targetStates];
        updatedTargetStates[targetCharIndex] = {
            ...updatedTargetStates[targetCharIndex],
            ...actionResult.endState[actionResult.char2 ? 'char2' : 'char1']
        };

        return isAllyAction 
            ? { allyStates, foeStates: updatedTargetStates }
            : { allyStates: updatedTargetStates, foeStates };
    }

    // If no changes, return original states
    return { allyStates, foeStates };
};

export const printCharacterState = (characterName, allyStates, foeStates) => {
    // Handle both object and array formats
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