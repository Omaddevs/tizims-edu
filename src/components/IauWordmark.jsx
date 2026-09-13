import svg from '../assets/iau-wordmark.svg?raw'
import { cn } from './ui'

export function IauWordmark({ className }) {
  return (
    <span
      className={cn('inline-block text-[#213832] dark:text-white [&>svg]:block [&>svg]:h-full [&>svg]:w-full', className)}
      role="img"
      aria-label="International Agriculture University"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}
