import React, { HTMLProps } from 'react'
import { motion } from 'framer-motion'
import classNames from 'classnames'

type Props = HTMLProps<HTMLDivElement> & { className: string }

export const RightSlideInDiv: React.FC<Props> = ({ children, className }) => {
  const classes = classNames(className)

  return (
    <motion.div
      initial={{ opacity: 0, x: '100%' }}
      animate={{ opacity: 1, x: '0%', transition: { type: 'spring', stiffness: 70, damping: 15 } }}
      exit={{ opacity: 0, transition: { ease: 'easeIn' } }}
      className={classes}
    >
      {children}
    </motion.div>
  )
}

export const ScaleInDiv: React.FC<Props> = ({ children, className }) => {
  const classes = classNames(className)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 70, damping: 15 } }}
      exit={{ opacity: 0, transition: { ease: 'easeIn' } }}
      className={classes}
    >
      {children}
    </motion.div>
  )
}

export const ScaleInSection: React.FC<Props> = ({ children, className }) => {
  const classes = classNames(className)

  return (
    <motion.section
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 70, damping: 15 } }}
      exit={{ opacity: 0, transition: { ease: 'easeIn' } }}
      className={classes}
    >
      {children}
    </motion.section>
  )
}

export const RightSlideInSection: React.FC<Props> = ({ children, className }) => {
  const classes = classNames(className)

  return (
    <motion.section
      initial={{ opacity: 0, x: '100%' }}
      animate={{ opacity: 1, x: '0%', transition: { type: 'spring', stiffness: 70, damping: 15 } }}
      exit={{ opacity: 0, transition: { ease: 'easeIn' } }}
      className={classes}
    >
      {children}
    </motion.section>
  )
}
