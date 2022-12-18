import { render, screen } from '@/test'
import VisibilityManager from '@/components/VisibilityManager'
import { mobileMax, tabletMin, desktopMin } from '@/constants/devices'

describe('VisibilityManager component', () => {
	it('should render children in mobile screen', () => {
		window.innerWidth = mobileMax
		render(
			<VisibilityManager hideOnDesktop hideOnTablet>
				<div>Mobile children</div>
			</VisibilityManager>
		)
		expect(screen.getByText('Mobile children')).toBeInTheDocument()
	})

	it('should render children in tablet screen', () => {
		window.innerWidth = tabletMin
		render(
			<VisibilityManager hideOnMobile hideOnDesktop>
				<div>Tablet children</div>
			</VisibilityManager>
		)
		expect(screen.getByText('Tablet children')).toBeInTheDocument()
	})

	it('should render children in desktop screen', () => {
		window.innerWidth = desktopMin
		render(
			<VisibilityManager hideOnMobile hideOnTablet>
				<div>Desktop children</div>
			</VisibilityManager>
		)
		expect(screen.getByText('Desktop children')).toBeInTheDocument()
	})
})
