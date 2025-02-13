const publicFolder = `${process.env.PUBLIC_URL}`;

const charData = {
    "Alfonse": {
        name: "Alfonse",
        isAlly: true,
        type: "infantry",
        level: 40,
        wpnType: "Red Sword",
        hp: 50,
        atk: 50,
        spd: 50,
        def: 30,
        res: 30,
        skills:{
            weapon: "Red Sword",
            assist: "Rally Attack",
            special: "Daylight",
            a: "Death Blow 3",
            b: "Obstruct 3",
            c: "Spur Atk 3"
        }
    },
    "Sharena": {
        name: "Sharena",
        isAlly: true,
        type: "infantry",
        level: 40,
        wpnType: "Blue Lance",
        hp: 50,
        atk: 50,
        spd: 50,
        def: 30,
        res: 30,
        skills:{
            weapon: "Blue Lance",
            assist: "Rally Defense",
            special: "Noontime",
            a: "Fortress Def 3",
            b: "Escape Route 3",
            c: "Fortify Def 3"
        }
    },
    "Anna": {
        name: "Anna",
        isAlly: true,
        type: "infantry",
        level: 40,
        wpnType: "Green Axe",
        hp: 50,
        atk: 50,
        spd: 50,
        def: 30,
        res: 30,
        skills:{
            weapon: "Noatun",
            assist: "Rally Attack",
            special: "Dawn",
            a: "Death Blow 3",
            b: "Obstruct 3",
            c: "Spur Atk 3",
        }
    },
    "Fjorm": {
        name: "Fjorm",
        isAlly: true,
        type: "infantry",
        level: 40,
        wpnType: "Blue Lance",
        hp: 50,
        atk: 50,
        spd: 50,
        def: 30,
        res: 30,
        skills:{
            weapon: "Leiptr",
            assist: "Rally Defense",
            special: "Noontime",
            a: "Fortress Def 3",
            b: "Escape Route 3",
            c: "Fortify Def 3",
        }
    },
    "FighterSword": {
        name: "FighterSword",
        isAlly: false,
        type: "infantry",
        level: 40,
        wpnType: "Red Sword",
        hp: 50,
        atk: 50,
        spd: 50,
        def: 30,
        res: 30,
        skills:{
            weapon: "Silver Sword",
            assist: "Rally Attack",
            special: "Daylight",
            a: "Death Blow 3",
            b: "Obstruct 3",
            c: "Spur Atk 3",
        }
    },
    Default: {
        name: "",
        isAlly: false,
        type: "",
        level: 0,
        wpnType: '',
        hp: 0,
        atk: 0,
        spd: 0,
        def: 0,
        res: 0,
        skills:{
            weapon: '',
            assist: '',
            special: '',
            a: '',
            b: '',
            c: '',
        }
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