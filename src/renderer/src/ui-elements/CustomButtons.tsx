import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { ButtonHTMLAttributes } from 'react'
import { IconProp, SizeProp } from '@fortawesome/fontawesome-svg-core'
import classNames from 'classnames'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  className: string
  iconName: IconProp
  iconSize?: SizeProp
  iconClassName?: string
}

export const IconButton: React.FC<Props> = ({ children, className, iconName, iconSize, iconClassName, ...props }) => {
  const buttonClasses = classNames(className)
  const iconClasses = classNames(iconClassName) || undefined

  return (
    <button
      className={buttonClasses}
      {...props}
    >
      <FontAwesomeIcon
        icon={iconName}
        size={iconSize || '1x'}
        fixedWidth
        className={iconClasses || ''}
      />
      {children}
    </button>
  )
}
