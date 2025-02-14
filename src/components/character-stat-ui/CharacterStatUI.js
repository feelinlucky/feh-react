import React from 'react';
import { useRef, useEffect, useState } from 'react';
import styles from './CharacterStatUI.module.css';
import Sprite from '../sprite/Sprite';
import SingleCharacterStatUI from '../single-character-stat-ui/SingleCharacterStatUI';
import MockChild from '../mock-child/MockChild';

const CharacterStatUI = ({ charName, level, wpnType, hp, atk, spd, def, res, skills }) => {
    const statUIRef = useRef(null);

    useEffect(() => {
        if (statUIRef.current) {
            // You can expose this width through a prop or context if needed
            const width = statUIRef.current.offsetWidth;
        }
    }, []);
    
    const characterStats = [
        { characterStatType: 'NAME', characterStatValue: charName },
        { characterStatType: 'LV', characterStatValue: level },
        { characterStatType: 'WPNTYPE', characterStatValue: wpnType},
        { characterStatType: 'WPN', characterStatValue: skills?.weapon},
        { characterStatType: 'HP', characterStatValue: hp },
        { characterStatType: 'ATK', characterStatValue: atk },
        { characterStatType: 'SPD', characterStatValue: spd },
        { characterStatType: 'DEF', characterStatValue: def },
        { characterStatType: 'RES', characterStatValue: res },
    ];

    const isValidStats = charName && level && wpnType && 
        typeof hp === 'number' && typeof atk === 'number' && 
        typeof spd === 'number' && typeof def === 'number' && 
        typeof res === 'number';

    if (!isValidStats) {
        console.error('Invalid stats:', characterStats);
        return <div className={styles.offState} />;
    }

    const characterStatsSlice1 = characterStats.slice(0, 4);
    const characterStatsSlice2 = characterStats.slice(4);


    if (!charName || !level || !wpnType || !hp || !atk || !spd || !def || !res || !skills) {
        return <div className={styles.offState} />;
    } else {
        return (
            <div ref={statUIRef} className={styles.characterTable}>
                <div className={styles.characterCell}>
                    <div style={{
                        height: 'calc(var(--stat-cell-height) * var(--stat-cell-count))',
                        width: 'auto',
                        paddingRight: '50%',
                        objectFit: 'contain',
                        scale: '0.7',
                    }}>
                        <Sprite
                            spriteName={`Portrait${charName}`}
                        />
                    </div>
                </div>
                <div className={styles.characterCell}>
                    {characterStatsSlice1.map((item, index) => (
                        <SingleCharacterStatUI
                            key={index}
                            characterStatType={item.characterStatType}
                            characterStatValue={item.characterStatValue}
                            backgroundColor="white"
                        />
                    ))}
                </div>
                <div className={styles.characterCell}>
                    {characterStatsSlice2.map((item, index) => (
                        <SingleCharacterStatUI
                            key={index}
                            characterStatType={item.characterStatType}
                            characterStatValue={item.characterStatValue}
                            backgroundColor="white"
                        />
                    ))}
                </div>
            </div>
        );
    }
};
export default CharacterStatUI;
