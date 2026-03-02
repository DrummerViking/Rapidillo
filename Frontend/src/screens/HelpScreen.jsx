// =============================================
// HelpScreen.jsx — Game rules and help
// =============================================

import {
    View, Text, TouchableOpacity, StyleSheet,
    SafeAreaView, ScrollView
} from 'react-native';
import useSettingsStore from '../store/settingsStore';

// Each section of the help guide
const SECTIONS = [
    { titleKey: 'help.objective', textKey: 'help.objectiveText' },
    { titleKey: 'help.setup', textKey: 'help.setupText' },
    { titleKey: 'help.staircases', textKey: 'help.staircasesText' },
    { titleKey: 'help.wilds', textKey: 'help.wildsText' },
    { titleKey: 'help.turn', textKey: 'help.turnText' },
    { titleKey: 'help.pile', textKey: 'help.pileText' },
    { titleKey: 'help.discardRows', textKey: 'help.discardRowsText' },
    { titleKey: 'help.aces', textKey: 'help.acesText' },
];

export default function HelpScreen({ navigation }) {
    const { theme, t } = useSettingsStore();
    const styles = makeStyles(theme);

    return (
        <SafeAreaView style={styles.container}>

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>{t('help.title')}</Text>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
                    <Text style={styles.closeButtonText}>{t('help.close')}</Text>
                </TouchableOpacity>
            </View>

            {/* Content */}
            <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
                {SECTIONS.map((section) => (
                    <View key={section.titleKey} style={styles.section}>
                        <Text style={styles.sectionTitle}>{t(section.titleKey)}</Text>
                        <Text style={styles.sectionText}>{t(section.textKey)}</Text>
                    </View>
                ))}
            </ScrollView>

        </SafeAreaView>
    );
}

function makeStyles(theme) {
    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.background,
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 16,
            paddingVertical: 14,
            borderBottomWidth: 1,
            borderBottomColor: theme.border,
        },
        headerTitle: {
            fontSize: 20,
            fontWeight: 'bold',
            color: theme.textPrimary,
        },
        closeButton: {
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 8,
            backgroundColor: theme.accent,
        },
        closeButtonText: {
            color: '#ffffff',
            fontWeight: 'bold',
            fontSize: 14,
        },
        scroll: {
            flex: 1,
        },
        scrollContent: {
            padding: 20,
            gap: 20,
        },
        section: {
            backgroundColor: theme.backgroundCard,
            borderRadius: 12,
            padding: 16,
            borderWidth: 1,
            borderColor: theme.border,
            gap: 8,
        },
        sectionTitle: {
            fontSize: 16,
            fontWeight: 'bold',
            color: theme.accent,
        },
        sectionText: {
            fontSize: 14,
            color: theme.textSecondary,
            lineHeight: 22,
        },
    });
}