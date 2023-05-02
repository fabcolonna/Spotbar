import { faLaptop, faMobileScreen, faTabletScreenButton, faTv } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChromecast } from '@fortawesome/free-brands-svg-icons'

export default function DeviceIcon(props: { type: string }) {
  const renderIcon = () => {
    switch (props.type.toLowerCase()) {
      case 'computer':
        return (
          <FontAwesomeIcon
            icon={faLaptop}
            fixedWidth
          />
        )
      case 'smartphone':
        return (
          <FontAwesomeIcon
            icon={faMobileScreen}
            fixedWidth
          />
        )
      case 'tablet':
        return (
          <FontAwesomeIcon
            icon={faTabletScreenButton}
            fixedWidth
          />
        )
      case 'tv':
        return (
          <FontAwesomeIcon
            icon={faTv}
            fixedWidth
          />
        )
      case 'speaker':
      default:
        return (
          <FontAwesomeIcon
            icon={faChromecast}
            fixedWidth
          />
        )
    }
  }

  return renderIcon()
}
