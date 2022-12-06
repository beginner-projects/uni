import { ButtonCTA } from 'components/Button'
import { AutoRow } from 'components/Row'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useIsDarkMode } from 'state/user/hooks'
import styled from 'styled-components/macro'
import { BREAKPOINTS } from 'theme'

const MOBILE_BREAKPOINT = BREAKPOINTS.sm
const DESKTOP_BREAKPOINT = BREAKPOINTS.md

type SVGProps = React.SVGProps<SVGSVGElement>

const UniswapIcon = (props: SVGProps) => (
  <svg {...props} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M13.2167 12.3144C13.1627 12.5231 13.0683 12.719 12.939 12.891C12.6983 13.2048 12.3798 13.4495 12.0152 13.6007C11.6874 13.7426 11.3402 13.8343 10.9853 13.8728C10.9122 13.8821 10.8366 13.8879 10.7633 13.8934L10.7514 13.8944C10.5266 13.9029 10.3104 13.9836 10.1346 14.1245C9.95869 14.2654 9.83234 14.4592 9.77403 14.6775C9.74732 14.7861 9.72747 14.8962 9.71458 15.0073C9.69416 15.1749 9.68365 15.3464 9.67227 15.532C9.66411 15.6652 9.65551 15.8055 9.64248 15.9569C9.56612 16.5732 9.38864 17.1726 9.11725 17.7306C9.06179 17.8479 9.00526 17.9616 8.94974 18.0733L8.9497 18.0734C8.65212 18.672 8.38328 19.2127 8.46048 19.937C8.52089 20.495 8.80543 20.8689 9.18351 21.2546C9.36308 21.4391 9.60119 21.5968 9.84836 21.7604C10.5401 22.2184 11.3028 22.7233 11.0515 23.9955C10.8459 25.0263 9.14453 26.1079 6.75325 26.4858C6.98521 26.4504 6.47427 25.5747 6.41753 25.4775L6.41414 25.4717C6.34823 25.3679 6.28071 25.2658 6.2133 25.1638L6.21324 25.1637C6.01856 24.8691 5.82483 24.576 5.67357 24.251C5.27404 23.4023 5.0889 22.4205 5.25261 21.4905C5.40091 20.6488 5.95481 19.9765 6.48813 19.3291C6.57506 19.2236 6.66146 19.1188 6.74545 19.0139C7.45875 18.1241 8.20712 16.9583 8.37277 15.8032C8.38674 15.7028 8.39921 15.5935 8.41233 15.4783L8.41234 15.4783C8.43582 15.2722 8.46139 15.0479 8.5014 14.8243C8.56086 14.4382 8.68125 14.0642 8.85805 13.7162C8.97872 13.488 9.1376 13.2824 9.32773 13.1083C9.42686 13.0159 9.49226 12.8928 9.51346 12.7586C9.53466 12.6244 9.51043 12.487 9.44466 12.3683L5.63264 5.48082L11.108 12.2684C11.1704 12.3471 11.2492 12.411 11.3389 12.4556C11.4286 12.5002 11.527 12.5245 11.627 12.5266C11.7271 12.5288 11.8264 12.5088 11.9179 12.468C12.0094 12.4273 12.0909 12.3668 12.1565 12.2909C12.2259 12.2097 12.2652 12.1069 12.2679 11.9999C12.2706 11.8929 12.2364 11.7882 12.1712 11.7036C11.9166 11.3768 11.6517 11.0455 11.388 10.7158L11.3879 10.7158L11.3878 10.7157C11.2811 10.5822 11.1746 10.4491 11.0691 10.3165L9.6912 8.60347L6.92572 5.18324L3.85498 1.53149L7.28042 4.87685L10.2242 8.14633L11.6927 9.78499C11.8276 9.93754 11.9624 10.0887 12.0973 10.2399L12.0975 10.2401L12.0975 10.2402C12.4498 10.6351 12.8021 11.0301 13.1544 11.4491L13.2343 11.547L13.2518 11.6987C13.2756 11.9044 13.2637 12.1128 13.2167 12.3144ZM27.289 14.6162L27.2948 14.625L27.2948 14.6226C27.2929 13.8921 26.8427 12.6885 25.9326 11.5308L25.9111 11.5024C25.6305 11.1539 25.3247 10.8267 24.9961 10.5235C24.9853 10.5129 24.9742 10.5024 24.9631 10.4918C24.9755 10.5029 24.9879 10.5137 25.0002 10.5242C24.9611 10.4879 24.9212 10.4519 24.8815 10.416L24.8427 10.381L24.8053 10.3471C24.8248 10.3648 24.8442 10.3829 24.8636 10.4009L24.8636 10.4009L24.8717 10.4084C24.8484 10.3877 24.8249 10.367 24.8012 10.3463C24.3803 9.97753 23.9202 9.65648 23.4292 9.38897L23.3941 9.37135C21.8516 8.52755 19.8442 8.09292 17.3692 8.58237C17.0367 8.17696 16.6787 7.79343 16.2973 7.43413C15.7131 6.87497 15.0255 6.43631 14.2733 6.14298C13.5279 5.86888 12.7297 5.77107 11.9405 5.85715C12.7012 5.92594 13.4421 6.1385 14.1243 6.48363C14.783 6.83817 15.3763 7.30371 15.8783 7.85995C16.387 8.42774 16.8652 9.02245 17.3107 9.64152L17.4225 9.78771C17.8585 10.3581 18.3023 10.9387 18.8552 11.4554C19.1596 11.7431 19.4991 11.9908 19.8657 12.1925C19.9631 12.2424 20.0615 12.2894 20.158 12.3305C20.2545 12.3716 20.3451 12.4098 20.4425 12.4451C20.6306 12.5185 20.8255 12.5792 21.0204 12.635C21.7999 12.8581 22.598 12.9384 23.3776 12.9815C23.4861 12.9872 23.5944 12.9926 23.7023 12.9979L23.7023 12.9979C23.9808 13.0117 24.2566 13.0254 24.5284 13.0451C24.9008 13.0673 25.2702 13.1257 25.6315 13.2194C26.1741 13.3615 26.6519 13.6863 26.985 14.1395C27.0982 14.2904 27.1998 14.4498 27.289 14.6162ZM24.0489 17.7355C21.542 16.7136 18.9197 15.6447 19.3102 12.6446C20.1471 13.5423 21.461 13.7306 22.89 13.9353C24.1862 14.1211 25.5772 14.3204 26.7929 15.0751C29.6617 16.8547 29.2427 20.3122 28.2683 21.5847C28.3561 19.4912 26.2469 18.6314 24.0489 17.7355ZM13.9316 16.2333C14.5932 16.1697 16.0033 15.8241 15.3728 14.7092C15.2372 14.4823 15.0406 14.2986 14.8056 14.1789C14.5707 14.0593 14.3069 14.0086 14.0446 14.0328C13.7784 14.0615 13.5275 14.1717 13.3258 14.3486C13.1241 14.5254 12.9815 14.7603 12.9172 15.0214C12.7214 15.7507 12.9289 16.3312 13.9316 16.2333ZM13.7573 7.40952C13.3422 6.92791 12.6981 6.67536 12.0666 6.58334C12.043 6.7413 12.028 6.90045 12.0218 7.06006C11.9935 8.37471 12.4584 9.81857 13.3578 10.8219C13.6455 11.1463 13.9925 11.4121 14.38 11.605C14.6041 11.7147 15.1985 11.9868 15.4187 11.7421C15.4355 11.7197 15.446 11.6932 15.4493 11.6653C15.4525 11.6374 15.4484 11.6092 15.4372 11.5835C15.4007 11.4787 15.3302 11.3836 15.2602 11.2892C15.2106 11.2223 15.1612 11.1557 15.1244 11.0862C15.0872 11.0163 15.0475 10.9481 15.0077 10.8799L15.0077 10.8799L15.0077 10.8798L15.0076 10.8798L15.0076 10.8797L15.0076 10.8797L15.0076 10.8796C14.9328 10.7515 14.8581 10.6235 14.8009 10.4842C14.6499 10.1197 14.5713 9.73208 14.4929 9.34571C14.4772 9.26828 14.4615 9.1909 14.4452 9.11377C14.3254 8.51762 14.1724 7.89114 13.7573 7.40952ZM22.6269 17.8977C21.9829 19.703 23.0215 21.2277 24.054 22.7434C25.2089 24.4389 26.3561 26.1232 25.1322 28.1761C27.5108 27.1893 28.6402 24.2086 27.6531 21.8436C27.031 20.3478 25.5319 19.5369 24.1404 18.7842C23.6005 18.4921 23.0768 18.2089 22.6269 17.8977ZM15.6531 22.2077C15.222 22.3843 14.8156 22.6163 14.4438 22.8978C15.2891 22.5898 16.1764 22.4139 17.0748 22.376C17.2376 22.3663 17.4015 22.3588 17.5668 22.3511L17.5669 22.3511L17.5671 22.3511L17.5672 22.3511L17.5673 22.3511L17.5674 22.3511L17.5675 22.3511L17.5676 22.3511C17.8531 22.3379 18.1429 22.3245 18.439 22.2997C18.9246 22.2666 19.4034 22.1678 19.8627 22.006C20.3439 21.8369 20.7818 21.5627 21.145 21.2033C21.5119 20.8323 21.7693 20.3664 21.8885 19.8574C21.9934 19.3765 21.9787 18.877 21.8456 18.4032C21.7125 17.9294 21.4652 17.4958 21.1255 17.1409C21.2894 17.5585 21.3903 17.9983 21.4247 18.4458C21.4544 18.8624 21.398 19.2807 21.259 19.6743C21.1234 20.0474 20.9017 20.3828 20.612 20.6532C20.3128 20.9261 19.9663 21.1418 19.5898 21.2895C19.0665 21.5012 18.4748 21.5879 17.8584 21.6781L17.8583 21.6781C17.5771 21.7193 17.2909 21.7612 17.0036 21.8161C16.5416 21.9011 16.0892 22.0323 15.6531 22.2077ZM23.1723 29.6228C23.1434 29.6459 23.1145 29.6693 23.0854 29.6927C22.9765 29.7808 22.8657 29.8703 22.7465 29.9507C22.5945 30.0513 22.4352 30.1403 22.27 30.217C21.926 30.3856 21.5477 30.4717 21.165 30.4686C20.1282 30.449 19.3954 29.6737 18.9666 28.7976C18.8542 28.568 18.7552 28.3312 18.6562 28.0945C18.4977 27.7156 18.3392 27.3367 18.1257 26.9866C17.6297 26.1732 16.781 25.5183 15.787 25.6397C15.3817 25.6906 15.0016 25.8737 14.7765 26.227C14.1841 27.1501 15.0348 28.4432 16.1193 28.2602C16.2116 28.2461 16.3018 28.2211 16.3883 28.1858C16.4744 28.1489 16.5548 28.0998 16.627 28.0399C16.7785 27.9132 16.8927 27.7474 16.9573 27.5603C17.0286 27.3652 17.0444 27.154 17.0031 26.9504C16.9586 26.7376 16.8335 26.5505 16.6543 26.4287C16.8627 26.5267 17.0251 26.7022 17.1074 26.9181C17.1927 27.1403 17.2146 27.382 17.1707 27.6161C17.1282 27.8599 17.0211 28.0878 16.8609 28.2758C16.7757 28.3726 16.6773 28.4566 16.5685 28.5255C16.4607 28.5935 16.3453 28.6484 16.2245 28.6889C15.9798 28.773 15.7192 28.8001 15.4625 28.7682C15.1021 28.7167 14.7621 28.5686 14.4783 28.3395C14.4213 28.2942 14.3667 28.2465 14.314 28.197C14.1273 28.0337 13.9574 27.8516 13.8071 27.6537C13.7368 27.5758 13.6653 27.499 13.5906 27.4252C13.2432 27.059 12.8333 26.7583 12.3804 26.5373C12.068 26.3995 11.7411 26.2977 11.4059 26.2339C11.2373 26.1986 11.0668 26.1732 10.8963 26.1517C10.8778 26.1498 10.842 26.1436 10.7976 26.1358L10.7976 26.1358C10.6552 26.111 10.4236 26.0705 10.3828 26.1086C10.9098 25.6212 11.4844 25.1883 12.0978 24.8165C12.7276 24.441 13.4038 24.1504 14.109 23.9521C14.8402 23.7453 15.605 23.6864 16.359 23.7788C16.7472 23.8257 17.1273 23.9244 17.4894 24.0725C17.8687 24.2247 18.2189 24.442 18.5242 24.7147C18.8264 25.0006 19.0706 25.3427 19.2434 25.7219C19.3993 26.077 19.5157 26.4483 19.5903 26.8291C19.6303 27.0339 19.6604 27.2591 19.6916 27.4922C19.8337 28.554 19.9977 29.7793 21.2147 29.9928C21.292 30.0079 21.3701 30.019 21.4485 30.0261L21.6912 30.032C21.858 30.02 22.0237 29.9962 22.1872 29.9605C22.5257 29.8805 22.8557 29.7674 23.1723 29.6228Z"
      fill="currentColor"
    />
  </svg>
)

