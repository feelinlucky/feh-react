const publicFolder = `${process.env.PUBLIC_URL}`;

const charData = {
    "Alfonse": {
        type: "infantry",
        level: 40,
        wpn: "Folkvangr",
        wpnType: "Red Sword",
        hp: 50,
        atk: 50,
        spd: 50,
        def: 30,
        res: 30
    },
    "Sharena": {
        type: "infantry",
        level: 40,
        wpn: "Fensalir",
        wpnType: "Blue Lance",
        hp: 50,
        atk: 50,
        spd: 50,
        def: 30,
        res: 30
    },
    "Anna": {
        type: "infantry",
        level: 40,
        wpn: "Noatun",
        wpnType: "Green Axe",
        hp: 50,
        atk: 50,
        spd: 50,
        def: 30,
        res: 30
    },
    "Fjorm": {
        type: "infantry",
        level: 40,
        wpn: "Leiptr",
        wpnType: "Blue Lance",
        hp: 50,
        atk: 50,
        spd: 50,
        def: 30,
        res: 30
    },
    "FighterSword": {
        type: "infantry",
        level: 40,
        wpn: "Sword",
        wpnType: "Red Sword",
        hp: 50,
        atk: 50,
        spd: 50,
        def: 30,
        res: 30
    },
    Default: {
        type: "",
        level: 0,
        wpn: '',
        wpnType: '',
        hp: 0,
        atk: 0,
        spd: 0,
        def: 0,
        res: 0,
    }
};

export const sharedProps = {
    moveTypes: {
        infantry: {
            icon: `${publicFolder}/assets/images/infantry.png`,
            distance: 2,
        },
        cavalry: {
            icon: `${publicFolder}/assets/images/cavalry.png`,
            distance: 3,
        },
        flier: {
            icon: `${publicFolder}/assets/images/flier.png`,
            distance: 2,
        },
    }
}

export function characterData(characterName) {
    if (!characterName) {
        return {};
    }

    const character = charData[characterName] || charData.Default;
    const { weaponType } = character.wpnType;
    const wpnIconUrl = weaponType?.icon ? `${publicFolder}${weaponType.icon}` : '';

    return {
        ...character,
        wpnIconUrl
    };
};

export default characterData;