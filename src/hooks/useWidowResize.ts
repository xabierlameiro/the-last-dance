import React from 'react'

type WindowTpe = {
	width: number
	height: number
}

function useWindowResize(): WindowTpe {
	const [widowSize, setWindowSize] = React.useState({ width: 0, height: 0 } as WindowTpe)

	React.useEffect(() => {
		const handleResize = () => {
			setWindowSize({ width: window.innerWidth, height: window.innerHeight })
		}
		window.addEventListener('resize', handleResize)

		handleResize()

		return () => {
			window.removeEventListener('resize', handleResize)
		}
	}, [])
	return widowSize
}
export default useWindowResize
