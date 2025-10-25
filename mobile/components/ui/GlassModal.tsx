import React from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { BlurView } from 'expo-blur';

interface GlassModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function GlassModal({ visible, onClose, children }: GlassModalProps) {
  // Android: Use solid backdrop and modal
  if (Platform.OS === 'android') {
    return (
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={onClose}
        statusBarTranslucent
      >
        <KeyboardAvoidingView
          behavior="height"
          style={styles.container}
        >
          {/* Solid Backdrop for Android */}
          <Pressable style={styles.androidBackdrop} onPress={onClose} />

          {/* Modal Content with Solid Background */}
          <View style={styles.androidModalContainer}>
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              bounces={false}
            >
              {children}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    );
  }

  // iOS: Use glassmorphism with BlurView
  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        behavior="padding"
        style={styles.container}
      >
        {/* Blurred Backdrop for iOS */}
        <View style={styles.backdrop}>
          <Pressable style={styles.backdropPress} onPress={onClose}>
            <BlurView intensity={20} tint="dark" style={styles.backdropBlur} />
          </Pressable>
        </View>

        {/* Modal Content */}
        <View style={styles.modalContainer}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            bounces={false}
          >
            {children}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  backdropPress: {
    flex: 1,
  },
  backdropBlur: {
    flex: 1,
  },
  androidBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.75)', // Solid dark backdrop for Android
  },
  modalContainer: {
    maxHeight: '90%',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: 'hidden',
  },
  androidModalContainer: {
    maxHeight: '90%',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF', // Solid white background for Android
    elevation: 24, // High elevation for prominent shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  scrollContent: {
    paddingBottom: 40,
  },
});
