import { Group } from '@visx/group'
import { LinePath } from '@visx/shape'
import { easeSinOut } from 'd3'
import ms from 'ms.macro'
import React from 'react'
import { useEffect, useRef, useState } from 'react'
import { useSpring } from 'react-spring'

import { AnimatedLineColors } from './AnimatedLineColor'
import { LineChartProps } from './LineChart'

type AnimatedInLineChartProps<T> = Omit<LineChartProps<T>, 'height' | 'width' | 'children'>

const config = {
  duration: ms`0.8s`,
  easing: easeSinOut,
}

// code reference: https://airbnb.io/visx/lineradial

function AnimatedInLineChart<T>({ data, getX, getY, marginTop, curve, strokeWidth }: AnimatedInLineChartProps<T>) {
  const lineRef = useRef<SVGPathElement>(null)
  const [lineLength, setLineLength] = useState(0)
  const [shouldAnimate, setShouldAnimate] = useState(false)
  const [hasAnimatedIn, setHasAnimatedIn] = useState(false)

  const spring = useSpring({
    frame: shouldAnimate ? 0 : 1,
    config,
    onRest: () => {
      setShouldAnimate(false)
      setHasAnimatedIn(true)
    },
  })

  // We need to check to see after the "invisble" line has been drawn
  // what the length is to be able to animate in the line for the first time
  // This will run on each render to see if there is a new line length
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (lineRef.current) {
      const length = lineRef.current.getTotalLength()
      if (length !== lineLength) {
        setLineLength(length)
      }
      if (length > 0 && !shouldAnimate && !hasAnimatedIn) {
        setShouldAnimate(true)
      }
    }
  })

  return (
    <Group top={marginTop}>
      <LinePath curve={curve} x={getX} y={getY}>
        {({ path }) => {
          const d = path(data) || ''
          return (
            <>
              <AnimatedLineColors
                d={d}
                strokeWidth={strokeWidth}
                hasAnimatedIn={hasAnimatedIn}
                lineRef={lineRef}
                shouldAnimate={shouldAnimate}
                lineLength={lineLength}
                spring={spring.frame}
              />
            </>
          )
        }}
      </LinePath>
    </Group>
  )
}

export default React.memo(AnimatedInLineChart) as typeof AnimatedInLineChart
