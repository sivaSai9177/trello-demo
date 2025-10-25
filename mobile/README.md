# Trello Demo - Mobile App (iOS & Android)

A beautiful React Native mobile app built with Expo, featuring iOS glassmorphism UI design, real-time updates, and offline support.

## Features

- ✨ **iOS Glassmorphism UI** - Native blur effects, gradient backgrounds, and frosted glass cards
- 🔄 **Real-time Updates** - WebSocket integration with automatic reconnection
- 📱 **Offline Support** - Works offline with MMKV caching and auto-sync
- 🎯 **Type-Safe** - End-to-end type safety with shared backend types
- 🎨 **Smooth Animations** - React Native Reanimated for 60fps animations
- 📳 **Haptic Feedback** - iOS haptic feedback for button interactions
- 🌐 **Network Awareness** - Auto-detects network changes and shows offline page
- ♿ **Accessibility** - Follows iOS and Android accessibility guidelines

## Tech Stack

### Core (Same as Web)
- **React 18.3** - UI framework (Expo SDK 52 requirement)
- **TypeScript 5.3** - Type safety
- **@tanstack/react-query@5.66.5** - Data fetching & caching
- **@tanstack/react-form@1.23.8** - Form state management
- **@orpc/client@1.10.1** - Type-safe RPC client
- **zod@4.1.12** - Runtime validation
- **@your-org/trello-backend-types** - Shared types from backend

### Mobile-Specific
- **Expo SDK 52** - React Native framework
- **Expo Router** - File-based navigation
- **NativeWind v4** - TailwindCSS for React Native
- **expo-blur** - iOS-native blur effects
- **expo-linear-gradient** - Gradient backgrounds
- **react-native-reanimated** - High-performance animations
- **expo-haptics** - Haptic feedback
- **react-native-mmkv** - Fast local storage
- **@react-native-community/netinfo** - Network detection

## Project Structure

```
mobile/
├── app/                          # Expo Router (file-based routing)
│   ├── (tabs)/                   # Tab navigation
│   │   ├── index.tsx             # Projects screen (main)
│   │   └── two.tsx               # Tasks screen (placeholder)
│   ├── _layout.tsx               # Root layout with providers
│   ├── offline.tsx               # Offline fallback page
│   └── +not-found.tsx            # 404 screen
├── components/
│   ├── ProjectsList.tsx          # Projects list with glassmorphism
│   ├── ProjectForm.tsx           # Create/Edit form (TanStack Form)
│   ├── ConnectionStatus.tsx      # WebSocket status banner
│   └── ui/                       # Reusable UI components
│       ├── GlassCard.tsx         # Glassmorphism card
│       ├── GlassButton.tsx       # iOS-style glass button
│       ├── GlassModal.tsx        # Floating glass modal
│       └── GradientBackground.tsx # Animated gradient
├── hooks/
│   ├── useProjectsRPC.ts         # Projects CRUD hooks (from web)
│   ├── useNetworkStatus.ts       # Network detection
│   └── useOfflineDetection.ts    # Auto-navigate to offline page
├── lib/
│   ├── orpc-client.ts            # Type-safe RPC client
│   ├── storage.ts                # MMKV storage wrapper
│   └── websocket.ts              # Network-aware WebSocket (planned)
├── stores/
│   └── websocket.store.ts        # WebSocket state management
├── constants/
│   ├── Colors.ts                 # Glassmorphism color palette
│   └── Config.ts                 # Environment configuration
├── global.css                    # TailwindCSS entry
├── tailwind.config.js            # TailwindCSS configuration
├── metro.config.js               # Metro bundler config
└── babel.config.js               # Babel configuration
```

## Getting Started

### Prerequisites

- **Node.js 18+** or **Bun**
- **Xcode** (for iOS development)
- **Android Studio** (for Android development)
- **Backend running** on `http://localhost:3002`

### Installation

```bash
# Install dependencies
cd mobile
bun install

# Link backend types for development
bun link @your-org/trello-backend-types

# Start Expo dev server
bun run start

# Or run directly on platform
bun run ios      # iOS Simulator
bun run android  # Android Emulator
bun run web      # Web browser (for debugging)
```

### First-Time Setup

1. **Start Backend:**
   ```bash
   cd backend
   bun run dev  # Backend on http://localhost:3002
   ```

