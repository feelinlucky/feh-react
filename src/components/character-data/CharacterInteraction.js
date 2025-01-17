export const characterInteraction = (charStates1, charStates2, interactionType) => {
    // Create copies to avoid modifying original states
    let char1 = {...charStates1};
    let char2 = {...charStates2};
    
    switch(interactionType) {
        case 'attack':
            // Calculate damage based on attack type
            let damage = char1.atk - char2.def;
            if (char1.wpnType.includes("Magic")) {
                damage = char1.atk - char2.res;
}
            
            // Apply weapon triangle advantage/disadvantage
            if ((char1.wpnType.includes("Red") && char2.wpnType.includes("Green")) ||
                (char1.wpnType.includes("Green") && char2.wpnType.includes("Blue")) ||
                (char1.wpnType.includes("Blue") && char2.wpnType.includes("Red"))) {
                damage = Math.floor(damage * 1.2);
            } else if ((char1.wpnType.includes("Red") && char2.wpnType.includes("Blue")) ||
                       (char1.wpnType.includes("Green") && char2.wpnType.includes("Red")) ||
                       (char1.wpnType.includes("Blue") && char2.wpnType.includes("Green"))) {
                damage = Math.floor(damage * 0.8);
            }
            
            // Ensure minimum 0 damage
            damage = Math.max(0, damage);
            
            // Apply damage
            char2.hp = Math.max(0, char2.hp - damage);
            
            return {
                attacker: char1,
                defender: char2,
                damageDealt: damage
            };
            
        case 'heal':
            // Healing - restore 50% of healer's attack as HP
            let healing = Math.floor(char1.atk * 0.5);
            char2.hp = Math.min(charStates2.hp, char2.hp + healing);
            
            return {
                healer: char1,
                target: char2,
                healingDone: healing
            };
            
        default:
            return {
                error: "Invalid interaction type"
            };
    }
};