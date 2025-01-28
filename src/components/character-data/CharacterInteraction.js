export const characterInteraction = (charStates1, charStates2) => {
    // Create copies to avoid modifying original states
    let char1 = { ...charStates1 };
    let char2 = { ...charStates2 };

    let interactionType = '';

    if (char1.group[0] === char2.group[0]) {
        interactionType = 'assist'; // Default interaction type for allies
    } else {
        interactionType = 'attack'; // Default interaction type for enemies
    }

    switch (interactionType) {
        case 'attack':
            // Calculate damage based on attack type
            let char1wpn = char1.wpnType || '';
            let damage = char1.atk - char2.def;
            if (char1wpn.includes("Magic")) {
                damage = char1.atk - char2.res;
            }

            // Apply weapon triangle advantage/disadvantage
            if ((char1wpn.includes("Red") && char2.wpnType.includes("Green")) ||
                (char1wpn.includes("Green") && char2.wpnType.includes("Blue")) ||
                (char1wpn.includes("Blue") && char2.wpnType.includes("Red"))) {
                damage = Math.floor(damage * 1.2);
            } else if ((char1wpn.includes("Red") && char2.wpnType.includes("Blue")) ||
                (char1wpn.includes("Green") && char2.wpnType.includes("Red")) ||
                (char1wpn.includes("Blue") && char2.wpnType.includes("Green"))) {
                damage = Math.floor(damage * 0.8);
            }

            // Ensure minimum 0 damage
            damage = Math.max(0, damage);

            return {
                char1: char1.name,
                char2: char2.name,
                action: 'attack',
                range: 1,
                effect: -100 // TODO: create an effect object that encapsulate all the effects of the action
            };

        case 'assist':
            let skill = (char1.skills && char1.skills.assist)? char1.skills.assist : '';
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
                action: skill,
                range: 1,
                effect: effect // TODO: create an effect object that encapsulate all the effects of the action
            };

        default:
            console.error(`Invalid interaction type: ${interactionType}`);
            return {
                error: "Invalid interaction type"
            };
    };
};

export const printInteractionResult = (interactionResult) => {
    console.log("printInteractionResult", interactionResult);
    if (interactionResult.error) {
        return `Error: ${interactionResult.error}`;
    };

    const { char1, char2, action, effect } = interactionResult;
    let resultText = `${char1} used ${action} on ${char2}. Effects: ${JSON.stringify(effect)}`;

    return resultText;
};