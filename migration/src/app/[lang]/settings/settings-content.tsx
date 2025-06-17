'use client'

import React from 'react';
import styles from '@/styles/settings.module.css';
import { useDialog } from '@/context/dialog';
import Avatar from '@/components/Avatar';
import Dialog from '@/components/Dialog';
import LangeSelect from '@/components/LangSelect';
import SearchInput from '@/components/SearchInput';
import IconWithName from '@/components/IconWithName';
import ControlButtons from '@/components/ControlButtons';
import NavigationArrows from '@/components/NavigationArrows';
import GridLayoutControl from '@/components/GridLayoutControl';
import useDarkMode from '@/hooks/useDarkMode';

type Props = {
  dict: any
}

const toggleHandler = (dispatch: Function) => () => dispatch({ type: 'toggleLang' });

function SettingsHeader({ dict }: Props) {
  const { lang, dispatch } = useDialog();
  const close = () => dispatch({ type: 'close' });
  
  return (
    <header className={styles.header}>
      <ControlButtons disabled onClickClose={close} onClickMinimise={close} />
      <NavigationArrows
        disabledRight={lang}
        disabledLeft={!lang}
        onClickLeft={toggleHandler(dispatch)}
        onClickRight={toggleHandler(dispatch)}
      />
      <GridLayoutControl routeName={dict.settings.title} />
      <SearchInput placeHolderText={dict.settings.search} />
    </header>
  );
}

function SettingsMainContent({ dict }: Props) {
  const { lang, dispatch } = useDialog();
  const {
    theme,
    scheme: { dark },
    toggleTheme,
  } = useDarkMode();

  if (lang) {
    return (
      <div className={styles.lang}>
        <IconWithName
          horizontal
          icon="/settings/lang.png"
          alt={dict.settings.langAlt}
          name={dict.settings['lang.description']}
        />
        <LangeSelect />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <Avatar
          img="/settings/avatar.png"
          name="Xabier Lameiro Cardama"
          alt={dict.settings.avatar}
          description={dict.settings.desc}
        />
      </div>
      <section className={styles.confg}>
        <IconWithName
          icon="/settings/lang.png"
          alt={dict.settings.langAlt}
          name={dict.settings.lang}
          onClick={toggleHandler(dispatch)}
        />
        <IconWithName
          icon="/settings/theme.png"
          alt={dict.settings.langAlt}
          name={theme === dark ? dict.settings.dark : dict.settings.light}
          onClick={toggleTheme}
        />
      </section>
      <section className={styles.confg}></section>
    </div>
  );
}

export default function SettingsContent({ dict }: Props) {
  const { open } = useDialog();

  return (
    <Dialog 
      modalMode 
      open={open} 
      body={<SettingsMainContent dict={dict} />} 
      header={<SettingsHeader dict={dict} />} 
    />
  );
}
