// =============================================
// LanguagePicker.jsx — Language dropdown selector
// =============================================

import { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Modal, FlatList, Platform
} from 'react-native';
import useSettingsStore from '../store/settingsStore';

export default function LanguagePicker() {
  const [isOpen, setIsOpen] = useState(false);

  const { theme, language, languages, setLanguage } = useSettingsStore();
  const styles = makeStyles(theme);

  const currentLang = languages[language];

  function handleSelect(code) {
    setLanguage(code);
    setIsOpen(false);
  }

  return (
    <View style={styles.container}>

      {/* Trigger button */}
      <TouchableOpacity
        style={styles.trigger}
        onPress={() => setIsOpen(true)}
      >
        <Text style={styles.triggerFlag}>{currentLang?.flag}</Text>
        <Text style={styles.triggerLabel}>{currentLang?.label}</Text>
        <Text style={styles.triggerArrow}>{isOpen ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      {/* Dropdown modal */}
      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        {/* Backdrop — tap to close */}
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          {/* Dropdown panel */}
          <View style={styles.dropdown}>
            <Text style={styles.dropdownTitle}>Select language</Text>

            <FlatList
              data={Object.entries(languages)}
              keyExtractor={([code]) => code}
              renderItem={({ item: [code, lang] }) => (
                <TouchableOpacity
                  style={[
                    styles.option,
                    code === language && styles.optionActive
                  ]}
                  onPress={() => handleSelect(code)}
                >
                  <Text style={styles.optionFlag}>{lang.flag}</Text>
                  <Text style={[
                    styles.optionLabel,
                    code === language && styles.optionLabelActive
                  ]}>
                    {lang.label}
                  </Text>
                  {code === language && (
                    <Text style={styles.optionCheck}>✓</Text>
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>

    </View>
  );
}

function makeStyles(theme) {
  return StyleSheet.create({
    container: {
      position: 'relative',
    },
    trigger: {
      flexDirection:   'row',
      alignItems:      'center',
      backgroundColor: theme.backgroundCard,
      borderRadius:    10,
      paddingVertical:   6,
      paddingHorizontal: 10,
      borderWidth:     1,
      borderColor:     theme.border,
      gap:             6,
    },
    triggerFlag: {
      fontSize: 18,
    },
    triggerLabel: {
      color:    theme.textSecondary,
      fontSize: 13,
    },
    triggerArrow: {
      color:    theme.textMuted,
      fontSize: 10,
    },
    backdrop: {
      flex:            1,
      backgroundColor: 'rgba(0,0,0,0.4)',
      justifyContent:  'flex-start',
      alignItems:      'flex-start',
      paddingTop:      80,
      paddingLeft:     16,
    },
    dropdown: {
      backgroundColor: theme.backgroundCard,
      borderRadius:    14,
      padding:         8,
      minWidth:        220,
      borderWidth:     1,
      borderColor:     theme.border,
      shadowColor:     '#000',
      shadowOffset:    { width: 0, height: 4 },
      shadowOpacity:   0.15,
      shadowRadius:    8,
      elevation:       8,
    },
    dropdownTitle: {
      color:         theme.textMuted,
      fontSize:      11,
      textTransform: 'uppercase',
      letterSpacing: 1,
      paddingVertical:   6,
      paddingHorizontal: 12,
      marginBottom:  4,
    },
    option: {
      flexDirection: 'row',
      alignItems:    'center',
      paddingVertical:   10,
      paddingHorizontal: 12,
      borderRadius:  8,
      gap:           10,
    },
    optionActive: {
      backgroundColor: theme.background,
    },
    optionFlag: {
      fontSize: 20,
    },
    optionLabel: {
      flex:     1,
      color:    theme.textPrimary,
      fontSize: 15,
    },
    optionLabelActive: {
      color:      theme.accent,
      fontWeight: 'bold',
    },
    optionCheck: {
      color:      theme.accent,
      fontSize:   16,
      fontWeight: 'bold',
    },
  });
}