const PageWrapper = styled.span<{ isDarkMode: boolean }>`
  width: 100%;
  height: calc(100vh - 72px);
  position: absolute;
  background: ${({ isDarkMode }) =>
    isDarkMode
      ? 'linear-gradient(rgba(8, 10, 24, 0) 9.84%, rgb(8 10 24 / 86%) 35.35%)'
      : 'linear-gradient(rgba(8, 10, 24, 0) 9.84%, rgb(255 255 255 / 86%) 35.35%)'};
  z-index: 999;
  display: flex;
  flex-direction: column;
  justify-content: end;
  padding: 24px 24px 64px 24px;
  align-items: center;
  pointer-events: none;
  transition: 250ms ease opacity;

  @media screen and (min-width: ${MOBILE_BREAKPOINT}px) {
    padding: 4rem;
  }

  @media screen and (min-width: ${DESKTOP_BREAKPOINT}px) {
    padding: 2rem;
  }
`

const TitleText = styled.h1<{ isDarkMode: boolean }>`
  font-size: 36px;
  font-weight: 600;
  text-align: center;
  margin-bottom: 0px;
  background: ${({ isDarkMode }) =>
    isDarkMode
      ? 'linear-gradient(20deg, rgba(255, 244, 207, 1) 10%, rgba(255, 87, 218, 1) 100%)'
      : 'linear-gradient(10deg, rgba(255,79,184,1) 0%, rgba(255,159,251,1) 100%)'};

  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;

  @media screen and (min-width: ${MOBILE_BREAKPOINT}px) {
    font-size: 48px;
  }

  @media screen and (min-width: ${DESKTOP_BREAKPOINT}px) {
    font-size: 72px;
  }
`