2. **Start Mobile:**
   ```bash
   cd mobile
   bun run start
   ```

3. **Choose Platform:**
   - Press `i` for iOS Simulator
   - Press `a` for Android Emulator
   - Press `w` for web browser

## Configuration

### Environment Variables

Edit [constants/Config.ts](constants/Config.ts):

```typescript
const ENV = {
  dev: {
    apiUrl: 'http://localhost:3002',
    wsUrl: 'ws://localhost:3002',
  },
  prod: {
    apiUrl: 'https://your-api.fly.dev',
    wsUrl: 'wss://your-api.fly.dev',
  },
};
```

### Backend Types

The app uses shared types from the backend package:

```typescript
import type { Project } from '@your-org/trello-backend-types';
```

During development, types are linked via `bun link`. For production:

```bash
# Install published package
bun add @your-org/trello-backend-types@latest
```

## Key Features Explained

### 1. iOS Glassmorphism UI

All components use native iOS blur effects and gradient overlays:

```typescript
// GlassCard.tsx
<BlurView intensity={30} tint="light">
  <LinearGradient
    colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']}
  >
    {children}
  </LinearGradient>
</BlurView>
```

**Color Palette:**
- Background gradients: Purple → Deep Purple → Pink → Blue
- Glass effects: White with 10-20% opacity
- Text: White with varying opacity (primary, secondary, tertiary)
- Accents: Blue, Purple, Pink, Green, Red

### 2. Real-Time Updates

WebSocket connection automatically syncs projects:

```typescript
// Automatic cache updates via WebSocket
case "project:updated":
  queryClient.setQueryData(["projects"], (old) =>
    old.map((p) => (p.id === updatedProject.id ? updatedProject : p))
  );
```

**Features:**
- Auto-reconnect with exponential backoff
- Heartbeat ping/pong (30s intervals)
- Network-aware (pauses when offline, resumes when online)
- App state aware (reconnects when app becomes active)

### 3. Offline Support

The app works seamlessly offline:

```typescript
// Auto-cache on successful fetch
const { data: projects } = useQuery({
  queryFn: async () => {
    try {
      const data = await orpcClient.projects.getAll();
      cacheProjects(data); // Store in MMKV
      return data;
    } catch (error) {
      return getCachedProjects(); // Fallback to cache
    }
  },
});
```

**Offline Features:**
- MMKV local storage for instant access
- Auto-navigate to `/offline` page when connection lost
- Show cached project count
- Auto-redirect when back online
- Queue mutations for sync (planned)

### 4. Form Validation

Uses same TanStack Form + Zod validation as web:

```typescript
<form.Field
  name="name"
  validators={{
    onChange: ({ value }) => {
      const result = z.string().min(1, 'Name is required').safeParse(value);
      return result.success ? undefined : result.error.errors[0].message;
    },
  }}
>
  {(field) => (
    <TextInput
      value={field.state.value}
      onChangeText={field.handleChange}
    />
  )}
</form.Field>
```

### 5. Haptic Feedback

iOS haptic feedback on button presses:

```typescript
const handlePress = () => {
  if (Platform.OS === 'ios') {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }
  onPress();
};
```

## Code Reuse from Web

Maximum code reuse strategy:

| Component | Reuse % | Notes |
|-----------|---------|-------|
| `hooks/useProjectsRPC.ts` | 95% | Added offline caching |
| `stores/websocket.store.ts` | 90% | Added NetInfo + AppState |
| Form validation logic | 100% | Same Zod schemas |
| oRPC client | 95% | Removed SSR checks |
| State management | 100% | Same React Query patterns |

## UI Components

### GlassCard

Reusable glassmorphism card:

```typescript
<GlassCard intensity={30} style={styles.card}>
  <Text>Content</Text>
</GlassCard>
```

### GlassButton

Pressable button with haptics and animations:

```typescript
<GlassButton
  onPress={handlePress}
  variant="primary" // or "secondary", "danger"
  disabled={isLoading}
>
  Submit
</GlassButton>
```

### GlassModal

Bottom sheet modal with glassmorphism:

```typescript
<GlassModal visible={showModal} onClose={handleClose}>
  <Text>Modal Content</Text>
</GlassModal>
```

### GradientBackground

Animated gradient background:

