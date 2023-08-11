import { ApolloProvider } from '@apollo/client'
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import * as Sentry from '@sentry/react-native'
import { PerformanceProfiler, RenderPassReport } from '@shopify/react-native-performance'
import * as SplashScreen from 'expo-splash-screen'
import { default as React, StrictMode, useCallback, useEffect } from 'react'
import { NativeModules, StatusBar } from 'react-native'
import { getUniqueId } from 'react-native-device-info'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { PersistGate } from 'redux-persist/integration/react'
import { ErrorBoundary } from 'src/app/ErrorBoundary'
import { useAppSelector } from 'src/app/hooks'
import { AppModals } from 'src/app/modals/AppModals'
import { useIsPartOfNavigationTree } from 'src/app/navigation/hooks'
import { AppStackNavigator } from 'src/app/navigation/navigation'
import { NavigationContainer } from 'src/app/navigation/NavigationContainer'
import { persistor, store } from 'src/app/store'
import { OfflineBanner } from 'src/components/banners/OfflineBanner'
import { Box } from 'src/components/layout'
import Trace from 'src/components/Trace/Trace'
import { TraceUserProperties } from 'src/components/Trace/TraceUserProperties'
import { usePersistedApolloClient } from 'src/data/usePersistedApolloClient'
import { initAppsFlyer } from 'src/features/analytics/appsflyer'
import { useCurrentAppearanceSetting, useIsDarkMode } from 'src/features/appearance/hooks'
import { LockScreenContextProvider } from 'src/features/authentication/lockScreenContext'
import { BiometricContextProvider } from 'src/features/biometrics/context'
import { selectFavoriteTokens } from 'src/features/favorites/selectors'
import { NotificationToastWrapper } from 'src/features/notifications/NotificationToastWrapper'
import { initOneSignal } from 'src/features/notifications/Onesignal'
import { sendMobileAnalyticsEvent } from 'src/features/telemetry'
import { MobileEventName } from 'src/features/telemetry/constants'
import { shouldLogScreen } from 'src/features/telemetry/directLogScreens'
import { TransactionHistoryUpdater } from 'src/features/transactions/TransactionHistoryUpdater'
import { processWidgetEvents, setFavoritesUserDefaults } from 'src/features/widgets/widgets'
import { DynamicThemeProvider } from 'src/theme/DynamicThemeProvider'
import { useAppStateTrigger } from 'src/utils/useAppStateTrigger'
import { getSentryEnvironment, getStatsigEnvironmentTier } from 'src/utils/version'
import { StatsigProvider } from 'statsig-react-native'
import { flex } from 'ui/src/theme/restyle/flex'
import { useAsyncData } from 'utilities/src/react/hooks'
import { AnalyticsNavigationContextProvider } from 'utilities/src/telemetry/trace/AnalyticsNavigationContext'
import { config } from 'wallet/src/config'
import { useTrmQuery } from 'wallet/src/features/trm/api'
import { AccountType } from 'wallet/src/features/wallet/accounts/types'
import { WalletContextProvider } from 'wallet/src/features/wallet/context'
import { useActiveAccount } from 'wallet/src/features/wallet/hooks'
import { SharedProvider } from 'wallet/src/provider'
import { CurrencyId } from 'wallet/src/utils/currencyId'

// Keep the splash screen visible while we fetch resources until one of our landing pages loads
SplashScreen.preventAutoHideAsync().catch(() => undefined)

// Construct a new instrumentation instance. This is needed to communicate between the integration and React
const routingInstrumentation = new Sentry.ReactNavigationInstrumentation()

// Dummy key since we use the reverse proxy will handle the real key
const DUMMY_STATSIG_SDK_KEY = 'client-0000000000000000000000000000000000000000000'

if (!__DEV__) {
  Sentry.init({
    environment: getSentryEnvironment(),
    dsn: config.sentryDsn,
    attachViewHierarchy: true,
    enableCaptureFailedRequests: true,
    tracesSampler: (_) => {
      return 0.2
    },
    integrations: [
      new Sentry.ReactNativeTracing({
        enableUserInteractionTracing: true,
        enableNativeFramesTracking: true,
        enableStallTracking: true,
        // Pass instrumentation to be used as `routingInstrumentation`
        routingInstrumentation,
      }),
    ],
  })
}

initOneSignal()
initAppsFlyer()