const SubText = styled.h3`
  color: ${({ theme }) => theme.textSecondary};
  font-size: 16px;
  font-weight: 400;
  text-align: center;

  @media screen and (min-width: ${MOBILE_BREAKPOINT}px) {
    font-size: 20px;
  }

  @media screen and (min-width: ${DESKTOP_BREAKPOINT}px) {
    font-size: 28px;
  }
`

const LearnMoreText = styled.p`
  color: ${({ theme }) => theme.textSecondary};
  font-size: 16px;
  margin-left: 8px;
  cursor: pointer;
`

const ButtonCTAText = styled.p`
  margin: 0px;
  font-size: 16px;
  white-space: nowrap;

  @media screen and (min-width: ${MOBILE_BREAKPOINT}px) {
    font-size: 20px;
  }

  @media screen and (min-width: ${DESKTOP_BREAKPOINT}px) {
    font-size: 24px;
  }
`

const TitleContentWrapper = styled.span`
  max-width: 720px;
`

const ContentWrapper = styled.span`
  max-width: 720px;
`

const FooterWrapper = styled.span`
  margin-bottom: 20px;
`

export default function Landing() {
  const [isHoveredText, setIsHoveredText] = useState(false)

  const isDarkMode = useIsDarkMode()

  const navigate = useNavigate()

  const handleMouseOver = () => {
    setIsHoveredText(true)
  }

  const handleMouseOut = () => {
    setIsHoveredText(false)
  }

  return (
    <PageWrapper isDarkMode={isDarkMode}>
      <TitleContentWrapper>
        <TitleText isDarkMode={isDarkMode}>Trade crypto & NFTs with confidence.</TitleText>
        <SubText>
          Swap tokens with the deepest liquidity and <br /> buy NFTs at the best prices.
        </SubText>
      </TitleContentWrapper>
      <ContentWrapper>
        <ButtonCTA
          onClick={() => {
            navigate('/swap')
          }}
        >
          <ButtonCTAText>Get started</ButtonCTAText>
        </ButtonCTA>
      </ContentWrapper>
      <FooterWrapper onMouseOver={handleMouseOver} onMouseOut={handleMouseOut}>
        <AutoRow>
          <UniswapIcon width="32" height="32" />
          {isHoveredText ? (
            <LearnMoreText onClick={() => navigate('/about')}>→ Learn more about Uniswap</LearnMoreText>
          ) : (
            <LearnMoreText>Powered by the Uniswap Protocol</LearnMoreText>
          )}
        </AutoRow>
      </FooterWrapper>
    </PageWrapper>
  )
}