```typescript
<GradientBackground
  colors={['#667eea', '#764ba2', '#f093fb']}
>
  {children}
</GradientBackground>
```

## Development Workflow

### Hot Reload

Changes reflect instantly (like Vite on web):
1. Save file
2. App reloads automatically
3. State persists across reloads

### Debugging

**React Query DevTools:**
```bash
# Shake device/simulator
# Select "Toggle Query DevTools"
```

**Network Inspector:**
```bash
# In Expo Go: Shake → Debug Remote JS
# In custom dev build: Shake → Open Debugger
```

**Logs:**
```bash
# iOS
npx react-native log-ios

# Android
npx react-native log-android
```

### Type Checking

```bash
# Check types
bun run tsc --noEmit

# Watch mode
bun run tsc --noEmit --watch
```

## Testing

### Manual Testing

1. **Offline Mode:**
   - Enable Airplane Mode on device/simulator
   - Verify offline page appears
   - Check cached projects are visible
   - Disable Airplane Mode
   - Verify auto-redirect to home

2. **Real-Time Sync:**
   - Open app on multiple devices
   - Create project on one device
   - Verify it appears on other devices instantly

3. **Form Validation:**
   - Try to submit empty form
   - Verify error messages appear
   - Test with valid data

### Automated Testing (Planned)

```bash
# Unit tests
bun test

# E2E tests (Detox or Maestro)
bun test:e2e
```

## Building for Production

### iOS

```bash
# Create production build
eas build --platform ios

# Or local build
bun run ios --configuration Release
```

### Android

```bash
# Create production build
eas build --platform android

# Or local build
cd android && ./gradlew assembleRelease
```

### Environment

Update [app.json](app.json) for production:

```json
{
  "expo": {
    "extra": {
      "environment": "prod"
    }
  }
}
```

## Deployment

### EAS (Expo Application Services)

```bash
# Install EAS CLI
npm install -g eas-cli

# Login
eas login

# Configure
eas build:configure

# Build for both platforms
eas build --platform all

# Submit to stores
eas submit --platform ios
eas submit --platform android
```

### TestFlight (iOS)

Builds automatically upload to TestFlight:
1. Open App Store Connect
2. Navigate to TestFlight
3. Add internal testers
4. Distribute build

### Google Play (Android)

1. Create release in Google Play Console
2. Upload AAB from EAS build
3. Complete store listing
4. Submit for review

## Troubleshooting

### Types Not Found

```bash
# Re-link backend types
cd ../backend && bun link
cd ../mobile && bun link @your-org/trello-backend-types
```

### WebSocket Not Connecting

1. Check backend is running on `http://localhost:3002`
2. Verify `constants/Config.ts` has correct URL
3. Check device/simulator can reach localhost:
   - iOS Simulator: Use `http://localhost:3002`
   - Android Emulator: Use `http://10.0.2.2:3002`
   - Physical device: Use computer's IP address

### Metro Bundler Issues

```bash
# Clear cache
bun run start --clear

# Or manually
rm -rf node_modules/.cache
rm -rf .expo
```

### NativeWind Not Working

```bash
# Verify metro.config.js has withNativeWind
# Restart dev server with cache clear
bun run start --clear
```

### Reanimated Warnings

Add to babel.config.js (already configured):
```javascript
plugins: ['react-native-reanimated/plugin']
```

## Performance

### Optimizations

- MMKV for instant storage (10x faster than AsyncStorage)
- React Query with stale-while-revalidate
- Reanimated for 60fps animations
- Image caching with expo-image (planned)
- List virtualization with FlashList (planned)

### Bundle Size

```bash
# Analyze bundle
npx react-native-bundle-visualizer

# Current size: ~15MB (debug) / ~8MB (release)
```

## Roadmap

- [ ] Task management screen
- [ ] Project details screen
- [ ] Comments on tasks
- [ ] User authentication
- [ ] Push notifications
- [ ] Dark mode toggle
- [ ] Image uploads
- [ ] Advanced filtering
- [ ] Offline mutation queue

## Contributing

See main [README.md](../README.md) for contribution guidelines.

## License

Same as main project.

## Support

For mobile-specific issues:
1. Check this README's troubleshooting section
2. Review Expo logs: `bun run start`
3. Open issue on GitHub with "mobile:" prefix