function App(): JSX.Element | null {
  // We want to ensure deviceID is used as the identifier to link with analytics
  const fetchAndSetDeviceId = useCallback(async () => {
    const uniqueId = await getUniqueId()
    Sentry.setUser({
      id: uniqueId,
    })
    return uniqueId
  }, [])

  const deviceId = useAsyncData(fetchAndSetDeviceId).data

  const statSigOptions = {
    options: {
      environment: {
        tier: getStatsigEnvironmentTier(),
      },
      api: config.statSigProxyUrl,
    },
    sdkKey: DUMMY_STATSIG_SDK_KEY,
    user: deviceId ? { userID: deviceId } : {},
    waitForInitialization: true,
  }

  return (
    <Trace>
      <StrictMode>
        <StatsigProvider {...statSigOptions}>
          <SafeAreaProvider>
            <SharedProvider reduxStore={store}>
              <AnalyticsNavigationContextProvider
                shouldLogScreen={shouldLogScreen}
                useIsPartOfNavigationTree={useIsPartOfNavigationTree}>
                <AppOuter />
              </AnalyticsNavigationContextProvider>
            </SharedProvider>
          </SafeAreaProvider>
        </StatsigProvider>
      </StrictMode>
    </Trace>
  )
}

// Ensures redux state is available inside usePersistedApolloClient for the custom endpoint
function AppOuter(): JSX.Element | null {
  const client = usePersistedApolloClient()

  const onReportPrepared = useCallback((report: RenderPassReport) => {
    sendMobileAnalyticsEvent(MobileEventName.PerformanceReport, report)
  }, [])

  if (!client) {
    return null
  }

  return (
    <ApolloProvider client={client}>
      <PersistGate loading={null} persistor={persistor}>
        <DynamicThemeProvider>
          <ErrorBoundary>
            <GestureHandlerRootView style={flex.fill}>
              <WalletContextProvider>
                <BiometricContextProvider>
                  <LockScreenContextProvider>
                    <Sentry.TouchEventBoundary>
                      <DataUpdaters />
                      <BottomSheetModalProvider>
                        <AppModals />
                        <PerformanceProfiler onReportPrepared={onReportPrepared}>
                          <AppInner />
                        </PerformanceProfiler>
                      </BottomSheetModalProvider>
                    </Sentry.TouchEventBoundary>
                  </LockScreenContextProvider>
                </BiometricContextProvider>
              </WalletContextProvider>
            </GestureHandlerRootView>
          </ErrorBoundary>
        </DynamicThemeProvider>
      </PersistGate>
    </ApolloProvider>
  )
}

function AppInner(): JSX.Element {
  const isDarkMode = useIsDarkMode()
  const themeSetting = useCurrentAppearanceSetting()

  useEffect(() => {
    // TODO: This is a temporary solution (it should be replaced with Appearance.setColorScheme
    // after updating RN to 0.72.0 or higher)
    NativeModules.ThemeModule.setColorScheme(themeSetting)
  }, [themeSetting])

  return (
    // This Flex ensures that the background color is set to the correct color
    // and the native background color is not visible after the splash screen
    // is hidden (there was an issue on Android where the native background
    // used as a splash screen which was visible when changing screens with
    // a transition)
    <Box backgroundColor="surface1" flex={1}>
      <NavStack isDarkMode={isDarkMode} />
    </Box>
  )
}

function DataUpdaters(): JSX.Element {
  const activeAccount = useActiveAccount()
  const favoriteTokens: CurrencyId[] = useAppSelector(selectFavoriteTokens)

  useTrmQuery(
    activeAccount && activeAccount.type === AccountType.SignerMnemonic
      ? activeAccount.address
      : undefined
  )

  // Refreshes widgets when bringing app to foreground
  useAppStateTrigger('background', 'active', processWidgetEvents)

  useEffect(() => {
    setFavoritesUserDefaults(favoriteTokens)
  }, [favoriteTokens])

  return (
    <>
      <TraceUserProperties />
      <TransactionHistoryUpdater />
    </>
  )
}

function NavStack({ isDarkMode }: { isDarkMode: boolean }): JSX.Element {
  return (
    <NavigationContainer
      onReady={(navigationRef): void => {
        routingInstrumentation.registerNavigationContainer(navigationRef)
      }}>
      <OfflineBanner />
      <NotificationToastWrapper />
      <AppStackNavigator />
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
      />
    </NavigationContainer>
  )
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function getApp() {
  return __DEV__ ? App : Sentry.wrap(App)
}

export default getApp()
