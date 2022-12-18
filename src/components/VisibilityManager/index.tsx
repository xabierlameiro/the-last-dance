import type { ReactElement } from 'react'
import useWindowResize from '@/hooks/useWidowResize'
import { mobileMax, tabletMax, tabletMin, desktopMin } from '@/constants/devices'

type Props = {
	children: ReactElement | ReactElement[]
	hideOnDesktop?: boolean
	hideOnTablet?: boolean
	hideOnMobile?: boolean
}

const VisibilityManager = (props: Props): ReactElement | null => {
	const { children, hideOnDesktop, hideOnTablet, hideOnMobile } = props
	const { width } = useWindowResize()

	const isMobile = width <= mobileMax
	const isTablet = width <= tabletMax && width >= tabletMin
	const isDesktop = width >= desktopMin

	const hideBecauseOfWidth =
		(hideOnDesktop && isDesktop) || (hideOnTablet && isTablet) || (hideOnMobile && isMobile)

	if (hideBecauseOfWidth) {
		return null
	}

	return <>{children}</>
}

export default VisibilityManager
