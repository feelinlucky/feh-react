import React from 'react';
import styles from './CharacterStatUI.module.css';
import MockChild from '../../components/mock-child/MockChild';

const CharacterStatUI = ({ charName, level, wpn, hp, atk, spd, def, res }) => {
    const characterStats = [
        { characterStatType: 'NAME', characterStatValue: charName },
        { characterStatType: 'LV', characterStatValue: level },
        { characterStatType: 'WPN', characterStatValue: wpn },
        { characterStatType: 'HP', characterStatValue: hp },
        { characterStatType: 'ATK', characterStatValue: atk },
        { characterStatType: 'SPD', characterStatValue: spd },
        { characterStatType: 'DEF', characterStatValue: def },
        { characterStatType: 'RES', characterStatValue: res },
    ];

    console.log('Character Stats:', {
        charName,
        level,
        wpn,
        hp,
        atk,
        spd,
        def,
        res
    });

    const characterStatsSlice1 = characterStats.slice(0, 4);
    const characterStatsSlice2 = characterStats.slice(4);

    return (
        <div className={styles.characterTable}>
            <div className={styles.characterCell} style={{ gridColumn: '1 / 2', gridRow: '1 / span 7' }}>
                <MockChild componentName="CharacterStatPortrait" backgroundColor="lightgray" characterName="Alfonse" />
            </div>
            <div className={styles.characterCell} style={{ gridColumn: '2 / 3', gridRow: '1 / span 7' }}>
                <div>
                    {characterStatsSlice1.map((item, index) => (
                        <MockChild
                            key={index}
                            componentName="SingleCharacterStatUI"
                            backgroundColor="lightcoral"
                            characterStatType={item.characterStatType}
                            characterStatValue={item.characterStatValue}
                        />
                    ))}
                </div>
            </div>
            <div className={styles.characterCell} style={{ gridColumn: '3 / 4', gridRow: '1 / span 7' }}>
                <div>
                    {characterStatsSlice2.map((item, index) => (
                        <MockChild
                            key={index}
                            componentName="SingleCharacterStatUI"
                            backgroundColor="gray"
                            characterStatType={item.characterStatType}
                            characterStatValue={item.characterStatValue}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CharacterStatUI;
