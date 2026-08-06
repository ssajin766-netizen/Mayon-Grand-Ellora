// src/components/GlassModal.tsx
import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  GestureResponderEvent,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTheme } from '../theme';
import GlassButton from './GlassButton';

export type GlassModalVariant = 'default' | 'danger' | 'success' | 'warning' | 'info';

export interface GlassModalProps {
  /** Controls visibility of the modal */
  visible: boolean;
  /** Title displayed at the top of the modal */
  title?: string;
  /** Message body – can be a string or custom JSX */
  message?: string | React.ReactNode;
  /** Text for the confirm button */
  confirmText?: string;
  /** Text for the cancel button */
  cancelText?: string;
  /** Callback when the confirm action is triggered */
  onConfirm?: (e: GestureResponderEvent) => void;
  /** Callback when the cancel action is triggered */
  onCancel?: (e: GestureResponderEvent) => void;
  /** Show a loading spinner on the confirm button */
  loading?: boolean;
  /** Optional icon to render next to the title */
  icon?: React.ReactNode;
  /** Visual variant that changes button colours */
  variant?: GlassModalVariant;
  /** Allow custom children (e.g., extra content) */
  children?: React.ReactNode;
  /** Optional style overrides for the outer container */
  style?: ViewStyle | ViewStyle[];
  /** Optional style overrides for the content area */
  contentStyle?: ViewStyle | ViewStyle[];
  /** Optional text style for the title */
  titleStyle?: TextStyle | TextStyle[];
  /** Optional text style for the message */
  messageStyle?: TextStyle | TextStyle[];
}

/**
 * Reusable glass‑morphism modal used for confirmations, alerts and custom dialogs.
 * It composes the existing GlassCard and GlassButton components to keep the UI consistent.
 */
const GlassModal: React.FC<GlassModalProps> = ({
  visible,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  loading = false,
  icon,
  variant = 'default',
  children,
  style,
  contentStyle,
  titleStyle,
  messageStyle,
}) => {
  const { colors, radii, spacing } = useTheme();

  // Determine button variants based on modal variant
  const confirmVariant: any = variant === 'danger' ? 'danger' : 'primary';
  const cancelVariant: any = variant === 'danger' ? 'ghost' : 'outline';

  return (
    <Modal transparent visible={visible} animationType="fade" statusBarTranslucent>
      <View style={[styles.backdrop, style]} testID="glass-modal-backdrop">
        <View style={[styles.modalContainer, { borderRadius: radii.md }, contentStyle]} testID="glass-modal-container">
          {title && (
            <View style={styles.header}>
              {icon && <View style={styles.icon}>{icon}</View>}
              <Text style={[styles.title, { color: colors.textPrimary }, titleStyle]}>{title}</Text>
            </View>
          )}
          {message && (
            <View style={styles.body}>
              {typeof message === 'string' ? (
                <Text style={[styles.message, { color: colors.textSecondary }, messageStyle]}>{message}</Text>
              ) : (
                message
              )}
            </View>
          )}
          {children}
          <View style={styles.actions}>
            {onCancel && (
              <GlassButton
                title={cancelText}
                onPress={onCancel}
                variant={cancelVariant}
                size="medium"
                style={styles.actionButton}
              />
            )}
            {onConfirm && (
              <GlassButton
                title={confirmText}
                onPress={onConfirm}
                variant={confirmVariant}
                size="medium"
                loading={loading}
                disabled={loading}
                style={styles.actionButton}
              />
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: 'rgba(255,255,255,0.08)', // glass background – will be overridden by theme if needed
    padding: 16,
    // Shadow for Android – iOS receives default elevation from theme
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  icon: {
    marginRight: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  body: {
    marginBottom: 16,
  },
  message: {
    fontSize: 15,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  actionButton: {
    // Buttons already have internal padding; we just add a small margin to separate them.
    marginLeft: 8,
  },
});

export default GlassModal;
