import Shake from '@shakebugs/react-native-shake'
import React, { useEffect, useRef } from 'react'
import { requireNativeComponent, ViewProps } from 'react-native'
import { dimensions } from 'src/styles/sizing'

interface NativeMnemonicTestProps {
  mnemonicId: Address
  shouldShowSmallText: boolean
  onTestComplete: () => void
}

const NativeMnemonicTest = requireNativeComponent<NativeMnemonicTestProps>('MnemonicTest')

type MnemonicTestProps = ViewProps & {
  mnemonicId: Address
  onTestComplete: () => void
}

const mnemonicTestStyle = (shouldShowSmallVersion: boolean) => {
  return {
    // This is the min height needed for native component to function correctly.
    // We handle padding separately wherever the component is placed.
    height: shouldShowSmallVersion ? 350 : 450,
  }
}

export function MnemonicTest(props: MnemonicTestProps) {
  const ref = useRef(null)
  const shouldShowSmallText = dimensions.fullHeight < 700

  // Make sure that the input portion of the screen is not included in the ShakeBug screencapture
  useEffect(() => {
    if (ref.current) {
      Shake.addPrivateView(ref.current)
    }
  }, [])

  return (
    <NativeMnemonicTest
      ref={ref}
      shouldShowSmallText={shouldShowSmallText}
      style={mnemonicTestStyle(shouldShowSmallText)}
      {...props}
    />
  )
}
